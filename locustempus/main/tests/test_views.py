from courseaffils.columbia import CourseStringMapper
from courseaffils.models import Course
from django.conf import settings
from django.contrib.auth.models import Group
from django.core import mail
from django.test import TestCase
from django.urls.base import reverse
from lti_provider.models import LTICourseContext
from lti_provider.tests.factories import LTICourseContextFactory


from locustempus.main.tests.factories import (
    CourseFactory, CourseTestMixin, UserFactory)


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

    def test_create_student(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get("/course/create/")
        self.assertEqual(response.status_code, 403)

    def test_create_faculty(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get("/course/create/")
        self.assertEqual(response.status_code, 403)

    def test_create_superuser(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.get("/course/create/")
        self.assertEqual(response.status_code, 200)

    def test_create_superuser_post(self):
        # TODO
        pass

    # For CourseListView
    def test_list_anon(self):
        response = self.client.get("/course/list/")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url, "/accounts/login/?next=/course/list/")

    def test_list_student(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get("/course/list/")
        self.assertEqual(response.status_code, 200)

    def test_list_faculty(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get("/course/list/")
        self.assertEqual(response.status_code, 200)

    def test_list_superuser(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.get("/course/list/")
        self.assertEqual(response.status_code, 200)

    # For CourseDetailView
    def test_detail_anon(self):
        response = self.client.get("/course/{}/".format(self.course.pk))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/accounts/login/?next=/course/{}/".format(self.course.pk))

    def test_detail_student_in_course(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/".format(self.course.pk))
        self.assertEqual(response.status_code, 200)

    def test_detail_student_not_in_course(self):
        alternate_course = CourseFactory.create()
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
        response = self.client.get("/course/{}/".format(self.course.pk))
        self.assertEqual(response.status_code, 200)

    def test_detail_faculty_not_in_course(self):
        alternate_course = CourseFactory.create()
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
        response = self.client.get("/course/{}/".format(self.course.pk))
        self.assertEqual(response.status_code, 200)

    # For CourseEditView
    def test_edit_anon(self):
        response = self.client.get("/course/{}/edit/".format(self.course.pk))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/accounts/login/?next=/course/{}/edit/".format(self.course.pk))

    def test_edit_student(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/edit/".format(self.course.pk))
        self.assertEqual(response.status_code, 403)

    def test_edit_faculty_in_course(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/edit/".format(self.course.pk))
        self.assertEqual(response.status_code, 200)

    def test_edit_faculty_post(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/edit/".format(self.course.pk),
            {'title': 'An edited course'}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/course/{}/".format(self.course.pk))

    def test_edit_faculty_not_in_course(self):
        alternate_course = CourseFactory.create()
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
        response = self.client.get("/course/{}/edit/".format(self.course.pk))
        self.assertEqual(response.status_code, 200)

    def test_edit_superuser_post(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/edit/".format(self.course.pk),
            {'title': 'An edited course'}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/course/{}/".format(self.course.pk))

    def test_delete_anon(self):
        response = self.client.get("/course/{}/delete/".format(self.course.pk))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/accounts/login/?next=/course/{}/delete/".format(self.course.pk))

    def test_delete_faculty(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/delete/".format(self.course.pk))
        self.assertEqual(response.status_code, 200)

    def test_delete_faculty_post(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/delete/".format(self.course.pk))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, '/course/list/')

    def test_delete_faculty_not_in_course(self):
        alternate_course = CourseFactory.create()
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
        response = self.client.get("/course/{}/delete/".format(self.course.pk))
        self.assertEqual(response.status_code, 200)

    def test_delete_superuser_post(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/delete/".format(self.course.pk))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/course/list/")

    def test_course_roster_faculty(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get(
            "/course/{}/roster/".format(self.course.pk))
        self.assertEqual(response.status_code, 200)

    def test_course_roster_faculty_not_in_course(self):
        alternate_course = CourseFactory.create()
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
            "/course/{}/roster/".format(self.course.pk))
        self.assertEqual(response.status_code, 200)

    def test_course_roster_student(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get(
            "/course/{}/roster/".format(self.course.pk))
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
            "/course/{}/roster/promote/".format(self.course.pk),
            {'user_id': self.student.pk}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url,
                         "/course/{}/roster/".format(self.course.pk))
        self.assertTrue(self.course.is_true_faculty(self.student))

    def test_course_roster_demote(self):
        """Test that a faculty can demote a user"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/roster/demote/".format(self.course.pk),
            {'user_id': self.faculty.pk}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url,
                         "/course/{}/roster/".format(self.course.pk))
        # Check that the demoted user is still a member of the course
        self.assertTrue(self.course.is_member(self.faculty))
        self.assertFalse(self.course.is_true_faculty(self.faculty))

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
            "/course/{}/roster/promote/".format(self.course.pk),
            {'user_id': self.student.pk}
        )
        self.assertEqual(response.status_code, 403)
        response = self.client.post(
            "/course/{}/roster/demote/".format(self.course.pk),
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
            "/course/{}/roster/remove/".format(self.course.pk),
            {'user_id': self.student.pk}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url,
                         "/course/{}/roster/".format(self.course.pk))
        self.assertFalse(self.course.is_true_member(self.student))

    def test_course_roster_remove_faculty(self):
        """Test that a faculty can demote a user"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        self.course.faculty_group.user_set.add(self.student)
        response = self.client.post(
            "/course/{}/roster/remove/".format(self.course.pk),
            {'user_id': self.student.pk}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url,
                         "/course/{}/roster/".format(self.course.pk))
        self.assertFalse(self.course.is_true_member(self.student))

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
            "/course/{}/roster/remove/".format(self.course.pk),
            {'user_id': self.student.pk}
        )
        self.assertEqual(response.status_code, 403)
        response = self.client.post(
            "/course/{}/roster/demote/".format(self.course.pk),
            {'user_id': self.faculty.pk}
        )
        self.assertEqual(response.status_code, 403)


class LTICourseSelectorTest(CourseTestMixin, TestCase):

    def setUp(self):
        self.setup_course()

    def test_get(self):
        ctx = LTICourseContextFactory(
            group=self.course.group,
            faculty_group=self.course.faculty_group)

        url = reverse('lti-course-select', args=[ctx.lms_course_context])

        self.client.login(username=self.faculty.username, password='test')
        response = self.client.get(url, follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['course'], self.course)


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
            "/course/{}/roster/invite/".format(self.course.pk))
        self.assertEqual(response.status_code, 200)

    def test_get_course_invite_page_student(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get(
            "/course/{}/roster/invite/".format(self.course.pk))
        self.assertEqual(response.status_code, 403)

    def test_get_course_invite_page_anon(self):
        response = self.client.get(
            "/course/{}/roster/invite/".format(self.course.pk))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/accounts/login/?next=/course/{}/roster/invite/".format(
                self.course.pk))

    def test_post_valid_uni(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/roster/invite/".format(self.course.pk),
            {
                'uni-TOTAL_FORMS': '1',
                'uni-INITIAL_FORMS': '0',
                'uni-0-invitee': 'abc123'
            }
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/course/{}/roster/".format(self.course.pk))

    def test_post_invalid_uni(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            "/course/{}/roster/invite/".format(self.course.pk),
            {
                'uni-TOTAL_FORMS': '1',
                'uni-INITIAL_FORMS': '0',
                'uni-0-invitee': 'foobar'
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertInHTML(
            'This is not a valid UNI.', response.content.decode('utf-8'))

    def test_post_no_uni(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        self.assertEqual(2, len(self.course.members))
        response = self.client.post(
            "/course/{}/roster/invite/".format(self.course.pk),
            {
                'uni-TOTAL_FORMS': '1',
                'uni-INITIAL_FORMS': '0',
                'uni-0-invitee': ''
            }
        )
        self.assertInHTML(
            'This field is required.', response.content.decode('utf-8'))
        self.assertEqual(2, len(self.course.members))
