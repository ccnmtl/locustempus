"""Tests for forms"""
from django.test import TestCase
from django.urls.base import reverse
from locustempus.main.forms import CourseForm
from locustempus.main.tests.factories import (
    SandboxCourseFactory, CourseTestMixin, UserFactory,
)


class CourseModelFormTest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    def test_form_save_override(self):
        self.assertIsNone(self.sandbox_course.get_detail('description', None))
        course_form = CourseForm(
            instance=self.sandbox_course,
            data={
                'title': 'A new title',
                'description': 'A new description'
            }
        )

        self.assertTrue(course_form.is_valid())
        course_form.save()
        self.assertEqual(
            self.sandbox_course.get_detail('description', None),
            'A new description'
        )
