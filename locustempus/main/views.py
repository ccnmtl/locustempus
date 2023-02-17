import re

from courseaffils.columbia import CourseStringTemplate, CanvasTemplate
from courseaffils.models import Course
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.mixins import (
    LoginRequiredMixin
)
from django.contrib.auth.models import User, Group
from django.contrib.sites.shortcuts import get_current_site
from django.core.exceptions import PermissionDenied
from django.db import connections
from django.db.models import OuterRef, Subquery
from django.http import (
    HttpRequest, HttpResponse, HttpResponseRedirect, Http404
)
from django.shortcuts import get_object_or_404, render, redirect
from django.urls.base import reverse
from django.utils.decorators import method_decorator
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.generic.base import View
from django.views.generic.detail import DetailView
from django.views.generic.edit import (
    CreateView, UpdateView, DeleteView
)
from lti_provider.models import LTICourseContext

from locustempus.main.forms import (
    CourseForm, InviteUNIFormset, InviteEmailFormset
)
from locustempus.main.models import GuestUserAffil, Project, Response
from locustempus.main.management.commands.integrationserver import (
    reset_test_models
)
from locustempus.main.utils import get_courses_for_user, send_template_email
from locustempus.mixins import (
    LoggedInCourseMixin, LoggedInFacultyMixin
)
from locustempus.utils import user_display_name
from s3sign.views import SignS3View as BaseSignS3View
from typing import (
    Any, Tuple, List
)
from uuid import uuid4


class IndexView(View):
    template_name = 'main/index.html'
    http_method_names = ['get']

    def get(self, request, *args, **kwargs) -> HttpResponse:
        ctx = {
            'user': request.user,
            'page_type': 'homepage'
        }
        return render(request, self.template_name, ctx)


class DashboardView(LoginRequiredMixin, View):
    template_name = 'main/course_list.html'
    http_method_names = ['get', 'post']

    def get_breadcrumb(self):
        user = self.request.user
        return {
            user.first_name + "'s Workspaces" if user.first_name
            else user.username + "'s Workspaces": ''
        }

    def post(self, request, *args, **kwargs) -> HttpResponse:
        is_grid = not request.session.get('course_grid_layout', False)
        request.session['course_grid_layout'] = is_grid

        ctx = {
            'user': request.user,
            'courses': get_courses_for_user(
                self.request.user).order_by('title'),
            'page_type': 'dashboard',
            'breadcrumb': self.get_breadcrumb(),
            'course_grid_layout': is_grid
        }
        return render(request, self.template_name, ctx)

    def get(self, request, *args, **kwargs) -> HttpResponse:
        is_grid = request.session.get('course_grid_layout', True)
        if 'course_grid_layout' not in request.session:
            request.session['course_grid_layout'] = is_grid

        ctx = {
            'user': request.user,
            'courses': get_courses_for_user(
                self.request.user).order_by('title'),
            'page_type': 'dashboard',
            'breadcrumb': self.get_breadcrumb(),
            'course_grid_layout': is_grid
        }
        return render(request, self.template_name, ctx)


class CourseCreateView(LoginRequiredMixin, CreateView):
    model = Course
    template_name = 'main/course_create.html'
    form_class = CourseForm

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['page_type'] = 'course'
        ctx['breadcrumb'] = {
            'Workspaces': reverse('course-list-view'),
            'Create New Workspace': ''
        }
        return ctx

    def get_success_url(self) -> str:
        return reverse('course-list-view')

    def form_valid(self, form) -> HttpResponse:
        assert isinstance(self.request.user, User)  # nosec
        title = form.cleaned_data['title']

        student_grp_name = '{}-group-{}'.format(title, uuid4())
        fac_grp_name = '{}-faculty-group-{}'.format(title, uuid4())
        student_grp = Group(name=student_grp_name)
        student_grp.save()
        student_grp.user_set.add(self.request.user)

        fac_grp = Group(name=fac_grp_name)
        fac_grp.save()
        fac_grp.user_set.add(self.request.user)

        form.instance.group = student_grp
        form.instance.faculty_group = fac_grp

        result = CreateView.form_valid(self, form)
        messages.add_message(
            self.request, messages.SUCCESS,
            '<strong>{}</strong> sandbox course created.'.format(title)
        )
        return result


