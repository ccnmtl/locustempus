from django.contrib.auth.models import AnonymousUser
from django.test import TestCase
from django.test.client import RequestFactory
from django.urls.base import reverse
from locustempus.main.permissions import (
    IsResponseOwnerOrFaculty
)
from locustempus.main.tests.factories import (
    CourseTestMixin, UserFactory, ProjectFactory, ActivityFactory
)


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
        self.assertTrue(
            perm.has_object_permission(
                req, None, self.sandbox_course_response))

        # Student
        req.user = self.student
        self.assertTrue(
            perm.has_object_permission(
                req, None, self.sandbox_course_response))

    def test_has_permissions_post(self):
        """Tests POST permissions"""
        perm = IsResponseOwnerOrFaculty()
        p = ProjectFactory.create(course=self.sandbox_course)
        a = ActivityFactory.create(project=p)
        req = RequestFactory().post(
            reverse('api-response-list'),
            {'activity': a.pk}
        )
        req.user = AnonymousUser()

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
        self.assertTrue(
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
        self.assertTrue(
            perm.has_object_permission(
                req, None, self.sandbox_course_response))
