from django.contrib.auth.models import AnonymousUser
from django.test import TestCase
from django.test.client import RequestFactory
from django.urls.base import reverse
from locustempus.main.permissions import (
    IsResponseOwnerOrFaculty, IsFeedbackFacultyOrStudentRecipient,
    LayerPermission
)
from locustempus.main.models import (
    Response, Activity
)
from locustempus.main.tests.factories import (
    CourseTestMixin, UserFactory, ProjectFactory, ActivityFactory,
    ResponseFactory, FeedbackFactory, LayerFactory
)
from unittest.mock import patch


class IsResponseOwnerOrFacultyTest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    def test_has_permissions_list_get(self):
        """Tests GET list permissions"""
        perm = IsResponseOwnerOrFaculty()
        req = RequestFactory().get(reverse('api-response-list'))

        # Anon
        req.user = AnonymousUser()
        self.assertFalse(perm.has_permission(req, None))

        # Faculty
        req.user = self.faculty
        self.assertTrue(perm.has_permission(req, None))

        # Student
        req.user = self.student
        self.assertTrue(perm.has_permission(req, None))

    def test_has_permissions_obj_get(self):
        """Tests GET permissions"""
        perm = IsResponseOwnerOrFaculty()
        req = RequestFactory().get(
            reverse(
                'api-response-detail',
                args=[self.sandbox_course_response.pk]
            ))

        # Anon
        req.user = AnonymousUser()
        self.assertFalse(
            perm.has_object_permission(
                req, None, self.sandbox_course_response))

        # Faculty
        req.user = self.faculty
        self.sandbox_course_response.status = Response.DRAFT
        self.sandbox_course_activity.save()
        self.assertFalse(
            perm.has_object_permission(
                req, None, self.sandbox_course_response))

        self.sandbox_course_response.status = Response.SUBMITTED
        self.sandbox_course_activity.save()
        self.assertTrue(
            perm.has_object_permission(
                req, None, self.sandbox_course_response))

        # Student
        req.user = self.student
        self.assertTrue(
            perm.has_object_permission(
                req, None, self.sandbox_course_response))

    def test_has_permissions_put(self):
        """Tests POST permissions"""
        perm = IsResponseOwnerOrFaculty()
        p = ProjectFactory.create(course=self.sandbox_course)
        a = ActivityFactory.create(project=p)
        req = RequestFactory().put(
            reverse('api-response-list'),
            {'activity': a.pk}
        )
        req.user = AnonymousUser()
        # Patch the request object, as it doesn't seem to create the
        # data attribute as expected
        req.data = {'activity': a.pk}

        # Anon
        self.assertFalse(perm.has_permission(req, None))

        # Faculty
        req.user = self.faculty
        self.assertFalse(perm.has_permission(req, None))

        # Unrelated Student
        unrelated_student = UserFactory.create(
            first_name='Student',
            last_name='Two',
            email='studenttwo@example.com'
        )
        self.registrar_course.group.user_set.add(
            unrelated_student)
        req.user = unrelated_student
        self.assertFalse(perm.has_permission(req, None))

        # Related Student
        req.user = self.student
        self.assertTrue(perm.has_permission(req, None))

    def test_has_object_permissions_patch(self):
        """Tests PATCH permissions"""
        perm = IsResponseOwnerOrFaculty()
        req = RequestFactory().patch(
            reverse(
                'api-response-detail',
                args=[self.sandbox_course_response.pk]),
            {'reflection': 'foo'}
        )

        # Anon
        req.user = AnonymousUser()
        self.assertFalse(
            perm.has_object_permission(
                req, None, self.sandbox_course_response))

        # Related Faculty
        req.user = self.faculty
        self.assertFalse(
            perm.has_object_permission(
                req, None, self.sandbox_course_response))

        # Unrelated Faculty
        # Checks that faculty in a different course can not
        # patch an object
        unrelated_faculty = UserFactory.create(
            first_name='Faculty',
            last_name='Two',
            email='facultytwo@example.com'
        )
        self.registrar_course.faculty_group.user_set.add(
            unrelated_faculty)
        req.user = unrelated_faculty
        self.assertFalse(
            perm.has_object_permission(
                req, None, self.sandbox_course_response))

        # Student
        req.user = self.student
        self.assertTrue(
            perm.has_object_permission(
                req, None, self.sandbox_course_response))

    def test_has_object_permissions_put(self):
        """Tests PUT permissions"""
        perm = IsResponseOwnerOrFaculty()
        req = RequestFactory().put(
            reverse(
                'api-response-detail',
                args=[self.sandbox_course_response.pk]),
            {'reflection': 'foo'}
        )

        # Anon
        req.user = AnonymousUser()
        self.assertFalse(
            perm.has_object_permission(
                req, None, self.sandbox_course_response))

        # Faculty
        req.user = self.faculty
        self.assertFalse(
            perm.has_object_permission(
                req, None, self.sandbox_course_response))

        # Student
        req.user = self.student
        self.assertTrue(
            perm.has_object_permission(
                req, None, self.sandbox_course_response))

    def test_has_object_permissions_delete(self):
        """Tests DELETE permissions"""
        perm = IsResponseOwnerOrFaculty()
        req = RequestFactory().delete(
            reverse(
                'api-response-detail',
                args=[self.sandbox_course_response.pk])
        )

        # Anon
        req.user = AnonymousUser()
        self.assertFalse(
            perm.has_object_permission(
                req, None, self.sandbox_course_response))

        # Faculty
        req.user = self.faculty
        self.assertFalse(
            perm.has_object_permission(
                req, None, self.sandbox_course_response))

        # Student
        req.user = self.student
        self.assertFalse(
            perm.has_object_permission(
                req, None, self.sandbox_course_response))


