import re

from courseaffils.columbia import WindTemplate, CanvasTemplate
from courseaffils.models import Course
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.mixins import (
    LoginRequiredMixin
)
from django.contrib.auth.models import User, Group
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.urls.base import reverse
from django.utils.decorators import method_decorator
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.generic.base import TemplateView, View
from django.views.generic.detail import DetailView
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.views.generic.list import ListView
from lti_provider.models import LTICourseContext

from locustempus.main.utils import send_template_email
from locustempus.mixins import (
    LoggedInCourseMixin, LoggedInFacultyMixin, LoggedInSuperuserMixin
)
from locustempus.utils import user_display_name


class IndexView(LoginRequiredMixin, TemplateView):
    template_name = 'main/index.html'


class CourseCreateView(LoggedInSuperuserMixin, CreateView):
    model = Course
    template_name = 'main/course_create.html'
    fields = ['title', 'group', 'faculty_group']

    def get_success_url(self) -> str:
        return reverse('course-list-view')

    def form_valid(self, form) -> HttpResponse:
        title = form.cleaned_data['title']

        result = CreateView.form_valid(self, form)

        messages.add_message(
            self.request, messages.SUCCESS,
            '<strong>{}</strong> cohort created.'.format(title),
            extra_tags='safe'
        )

        return result


class CourseListView(LoginRequiredMixin, ListView):
    model = Course
    template_name = 'main/course_list.html'


class CourseDetailView(LoggedInCourseMixin, DetailView):
    model = Course
    template_name = 'main/course_detail.html'


class CourseEditView(LoggedInFacultyMixin, UpdateView):
    model = Course
    template_name = 'main/course_edit.html'
    fields = ['title']

    def get_success_url(self):
        return reverse('course-detail-view', kwargs={'pk': self.object.pk})


class CourseDeleteView(LoggedInFacultyMixin, DeleteView):
    model = Course
    template_name = 'main/course_delete.html'

    def get_success_url(self) -> str:
        return reverse('course-list-view')


class CourseRosterView(LoggedInFacultyMixin, DetailView):
    model = Course
    template_name = 'main/course_roster.html'

    def post(self, request, *args, **kwargs):
        """Toggles the role of course users between faculty/student"""
        user = get_object_or_404(
            User, id=request.POST.get('user_id', None))
        course = get_object_or_404(Course, id=kwargs.get('pk', None))

        if course.is_true_faculty(user):
            course.faculty_group.user_set.remove(user)
            msg = u'{} is now a student'.format(user_display_name(user))
        elif course.is_member(user):
            course.faculty_group.user_set.add(user)
            msg = u'{} is now faculty'.format(user_display_name(user))
        else:
            msg = u'{} is not a user in this course'.format(
                user_display_name(user))

        messages.add_message(request, messages.INFO, msg)
        return HttpResponseRedirect(
            reverse('course-roster-view', args=[course.pk]))


@method_decorator(xframe_options_exempt, name='dispatch')
class LTICourseCreate(LoginRequiredMixin, View):

    def notify_staff(self, course):
        data = {
            'course': course,
            'domain': self.request.POST.get('domain'),
            'user': self.request.user
        }
        send_template_email(
            'Locus Tempus Course Connected',
            'main/notify_lti_course_connect.txt',
            data, settings.SERVER_EMAIL)

    def thank_faculty(self, course):
        send_template_email(
            'Locus Tempus Course Connected',
            'main/lti_course_connect.txt',
            {'course': course}, self.request.user.email)

    def groups_from_context(self, course_context):
        group, created = Group.objects.get_or_create(name=course_context)
        faculty_group, created = Group.objects.get_or_create(
            name='{}_faculty'.format(course_context))
        return (group, faculty_group)

    def groups_from_sis_course_id(self, attrs):
        st_affil = WindTemplate.to_string(attrs)
        group, created = Group.objects.get_or_create(name=st_affil)
        self.request.user.groups.add(group)

        attrs['member'] = 'fc'
        fc_affil = WindTemplate.to_string(attrs)
        faculty_group, created = Group.objects.get_or_create(name=fc_affil)
        self.request.user.groups.add(faculty_group)
        return (group, faculty_group)

    def get_year_and_term_from_sis_course_id(self, sis_course_id):
        m = re.match(
            (r'(?P<year>\d{4})(?P<term>\d{2})'), sis_course_id)
        if m:
            return m.groupdict()

    def post(self, *args, **kwargs):
        course_context = self.request.POST.get('lms_course')
        title = self.request.POST.get('lms_course_title')

        sis_course_id = self.request.POST.get('sis_course_id', '')
        d = CanvasTemplate.to_dict(sis_course_id)

        if d:
            (group, faculty_group) = self.groups_from_sis_course_id(d)
        else:
            (group, faculty_group) = self.groups_from_context(course_context)
            yt = self.get_year_and_term_from_sis_course_id(sis_course_id)

        self.request.user.groups.add(group)
        self.request.user.groups.add(faculty_group)

        course, created = Course.objects.get_or_create(
            group=group, faculty_group=faculty_group,
            defaults={'title': title})

        if d:
            # Add CourseInfo from the fields
            course.info.term = d['term']
            course.info.year = d['year']
            course.info.save()
        elif yt:
            course.info.term = yt['term']
            course.info.year = yt['year']
            course.info.save()

        # hook up the context
        (ctx, created) = LTICourseContext.objects.get_or_create(
            group=group, faculty_group=faculty_group,
            lms_course_context=course_context)

        messages.add_message(
            self.request, messages.INFO,
            u'<strong>Success!</strong> ' +
            u'{} is connected to Locus Tempus.'.format(title))

        self.notify_staff(course)
        self.thank_faculty(course)

        url = reverse('lti-landing-page')
        return HttpResponseRedirect(url)


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
