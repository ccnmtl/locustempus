from django.template import Context
from django.test import TestCase
from locustempus.main.templatetags.is_course_faculty import is_course_faculty
from locustempus.main.tests.factories import (
    CourseTestMixin, UserFactory
)


class IsCourseFacultyTest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    def test_is_course_faculty(self):
        context = Context({'course': self.sandbox_course})
        self.assertTrue(is_course_faculty(context, self.faculty))

    def test_is_course_faculty_student(self):
        context = Context({'course': self.sandbox_course})
        self.assertFalse(is_course_faculty(context, self.student))

    def test_is_course_faculty_not_in_course(self):
        context = Context({'course': self.sandbox_course})
        some_user = UserFactory(
            first_name='Random',
            last_name='User',
            email='random@example.com'
        )
        self.assertFalse(is_course_faculty(context, some_user))