class IsFeedbackFacultyOrStudentRecipientTest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    def test_has_permissions_list_get(self):
        """Tests GET list permissions"""
        perm = IsFeedbackFacultyOrStudentRecipient()
        req = RequestFactory().get(
            reverse('api-feedback-list')
        )
        req.query_params = dict()
        req.data = dict()

        # Anon
        req.user = AnonymousUser()
        self.assertFalse(perm.has_permission(req, None))

        # Faculty
        req.user = self.faculty
        self.assertFalse(perm.has_permission(req, None))

        # Student
        req.user = self.student
        self.assertFalse(perm.has_permission(req, None))

    def test_has_permissions_obj_get(self):
        """Tests GET permissions"""
        perm = IsFeedbackFacultyOrStudentRecipient()
        self.sandbox_course_response.status = \
            self.sandbox_course_response.SUBMITTED
        self.sandbox_course_response.save()
        feedback = FeedbackFactory(response=self.sandbox_course_response)
        req = RequestFactory().get(
            reverse(
                'api-feedback-detail',
                args=[feedback.pk]
            ))

        # Anon
        req.user = AnonymousUser()
        self.assertFalse(
            perm.has_object_permission(
                req, None, feedback))

        # Faculty
        req.user = self.faculty
        self.assertTrue(
            perm.has_object_permission(
                req, None, feedback))

        # Student
        req.user = self.student
        self.assertTrue(
            perm.has_object_permission(
                req, None, feedback))

        # Student in course, but not related to the response
        classmate = UserFactory.create(
            first_name='Student',
            last_name='Two',
            email='studenttwo@example.com'
        )
        self.sandbox_course.group.user_set.add(
            classmate)
        req.user = classmate
        self.assertFalse(
            perm.has_object_permission(
                req, None, feedback))

        # Non-course user
        unrelated_student = UserFactory.create(
            first_name='Student',
            last_name='Two',
            email='studenttwo@example.com'
        )
        req.user = unrelated_student
        self.assertFalse(
            perm.has_object_permission(
                req, None, feedback))

    def test_has_permissions_put(self):
        """Tests POST permissions"""
        perm = IsFeedbackFacultyOrStudentRecipient()
        p = ProjectFactory.create(course=self.sandbox_course)
        a = ActivityFactory.create(project=p)
        r = ResponseFactory.create(activity=a, owners=[self.student])
        req = RequestFactory().post(
            reverse('api-feedback-list'),
            {'response': r.pk, 'body': 'foobar'}
        )
        req.query_params = dict()
        req.data = {'response': r.pk, 'body': 'foobar'}

        # Anon
        req.user = AnonymousUser()
        self.assertFalse(perm.has_permission(req, None))

        # Faculty
        req.user = self.faculty
        self.assertTrue(perm.has_permission(req, None))

        # Unrelated Student
        unrelated_student = UserFactory.create(
            first_name='Student',
            last_name='Two',
            email='studenttwo@example.com'
        )
        self.registrar_course.group.user_set.add(
            unrelated_student)
        req.user = unrelated_student
        self.assertFalse(perm.has_permission(req, None))

        # Related Student
        req.user = self.student
        self.assertFalse(perm.has_permission(req, None))

    def test_has_object_permissions_patch(self):
        """Tests PATCH permissions"""
        perm = IsFeedbackFacultyOrStudentRecipient()
        p = ProjectFactory.create(course=self.sandbox_course)
        a = ActivityFactory.create(project=p)
        r = ResponseFactory.create(activity=a, owners=[self.student])
        r.status = r.SUBMITTED
        r.save()
        f = FeedbackFactory(response=r)
        req = RequestFactory().patch(
            reverse(
                'api-feedback-detail',
                args=[f.pk]),
            {'feedback': 'foo'}
        )

        # Anon
        req.user = AnonymousUser()
        self.assertFalse(
            perm.has_object_permission(
                req, None, r.feedback))

        # Related Faculty
        req.user = self.faculty
        self.assertTrue(
            perm.has_object_permission(
                req, None, r.feedback))

        # Unrelated Faculty
        # Checks that faculty in a different course can not
        # patch an object
        unrelated_faculty = UserFactory.create(
            first_name='Faculty',
            last_name='Two',
            email='facultytwo@example.com'
        )
        self.registrar_course.faculty_group.user_set.add(
            unrelated_faculty)
        req.user = unrelated_faculty
        self.assertFalse(
            perm.has_object_permission(
                req, None, r.feedback))

        # Student
        req.user = self.student
        self.assertFalse(
            perm.has_object_permission(
                req, None, r.feedback))

    def test_has_object_permissions_put(self):
        """Tests PUT permissions"""
        perm = IsFeedbackFacultyOrStudentRecipient()
        self.sandbox_course_response.status = \
            self.sandbox_course_response.SUBMITTED
        self.sandbox_course_response.save()
        f = FeedbackFactory(response=self.sandbox_course_response)
        req = RequestFactory().put(
            reverse(
                'api-feedback-detail',
                args=[f.pk]),
            {'feedback': 'foo'}
        )

        # Anon
        req.user = AnonymousUser()
        self.assertFalse(
            perm.has_object_permission(
                req, None, self.sandbox_course_response.feedback))

        # Faculty
        req.user = self.faculty
        self.assertTrue(
            perm.has_object_permission(
                req, None, self.sandbox_course_response.feedback))

        # Student
        req.user = self.student
        self.assertFalse(
            perm.has_object_permission(
                req, None, self.sandbox_course_response.feedback))

    def test_has_object_permissions_delete(self):
        """Tests DELETE permissions"""
        perm = IsFeedbackFacultyOrStudentRecipient()
        self.sandbox_course_response.status = \
            self.sandbox_course_response.SUBMITTED
        self.sandbox_course_response.save()
        f = FeedbackFactory(response=self.sandbox_course_response)
        req = RequestFactory().delete(
            reverse(
                'api-feedback-detail',
                args=[f.pk]))

        # Anon
        req.user = AnonymousUser()
        self.assertFalse(
            perm.has_object_permission(
                req, None, self.sandbox_course_response.feedback))

        # Faculty
        req.user = self.faculty
        self.assertFalse(
            perm.has_object_permission(
                req, None, self.sandbox_course_response.feedback))

        # Student
        req.user = self.student
        self.assertFalse(
            perm.has_object_permission(
                req, None, self.sandbox_course_response.feedback))


