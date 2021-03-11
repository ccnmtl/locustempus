"""Tests for Course and dashbord views"""
from django.test import TestCase
from django.urls.base import reverse
from locustempus.main.tests.factories import (
    SandboxCourseFactory, CourseTestMixin, UserFactory,
)


class BasicTest(TestCase):
    def test_root(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)

    def test_smoketest(self):
        response = self.client.get("/smoketest/")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'PASS')


class CourseTest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    # For CourseCreateView
    def test_create_anon(self):
        response = self.client.get(reverse('course-create-view'))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url, "/accounts/login/?next=/course/create/")

    def test_create_logged_in(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get(reverse('course-create-view'))
        self.assertEqual(response.status_code, 200)

    def test_create_course(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            reverse('course-create-view'),
            {'title': 'A test course'}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/dashboard/")

    # For CourseDetailView
    def test_detail_anon(self):
        response = self.client.get(
            reverse('course-detail-view', args=[self.sandbox_course.pk]))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/accounts/login/?next=/course/{}/".format(
                self.sandbox_course.pk))

    def test_detail_student_in_course(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get(
            reverse('course-detail-view', args=[self.sandbox_course.pk]))
        self.assertEqual(response.status_code, 200)

    def test_detail_student_not_in_course(self):
        alternate_course = SandboxCourseFactory.create()
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get(
            reverse('course-detail-view', args=[alternate_course.pk]))
        self.assertEqual(response.status_code, 403)

    def test_detail_faculty_in_course(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get(
            reverse('course-detail-view', args=[self.sandbox_course.pk]))
        self.assertEqual(response.status_code, 200)

    def test_detail_faculty_not_in_course(self):
        alternate_course = SandboxCourseFactory.create()
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get(
            reverse('course-detail-view', args=[alternate_course.pk]))
        self.assertEqual(response.status_code, 403)

    def test_detail_superuser(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.get(
            reverse('course-detail-view', args=[self.sandbox_course.pk]))
        self.assertEqual(response.status_code, 200)

    # For CourseEditView
    def test_edit_anon(self):
        response = self.client.get(
            reverse('course-edit-view', args=[self.sandbox_course.pk]))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/accounts/login/?next=/course/{}/edit/".format(
                self.sandbox_course.pk))

    def test_edit_student(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get(
            reverse('course-edit-view', args=[self.sandbox_course.pk]))
        self.assertEqual(response.status_code, 403)

    def test_edit_faculty_in_course(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get(
            reverse('course-edit-view', args=[self.sandbox_course.pk]))
        self.assertEqual(response.status_code, 200)

    def test_edit_faculty_post(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            reverse('course-edit-view', args=[self.sandbox_course.pk]),
            {'title': 'An edited course'}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/course/{}/".format(self.sandbox_course.pk))

    def test_edit_faculty_not_in_course(self):
        alternate_course = SandboxCourseFactory.create()
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get(
            reverse('course-edit-view', args=[alternate_course.pk]))
        self.assertEqual(response.status_code, 403)

    def test_edit_superuser(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.get(
            reverse('course-edit-view', args=[self.sandbox_course.pk]))
        self.assertEqual(response.status_code, 200)

    def test_edit_superuser_post(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.post(
            reverse('course-edit-view', args=[self.sandbox_course.pk]),
            {'title': 'An edited course'}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/course/{}/".format(self.sandbox_course.pk))

    def test_delete_anon(self):
        url = reverse('course-delete-view', args=[self.sandbox_course.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/accounts/login/?next=" + url)

    def test_delete_faculty(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get(
            reverse('course-delete-view', args=[self.sandbox_course.pk]))
        self.assertEqual(response.status_code, 200)

    def test_delete_faculty_post(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            reverse('course-delete-view', args=[self.sandbox_course.pk]))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, '/dashboard/')

    def test_delete_faculty_not_in_course(self):
        alternate_course = SandboxCourseFactory.create()
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get(
            reverse('course-delete-view', args=[alternate_course.pk]))
        self.assertEqual(response.status_code, 403)

    def test_delete_superuser(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.get(
            reverse('course-delete-view', args=[self.sandbox_course.pk]))
        self.assertEqual(response.status_code, 200)

    def test_delete_superuser_post(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.post(
            reverse('course-delete-view', args=[self.sandbox_course.pk]))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/dashboard/")

    def test_detail_toggle_grid_list(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        r1 = self.client.get(
            reverse('course-detail-view', args=[self.sandbox_course.pk]))
        self.assertTrue(r1.context['project_grid_layout'])

        r2 = self.client.post(
            reverse('course-detail-view', args=[self.sandbox_course.pk]))
        self.assertFalse(r2.context['project_grid_layout'])

        r3 = self.client.post(
            reverse('course-detail-view', args=[self.sandbox_course.pk]))
        self.assertTrue(r3.context['project_grid_layout'])


class DashboardTest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    def test_no_course(self):
        """
        Tests that the courses created in the setup method
        do not appear for a new user not in those courses.
        """
        student = UserFactory.create(
            first_name='Student',
            last_name='Two',
            username='student-two',
            email='studenttwo@example.com'
        )
        self.assertTrue(
            self.client.login(
                username=student.username,
                password='test'
            )
        )
        response = self.client.get("/dashboard/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.context['courses'].count(), 0)

    def test_courses_present(self):
        """
        Tests that the courses created in the setup
        method appear for users in those courses.
        """
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get("/dashboard/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.context['courses'].count(), 2)

    def test_detail_toggle_grid_list(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        r1 = self.client.get(reverse('course-list-view'))
        self.assertTrue(r1.context['course_grid_layout'])

        r2 = self.client.post(reverse('course-list-view'))
        self.assertFalse(r2.context['course_grid_layout'])

        r3 = self.client.post(reverse('course-list-view'))
        self.assertTrue(r3.context['course_grid_layout'])
