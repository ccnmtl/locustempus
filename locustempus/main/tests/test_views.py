from courseaffils.columbia import CourseStringMapper
from courseaffils.models import Course
from django.conf import settings
from django.contrib.auth.models import Group
from django.core import mail
from django.test import TestCase
from django.urls.base import reverse
from django_registration.signals import user_activated
from locustempus.main.models import GuestUserAffil
from lti_provider.models import LTICourseContext
from lti_provider.tests.factories import LTICourseContextFactory


from locustempus.main.models import Project
from locustempus.main.tests.factories import (
    SandboxCourseFactory, CourseTestMixin, ProjectFactory, UserFactory,
)
from unittest.mock import MagicMock


class BasicTest(TestCase):
    def test_root(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url, "/accounts/login/?next=/")

    def test_smoketest(self):
        response = self.client.get("/smoketest/")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'PASS')


class CourseTest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    # For CourseCreateView
    def test_create_anon(self):
        response = self.client.get("/course/create/")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url, "/accounts/login/?next=/course/create/")

    def test_create_logged_in(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get("/course/create/")
        self.assertEqual(response.status_code, 200)

    def test_create_course(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/create/",
            {'title': 'A test course'}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/")

    # For CourseDetailView
    def test_detail_anon(self):
        response = self.client.get("/course/{}/".format(
            self.sandbox_course.pk))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/accounts/login/?next=/course/{}/".format(
                self.sandbox_course.pk))

    def test_detail_student_in_course(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/".format(
            self.sandbox_course.pk))
        self.assertEqual(response.status_code, 200)

    def test_detail_student_not_in_course(self):
        alternate_course = SandboxCourseFactory.create()
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/".format(alternate_course.pk))
        self.assertEqual(response.status_code, 403)

    def test_detail_faculty_in_course(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/".format(
            self.sandbox_course.pk))
        self.assertEqual(response.status_code, 200)

    def test_detail_faculty_not_in_course(self):
        alternate_course = SandboxCourseFactory.create()
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/".format(alternate_course.pk))
        self.assertEqual(response.status_code, 403)

    def test_detail_superuser(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/".format(
            self.sandbox_course.pk))
        self.assertEqual(response.status_code, 200)

    # For CourseEditView
    def test_edit_anon(self):
        response = self.client.get("/course/{}/edit/".format(
            self.sandbox_course.pk))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/accounts/login/?next=/course/{}/edit/".format(
                self.sandbox_course.pk))

    def test_edit_student(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/edit/".format(
            self.sandbox_course.pk))
        self.assertEqual(response.status_code, 403)

    def test_edit_faculty_in_course(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/edit/".format(
            self.sandbox_course.pk))
        self.assertEqual(response.status_code, 200)

    def test_edit_faculty_post(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/edit/".format(self.sandbox_course.pk),
            {'title': 'An edited course'}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/course/{}/".format(self.sandbox_course.pk))

    def test_edit_faculty_not_in_course(self):
        alternate_course = SandboxCourseFactory.create()
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get(
            "/course/{}/edit/".format(alternate_course.pk))
        self.assertEqual(response.status_code, 403)

    def test_edit_superuser(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/edit/".format(
            self.sandbox_course.pk))
        self.assertEqual(response.status_code, 200)

    def test_edit_superuser_post(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/edit/".format(self.sandbox_course.pk),
            {'title': 'An edited course'}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/course/{}/".format(self.sandbox_course.pk))

    def test_delete_anon(self):
        response = self.client.get("/course/{}/delete/".format(
            self.sandbox_course.pk))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/accounts/login/?next=/course/{}/delete/".format(
                self.sandbox_course.pk))

    def test_delete_faculty(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/delete/".format(
            self.sandbox_course.pk))
        self.assertEqual(response.status_code, 200)

    def test_delete_faculty_post(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/delete/".format(self.sandbox_course.pk))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, '/')

    def test_delete_faculty_not_in_course(self):
        alternate_course = SandboxCourseFactory.create()
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get(
            "/course/{}/delete/".format(alternate_course.pk))
        self.assertEqual(response.status_code, 403)

    def test_delete_superuser(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/delete/".format(
            self.sandbox_course.pk))
        self.assertEqual(response.status_code, 200)

    def test_delete_superuser_post(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/delete/".format(self.sandbox_course.pk))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/")


