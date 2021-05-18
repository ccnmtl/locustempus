from courseaffils.models import Course
from django.contrib.auth.models import AnonymousUser
from django.test import TestCase
from django.urls.base import reverse
import json
from locustempus.main.models import Response, Layer, Event
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
        p1 = self.sandbox_course.projects.first()
        p2 = self.sandbox_course.projects.last()
        self.assertFalse(
            self.perm.has_object_permission(request, view, p1))
        self.assertTrue(
            self.perm.has_object_permission(request, view, p2))

    def test_superuser(self):
        request = MagicMock(user=self.superuser)
        view = MagicMock()
        project = self.sandbox_course.projects.first()
        self.assertFalse(
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
        self.assertFalse(
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

    def test_course_faculty_list(self):
        """LIST request"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )

        # Test that a list requests only returns projects the user
        # is faculty for
        r = self.client.get(reverse('api-project-list'))
        self.assertEqual(r.status_code, 200)
        for proj in r.data:
            c = Course.objects.get(pk=proj['course']['pk'])
            self.assertTrue(c.is_true_faculty(self.faculty))

    def test_course_faculty_get(self):
        """GET request"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        project = self.sandbox_course.projects.first()
        r = self.client.get(
            reverse('api-project-detail', args=[project.pk]))
        self.assertEqual(r.status_code, 200)

    def test_course_faculty_post(self):
        """POST request"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )

        # Projects should not be created via the API
        r = self.client.post(
            reverse('api-project-list'),
            {
                'title': 'A Project Title',
                'description': 'foo',
                'base_map': 'some_map',
                'layers': [],
                'raster_layers': []
            }
        )
        self.assertEqual(r.status_code, 400)

    def test_course_faculty_put(self):
        """PUT request"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        project = self.sandbox_course.projects.first()
        r1 = self.client.put(
            reverse('api-project-detail', args=[project.pk]),
            json.dumps({
                'title': 'Updated Title',
            }),
            content_type='application/json'
        )
        self.assertEqual(r1.status_code, 200)

        # Try editing a project in a different course
        r2 = self.client.put(
            reverse('api-project-detail',
                    args=[self.fake_course_project.pk]),
            json.dumps({
                'title': 'Updated Title'
            }),
            content_type='application/json'
        )
        self.assertEqual(r2.status_code, 404)

    def test_course_faculty_delete(self):
        """DELETE request"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )

        project = self.sandbox_course.projects.first()
        r1 = self.client.delete(
            reverse('api-project-detail', args=[project.pk]))
        self.assertEqual(r1.status_code, 204)

        # Test deleting a project in a different course
        r2 = self.client.delete(
            reverse('api-project-detail',
                    args=[self.fake_course_project.pk]))
        self.assertEqual(r2.status_code, 404)

    def test_course_student(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )

        p1 = self.sandbox_course.projects.first()
        r1 = self.client.get(
            reverse('api-project-detail', args=[p1.pk]))
        self.assertEqual(r1.status_code, 404)

        p2 = self.sandbox_course.projects.last()
        r2 = self.client.get(
            reverse('api-project-detail', args=[p2.pk]))
        self.assertEqual(r2.status_code, 200)

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
        self.assertEqual(response.status_code, 404)

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
        self.assertEqual(response.status_code, 404)

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


class EventAPITest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()
        self.project = self.sandbox_course.projects.first()
        self.layer = Layer.objects.create(
            title='A Title', content_object=self.project)

    def test_event_create(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        r1 = self.client.post(
            reverse('api-event-list'),
            json.dumps({
                'label': 'An Event Label',
                'layer': self.layer.pk,
                'description': 'A short description.',
                'location': {
                    'point': {'lat': 45.1, 'lng': 45.1},
                },
                'media': None
            }),
            content_type='application/json'
        )
        self.assertEqual(r1.status_code, 201)

        r2 = self.client.post(
            reverse('api-event-list'),
            json.dumps({
                'label': 'An Event Label',
                'layer': self.layer.pk,
                'description': 'A short description.',
                'location': {
                    'point': {'lat': 45.1, 'lng': 45.1},
                },
                'media': [{'url': 'https://some.bucket.example.com'}]
            }),
            content_type='application/json'
        )
        self.assertEqual(r2.status_code, 201)

    def test_event_read(self):
        event = Event.objects.create(
            label='An event label',
            layer=self.layer,
            description='A description',
            created_by=self.faculty
        )

        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )

        response = self.client.get(
            reverse(
                'api-event-detail', args=[event.pk]
            )
        )
        self.assertEqual(response.status_code, 200)

    def test_event_update(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        r1_data = {
            'label': 'An Event Label',
            'layer': self.layer.pk,
            'description': 'A short description.',
            'location': {
                'point': {'lat': 45.1, 'lng': 45.1},
            },
            'media': [{'url': 'https://some.bucket.example.com/img1.jpg'}]
        }
        r1 = self.client.post(
            reverse('api-event-list'),
            json.dumps(r1_data),
            content_type='application/json'
        )

        r2_data = {
            'label': 'A different Event Label',
            'layer': self.layer.pk,
            'description': 'A different short description.',
            'location': {
                'point': {'lat': 45.0, 'lng': 90.0},
            },
            'media': [{
                'url': 'https://some.bucket.example.com/img2.jpg',
                'caption': '',
                'source': ''
            }]
        }

        r2 = self.client.put(
            reverse(
                'api-event-detail', args=[r1.json()['pk']]
            ),
            json.dumps(r2_data),
            content_type='application/json'
        )
        ret_data = r2.json()
        self.assertEqual(r2.status_code, 200)
        # Checks that the custom serializers correct transform
        # location and media
        self.assertEqual(ret_data['description'], r2_data['description'])
        self.assertEqual(ret_data['label'], r2_data['label'])
        self.assertEqual(ret_data['media'], r2_data['media'])
        # Test longitude update
        self.assertEqual(
            ret_data['location']['lng_lat'][0],
            r2_data['location']['point']['lng']
        )
        # Test latitude update
        self.assertEqual(
            ret_data['location']['lng_lat'][1],
            r2_data['location']['point']['lat']
        )

    def test_event_delete(self):
        event = Event.objects.create(
            label='An event label',
            layer=self.layer,
            description='A description',
        )

        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )

        response = self.client.delete(
            reverse(
                'api-event-detail', args=[event.pk]
            )
        )
        self.assertEqual(response.status_code, 204)

    def test_event_media_delete(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        data = {
            'label': 'An Event Label',
            'layer': self.layer.pk,
            'description': 'A short description.',
            'location': {
                'point': {'lat': 45.1, 'lng': 45.1},
            },
            'media': [{'url': 'https://some.bucket.example.com/img1.jpg'}]
        }
        r1 = self.client.post(
            reverse('api-event-list'),
            json.dumps(data),
            content_type='application/json'
        )

        # Remove the media
        data['media'] = None

        r2 = self.client.put(
            reverse(
                'api-event-detail', args=[r1.json()['pk']]
            ),
            json.dumps(data),
            content_type='application/json'
        )
        ret_data = r2.json()
        self.assertListEqual(ret_data['media'], [])


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
        self.assertEqual(len(r2.data), 0)

        # Now 'submit' the student response
        self.sandbox_course_response.status = \
            self.sandbox_course_response.SUBMITTED
        self.sandbox_course_response.save()
        r3 = self.client.get(
            reverse('api-response-list') + '?activity={}'.format(
                self.sandbox_course_activity.pk
            )
        )

        self.assertEqual(r3.status_code, 200)
        self.assertEqual(len(r3.data), 1)

        # GET
        r4 = self.client.get(
            reverse(
                'api-response-detail', args=[self.sandbox_course_response.pk]
            )
        )
        self.assertEqual(r4.status_code, 404)

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
