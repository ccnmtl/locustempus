"""Tests for Activity views"""
from django.test import TestCase
from django.urls.base import reverse


from locustempus.main.tests.factories import (
    CourseTestMixin, ProjectFactory, ActivityFactory
)


class ActivityTest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    def test_activity_create_faculty(self):
        """
        Test that faculty can GET and POST to the
        activity creation view
        """
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        c = self.registrar_course
        p = ProjectFactory.create(course=c)
        r1 = self.client.get(
            reverse('activity-create', args=[c.pk, p.pk])
        )
        self.assertEqual(r1.status_code, 200)

        r2 = self.client.post(
            reverse('activity-create', args=[c.pk, p.pk]),
            {
                'instructions': 'Some instructions',
            }
        )
        self.assertEqual(r2.status_code, 302)

    def test_activity_create_student(self):
        """
        Test that students can not create an activity
        """
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        c = self.registrar_course
        p = ProjectFactory.create(course=c)
        r1 = self.client.get(
            reverse('activity-create', args=[c.pk, p.pk])
        )
        self.assertEqual(r1.status_code, 403)

    def test_activity_create_anon(self):
        """
        Test that anon users can not create an activity
        """
        c = self.registrar_course
        p = ProjectFactory.create(course=c)
        r1 = self.client.get(
            reverse('activity-create', args=[c.pk, p.pk])
        )
        self.assertEqual(r1.status_code, 302)

    def test_activity_404(self):
        """
        Test that a request for an activity detail page that
        does not exist returns 404
        """
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        c = self.registrar_course
        p = ProjectFactory.create(course=c)
        r1 = self.client.get(
            reverse('activity-detail', args=[c.pk, p.pk])
        )
        self.assertEqual(r1.status_code, 404)

    def test_activity_update_faculty(self):
        """
        Test that faculty can edit an activity view
        """
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        c = self.registrar_course
        p = self.registrar_course_project
        response = self.client.post(
            reverse('activity-update', args=[c.pk, p.pk]),
            {
                'instructions': 'Some new instructions',
            }
        )
        self.assertEqual(response.status_code, 302)

    def test_activity_update_student(self):
        """
        Test that students can not edit an activity
        """
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        c = self.registrar_course
        p = self.registrar_course_project
        response = self.client.post(
            reverse('activity-update', args=[c.pk, p.pk]),
            {
                'instructions': 'Some new instructions',
            }
        )
        self.assertEqual(response.status_code, 403)

    def test_activity_delete_faculty(self):
        """
        Test that faculty can delete an activity if
        there are no related responses
        """
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        c = self.registrar_course
        p = ProjectFactory.create(course=c)
        ActivityFactory.create(project=p)
        response = self.client.post(
            reverse('activity-delete', args=[c.pk, p.pk])
        )
        self.assertEqual(response.status_code, 302)

        # Test that the model can not be deleted
        # from the front end if there are responses
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        c = self.registrar_course
        p = self.registrar_course_project
        response = self.client.post(
            reverse('activity-delete', args=[c.pk, p.pk])
        )
        self.assertEqual(response.status_code, 403)

    def test_activity_delete_student(self):
        """
        Test that students can not delete an activity
        """
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        c = self.registrar_course
        p = self.registrar_course_project
        response = self.client.post(
            reverse('activity-delete', args=[c.pk, p.pk])
        )
        self.assertEqual(response.status_code, 403)


class ApiTest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    def test_api_get(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.get(
            reverse('api-activity-detail',
                    args=[self.registrar_course_activity.pk]))
        self.assertEqual(response.status_code, 200)
