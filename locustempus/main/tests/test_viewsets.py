from courseaffils.models import Course
from django.contrib.auth.models import AnonymousUser
from django.test import TestCase
from django.urls.base import reverse
import json
from locustempus.main.models import (
    Activity, Response, Layer, Event, Project
)
from locustempus.main.permissions import (
    IsLoggedInCourse, IsLoggedInFaculty, LayerPermission
)
from locustempus.main.tests.factories import (
    CourseTestMixin, UserFactory, LayerFactory, ResponseFactory,
    ProjectFactory
)
from unittest.mock import MagicMock
from waffle.testutils import override_flag


SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS')
UNSAFE_METHODS = ('PUT', 'POST', 'PATCH', 'DELETE')
METHODS = SAFE_METHODS + UNSAFE_METHODS


class IsLoggedInCourseTest(CourseTestMixin, TestCase):
    """Unit tests for IsLoggedInCourse permission class"""
    def setUp(self):
        self.setup_course()
        self.perm = IsLoggedInCourse()

    def test_auth_has_permission(self):
        request = MagicMock(user=self.faculty)
        view = MagicMock()

        for method in ('GET', 'HEAD', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'):
            request.method = method
            self.assertTrue(
                self.perm.has_permission(request, view))

        request.method = 'POST'
        self.assertFalse(
            self.perm.has_permission(request, view))

    def test_anon_has_permission(self):
        request = MagicMock(user=AnonymousUser())
        view = MagicMock()

        for method in METHODS:
            request.method
            self.assertFalse(
                self.perm.has_permission(request, view))

    def test_faculty_object_permission(self):
        request = MagicMock(user=self.faculty)
        view = MagicMock()
        project = self.sandbox_course.projects.first()

        for method in ('GET', 'HEAD', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'):
            request.method = method
            self.assertTrue(
                self.perm.has_object_permission(request, view, project))

        request.method = 'POST'
        self.assertFalse(
            self.perm.has_object_permission(request, view, project))

    def test_student_object_permission(self):
        request = MagicMock(user=self.student)
        view = MagicMock()

        # This project does not have an activity, and student
        # should not be able to see it
        p1 = self.sandbox_course.projects.first()
        for method in METHODS:
            request.method = method
            self.assertFalse(
                self.perm.has_object_permission(request, view, p1))

        # This project does have an activity, and student
        # should be able to see it
        p2 = self.sandbox_course.projects.last()
        for method in SAFE_METHODS:
            request.method = method
            self.assertTrue(
                self.perm.has_object_permission(request, view, p2))

        for method in UNSAFE_METHODS:
            request.method = method
            self.assertFalse(
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
        """GET / request"""
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
        self.assertEqual(r.status_code, 403)

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
                    args=[self.alt_course_project.pk]),
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
                    args=[self.alt_course_project.pk]))
        self.assertEqual(r2.status_code, 404)

    def test_course_student_list(self):
        """GET / request"""
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )

        r = self.client.get(reverse('api-project-list'))
        self.assertEqual(r.status_code, 200)
        for proj in r.data:
            c = Course.objects.get(pk=proj['course']['pk'])
            self.assertTrue(c.is_true_member(self.student))

    def test_course_student_get(self):
        """GET request"""
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

    def test_course_student_post(self):
        """POST request"""
        self.assertTrue(
            self.client.login(
                username=self.student.username,
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
        self.assertEqual(r.status_code, 403)

    def test_course_student_put(self):
        """PUT request"""
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )

        # Try editing a project that the student can not see
        p1 = self.sandbox_course.projects.first()
        r1 = self.client.put(
            reverse('api-project-detail', args=[p1.pk]),
            json.dumps({
                'title': 'Updated Title',
            }),
            content_type='application/json'
        )
        self.assertEqual(r1.status_code, 404)

        # Next try editing a project that the student CAN see
        p2 = self.sandbox_course.projects.last()
        r2 = self.client.put(
            reverse('api-project-detail', args=[p2.pk]),
            json.dumps({
                'title': 'Updated Title',
            }),
            content_type='application/json'
        )
        self.assertEqual(r2.status_code, 403)

    def test_course_student_delete(self):
        """DELETE request"""
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )

        # Try deleting a project the student can not see
        p1 = self.sandbox_course.projects.first()
        r1 = self.client.delete(
            reverse('api-project-detail', args=[p1.pk]))
        self.assertEqual(r1.status_code, 404)

        # Try deleting a project the student can see
        p2 = self.sandbox_course.projects.last()
        r2 = self.client.delete(
            reverse('api-project-detail', args=[p2.pk]))
        self.assertEqual(r2.status_code, 403)

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

    def test_non_course_user_list(self):
        """GET / request"""
        user = UserFactory.create()
        self.assertTrue(
            self.client.login(
                username=user.username,
                password='test'
            )
        )

        r = self.client.get(reverse('api-project-list'))
        self.assertEqual(r.status_code, 200)
        self.assertListEqual(r.data, [])

    def test_non_course_user_get(self):
        """GET request"""
        user = UserFactory.create()
        self.assertTrue(
            self.client.login(
                username=user.username,
                password='test'
            )
        )

        for proj in Project.objects.all():
            r = self.client.get(
                reverse('api-project-detail', args=[proj.pk]))
            self.assertEqual(r.status_code, 404)

    def test_non_course_user_post(self):
        """POST request"""
        user = UserFactory.create()
        self.assertTrue(
            self.client.login(
                username=user.username,
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
        self.assertEqual(r.status_code, 403)

    def test_non_course_user_put(self):
        """PUT request"""
        user = UserFactory.create()
        self.assertTrue(
            self.client.login(
                username=user.username,
                password='test'
            )
        )

        for proj in Project.objects.all():
            r = self.client.put(
                reverse('api-project-detail', args=[proj.pk]),
                json.dumps({
                    'title': 'Updated Title',
                }),
                content_type='application/json'
            )
            self.assertEqual(r.status_code, 404)

    def test_non_course_user_delete(self):
        """DELETE request"""
        user = UserFactory.create()
        self.assertTrue(
            self.client.login(
                username=user.username,
                password='test'
            )
        )

        for proj in Project.objects.all():
            r = self.client.delete(
                reverse('api-project-detail', args=[proj.pk]))
            self.assertEqual(r.status_code, 404)

    def test_anon_list(self):
        response = self.client.get(reverse('api-project-list'))
        self.assertEqual(response.status_code, 403)

    def test_anon_get(self):
        project = self.sandbox_course.projects.first()
        response = self.client.get(
            reverse('api-project-detail', args=[project.pk]))
        self.assertEqual(response.status_code, 403)

    def test_anon_post(self):
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
        self.assertEqual(r.status_code, 403)

    def test_anon_put(self):
        project = self.sandbox_course.projects.first()
        r = self.client.put(
            reverse('api-project-detail', args=[project.pk]),
            json.dumps({
                'title': 'Updated Title',
            }),
            content_type='application/json'
        )
        self.assertEqual(r.status_code, 403)

    def test_anon_delete(self):
        project = self.sandbox_course.projects.first()
        r = self.client.delete(
            reverse('api-project-detail', args=[project.pk]))
        self.assertEqual(r.status_code, 403)

    @override_flag('share_response_layers', active=True)
    def test_faculty_aggregated_layers(self):
        """Checks that aggregated_layers are empty for faculty"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        project = self.sandbox_course.projects.first()
        # Add layer to draft response
        LayerFactory(
            title='Untitled Response Layer',
            content_object=self.sandbox_course_response
        )
        self.assertEqual(
            self.sandbox_course_response.status,
            Response.DRAFT
        )
        r1 = self.client.get(
            reverse('api-project-detail', args=[project.pk]))
        self.assertListEqual(r1.data['aggregated_layers'], [])

        # Create a submission
        self.sandbox_course_response.status = Response.SUBMITTED
        self.sandbox_course_response.save()
        r2 = self.client.get(
            reverse('api-project-detail', args=[project.pk]))
        self.assertListEqual(r2.data['aggregated_layers'], [])

    @override_flag('share_response_layers', active=True)
    def test_student_aggregated_layers(self):
        """
        Checks that a student who has not submitted
        yet can not see other student/contributor's layers.

        Then it checks that once a student submits, they can see
        other submitted responses.
        """
        # Setup a student, add to course, create a submitted response
        student = UserFactory.create(
            first_name='Student',
            last_name='Fake',
            email='fakestudent@example.com'
        )
        self.sandbox_course.group.user_set.add(student)
        student_response = ResponseFactory.create(
            activity=self.sandbox_course_activity,
            owners=[student],
            status=Response.SUBMITTED
        )
        LayerFactory.create(
            title='Untitled Response Layer',
            content_object=student_response
        )

        # Setup another student, add to course, but creates a draft response
        stu = UserFactory.create(
            first_name='Stu',
            last_name='The Fake Student',
            email='fakestudentstu@example.com'
        )
        self.sandbox_course.group.user_set.add(student)
        stu_response = ResponseFactory.create(
            activity=self.sandbox_course_activity,
            owners=[stu],
            status=Response.DRAFT
        )
        LayerFactory.create(
            title='Stu\'s Untitled Response Layer',
            content_object=stu_response
        )

        # Now login as test user and confirm user can not see layers
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        project = self.sandbox_course.projects.last()
        r1 = self.client.get(
            reverse('api-project-detail', args=[project.pk]))
        self.assertListEqual(r1.data['aggregated_layers'], [])

        # Now student submits their response
        self.sandbox_course_response.status = Response.SUBMITTED
        self.sandbox_course_response.save()
        r2 = self.client.get(
            reverse('api-project-detail', args=[project.pk]))

        # Assert that we can only see the layer related
        # to the submitted response
        for lyr in r2.data['aggregated_layers']:
            pk = lyr.split('/')[-2]
            layer = Layer.objects.get(pk=int(pk))
            # First assert that the layer is related to a Response and that
            # the response is related to our specific activity
            self.assertTrue(
                isinstance(layer.content_object, Response) and
                layer.content_object.activity == self.sandbox_course_activity
            )
            # The student needs to own the related Response or the Response
            # needs to be submitted or reviewed
            self.assertTrue(
                self.student in layer.content_object.owners.all() or
                layer.content_object.status in [
                    Response.SUBMITTED, Response.REVIEWED]
            )


class ActivityAPITest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    def test_faculty_get_list(self):
        """GET / request"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )

        r = self.client.get(reverse('api-activity-list'))
        self.assertEqual(r.status_code, 200)
        for activity in r.data:
            proj = Project.objects.get(pk=activity['project'])
            self.assertTrue(proj.course.is_true_faculty(self.faculty))

    def test_faculty_get(self):
        """GET request"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )

        for activity in Activity.objects.all():
            resp = self.client.get(
                reverse('api-activity-detail', args=[activity.pk]))
            in_course = activity.project.course.is_true_member(self.faculty)
            self.assertEqual(resp.status_code, 200 if in_course else 404)

    def test_faculty_post(self):
        """POST request"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )

        for project in Project.objects.filter(activity__isnull=True):
            resp = self.client.post(
                reverse('api-activity-list'),
                {
                    'project': project.pk,
                    'instructions': 'some instructions'
                }
            )
            is_faculty = project.course.is_true_faculty(self.faculty)
            self.assertEqual(resp.status_code, 201 if is_faculty else 403)

    def test_faculty_put(self):
        """PUT request"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )

        for activity in Activity.objects.all():
            resp = self.client.put(
                reverse('api-activity-detail', args=[activity.pk]),
                json.dumps({
                    'project': activity.project.pk,
                    'instructions': 'updated instructions'
                }),
                content_type='application/json'
            )
            is_faculty = activity.project.course.is_true_faculty(self.faculty)
            self.assertEqual(resp.status_code, 200 if is_faculty else 404)

    def test_faculty_delete(self):
        """DELETE request"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )

        for activity in Activity.objects.all():
            resp = self.client.delete(
                reverse('api-activity-detail', args=[activity.pk]))
            is_faculty = activity.project.course.is_true_faculty(self.faculty)
            self.assertEqual(resp.status_code, 204 if is_faculty else 404)

    def test_student_get_list(self):
        """GET / request"""
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )

        r = self.client.get(reverse('api-activity-list'))
        self.assertEqual(r.status_code, 200)
        for activity in r.data:
            proj = Project.objects.get(pk=activity['project'])
            self.assertTrue(proj.course.is_true_member(self.faculty))

    def test_student_get(self):
        """GET request"""
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )

        for activity in Activity.objects.all():
            resp = self.client.get(
                reverse('api-activity-detail', args=[activity.pk]))
            in_course = activity.project.course.is_true_member(self.student)
            self.assertEqual(resp.status_code, 200 if in_course else 404)

    def test_student_post(self):
        """POST request"""
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )

        for project in Project.objects.filter(activity__isnull=True):
            resp = self.client.post(
                reverse('api-activity-list'),
                {
                    'project': project.pk,
                    'instructions': 'some instructions'
                }
            )
            self.assertEqual(resp.status_code, 403)

    def test_student_put(self):
        """PUT request"""
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )

        for activity in Activity.objects.all():
            resp = self.client.put(
                reverse('api-activity-detail', args=[activity.pk]),
                json.dumps({
                    'project': activity.project.pk,
                    'instructions': 'updated instructions'
                }),
                content_type='application/json'
            )
            in_course = activity.project.course.is_true_member(self.student)
            self.assertEqual(resp.status_code, 403 if in_course else 404)

    def test_student_delete(self):
        """DELETE request"""
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )

        for activity in Activity.objects.all():
            resp = self.client.delete(
                reverse('api-activity-detail', args=[activity.pk]))
            in_course = activity.project.course.is_true_member(self.student)
            self.assertEqual(resp.status_code, 403 if in_course else 404)

    def test_non_course_user_get_list(self):
        """GET / request"""
        user = UserFactory.create()
        self.assertTrue(
            self.client.login(
                username=user.username,
                password='test'
            )
        )
        r = self.client.get(reverse('api-activity-list'))
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.data), 0)

    def test_non_course_user_get(self):
        """GET request"""
        user = UserFactory.create()
        self.assertTrue(
            self.client.login(
                username=user.username,
                password='test'
            )
        )

        for activity in Activity.objects.all():
            resp = self.client.get(
                reverse('api-activity-detail', args=[activity.pk]))
            self.assertEqual(resp.status_code, 404)

    def test_non_course_user_post(self):
        """POST request"""
        user = UserFactory.create()
        self.assertTrue(
            self.client.login(
                username=user.username,
                password='test'
            )
        )

        for project in Project.objects.filter(activity__isnull=True):
            resp = self.client.post(
                reverse('api-activity-list'),
                {
                    'project': project.pk,
                    'instructions': 'some instructions'
                }
            )
            self.assertEqual(resp.status_code, 403)

    def test_non_course_user_put(self):
        """PUT request"""
        user = UserFactory.create()
        self.assertTrue(
            self.client.login(
                username=user.username,
                password='test'
            )
        )

        for activity in Activity.objects.all():
            resp = self.client.put(
                reverse('api-activity-detail', args=[activity.pk]),
                json.dumps({
                    'project': activity.project.pk,
                    'instructions': 'updated instructions'
                }),
                content_type='application/json'
            )
            self.assertEqual(resp.status_code, 404)

    def test_non_course_user_delete(self):
        """DELETE request"""
        user = UserFactory.create()
        self.assertTrue(
            self.client.login(
                username=user.username,
                password='test'
            )
        )

        for activity in Activity.objects.all():
            resp = self.client.delete(
                reverse('api-activity-detail', args=[activity.pk]))
            self.assertEqual(resp.status_code, 404)

    def test_anon_get_list(self):
        """GET / request"""
        r = self.client.get(reverse('api-activity-list'))
        self.assertEqual(r.status_code, 403)

    def test_anon_get(self):
        """GET request"""
        for project in Project.objects.filter(activity__isnull=True):
            resp = self.client.post(
                reverse('api-activity-list'),
                {
                    'project': project.pk,
                    'instructions': 'some instructions'
                }
            )
            self.assertEqual(resp.status_code, 403)

    def test_anon_post(self):
        """POST request"""
        for project in Project.objects.filter(activity__isnull=True):
            resp = self.client.post(
                reverse('api-activity-list'),
                {
                    'project': project.pk,
                    'instructions': 'some instructions'
                }
            )
            self.assertEqual(resp.status_code, 403)

    def test_anon_put(self):
        """PUT request"""
        for activity in Activity.objects.all():
            resp = self.client.put(
                reverse('api-activity-detail', args=[activity.pk]),
                json.dumps({
                    'project': activity.project.pk,
                    'instructions': 'updated instructions'
                }),
                content_type='application/json'
            )
            self.assertEqual(resp.status_code, 403)

    def test_anon_delete(self):
        """DELETE request"""
        for activity in Activity.objects.all():
            resp = self.client.delete(
                reverse('api-activity-detail', args=[activity.pk]))
            self.assertEqual(resp.status_code, 403)


