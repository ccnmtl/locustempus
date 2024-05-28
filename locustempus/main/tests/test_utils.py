from courseaffils.tests.factories import (
    CourseFactory
)
from django.core import mail
from django.test.testcases import TestCase
from django.urls.base import reverse

from locustempus.main.tests.factories import UserFactory
from locustempus.main.utils import (
    get_courses_for_user, get_courses_for_instructor, send_template_email
)


class UtilTest(TestCase):

    def test_send_template_email(self):
        user = UserFactory()
        with self.settings(SERVER_EMAIL='locustempus@example.com'):
            send_template_email('foo', 'main/notify_lti_course_connect.txt',
                                {'user': user}, 'abc123@columbia.edu')
            self.assertEqual(len(mail.outbox), 1)
            self.assertEqual(mail.outbox[0].subject, 'foo')
            self.assertEqual(mail.outbox[0].from_email,
                             'locustempus@example.com')
            self.assertTrue(mail.outbox[0].to, ['abc123@columbia.edu'])

    def test_sentry_dsn_processor(self):
        with self.settings(SENTRY_DSN='foo'):
            r = self.client.get(reverse('index-view'))
            self.assertEqual('foo', r.context['SENTRY_DSN'])

    def test_get_courses(self):
        course = CourseFactory()
        student = UserFactory()
        instructor = UserFactory()

        course.group.user_set.add(student)
        course.group.user_set.add(instructor)
        course.faculty_group.user_set.add(instructor)

        # as student
        lst = get_courses_for_user(student)
        self.assertEqual(len(lst), 1)
        self.assertTrue(course in lst)

        lst = get_courses_for_instructor(student)
        self.assertEqual(len(lst), 0)

        # as instructor
        lst = get_courses_for_user(instructor)
        self.assertEqual(len(lst), 1)
        self.assertTrue(course in lst)

        lst = get_courses_for_instructor(instructor)
        self.assertEqual(len(lst), 1)
        self.assertTrue(course in lst)
