from django.test import TestCase
from locustempus.main.tests.factories import (
    CourseFactory, CourseTestMixin
)


class BasicTest(TestCase):
    def test_root(self):
        response = self.client.get("/")
        self.assertEquals(response.status_code, 302)

    def test_smoketest(self):
        response = self.client.get("/smoketest/")
        self.assertEquals(response.status_code, 200)
        self.assertContains(response, 'PASS')


class CourseTest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    # For CourseCreateView
    def test_create_anon(self):
        response = self.client.get("/course/create/")
        self.assertEquals(response.status_code, 302)

    def test_create_student(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get("/course/create/")
        self.assertEquals(response.status_code, 403)

    def test_create_faculty(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get("/course/create/")
        self.assertEquals(response.status_code, 403)

    def test_create_superuser(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.get("/course/create/")
        self.assertEquals(response.status_code, 200)

    def test_create_superuser_post(self):
        # TODO
        pass

    # For CourseListView
    def test_list_anon(self):
        response = self.client.get("/course/list/")
        self.assertEquals(response.status_code, 302)

    def test_list_student(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get("/course/list/")
        self.assertEquals(response.status_code, 200)

    def test_list_faculty(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get("/course/list/")
        self.assertEquals(response.status_code, 200)

    def test_list_superuser(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.get("/course/list/")
        self.assertEquals(response.status_code, 200)

    # For CourseDetailView
    def test_detail_anon(self):
        response = self.client.get("/course/{}/".format(self.course.pk))
        self.assertEquals(response.status_code, 302)

    def test_detail_student_in_course(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/".format(self.course.pk))
        self.assertEquals(response.status_code, 200)

    def test_detail_student_not_in_course(self):
        alternate_course = CourseFactory()
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/".format(alternate_course.pk))
        self.assertEquals(response.status_code, 403)

    def test_detail_faculty_in_course(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/".format(self.course.pk))
        self.assertEquals(response.status_code, 200)

    def test_detail_faculty_not_in_course(self):
        alternate_course = CourseFactory()
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/".format(alternate_course.pk))
        self.assertEquals(response.status_code, 403)

    def test_detail_superuser(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/".format(self.course.pk))
        self.assertEquals(response.status_code, 200)

    # For CourseEditView
    def test_edit_anon(self):
        response = self.client.get("/course/{}/edit/".format(self.course.pk))
        self.assertEquals(response.status_code, 302)

    def test_edit_student(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/edit/".format(self.course.pk))
        self.assertEquals(response.status_code, 403)

    def test_edit_faculty_in_course(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/edit/".format(self.course.pk))
        self.assertEquals(response.status_code, 200)

    def test_edit_faculty_post(self):
        # TODO
        pass

    def test_edit_faculty_not_in_course(self):
        alternate_course = CourseFactory()
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get(
            "/course/{}/edit/".format(alternate_course.pk))
        self.assertEquals(response.status_code, 403)

    def test_edit_superuser(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.get("/course/{}/edit/".format(self.course.pk))
        self.assertEquals(response.status_code, 200)

    def test_edit_superuser_post(self):
        # TODO
        pass