class CourseRoster(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    def test_course_roster_faculty(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get(
            "/course/{}/roster/".format(self.sandbox_course.pk))
        self.assertEqual(response.status_code, 200)

    def test_course_roster_faculty_not_in_course(self):
        alternate_course = SandboxCourseFactory.create()
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get(
            "/course/{}/roster/".format(alternate_course.pk))
        self.assertEqual(response.status_code, 403)

    def test_course_roster_superuser(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.get(
            "/course/{}/roster/".format(self.sandbox_course.pk))
        self.assertEqual(response.status_code, 200)

    def test_course_roster_student(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get(
            "/course/{}/roster/".format(self.sandbox_course.pk))
        self.assertEqual(response.status_code, 403)

    def test_course_roster_promote(self):
        """Test that a faculty can demote a user"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/roster/promote/".format(self.sandbox_course.pk),
            {'user_id': self.student.pk}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url,
                         "/course/{}/roster/".format(self.sandbox_course.pk))
        self.assertTrue(self.sandbox_course.is_true_faculty(self.student))

    def test_course_roster_demote(self):
        """Test that a faculty can demote a user"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/roster/demote/".format(self.sandbox_course.pk),
            {'user_id': self.faculty.pk}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url,
                         "/course/{}/roster/".format(self.sandbox_course.pk))
        # Check that the demoted user is still a member of the course
        self.assertTrue(self.sandbox_course.is_member(self.faculty))
        self.assertFalse(self.sandbox_course.is_true_faculty(self.faculty))

    def test_course_roster_non_members(self):
        """Test that users who are not faculty can not
        promote/demote course members"""
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/roster/promote/".format(self.sandbox_course.pk),
            {'user_id': self.student.pk}
        )
        self.assertEqual(response.status_code, 403)
        response = self.client.post(
            "/course/{}/roster/demote/".format(self.sandbox_course.pk),
            {'user_id': self.student.pk}
        )
        self.assertEqual(response.status_code, 403)

    def test_course_roster_remove_student(self):
        """Test that a faculty can demote a user"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/roster/remove/".format(self.sandbox_course.pk),
            {'user_id': self.student.pk}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url,
                         "/course/{}/roster/".format(self.sandbox_course.pk))
        self.assertFalse(self.sandbox_course.is_true_member(self.student))

    def test_course_roster_remove_faculty(self):
        """Test that a faculty can demote a user"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        self.sandbox_course.faculty_group.user_set.add(self.student)
        response = self.client.post(
            "/course/{}/roster/remove/".format(self.sandbox_course.pk),
            {'user_id': self.student.pk}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url,
                         "/course/{}/roster/".format(self.sandbox_course.pk))
        self.assertFalse(self.sandbox_course.is_true_member(self.student))

    def test_course_roster_remove_non_members(self):
        """Test that users who are not faculty can not
        remove course members"""
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/roster/remove/".format(self.sandbox_course.pk),
            {'user_id': self.student.pk}
        )
        self.assertEqual(response.status_code, 403)
        response = self.client.post(
            "/course/{}/roster/demote/".format(self.sandbox_course.pk),
            {'user_id': self.faculty.pk}
        )
        self.assertEqual(response.status_code, 403)

    def test_course_roster_resend_invite(self):
        """Test that faculty can resend invite"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        addr = 'foo@bar.com'
        affil = GuestUserAffil(
            guest_email=addr,
            course=self.sandbox_course,
            invited_by=self.faculty
        )
        affil.save()
        response = self.client.post(
            "/course/{}/roster/resend-invite/".format(self.sandbox_course.pk),
            {'user_email': addr}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url,
                         "/course/{}/roster/".format(self.sandbox_course.pk))

        self.assertEqual(len(mail.outbox), 1)

        self.assertEqual(
            mail.outbox[0].subject,
            'Locus Tempus Invite: {}'.format(self.sandbox_course.title))

    def test_course_roster_uninvite(self):
        """Test that faculty can uninvite a guest user"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        addr = 'foo@bar.com'
        affil = GuestUserAffil(
            guest_email=addr,
            course=self.sandbox_course,
            invited_by=self.faculty
        )
        affil.save()

        self.assertTrue(
            GuestUserAffil.objects.filter(
                course=self.sandbox_course, guest_email=addr).exists())

        response = self.client.post(
            "/course/{}/roster/uninvite/".format(self.sandbox_course.pk),
            {'user_email': addr}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url,
                         "/course/{}/roster/".format(self.sandbox_course.pk))

        self.assertFalse(
            GuestUserAffil.objects.filter(
                course=self.sandbox_course, guest_email=addr).exists())

    def test_course_roster_uninvite_non_faculty(self):
        """
        Tests that non-course faculty can't uninvite a
        user invited to another course.
        """
        # Set up course and an affil
        course = SandboxCourseFactory.create()
        addr = 'foo@bar.com'
        affil = GuestUserAffil(
            guest_email=addr,
            course=self.sandbox_course,
            invited_by=self.faculty
        )
        affil.save()

        # Log in a faculty for a different course and try
        # to uninvite foo@bar.com
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/roster/uninvite/".format(course.pk),
            {'user_email': addr}
        )
        self.assertEqual(response.status_code, 403)


