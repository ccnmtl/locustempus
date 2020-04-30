"""Tests for LTI views"""
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
    CourseTestMixin, UserFactory,
)


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