class CourseDetailView(LoggedInCourseMixin, View):
    template_name = 'main/course_detail.html'
    http_method_names = ['get', 'post']

    def get_projects(self, course, is_faculty):
        if is_faculty:
            projects = Project.objects.filter(course=course)
        else:
            projects = Project.objects.filter(
                course=course, activity__isnull=False) \
                .annotate(response_status=Subquery(
                    Response.objects.filter(
                        activity__project=OuterRef('pk'),
                        owners__in=[self.request.user]
                    ).values('status')[:1]
                ))
        return projects.order_by('title')

    def get_context(self, request, toggle_layout, pk):
        course = get_object_or_404(Course, pk=pk)
        course.description = course.get_detail('description', None)
        is_faculty = course.is_true_faculty(self.request.user)
        projects = self.get_projects(course, is_faculty)

        if toggle_layout:
            is_grid = not request.session.get('project_grid_layout', False)
        else:
            is_grid = request.session.get('project_grid_layout', True)

        request.session['project_grid_layout'] = is_grid

        return {
            'course': course,
            'projects': projects,
            'is_faculty': is_faculty,
            'page_type': 'course',
            'project_grid_layout': is_grid,
            'breadcrumb': {
                'Workspaces': reverse('course-list-view'),
                course.title: '',
            }
        }

    def post(self, request, *args, **kwargs):
        ctx = self.get_context(
            request, toggle_layout=True, pk=kwargs.get('pk'))
        return render(request, self.template_name, ctx)

    def get(self, request, *args, **kwargs):
        ctx = self.get_context(
            request, toggle_layout=False, pk=kwargs.get('pk'))
        return render(request, self.template_name, ctx)


class CourseEditView(LoggedInFacultyMixin, UpdateView):
    model = Course
    template_name = 'main/course_edit.html'
    form_class = CourseForm

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['object'].description = \
            ctx['object'].get_detail('description', None)
        ctx['page_type'] = 'course'
        ctx['breadcrumb'] = {
            'Workspaces': reverse('course-list-view'),
            self.object.title:
                reverse('course-detail-view', args=[self.object.pk]),
            'Edit': ''
        }
        return ctx

    def get_success_url(self):
        return reverse('course-detail-view', kwargs={'pk': self.object.pk})


class CourseDeleteView(LoggedInFacultyMixin, DeleteView):
    model = Course
    template_name = 'main/course_delete.html'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['page_type'] = 'course'
        ctx['breadcrumb'] = {
            'Workspaces': reverse('course-list-view'),
            self.object.title:
                reverse('course-detail-view', args=[self.object.pk]),
            'Delete': ''
        }
        return ctx

    def get_success_url(self) -> str:
        return reverse('course-list-view')


class CourseRosterView(LoggedInFacultyMixin, DetailView):
    model = Course
    template_name = 'main/course_roster.html'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        course = kwargs.get('object')
        inactive_email_invites = GuestUserAffil.objects.filter(
            course=course,
            accepted_at=None
        )
        ctx['inactive_invitees'] = inactive_email_invites
        ctx['page_type'] = 'roster'
        ctx['breadcrumb'] = {
            'Workspaces': reverse('course-list-view'),
            course.title: reverse('course-detail-view', args=[course.pk]),
            'Roster': ''
        }
        return ctx


class CourseRosterPromoteView(LoggedInFacultyMixin, View):
    """Promotes a student to course faculty"""
    http_method_names = ['post']

    def post(self, request: HttpRequest, *args, **kwargs) -> HttpResponse:
        user = get_object_or_404(
            User, id=request.POST.get('user_id', None))
        course = get_object_or_404(Course, id=kwargs.get('pk', None))

        if course.is_true_faculty(user):
            msg = u'{} is already Author in this workspace.'.format(
                user_display_name(user))
        elif course.is_member(user):
            course.faculty_group.user_set.add(user)
            msg = u'{} is now Author.'.format(user_display_name(user))
        else:
            msg = u'{} is not a member of this workspace.'.format(
                user_display_name(user))

        messages.add_message(request, messages.INFO, msg)
        return HttpResponseRedirect(
            reverse('course-roster-view', args=[course.pk]))