class LayerAPITest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()
        self.anon = AnonymousUser()
        self.classmate = UserFactory.create(
            first_name='Student',
            last_name='Two',
            email='studenttwo@example.com'
        )
        self.registrar_course.group.user_set.add(self.classmate)
        self.classmate_response = ResponseFactory.create(
            activity=self.sandbox_course_activity,
            owners=[self.classmate]
        )
        self.classmate_layer = LayerFactory.create(
            title='Classmate layer',
            content_object=self.classmate_response
        )

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

    def test_faculty_get_list(self):
        """GET / request"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        r = self.client.get(reverse('api-layer-list'))
        self.assertEqual(r.status_code, 200)
        for lyr in r.data:
            layer = Layer.objects.get(pk=lyr['pk'])
            self.assertTrue(
                LayerPermission().layer_permission_helper(layer, self.faculty))

    def test_faculty_get(self):
        """GET request"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )

        # Project layer
        layer_one = LayerFactory.create(
            title='A Layer Title',
            content_object=self.sandbox_course_project
        )
        r1 = self.client.get(
            reverse('api-layer-detail', args=[layer_one.pk]))
        self.assertEqual(r1.status_code, 200)

        # Project layer belonging to a different course
        layer_two = LayerFactory.create(
            title='A Layer Title',
            content_object=self.alt_course_project
        )
        r2 = self.client.get(
            reverse('api-layer-detail', args=[layer_two.pk]))
        self.assertEqual(r2.status_code, 404)

        # Unsubmitted Response layer
        layer_three = LayerFactory.create(
            title='A Layer Title',
            content_object=self.sandbox_course_response
        )
        r3 = self.client.get(
            reverse('api-layer-detail', args=[layer_three.pk]))
        self.assertEqual(r3.status_code, 404)

        # Submitted Response layer
        self.sandbox_course_response.status = Response.SUBMITTED
        self.sandbox_course_response.save()
        r4 = self.client.get(
            reverse('api-layer-detail', args=[layer_three.pk]))
        self.assertEqual(r4.status_code, 200)

    def test_faculty_post(self):
        """POST request"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )

        # Post a layer related to the faculty's course
        r1 = self.client.post(
            reverse('api-layer-list'),
            {
                'title': 'Some title',
                'content_object': reverse(
                    'api-project-detail',
                    args=[self.sandbox_course_project.pk])
            }
        )
        self.assertEqual(r1.status_code, 201)

        # Post a layer not related to the faculty's course
        r2 = self.client.post(
            reverse('api-layer-list'),
            {
                'title': 'Some title',
                'content_object': reverse(
                    'api-project-detail', args=[self.alt_course_project.pk])
            }
        )
        self.assertEqual(r2.status_code, 403)

        # Post to an existing layer
        layer = LayerFactory.create(
            title='A Layer Title',
            content_object=self.sandbox_course_project
        )
        r3 = self.client.post(
            reverse('api-layer-list'),
            {
                'title': 'Some title',
                'pk': layer.pk,
                'content_object': reverse(
                    'api-project-detail',
                    args=[self.sandbox_course_project.pk])
            }
        )
        self.assertEqual(r3.status_code, 201)

    def test_faculty_put(self):
        """PUT request"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )

        # Put to a Project layer
        l1 = LayerFactory.create(
            title='A Layer Title',
            content_object=self.sandbox_course_project
        )
        r1 = self.client.put(
            reverse('api-layer-detail', kwargs={'pk': l1.pk}),
            {
                'title': 'Some title',
                'content_object': reverse(
                    'api-project-detail',
                    kwargs={'pk': self.sandbox_course_project.pk}
                )
            },
            content_type='application/json'
        )
        self.assertEqual(r1.status_code, 200)

        # Put to a Response layer
        l2 = LayerFactory.create(
            title='A Layer Title',
            content_object=self.sandbox_course_response
        )
        r2 = self.client.put(
            reverse('api-layer-detail', kwargs={'pk': l2.pk}),
            {
                'title': 'Some title',
                'content_object': reverse(
                    'api-project-detail',
                    kwargs={'pk': self.sandbox_course_response.pk}
                )
            }
        )
        self.assertEqual(r2.status_code, 404)

        # Put to another course's Project layer
        l3 = LayerFactory.create(
            title='A Layer Title',
            content_object=self.alt_course_project
        )
        r3 = self.client.put(
            reverse('api-layer-detail', kwargs={'pk': l3.pk}),
            {
                'title': 'Some title',
                'content_object': reverse(
                    'api-project-detail',
                    kwargs={'pk': self.alt_course_project.pk}
                )
            },
            content_type='application/json'
        )
        self.assertEqual(r3.status_code, 404)

        # Put to another course's Response layer
        l4 = LayerFactory.create(
            title='A Layer Title',
            content_object=self.alt_course_response
        )
        r4 = self.client.put(
            reverse('api-layer-detail', kwargs={'pk': l4.pk}),
            {
                'title': 'Some title',
                'content_object': reverse(
                    'api-project-detail',
                    kwargs={'pk': self.alt_course_response.pk}
                )
            },
            content_type='application/json'
        )
        self.assertEqual(r4.status_code, 404)

    def test_faculty_delete(self):
        """DELETE request"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )

        # Delete a Project layer
        l1 = LayerFactory.create(
            title='A Layer Title',
            content_object=self.sandbox_course_project
        )
        r1 = self.client.delete(
            reverse('api-layer-detail', kwargs={'pk': l1.pk}))
        self.assertEqual(r1.status_code, 204)

        # Delete a Response layer
        l2 = LayerFactory.create(
            title='A Layer Title',
            content_object=self.sandbox_course_response
        )
        r2 = self.client.delete(
            reverse('api-layer-detail', kwargs={'pk': l2.pk}))
        self.assertEqual(r2.status_code, 404)

        # Delete a different course's Project layer
        l3 = LayerFactory.create(
            title='A Layer Title',
            content_object=self.alt_course_project
        )
        r3 = self.client.delete(
            reverse('api-layer-detail', kwargs={'pk': l3.pk}))
        self.assertEqual(r3.status_code, 404)

        # Delete a different course's Response layer
        l4 = LayerFactory.create(
            title='A Layer Title',
            content_object=self.alt_course_response
        )
        r4 = self.client.delete(
            reverse('api-layer-detail', kwargs={'pk': l4.pk}))
        self.assertEqual(r4.status_code, 404)

    def test_student_get_list(self):
        """GET / request"""
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        r = self.client.get(reverse('api-layer-list'))
        self.assertEqual(r.status_code, 200)
        for lyr in r.data:
            layer = Layer.objects.get(pk=lyr['pk'])
            self.assertTrue(
                LayerPermission().layer_permission_helper(layer, self.student))

    def test_student_get(self):
        """GET request"""
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )

        # Check that a student can get a Project layer
        l1 = LayerFactory.create(
            title='A Layer Title',
            content_object=self.sandbox_course_project
        )
        r1 = self.client.get(
            reverse('api-layer-detail', kwargs={'pk': l1.pk}))
        self.assertEqual(r1.status_code, 200)

        # Check that a student can not get a Project layer if an Activity
        # does not exist
        proj = ProjectFactory.create(course=self.sandbox_course)
        l2 = LayerFactory.create(
            title='A Layer Title',
            content_object=proj
        )
        r2 = self.client.get(
            reverse('api-layer-detail', kwargs={'pk': l2.pk}))
        self.assertEqual(r2.status_code, 404)

        # Check that a student can not get a Project layer from an
        # unrelated course
        l3 = LayerFactory.create(
            title='A Layer Title',
            content_object=self.alt_course_project
        )
        r3 = self.client.get(
            reverse('api-layer-detail', kwargs={'pk': l3.pk}))
        self.assertEqual(r3.status_code, 404)

        # Check that a student can get a Response layer owned by them
        l4 = LayerFactory.create(
            title='A Layer Title',
            content_object=self.sandbox_course_response
        )
        r4 = self.client.get(
            reverse('api-layer-detail', kwargs={'pk': l4.pk}))
        self.assertEqual(r4.status_code, 200)

        # Check that a student can not get a Response layer if owned
        # by a classmate, and the classmate's Response is still
        # in a draft status
        self.assertEqual(self.classmate_response.status, Response.DRAFT)
        self.assertEqual(self.sandbox_course_response.status, Response.DRAFT)
        r5 = self.client.get(
            reverse('api-layer-detail',
                    kwargs={'pk': self.classmate_layer.pk}))
        self.assertEqual(r5.status_code, 404)

        # Check that a student can not get a Response layer if owned
        # by a classmate, the classmate's Response is not in a draft
        # status, but the student's Response is in a draft status
        self.classmate_response.status = Response.SUBMITTED
        self.classmate_response.save()
        self.assertEqual(self.classmate_response.status, Response.SUBMITTED)
        self.assertEqual(self.sandbox_course_response.status, Response.DRAFT)
        r6 = self.client.get(
            reverse('api-layer-detail',
                    kwargs={'pk': self.classmate_layer.pk}))
        self.assertEqual(r6.status_code, 404)

        # Check that a student can get a Response layer if owned
        # by a classmate, the classmate's Response is not in a draft
        # status, and the student's Response is not in a draft status
        self.sandbox_course_response.status = Response.SUBMITTED
        self.sandbox_course_response.save()
        self.assertEqual(self.classmate_response.status, Response.SUBMITTED)
        self.assertEqual(
            self.sandbox_course_response.status, Response.SUBMITTED)
        r7 = self.client.get(
            reverse('api-layer-detail',
                    kwargs={'pk': self.classmate_layer.pk}))
        self.assertEqual(r7.status_code, 200)

        # Check that a student can not get a Response layer from an
        # unrelated course
        alt_layer = LayerFactory.create(
            title='A Layer Title',
            content_object=self.alt_course_response
        )
        r8 = self.client.get(
            reverse('api-layer-detail', kwargs={'pk': alt_layer.pk}))
        self.assertEqual(r8.status_code, 404)

    def test_student_post(self):
        """POST request"""
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )

        # Check that student can post to a Response they own
        r1 = self.client.post(
            reverse('api-layer-list'),
            {
                'title': 'Some title',
                'content_object': reverse(
                    'api-response-detail',
                    args=[self.sandbox_course_response.pk])
            }
        )
        self.assertEqual(r1.status_code, 201)

        # Check that student can not post to a Response that they
        # do not own
        r2 = self.client.post(
            reverse('api-layer-list'),
            {
                'title': 'Some title',
                'content_object': reverse(
                    'api-response-detail',
                    args=[self.classmate_response.pk])
            }
        )
        self.assertEqual(r2.status_code, 403)

        # Check that student can not post to a Project in their course
        r3 = self.client.post(
            reverse('api-layer-list'),
            {
                'title': 'Some title',
                'content_object': reverse(
                    'api-response-detail',
                    args=[self.sandbox_course_project.pk])
            }
        )
        self.assertEqual(r3.status_code, 403)

        # Check that student can not post to a Project outside their course
        r4 = self.client.post(
            reverse('api-layer-list'),
            {
                'title': 'Some title',
                'content_object': reverse(
                    'api-response-detail',
                    args=[self.alt_course_project.pk])
            }
        )
        self.assertEqual(r4.status_code, 403)

        # Check that student can not post to a Response outside their course
        r5 = self.client.post(
            reverse('api-layer-list'),
            {
                'title': 'Some title',
                'content_object': reverse(
                    'api-response-detail',
                    args=[self.alt_course_response.pk])
            }
        )
        self.assertEqual(r5.status_code, 403)

    def test_student_put(self):
        """PUT request"""
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )

        # Check that student can put to a Layer related to a Response they own
        layer = LayerFactory.create(
            title='Student layer',
            content_object=self.sandbox_course_response
        )
        r1 = self.client.put(
            reverse('api-layer-detail', kwargs={'pk': layer.pk}),
            {
                'title': 'Some title',
                'content_object': reverse(
                    'api-response-detail',
                    args=[self.sandbox_course_response.pk])
            },
            content_type='application/json'
        )
        self.assertEqual(r1.status_code, 200)

        # Check that student can not put to a Layer related to a Response that
        # they do not own
        r2 = self.client.put(
            reverse('api-layer-detail',
                    kwargs={'pk': self.classmate_layer.pk}),
            {
                'title': 'Some title',
                'content_object': reverse(
                    'api-response-detail',
                    args=[self.classmate_response.pk])
            },
            content_type='application/json'
        )
        self.assertEqual(r2.status_code, 404)

        # Check that student can not put to a Layer related to a Project in
        # their course
        proj_layer = LayerFactory.create(
            title='Student layer',
            content_object=self.sandbox_course_project
        )
        r3 = self.client.put(
            reverse('api-layer-detail', kwargs={'pk': proj_layer.pk}),
            {
                'title': 'Some title',
                'content_object': reverse(
                    'api-response-detail',
                    args=[self.sandbox_course_project.pk])
            },
            content_type='application/json'
        )
        self.assertEqual(r3.status_code, 403)

        # Check that student can not put to a Layer related to a Project
        # outside their course
        alt_layer = LayerFactory.create(
            title='Student layer',
            content_object=self.alt_course_project
        )
        r4 = self.client.put(
            reverse('api-layer-detail', kwargs={'pk': alt_layer.pk}),
            {
                'title': 'Some title',
                'content_object': reverse(
                    'api-response-detail',
                    args=[self.alt_course_project.pk])
            },
            content_type='application/json'
        )
        self.assertEqual(r4.status_code, 404)

        # Check that student can not put to a Layer related to a Response
        # outside their course
        alt_response_layer = LayerFactory.create(
            title='Student layer',
            content_object=self.alt_course_response
        )
        r5 = self.client.put(
            reverse('api-layer-detail', kwargs={'pk': alt_response_layer.pk}),
            {
                'title': 'Some title',
                'content_object': reverse(
                    'api-response-detail',
                    args=[self.alt_course_response.pk])
            },
            content_type='application/json'
        )
        self.assertEqual(r5.status_code, 404)

    def test_student_delete(self):
        """DELETE request"""
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )

        # Check that student can delete a Layer related to a Response they
        # own
        layer = LayerFactory.create(
            title='Student layer',
            content_object=self.sandbox_course_response
        )
        r1 = self.client.delete(
            reverse('api-layer-detail', kwargs={'pk': layer.pk}))
        self.assertEqual(r1.status_code, 204)

        # Check that student can not delete a Layer related to a Response that
        # they do not own
        r2 = self.client.delete(
            reverse('api-layer-detail',
                    kwargs={'pk': self.classmate_layer.pk}))
        self.assertEqual(r2.status_code, 404)

        # Check that student can not delete a Layer related to a Project in
        # their course
        proj_layer = LayerFactory.create(
            title='Student layer',
            content_object=self.sandbox_course_project
        )
        r3 = self.client.delete(
            reverse('api-layer-detail', kwargs={'pk': proj_layer.pk}))
        self.assertEqual(r3.status_code, 403)

        # Check that student can not delete a Layer related to a Project
        # outside their course
        alt_layer = LayerFactory.create(
            title='Student layer',
            content_object=self.alt_course_project
        )
        r4 = self.client.delete(
            reverse('api-layer-detail', kwargs={'pk': alt_layer.pk}))
        self.assertEqual(r4.status_code, 404)

        # Check that student can not delete a Layer related to a Response
        # outside their course
        alt_response_layer = LayerFactory.create(
            title='Student layer',
            content_object=self.alt_course_response
        )
        r5 = self.client.put(
            reverse('api-layer-detail', kwargs={'pk': alt_response_layer.pk}))
        self.assertEqual(r5.status_code, 404)

    def test_non_course_user_get_list(self):
        """GET / request"""
        # An authed user, but not a member of any course, should be able to
        # make a request to the API, but the reply should be empty
        user = UserFactory.create()
        self.assertTrue(
            self.client.login(
                username=user.username,
                password='test'
            )
        )
        r = self.client.get(reverse('api-layer-list'))
        self.assertEqual(r.status_code, 200)
        self.assertListEqual(r.data, [])

    def test_anon_get_list(self):
        """GET / request"""
        r = self.client.get(reverse('api-layer-list'))
        self.assertEqual(r.status_code, 403)

    def test_anon_get(self):
        """GET request"""
        for layer in Layer.objects.all():
            resp = self.client.get(
                reverse('api-layer-detail', args=[layer.pk]))
            self.assertEqual(resp.status_code, 403)

    def test_anon_post(self):
        """POST request"""
        for project in Project.objects.all():
            resp = self.client.post(
                reverse('api-layer-list'),
                {
                    'title': 'Some title',
                    'content_object': reverse(
                        'api-project-detail', args=[project.pk])
                }
            )
            self.assertEqual(resp.status_code, 403)

        for response in Response.objects.all():
            resp = self.client.post(
                reverse('api-layer-list'),
                {
                    'title': 'Some title',
                    'content_object': reverse(
                        'api-response-detail', args=[response.pk])
                }
            )
            self.assertEqual(resp.status_code, 403)

    def test_anon_put(self):
        """PUT request"""
        for layer in Layer.objects.all():
            content_object = ''
            if isinstance(layer.content_object, Project):
                content_object = reverse(
                    'api-project-detail', args=[layer.content_object.pk])
            elif isinstance(layer.content_object, Response):
                content_object = reverse(
                    'api-response-detail', args=[layer.content_object.pk])
            else:
                raise Exception(
                    'content_object must be either a Project or Response')

            resp = self.client.put(
                reverse('api-layer-detail', args=[layer.pk]),
                json.dumps({
                    'title': 'A different title',
                    'content_object': content_object
                }),
                content_type='application/json'
            )
            self.assertEqual(resp.status_code, 403)

    def test_anon_delete(self):
        """DELETE request"""
        for layer in Layer.objects.all():
            resp = self.client.delete(
                reverse('api-layer-detail', args=[layer.pk])
            )
            self.assertEqual(resp.status_code, 403)


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