class LTICourseSelectorTest(CourseTestMixin, TestCase):

    def setUp(self):
        self.setup_course()

    def test_get(self):
        ctx = LTICourseContextFactory(
            group=self.sandbox_course.group,
            faculty_group=self.sandbox_course.faculty_group)

        url = reverse('lti-course-select', args=[ctx.lms_course_context])

        self.client.login(username=self.faculty.username, password='test')
        response = self.client.get(url, follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['course'], self.sandbox_course)


class LTICourseCreateTest(TestCase):

    def test_post_sis_course_id(self):
        with self.settings(
                COURSEAFFILS_COURSESTRING_MAPPER=CourseStringMapper):
            user = UserFactory()
            self.client.login(username=user.username, password='test')

            data = {
                'lms_course': '1234',
                'lms_course_title': 'LTI Course',
                'sis_course_id': 'SOCWT7113_010_2017_3'
            }
            response = self.client.post(reverse('lti-course-create'), data)
            self.assertEqual(response.status_code, 302)

            c = Course.objects.get(title='LTI Course')
            self.assertEqual(
                c.group.name,
                't3.y2017.s010.ct7113.socw.st.course:columbia.edu')
            self.assertEqual(
                c.faculty_group.name,
                't3.y2017.s010.ct7113.socw.fc.course:columbia.edu')

            self.assertEqual(c.info.term, 3)
            self.assertEqual(c.info.year, 2017)

            self.assertTrue(user in c.group.user_set.all())
            self.assertTrue(user in c.faculty_group.user_set.all())

            self.assertEqual(len(mail.outbox), 2)

            self.assertEqual(mail.outbox[0].subject,
                             'Locus Tempus Course Connected')
            self.assertEqual(mail.outbox[0].from_email,
                             settings.SERVER_EMAIL)
            self.assertEqual(mail.outbox[0].to,
                             [settings.SERVER_EMAIL])

            self.assertEqual(mail.outbox[1].subject,
                             'Locus Tempus Course Connected')
            self.assertEqual(mail.outbox[1].from_email,
                             settings.SERVER_EMAIL)
            self.assertEqual(mail.outbox[1].to,
                             [user.email])

            LTICourseContext.objects.get(
                lms_course_context='1234',
                group=c.group, faculty_group=c.faculty_group)

            # try this again and make sure there is no duplication
            data['lms_course_title'] = 'LTI Course With More Detail'
            response = self.client.post(reverse('lti-course-create'), data)
            self.assertEqual(response.status_code, 302)
            Course.objects.get(title='LTI Course')
            Group.objects.get(name=c.group.name)
            Group.objects.get(name=c.faculty_group.name)
            LTICourseContext.objects.get(
                lms_course_context='1234',
                group=c.group, faculty_group=c.faculty_group)

    def test_post_course_context(self):
        with self.settings(
                COURSEAFFILS_COURSESTRING_MAPPER=CourseStringMapper):

            user = UserFactory()
            self.client.login(username=user.username, password='test')

            data = {
                'lms_course': '1234',
                'lms_course_title': 'LTI Course',
                'sis_course_id': '20170152049'
            }
            response = self.client.post(reverse('lti-course-create'), data)
            self.assertEqual(response.status_code, 302)

            c = Course.objects.get(title='LTI Course')
            self.assertEqual(c.group.name, '1234')
            self.assertEqual(c.faculty_group.name, '1234_faculty')
            self.assertEqual(c.info.term, 1)
            self.assertEqual(c.info.year, 2017)

            self.assertTrue(user in c.group.user_set.all())
            self.assertTrue(user in c.faculty_group.user_set.all())

            LTICourseContext.objects.get(
                lms_course_context='1234',
                group=c.group, faculty_group=c.faculty_group)

            # try this again and make sure there is no duplication
            data['lms_course_title'] = 'LTI Course With More Detail'
            response = self.client.post(reverse('lti-course-create'), data)
            self.assertEqual(response.status_code, 302)
            Course.objects.get(title='LTI Course')
            Group.objects.get(name=c.group.name)
            Group.objects.get(name=c.faculty_group.name)
            LTICourseContext.objects.get(
                lms_course_context='1234',
                group=c.group, faculty_group=c.faculty_group)

    def test_post_course_context_with_unicode(self):
        with self.settings(
                COURSEAFFILS_COURSESTRING_MAPPER=CourseStringMapper):

            user = UserFactory()
            self.client.login(username=user.username, password='test')

            data = {
                'lms_course': '1234',
                'lms_course_title': 'LTI Course "Película", rødgrød med fløde',
                'sis_course_id': '20170152049'
            }
            response = self.client.post(reverse('lti-course-create'), data)
            self.assertEqual(response.status_code, 302)

            c = Course.objects.get(
                title='LTI Course "Película", rødgrød med fløde')
            self.assertEqual(c.group.name, '1234')
            self.assertEqual(c.faculty_group.name, '1234_faculty')
            self.assertEqual(c.info.term, 1)
            self.assertEqual(c.info.year, 2017)

            self.assertTrue(user in c.group.user_set.all())
            self.assertTrue(user in c.faculty_group.user_set.all())

            LTICourseContext.objects.get(
                lms_course_context='1234',
                group=c.group, faculty_group=c.faculty_group)

            # try this again and make sure there is no duplication
            data['lms_course_title'] = 'LTI Course With More Detail'
            response = self.client.post(reverse('lti-course-create'), data)
            self.assertEqual(response.status_code, 302)
            Course.objects.get(
                title='LTI Course "Película", rødgrød med fløde')
            Group.objects.get(name=c.group.name)
            Group.objects.get(name=c.faculty_group.name)
            LTICourseContext.objects.get(
                lms_course_context='1234',
                group=c.group, faculty_group=c.faculty_group)