class CourseRosterDemoteView(LoggedInFacultyMixin, View):
    """Demotes a course faculty to a student"""
    http_method_names = ['post']

    def post(self, request: HttpRequest, *args, **kwargs) -> HttpResponse:
        user = get_object_or_404(
            User, id=request.POST.get('user_id', None))
        course = get_object_or_404(Course, id=kwargs.get('pk', None))

        if course.is_true_faculty(user):
            course.faculty_group.user_set.remove(user)
            msg = u'{} is now Contributor'.format(
                user_display_name(user))
        elif course.is_member(user):
            msg = u'{} is already a member of this workspace.'.format(
                user_display_name(user))
        else:
            msg = u'{} is not a user in this workspace.'.format(
                user_display_name(user))

        messages.add_message(request, messages.INFO, msg)
        return HttpResponseRedirect(
            reverse('course-roster-view', args=[course.pk]))


class CourseRosterRemoveView(LoggedInFacultyMixin, View):
    """Removes a user from a course"""
    http_method_names = ['post']

    def post(self, request: HttpRequest, *args, **kwargs) -> HttpResponse:
        user = get_object_or_404(
            User, id=request.POST.get('user_id', None))
        course = get_object_or_404(Course, id=kwargs.get('pk', None))

        if course.is_true_faculty(user):
            course.faculty_group.user_set.remove(user)

        if course.is_member(user):
            course.group.user_set.remove(user)
            msg = u'{} is no longer a member of this workspace.'.format(
                user_display_name(user))
        else:
            msg = u'{} was not a member in this workspace.'.format(
                user_display_name(user))

        messages.add_message(request, messages.INFO, msg)
        return HttpResponseRedirect(
            reverse('course-roster-view', args=[course.pk]))


class CourseRosterResendEmailInviteView(LoggedInFacultyMixin, View):
    """Resends an email invitation to a guest user"""
    http_method_names = ['post']
    guest_email_template = 'main/email/new_guest_user.txt'

    def post(self, request: HttpRequest, *args, **kwargs) -> HttpResponse:
        site = get_current_site(request)
        addr = request.POST.get('user_email', None)
        course = get_object_or_404(Course, id=kwargs.get('pk', None))
        affil = get_object_or_404(
            GuestUserAffil, guest_email=addr, course=course, accepted_at=None)

        # Set the modified_at time
        affil.save()

        # Resend email to invited user
        subj = 'Locus Tempus Invitation: {}'.format(course.title)
        send_template_email(
            subj,
            self.guest_email_template,
            {'course_title': course.title,
             'guest_email': affil.guest_email,
             'site': site},
            affil.guest_email
        )

        msg = ('{} has been resent an invitation '
               'to join the workspace.'.format(addr))
        messages.add_message(request, messages.INFO, msg)
        return HttpResponseRedirect(
            reverse('course-roster-view', args=[course.pk]))


class CourseRosterUninviteView(LoggedInFacultyMixin, View):
    """Uninvites a guest user"""
    http_method_names = ['post']

    def post(self, request: HttpRequest, *args, **kwargs) -> HttpResponse:
        addr = request.POST.get('user_email', None)
        course = get_object_or_404(Course, id=kwargs.get('pk', None))
        affil = get_object_or_404(
            GuestUserAffil, guest_email=addr, course=course, accepted_at=None)

        affil.delete()

        msg = ('The invitation for {} has been deleted.'.format(addr))
        messages.add_message(request, messages.WARNING, msg)
        return HttpResponseRedirect(
            reverse('course-roster-view', args=[course.pk]))


