from django.contrib.auth.models import AnonymousUser
from django.test import TestCase
from django.urls.base import reverse
from locustempus.main.permissions import (
    IsLoggedInCourse, IsLoggedInFaculty
)
from locustempus.main.tests.factories import (
    CourseTestMixin, UserFactory
)
from unittest.mock import MagicMock


class IsLoggedInCourseTest(CourseTestMixin, TestCase):
    """Unit tests for IsLoggedInCourse permission class"""
    def setUp(self):
        self.setup_course()
        self.perm = IsLoggedInCourse()

    def test_faculty(self):
        request = MagicMock(user=self.faculty)
        view = MagicMock()
        project = self.sandbox_course.projects.first()
        self.assertTrue(
            self.perm.has_object_permission(request, view, project))

    def test_student(self):
        request = MagicMock(user=self.student)
        view = MagicMock()
        project = self.sandbox_course.projects.first()
        self.assertTrue(
            self.perm.has_object_permission(request, view, project))

    def test_superuser(self):
        request = MagicMock(user=self.superuser)
        view = MagicMock()
        project = self.sandbox_course.projects.first()
        self.assertTrue(
            self.perm.has_object_permission(request, view, project))

    def test_non_course_user(self):
        request = MagicMock(user=UserFactory())
        view = MagicMock()
        project = self.sandbox_course.projects.first()
        self.assertFalse(
            self.perm.has_object_permission(request, view, project))

    def test_anon_user(self):
        request = MagicMock(user=AnonymousUser())
        view = MagicMock()
        project = self.sandbox_course.projects.first()
        self.assertFalse(
            self.perm.has_object_permission(request, view, project))


class IsLoggedInFacultyTest(CourseTestMixin, TestCase):
    """Unit tests for IsLoggedInFaculty permission class"""
    def setUp(self):
        self.setup_course()
        self.perm = IsLoggedInFaculty()

    def test_faculty(self):
        request = MagicMock(user=self.faculty)
        view = MagicMock()
        project = self.sandbox_course.projects.first()
        self.assertTrue(
            self.perm.has_object_permission(request, view, project))

    def test_student(self):
        request = MagicMock(user=self.student)
        view = MagicMock()
        project = self.sandbox_course.projects.first()
        self.assertFalse(
            self.perm.has_object_permission(request, view, project))

    def test_superuser(self):
        request = MagicMock(user=self.superuser)
        view = MagicMock()
        project = self.sandbox_course.projects.first()
        self.assertTrue(
            self.perm.has_object_permission(request, view, project))

    def test_non_course_user(self):
        request = MagicMock(user=UserFactory())
        view = MagicMock()
        project = self.sandbox_course.projects.first()
        self.assertFalse(
            self.perm.has_object_permission(request, view, project))

    def test_anon_user(self):
        request = MagicMock(user=AnonymousUser())
        view = MagicMock()
        project = self.sandbox_course.projects.first()
        self.assertFalse(
            self.perm.has_object_permission(request, view, project))


class ProjectAPITest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    def test_course_faculty(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )

        project = self.sandbox_course.projects.first()
        response = self.client.get(
            reverse('api-project-detail', args=[project.pk]))
        self.assertEqual(response.status_code, 200)

    def test_course_student(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )

        project = self.sandbox_course.projects.first()
        response = self.client.get(
            reverse('api-project-detail', args=[project.pk]))
        self.assertEqual(response.status_code, 200)

    def test_superuser(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )

        project = self.sandbox_course.projects.first()
        response = self.client.get(
            reverse('api-project-detail', args=[project.pk]))
        self.assertEqual(response.status_code, 200)

    def test_non_course_user(self):
        user = UserFactory.create()
        self.assertTrue(
            self.client.login(
                username=user.username,
                password='test'
            )
        )

        project = self.sandbox_course.projects.first()
        response = self.client.get(
            reverse('api-project-detail', args=[project.pk]))
        self.assertEqual(response.status_code, 403)

    def test_anon(self):
        project = self.sandbox_course.projects.first()
        response = self.client.get(
            reverse('api-project-detail', args=[project.pk]))
        self.assertEqual(response.status_code, 403)