class LayerPermissionTest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()
        self.layer_permission_helper = \
            LayerPermission().layer_permission_helper
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

    def test_layer_permission_helper_project_faculty(self):
        """
        - If the Layer is associated with a Project, and the user is faculty in
          Layer => Project => Course
        """
        layer = LayerFactory(
            title='A Layer Title',
            content_object=self.sandbox_course_project
        )
        self.assertTrue(
            self.layer_permission_helper(layer, self.faculty))

        # Check with unrelated faculty
        self.assertFalse(
            self.layer_permission_helper(layer, self.alt_faculty))

        # Check with anon user
        self.assertFalse(
            self.layer_permission_helper(layer, self.anon))

    def test_layer_permission_helper_project_student(self):
        """
        - If the Layer is associated with a Project, the user is a student in
          Layer => Project => Course, and the Project has an Activity
        """
        layer = LayerFactory(
            title='A Layer Title',
            content_object=self.sandbox_course_project
        )
        self.assertTrue(
            hasattr(self.sandbox_course_project, 'activity') and
            isinstance(self.sandbox_course_project.activity, Activity)
        )
        self.assertTrue(
            self.layer_permission_helper(layer, self.student))

        # Check with non-course student
        self.assertFalse(
            self.layer_permission_helper(layer, self.alt_student))

        # Check after removing the activity
        layer.content_object.activity.delete()
        layer.content_object.refresh_from_db()
        self.assertFalse(
            self.layer_permission_helper(layer, self.student))

    def test_layer_permission_helper_draft_response(self):
        """
        - If the Layer is associated with a Response, and the user is an owner
          of the Response
        """
        # Check owner
        layer = LayerFactory(
            title='A Layer Title',
            content_object=self.sandbox_course_response
        )
        self.assertTrue(
            self.layer_permission_helper(layer, self.student))

        # Check faculty
        self.assertEqual(
            self.sandbox_course_response.status,
            Response.DRAFT
        )
        self.assertFalse(
            self.layer_permission_helper(layer, self.faculty))

        # Check classmate
        self.assertFalse(
            self.layer_permission_helper(layer, self.classmate))

        # Check non-course student
        self.assertFalse(
            self.layer_permission_helper(layer, self.alt_student))

    def test_layer_permission_helper_submitted_response(self):
        """
        - If the Layer is associated with a Response, the Response state is not
          "Draft", and the user is faculty in Layer => Response => Activity =>
          Project => Course
        """
        layer = LayerFactory(
            title='A Layer Title',
            content_object=self.sandbox_course_response
        )
        self.sandbox_course_response.status = Response.SUBMITTED
        self.sandbox_course_response.save()

        # Check owner
        self.assertTrue(
            self.layer_permission_helper(layer, self.student))

        # Check faculty
        self.assertTrue(
            self.layer_permission_helper(layer, self.faculty))

        # Check classmate who's response is still a draft
        self.assertFalse(
            self.layer_permission_helper(layer, self.classmate))

        # Check non-course student
        self.assertFalse(
            self.layer_permission_helper(layer, self.alt_student))

    def test_layer_permission_helper_response_classmate(self):
        """
        - If the Layer is associated with a Response, the Response state is not
          "Draft", the user is owner of a Response related to Layer => Response
          => Activity, the state of the user's Response is not "Draft", and the
          user is a student in Layer => Response => Activity => Project =>
          Course
        """
        # First check that the classmate's response is a draft
        self.assertEqual(
            self.classmate_response.status,
            Response.DRAFT
        )
        self.assertEqual(
            self.sandbox_course_response.status,
            Response.DRAFT
        )
        # Confirm that the student can not see the classmate's layer
        self.assertFalse(
            self.layer_permission_helper(self.classmate_layer, self.student))

        # Now update the classmate response to submitted
        self.classmate_response.status = Response.SUBMITTED
        self.classmate_response.save()

        # The classmate's response should still not be reachable
        self.assertFalse(
            self.layer_permission_helper(self.classmate_layer, self.student))

        # Finally, update the student's response and check the classmate layer
        self.sandbox_course_response.status = Response.SUBMITTED
        self.sandbox_course_response.save()
        self.assertTrue(
            self.layer_permission_helper(self.classmate_layer, self.student))

    def test_has_permission_get(self):
        perm = LayerPermission()
        req = RequestFactory().get(reverse('api-layer-list'))

        # Check anon
        req.user = self.anon
        self.assertFalse(
            perm.has_permission(req, None))

        # Check authed user
        req.user = self.faculty
        self.assertTrue(
            perm.has_permission(req, None))

    def test_has_permission_post_project(self):
        # Check course faculty
        perm = LayerPermission()
        req = RequestFactory().post(
            reverse('api-layer-list'))
        req.data = {
            'content_object': reverse(
                'api-project-detail',
                kwargs={
                    'pk': self.sandbox_course_project.pk}
            )
        }
        req.user = self.faculty
        self.assertTrue(perm.has_permission(req, None))

        # Check that course student can not create a new
        # Project layer
        req.user = self.student
        self.assertFalse(perm.has_permission(req, None))

        # Check that authed user outside the course can not
        # create a Project layer
        req.user = self.alt_student
        self.assertFalse(perm.has_permission(req, None))

    def test_has_permission_post_response(self):
        # Check course faculty
        perm = LayerPermission()
        req = RequestFactory().post(
            reverse('api-layer-list'))
        req.data = {
            'content_object': reverse(
                'api-response-detail',
                kwargs={
                    'pk': self.sandbox_course_response.pk}
            )
        }
        req.user = self.faculty
        self.assertFalse(perm.has_permission(req, None))

        # Check that student can add layer to their response
        req.user = self.student
        self.assertTrue(perm.has_permission(req, None))

        # Check that a classmate can not add a layer
        req.user = self.classmate
        self.assertFalse(perm.has_permission(req, None))

        # Check that authed user outside the course can not
        # create a Response layer
        req.user = self.alt_student
        self.assertFalse(perm.has_permission(req, None))

    def test_has_object_permission_get(self):
        with patch.object(LayerPermission, 'layer_permission_helper') \
                as mock_layer_permission_helper:
            perm = LayerPermission()
            layer = LayerFactory.create(
                title='A Layer Title',
                content_object=self.sandbox_course_project
            )
            req = RequestFactory().get(
                reverse(
                    'api-layer-detail',
                    kwargs={'pk': self.classmate_layer.pk}))

            # Check that layer_permission_helper is called
            req.user = self.student
            perm.has_object_permission(req, None, layer)
            self.assertTrue(mock_layer_permission_helper.called)

    def test_has_object_permission_post(self):
        # In reality, POST to an existing object should 405
        # Project Layer: Faculty
        perm = LayerPermission()
        layer = LayerFactory.create(
            title='A Layer Title',
            content_object=self.sandbox_course_project
        )
        req = RequestFactory().post(
            reverse(
                'api-layer-detail',
                kwargs={'pk': layer.pk}))
        req.data = {
            'content_object': reverse(
                'api-response-detail',
                kwargs={
                    'pk': layer.content_object.pk}
            )
        }
        req.user = self.faculty
        self.assertTrue(
            perm.has_object_permission(req, None, layer))

        # Project Layer: Student
        req.user = self.student
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

        # Project Layer: non-course user
        req.user = self.alt_student
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

        # Project Layer: anon
        req.user = self.anon
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

        # Response Layer: Faculty
        perm = LayerPermission()
        layer = LayerFactory.create(
            title='A Layer Title',
            content_object=self.sandbox_course_response
        )
        req = RequestFactory().post(
            reverse(
                'api-layer-detail',
                kwargs={'pk': layer.pk}))
        req.data = {
            'content_object': reverse(
                'api-response-detail',
                kwargs={
                    'pk': layer.content_object.pk}
            )
        }
        req.user = self.faculty
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

        # Response Layer: Student
        req.user = self.student
        self.assertTrue(
            perm.has_object_permission(req, None, layer))

        # Response Layer: classmate
        req.user = self.classmate
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

        # Response Layer: non-course user
        req.user = self.classmate
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

        # Response Layer: anon
        req.user = self.anon
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

    def test_has_object_permission_put(self):
        # Project Layer: Faculty
        perm = LayerPermission()
        layer = LayerFactory.create(
            title='A Layer Title',
            content_object=self.sandbox_course_project
        )
        req = RequestFactory().post(
            reverse(
                'api-layer-detail',
                kwargs={'pk': layer.pk}))
        req.data = {
            'content_object': reverse(
                'api-response-detail',
                kwargs={
                    'pk': layer.content_object.pk}
            )
        }
        req.user = self.faculty
        self.assertTrue(
            perm.has_object_permission(req, None, layer))

        # Project Layer: Student
        req.user = self.student
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

        # Project Layer: non-course user
        req.user = self.alt_student
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

        # Project Layer: anon
        req.user = self.anon
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

        # Response Layer: Faculty
        perm = LayerPermission()
        layer = LayerFactory.create(
            title='A Layer Title',
            content_object=self.sandbox_course_response
        )
        req = RequestFactory().put(
            reverse(
                'api-layer-detail',
                kwargs={'pk': layer.pk}))
        req.data = {
            'content_object': reverse(
                'api-response-detail',
                kwargs={
                    'pk': layer.content_object.pk}
            )
        }
        req.user = self.faculty
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

        # Response Layer: Student
        req.user = self.student
        self.assertTrue(
            perm.has_object_permission(req, None, layer))

        # Response Layer: classmate
        req.user = self.classmate
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

        # Response Layer: non-course user
        req.user = self.classmate
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

        # Response Layer: anon
        req.user = self.anon
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

    def test_has_object_permission_delete(self):
        # Project Layer: Faculty
        perm = LayerPermission()
        layer = LayerFactory.create(
            title='A Layer Title',
            content_object=self.sandbox_course_project
        )
        req = RequestFactory().delete(
            reverse(
                'api-layer-detail',
                kwargs={'pk': layer.pk}))
        req.user = self.faculty
        self.assertTrue(
            perm.has_object_permission(req, None, layer))

        # Project Layer: Student
        req.user = self.student
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

        # Project Layer: non-course user
        req.user = self.alt_student
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

        # Project Layer: anon
        req.user = self.anon
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

        # Response Layer: Faculty
        perm = LayerPermission()
        layer = LayerFactory.create(
            title='A Layer Title',
            content_object=self.sandbox_course_response
        )
        req = RequestFactory().delete(
            reverse(
                'api-layer-detail',
                kwargs={'pk': layer.pk}))
        req.user = self.faculty
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

        # Response Layer: Student
        req.user = self.student
        self.assertTrue(
            perm.has_object_permission(req, None, layer))

        # Response Layer: classmate
        req.user = self.classmate
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

        # Response Layer: non-course user
        req.user = self.classmate
        self.assertFalse(
            perm.has_object_permission(req, None, layer))

        # Response Layer: anon
        req.user = self.anon
        self.assertFalse(
            perm.has_object_permission(req, None, layer))