class CourseRosterInviteUser(LoggedInFacultyMixin, View):
    """Invites a new user to the course by UNI"""
    http_method_names = ['get', 'post']
    template_name = 'main/course_roster_invite.html'
    email_template = 'main/email/new_user.txt'
    guest_email_template = 'main/email/new_guest_user.txt'
    uni_formset = InviteUNIFormset
    email_formset = InviteEmailFormset

    @staticmethod
    def get_or_create_user(uni: str) -> User:
        try:
            user = User.objects.get(username=uni)
        except User.DoesNotExist:
            user = User(username=uni)
            user.set_unusable_password()
            user.save()
        return user

    def handle_unis(self, course: Course, unis: List[str]) -> None:
        """
        Add a list of UNI users to a course
        """
        site = get_current_site(self.request)
        for uni in unis:
            user = self.get_or_create_user(uni)
            display_name = user_display_name(user)
            if course.is_true_member(user):
                msg = '{} ({}) is already a course member'.format(
                    display_name, uni)
                messages.add_message(self.request, messages.WARNING, msg)
            else:
                email = '{}@columbia.edu'.format(uni)
                course.group.user_set.add(user)
                subj = 'Locus Tempus Invitation: {}'.format(course.title)
                send_template_email(
                    subj,
                    self.email_template,
                    {'course_title': course.title, 'site': site},
                    email
                )
                msg = (
                    '{} is now a workspace member. An email notification '
                    'was sent to {}.').format(display_name, email)

                messages.add_message(self.request, messages.SUCCESS, msg)

    def handle_emails(self, course: Course, email_addrs: List[str]) -> None:
        """
        Add a list of guest users to a course from a list of email addresses.
        """
        site = get_current_site(self.request)
        assert isinstance(self.request.user, User)  # nosec
        for addr in email_addrs:
            try:
                user = User.objects.get(email=addr)
                if course.is_true_member(user):
                    msg = '{} is already a course member'.format(
                        user.username)
                    messages.add_message(self.request, messages.WARNING, msg)
                else:
                    course.group.user_set.add(user)
                    subj = 'Locus Tempus Invitation: {}'.format(course.title)
                    send_template_email(
                        subj,
                        self.email_template,
                        {'course_title': course.title, 'site': site},
                        addr
                    )
                    msg = (
                        '{} is now a workspace member. An email notification '
                        'was sent to {}.').format(
                            user.username, addr)

                    messages.add_message(self.request, messages.SUCCESS, msg)
            except User.DoesNotExist:
                # Create an affiliation
                # You need to check if an affiliation exist
                if GuestUserAffil.objects.filter(
                        course=course, guest_email=addr).exists():
                    msg = ('{} has already been invited to join the workspace.'
                           ' Please use the resend button below to '
                           'resend the invitation'.format(addr))
                    messages.add_message(self.request, messages.INFO, msg)
                else:
                    affil = GuestUserAffil(
                        course=course,
                        guest_email=addr,
                        invited_by=self.request.user
                    )
                    affil.save()
                    # Send email to invite user to sign up
                    subj = 'Locus Tempus Invitation: {}'.format(course.title)
                    send_template_email(
                        subj,
                        self.guest_email_template,
                        {
                            'course_title': course.title,
                            'guest_email': addr,
                            'site': site
                        },
                        addr
                    )
                    # Show message to faculty
                    msg = ('{} has been sent an invitation '
                           'to join the workspace.'.format(addr))
                    messages.add_message(self.request, messages.SUCCESS, msg)

    def get(self, request, *args, **kwargs) -> HttpResponse:
        course = get_object_or_404(Course, pk=kwargs.get('pk'))
        return render(request, self.template_name, {
            'course': course,
            'uni_formset': self.uni_formset(prefix='uni'),
            'email_formset': self.email_formset(prefix='email'),
            'page_type': 'roster',
            'template_title': 'Invite Contributor',
            'breadcrumb': {
                'Workspaces': reverse('course-list-view'),
                course.title: reverse('course-detail-view', args=[course.pk]),
                'Roster': reverse('course-roster-view', args=[course.pk]),
                'Invite': ''
            }
        })

    def post(self, request, *args, **kwargs) -> HttpResponse:
        course = get_object_or_404(Course, pk=kwargs.get('pk'))
        uni_formset = self.uni_formset(
            request.POST, request.FILES, prefix='uni')
        email_formset = self.email_formset(
            request.POST, request.FILES, prefix='email')

        if uni_formset.is_valid() and email_formset.is_valid():
            unis = [el['invitee'] for el in uni_formset.cleaned_data if el]
            email_addrs = [el['invitee'] for el
                           in email_formset.cleaned_data if el]

            if (len(unis) == 0 and len(email_addrs) == 0):
                msg = 'A value must be entered in either field.'
                messages.add_message(request, messages.ERROR, msg)
                return render(request, self.template_name, {
                    'course': course,
                    'uni_formset': self.uni_formset(prefix='uni'),
                    'email_formset': self.email_formset(prefix='email'),
                    'page_type': 'roster',
                    'template_title': 'Invite Contributor',
                    'breadcrumb': {
                        'Workspaces': reverse('course-list-view'),
                        course.title:
                            reverse('course-detail-view', args=[course.pk]),
                        'Roster':
                            reverse('course-roster-view', args=[course.pk]),
                        'Invite': ''
                    }
                })

            self.handle_unis(course, unis)
            self.handle_emails(course, email_addrs)

            return HttpResponseRedirect(
                reverse('course-roster-view', args=[course.pk]))

        return render(request, self.template_name, {
            'course': course,
            'uni_formset': uni_formset,
            'email_formset': email_formset,
            'page_type': 'roster',
            'template_title': 'Invite Contributor',
            'breadcrumb': {
                'Workspaces': reverse('course-list-view'),
                course.title: reverse('course-detail-view', args=[course.pk]),
                'Roster': reverse('course-roster-view', args=[course.pk]),
                'Invite': ''
            }
        })


