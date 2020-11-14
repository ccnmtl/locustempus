from django.contrib.auth.models import AnonymousUser
from django.test import TestCase
from django.urls.base import reverse
from locustempus.main.permissions import (
    IsLoggedInCourse, IsLoggedInFaculty
)
from locustempus.main.tests.factories import (
    CourseTestMixin, UserFactory, ProjectFactory, ActivityFactory
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


class LayerAPITest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    def test_layer_create(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        project = self.sandbox_course.projects.first()
        response = self.client.post(
            reverse('api-layer-list'),
            {
                'title': 'A Title',
                'content_object': reverse(
                    'api-project-detail', args=[project.pk])
            }
        )
        self.assertEqual(response.status_code, 201)

    def test_layer_read(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        project = self.sandbox_course.projects.first()
        self.client.post(
            reverse('api-layer-list'),
            {
                'title': 'A Title',
                'content_object': reverse(
                    'api-project-detail', args=[project.pk])
            }
        )

        layer = project.layers.first()
        response = self.client.get(
            reverse('api-layer-detail', args=[layer.pk])
        )
        self.assertEqual(response.status_code, 200)

    def test_layer_update(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        project = self.sandbox_course.projects.first()
        r1 = self.client.post(
            reverse('api-layer-list'),
            {
                'title': 'A Title',
                'content_object': reverse(
                    'api-project-detail', args=[project.pk])
            }
        )
        self.assertEqual(r1.status_code, 201)

        r2 = self.client.post(
            reverse('api-layer-list'),
            {
                'title': 'A Different Title',
                'content_object': reverse(
                    'api-project-detail', args=[project.pk])
            }
        )
        self.assertEqual(r2.status_code, 201)

    def test_layer_delete(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        project = self.sandbox_course.projects.first()
        self.client.post(
            reverse('api-layer-list'),
            {
                'title': 'A Title',
                'content_object': reverse(
                    'api-project-detail', args=[project.pk])
            }
        )

        layer = project.layers.first()
        response = self.client.delete(
            reverse('api-layer-detail', args=[layer.pk])
        )
        self.assertEqual(response.status_code, 204)


class ResponseAPITest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    def test_create_student_response(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        p = ProjectFactory.create(course=self.sandbox_course)
        a = ActivityFactory.create(project=p)
        response = self.client.post(
            reverse('api-response-list'),
            {
                'activity': a.pk,
            }
        )
        self.assertEqual(response.status_code, 201)

    def test_faculty_activity_response_querystring(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )

        response = self.client.get(
            reverse('api-response-list') + '?activity={}'.format(
                self.sandbox_course_activity.pk
            )
        )

        self.assertEqual(response.status_code, 200)

    def test_student_activity_response_querystring(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )

        response = self.client.get(
            reverse('api-response-list') + '?activity={}'.format(
                self.sandbox_course_activity.pk
            )
        )

        self.assertEqual(response.status_code, 200)