class CourseRosterInviteUserTest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    def test_get_course_invite_page(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get(
            "/course/{}/roster/invite/".format(self.sandbox_course.pk))
        self.assertEqual(response.status_code, 200)

    def test_get_course_invite_page_student(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get(
            "/course/{}/roster/invite/".format(self.sandbox_course.pk))
        self.assertEqual(response.status_code, 403)

    def test_get_course_invite_page_anon(self):
        response = self.client.get(
            "/course/{}/roster/invite/".format(self.sandbox_course.pk))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/accounts/login/?next=/course/{}/roster/invite/".format(
                self.sandbox_course.pk))

    def test_post_valid_uni(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/roster/invite/".format(self.sandbox_course.pk),
            {
                'uni-TOTAL_FORMS': '1',
                'uni-INITIAL_FORMS': '0',
                'uni-0-invitee': 'abc123',
                'email-TOTAL_FORMS': '1',
                'email-INITIAL_FORMS': '0'
            }
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/course/{}/roster/".format(self.sandbox_course.pk))

    def test_post_invalid_uni(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/roster/invite/".format(self.sandbox_course.pk),
            {
                'uni-TOTAL_FORMS': '1',
                'uni-INITIAL_FORMS': '0',
                'uni-0-invitee': 'foobar',
                'email-TOTAL_FORMS': '1',
                'email-INITIAL_FORMS': '0'
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertInHTML(
            'This is not a valid UNI.', response.content.decode('utf-8'))

    def test_post_email(self):
        """Tests that a guest user can be added"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        addr = 'foo@bar.com'
        response = self.client.post(
            "/course/{}/roster/invite/".format(self.sandbox_course.pk),
            {
                'uni-TOTAL_FORMS': '1',
                'uni-INITIAL_FORMS': '0',
                'uni-0-invitee': '',
                'email-TOTAL_FORMS': '1',
                'email-INITIAL_FORMS': '0',
                'email-0-invitee': addr,
            }
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/course/{}/roster/".format(self.sandbox_course.pk))
        self.assertTrue(
            GuestUserAffil.objects.filter(
                course=self.sandbox_course, guest_email=addr).exists())
        self.assertEqual(2, len(self.sandbox_course.members))

    def test_post_cu_email(self):
        """Tests that a CU email address can not be added as a guest user"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        addr = 'roary@columbia.edu'
        response = self.client.post(
            "/course/{}/roster/invite/".format(self.sandbox_course.pk),
            {
                'uni-TOTAL_FORMS': '1',
                'uni-INITIAL_FORMS': '0',
                'uni-0-invitee': '',
                'email-TOTAL_FORMS': '1',
                'email-INITIAL_FORMS': '0',
                'email-0-invitee': addr,
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(
            response,
            addr + ' is a Columbia University email address.')

    def test_guest_user_course_affil(self):
        """
        Tests that a guest user is added to the
        course upon registering for an account
        """
        affil = GuestUserAffil(
            guest_email='foo@bar.com',
            course=self.sandbox_course,
            invited_by=self.faculty
        )
        affil.save()
        guest = UserFactory.create(
            first_name='Guest',
            last_name='User',
            username='guest-user',
            email='foo@bar.com'
        )

        mock_sender = MagicMock()
        user_activated.send(sender=mock_sender, user=guest)
        self.assertTrue(self.sandbox_course.is_true_member(guest))

    def test_guest_user_exists(self):
        """
        Tests the case where a guest is invited to a course,
        and the user already has a Locus Tempus account.
        """
        addr = 'gueststudent@example.com'
        UserFactory.create(
            first_name='Guest',
            last_name='Student',
            username='guest-student',
            email=addr
        )
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/roster/invite/".format(self.sandbox_course.pk),
            {
                'uni-TOTAL_FORMS': '1',
                'uni-INITIAL_FORMS': '0',
                'uni-0-invitee': '',
                'email-TOTAL_FORMS': '1',
                'email-INITIAL_FORMS': '0',
                'email-0-invitee': addr,
            },
            follow=True
        )
        self.assertContains(
            response,
            'An email was sent to {} notifying the user.'.format(addr))

    def test_empty_form(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/roster/invite/".format(self.sandbox_course.pk),
            {
                'uni-TOTAL_FORMS': '1',
                'uni-INITIAL_FORMS': '0',
                'uni-0-invitee': '',
                'email-TOTAL_FORMS': '1',
                'email-INITIAL_FORMS': '0',
                'email-0-invitee': '',
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(
            response, 'A value must be entered in either field.')


class DashboardTest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    def test_no_course(self):
        """
        Tests that the courses created in the setup method
        do not appear for a new user not in those courses.
        """
        student = UserFactory.create(
            first_name='Student',
            last_name='Two',
            username='student-two',
            email='studenttwo@example.com'
        )
        self.assertTrue(
            self.client.login(
                username=student.username,
                password='test'
            )
        )
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.context['registrar_courses'].count(), 0)
        self.assertEqual(
            response.context['sandbox_courses'].count(), 0)

    def test_courses_present(self):
        """
        Tests that the courses created in the setup
        method appear for users in those courses.
        """
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.context['registrar_courses'].count(), 1)
        self.assertEqual(
            response.context['sandbox_courses'].count(), 1)


class ProjectTest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    def test_create_project_faculty(self):
        """Test that faculty can create projects"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/project/create/".format(self.sandbox_course.pk),
            {
                'title': 'A Test Project',
                'description': 'A fine description',
                'base_map': 'dark-v10'
            }
        )
        self.assertEqual(response.status_code, 302)

    def test_create_project_student(self):
        """Test that students can't create projects"""
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get(
            "/course/{}/project/create/".format(self.sandbox_course.pk)
        )
        self.assertEqual(response.status_code, 403)

    def test_update_project_faculty(self):
        """Test that faculty can update projects"""
        project = ProjectFactory.create(course=self.sandbox_course)
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/project/{}/edit/".format(
                self.sandbox_course.pk, project.pk),
            {
                'title': 'A Test Project',
                'description': 'A fine description',
                'base_map': 'dark-v10'
            }
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/course/{}/project/{}/".format(
                self.sandbox_course.pk, project.pk))

    def test_update_project_students(self):
        """Test that students can not update projects"""
        project = ProjectFactory.create(course=self.sandbox_course)
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/project/{}/edit/".format(
                self.sandbox_course.pk, project.pk),
            {
                'title': 'A Test Project',
                'description': 'A fine description',
                'base_map': 'dark-v10'
            }
        )
        self.assertEqual(response.status_code, 403)

    def test_delete_project_faculty(self):
        """Test that faculty can delete projects"""
        project = ProjectFactory.create(course=self.sandbox_course)
        project_pk = project.pk
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/project/{}/delete/".format(
                self.sandbox_course.pk, project.pk)
        )
        self.assertEqual(response.status_code, 302)
        r2 = self.client.get(
            "/course/{}/project/{}/".format(
                self.sandbox_course.pk, project_pk))
        self.assertEqual(r2.status_code, 404)

    def test_delete_project_students(self):
        """Test that students can not delete projects"""
        project = ProjectFactory.create(course=self.sandbox_course)
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/project/{}/delete/".format(
                self.sandbox_course.pk, project.pk)
        )
        self.assertEqual(response.status_code, 403)

    def test_list_project_faculty(self):
        """Test that students and faculty can list projects"""
        p1 = ProjectFactory.create(course=self.sandbox_course)
        p2 = ProjectFactory.create(course=self.sandbox_course)
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get(
            "/course/{}/".format(self.sandbox_course.pk))
        self.assertIn(p1, response.context['projects'])
        self.assertIn(p2, response.context['projects'])
        self.assertContains(response, 'Create New Project')

    def test_list_project_students(self):
        """Test that students and faculty can list projects"""
        p1 = ProjectFactory(course=self.sandbox_course)
        p2 = ProjectFactory(course=self.sandbox_course)
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get(
            "/course/{}/".format(self.sandbox_course.pk))
        self.assertIn(p1, response.context['projects'])
        self.assertIn(p2, response.context['projects'])
        self.assertNotContains(response, 'Create New Project')

    def test_detail_project_faculty(self):
        """Test that faculty can view a project"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/project/create/".format(self.sandbox_course.pk),
            {
                'title': 'A Test Project',
                'description': 'A fine description',
                'base_map': 'dark-v10'
            }
        )
        self.assertEqual(response.status_code, 302)
        project = Project.objects.first()
        r2 = self.client.get(
            "/course/{}/project/{}/".format(
                self.sandbox_course.pk, project.pk))
        self.assertEqual(r2.status_code, 200)

    def test_detail_project_students(self):
        """Test that students can view a project"""
        project = ProjectFactory.create(course=self.sandbox_course)
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get(
            "/course/{}/project/{}/".format(
                self.sandbox_course.pk, project.pk))
        self.assertEqual(response.status_code, 200)