@method_decorator(xframe_options_exempt, name='dispatch')
class LTICourseCreate(LoginRequiredMixin, View):

    def notify_staff(self, course: Course) -> None:
        data = {
            'course': course,
            'user': self.request.user
        }
        send_template_email(
            'Locus Tempus Course Connected',
            'main/notify_lti_course_connect.txt',
            data, settings.SERVER_EMAIL)

    def thank_faculty(self, course: Course) -> None:
        assert isinstance(self.request.user, User)  # nosec
        user = self.request.user
        send_template_email(
            'Locus Tempus Course Connected',
            'main/lti_course_connect.txt',
            {'course': course},
            user.email if user.email else user.username + '@columbia.edu')

    def groups_from_context(self, course_context) -> Tuple[Group, Group]:
        group, created = Group.objects.get_or_create(name=course_context)
        faculty_group, created = Group.objects.get_or_create(
            name='{}_faculty'.format(course_context))
        return (group, faculty_group)

    def groups_from_sis_course_id(self, attrs) -> Tuple[Group, Group]:
        assert isinstance(self.request.user, User)  # nosec
        user = self.request.user
        st_affil = CourseStringTemplate.to_string(attrs)
        group, created = Group.objects.get_or_create(name=st_affil)
        user.groups.add(group)

        attrs['member'] = 'fc'
        fc_affil = CourseStringTemplate.to_string(attrs)
        faculty_group, created = Group.objects.get_or_create(name=fc_affil)
        user.groups.add(faculty_group)
        return (group, faculty_group)

    def add_yt_to_course(self, sis_course_id: str, course: Course) -> None:
        """
        Sets the year and term attributes on a course if
        they can be determined from a sis_course_id
        """

        # CanvasTemplate matches a CU course string
        cu_course = CanvasTemplate.to_dict(sis_course_id)
        # TC courses use a different format
        tc_course = re.match(
            (r'(?P<year>\d{4})(?P<term>\d{2})'), sis_course_id)

        if cu_course:
            course.info.term = cu_course['term']
            course.info.year = cu_course['year']
            course.info.save()
        elif tc_course:
            course.info.term = tc_course['term']
            course.info.year = tc_course['year']
            course.info.save()

    def post(self, *args, **kwargs):
        user = self.request.user
        course_context = self.request.POST.get('lms_course')
        title = self.request.POST.get('lms_course_title')
        sis_course_id = '' if self.request.POST['sis_course_id'] == 'None' \
            else self.request.POST['sis_course_id']

        # This view needs to take four steps to create a course
        # 1. Create groups for students and faculty, named after the course
        # 2. Create the course
        # 3. Set the year and term, if applicable
        # 4. Create the course context

        # 1. Create groups
        cu_course = CanvasTemplate.to_dict(sis_course_id)
        if cu_course:
            (group, faculty_group) = self.groups_from_sis_course_id(cu_course)
        else:
            (group, faculty_group) = self.groups_from_context(course_context)

        user.groups.add(group)
        user.groups.add(faculty_group)

        # 2. Create the course
        course, created = Course.objects.get_or_create(
            group=group, faculty_group=faculty_group,
            defaults={'title': title})

        # 3. Set the term and year of the course
        if sis_course_id:
            self.add_yt_to_course(sis_course_id, course)

        # 4. Create the course context
        (ctx, created) = LTICourseContext.objects.get_or_create(
            group=group, faculty_group=faculty_group,
            lms_course_context=course_context)

        messages.add_message(
            self.request, messages.INFO,
            '<strong>Success!</strong> ' +
            '{} is connected to Locus Tempus.'.format(title))

        self.notify_staff(course)
        self.thank_faculty(course)

        return HttpResponseRedirect(reverse('lti-landing-page'))


