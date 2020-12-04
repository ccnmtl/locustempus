from django.contrib.auth.models import AnonymousUser
from django.test import TestCase
from django.urls.base import reverse
from locustempus.main.models import Response
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
    """
    This test class focuses on testing the get_queryset method of
    the viewset.
    """
    def setUp(self):
        self.setup_course()

    def test_get_queryset_faculty(self):
        """
        Tests that the expected queryset is returned for GET
        requests from faculty
        """
        # List GET
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        r1 = self.client.get(
            reverse('api-response-list'),
        )
        self.assertEqual(r1.status_code, 200)
        for el in r1.data:
            r = Response.objects.get(pk=el['pk'])
            self.assertIn(self.faculty, r.owners.all())

        self.assertEqual(len(r1.data), 0)

        # List GET w/ querystring
        r2 = self.client.get(
            reverse('api-response-list') + '?activity={}'.format(
                self.sandbox_course_activity.pk
            )
        )

        self.assertEqual(r2.status_code, 200)
        self.assertEqual(len(r2.data), 1)

        # GET
        r3 = self.client.get(
            reverse(
                'api-response-detail', args=[self.sandbox_course_response.pk]
            )
        )
        self.assertEqual(r3.status_code, 404)

    def test_get_queryset_student(self):
        """
        Tests that the expected queryset is returned for GET
        requests from students
        """
        # List GET
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        r1 = self.client.get(
            reverse('api-response-list'),
        )
        self.assertEqual(r1.status_code, 200)
        for el in r1.data:
            r = Response.objects.get(pk=el['pk'])
            self.assertIn(self.student, r.owners.all())

        self.assertEqual(len(r1.data), 2)

        # List GET w/ querystring
        r2 = self.client.get(
            reverse('api-response-list') + '?activity={}'.format(
                self.sandbox_course_activity.pk
            )
        )

        self.assertEqual(r2.status_code, 200)
        self.assertEqual(len(r2.data), 1)

        # GET
        r3 = self.client.get(
            reverse(
                'api-response-detail', args=[self.sandbox_course_response.pk]
            )
        )
        self.assertEqual(r3.status_code, 200)

    def test_get_queryset_authed(self):
        """
        Tests that authed users who make a GET request, with a querystring for
        a course which they are not members, that it returns an empty queryset
        """
        authed_user = UserFactory.create(
            first_name='Student',
            last_name='Two',
            email='studenttwo@example.com'
        )

        self.assertTrue(
            self.client.login(
                username=authed_user,
                password='test'
            )
        )

        r = self.client.get(
            reverse('api-response-list') + '?activity={}'.format(
                self.sandbox_course_activity.pk
            )
        )

        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.data), 0)
