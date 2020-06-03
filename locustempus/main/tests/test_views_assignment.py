"""Tests for Assignment views"""
from django.test import TestCase
from django.urls.base import reverse


from locustempus.main.tests.factories import (
    CourseTestMixin, ProjectFactory, AssignmentFactory
)


class AssignmentTest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    def test_assignment_create_faculty(self):
        """
        Test that faculty can GET and POST to the
        assignment creation view
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
            reverse('assignment-create', args=[c.pk, p.pk])
        )
        self.assertEqual(r1.status_code, 200)

        r2 = self.client.post(
            reverse('assignment-create', args=[c.pk, p.pk]),
            {
                'instructions': 'Some instructions',
            }
        )
        self.assertEqual(r2.status_code, 302)

    def test_assignment_create_student(self):
        """
        Test that students can not create an assignment
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
            reverse('assignment-create', args=[c.pk, p.pk])
        )
        self.assertEqual(r1.status_code, 403)

    def test_assignment_create_anon(self):
        """
        Test that anon users can not create an assignment
        """
        c = self.registrar_course
        p = ProjectFactory.create(course=c)
        r1 = self.client.get(
            reverse('assignment-create', args=[c.pk, p.pk])
        )
        self.assertEqual(r1.status_code, 302)

    def test_assignment_404(self):
        """
        Test that a request for an assignment detail page that
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
            reverse('assignment-detail', args=[c.pk, p.pk])
        )
        self.assertEqual(r1.status_code, 404)

    def test_assignment_update_faculty(self):
        """
        Test that faculty can edit an assignment view
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
            reverse('assignment-update', args=[c.pk, p.pk]),
            {
                'instructions': 'Some new instructions',
            }
        )
        self.assertEqual(response.status_code, 302)

    def test_assignment_update_student(self):
        """
        Test that students can not edit an assignment
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
            reverse('assignment-update', args=[c.pk, p.pk]),
            {
                'instructions': 'Some new instructions',
            }
        )
        self.assertEqual(response.status_code, 403)

    def test_assignment_delete_faculty(self):
        """
        Test that faculty can delete an assignment if
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
        AssignmentFactory.create(project=p)
        response = self.client.post(
            reverse('assignment-delete', args=[c.pk, p.pk])
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
            reverse('assignment-delete', args=[c.pk, p.pk])
        )
        self.assertEqual(response.status_code, 403)

    def test_assignment_delete_student(self):
        """
        Test that students can not delete an assignment
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
            reverse('assignment-delete', args=[c.pk, p.pk])
        )
        self.assertEqual(response.status_code, 403)