class LTICourseSelector(LoginRequiredMixin, View):

    def get(self, request, context):
        try:
            messages.add_message(
                request, messages.INFO,
                'Reminder: please log out of Locus Tempus '
                'after you log out of Courseworks.')

            ctx = LTICourseContext.objects.get(lms_course_context=context)
            url = u'/course/{}/'.format(ctx.group.course.id)
        except LTICourseContext.DoesNotExist:
            url = '/'

        return HttpResponseRedirect(url)


class ProjectView(LoggedInCourseMixin, View):
    http_method_names = ['get']
    template_name = 'main/course_project.html'

    def get(self, request, *args, **kwargs) -> HttpResponse:
        course = get_object_or_404(Course, pk=kwargs.get('pk', None))
        project: Any = get_object_or_404(
            Project.objects.filter(course=course.pk),
            pk=kwargs.get('project_pk', None))
        is_faculty = course.is_true_faculty(request.user)

        if not is_faculty and not hasattr(project, 'activity'):
            raise PermissionDenied

        new_project = False
        if request.GET.get('new_project', None):
            new_project = True

        ctx = {
            'course': course,
            'project': project,
            'token': getattr(settings, 'MAPBOX_TOKEN', '123abc'),
            'geocoder': getattr(settings, 'GEOCODER', True),
            'is_faculty': is_faculty,
            'page_type': 'project',
            'is_new_project': new_project
        }
        return render(request, self.template_name, ctx)


class ProjectCreateView(LoggedInFacultyMixin, View):

    def post(self, request, *args, **kwargs):
        course = get_object_or_404(Course, pk=kwargs.get('pk', None))

        project = Project.objects.create(
            course=course, base_map=settings.DEFAULT_BASE_MAP)

        return HttpResponseRedirect(reverse(
            'course-project-detail',
            kwargs={
                'pk': course.pk,
                'project_pk': project.pk
            }) + '?new_project=true')


class ProjectDeleteView(LoggedInFacultyMixin, DeleteView):
    model = Project
    http_method_names = ['post']
    pk_url_kwarg = 'project_pk'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['page_type'] = 'project'
        return ctx

    def get_success_url(self):
        if not self.request.GET.get('hide_course_delete_notice') == 'true':
            messages.add_message(
                self.request, messages.SUCCESS,
                '<strong>{}</strong> has been deleted.'.format(
                    self.object.title)
            )
        return reverse(
            'course-detail-view',
            kwargs={'pk': self.kwargs.get('pk')})


class SignS3View(LoginRequiredMixin, BaseSignS3View):
    root = "uploads/"

    def get_bucket(self):
        return settings.AWS_STORAGE_BUCKET_NAME


class ResetView(View):
    @staticmethod
    def can_reset_database():
        db_name = connections.databases['default']['NAME']
        if not (db_name == 'test_locustempus' or
                db_name == 'file:memorydb_default?mode=memory&cache=shared'):
            return False

        return True

    def get(self, request, *argss, **kwargs):
        if not ResetView.can_reset_database():
            raise Http404()

        # Generate new models
        reset_test_models()

        return redirect('index-view')
