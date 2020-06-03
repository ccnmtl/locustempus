"""Tests Course Roster invite views"""
from django.core import mail
from django.test import TestCase
from django.urls.base import reverse
from django_registration.signals import user_activated
from locustempus.main.models import GuestUserAffil
from locustempus.main.tests.factories import (
    SandboxCourseFactory, CourseTestMixin, UserFactory,
)
from unittest.mock import MagicMock


class CourseRoster(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    def test_course_roster_faculty(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get(
            reverse('course-roster-view', args=[self.sandbox_course.pk]))
        self.assertEqual(response.status_code, 200)

    def test_course_roster_faculty_not_in_course(self):
        alternate_course = SandboxCourseFactory.create()
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get(
            reverse('course-roster-view', args=[alternate_course.pk]))
        self.assertEqual(response.status_code, 403)

    def test_course_roster_superuser(self):
        self.assertTrue(
            self.client.login(
                username=self.superuser.username,
                password='test'
            )
        )
        response = self.client.get(
            reverse('course-roster-view', args=[self.sandbox_course.pk]))
        self.assertEqual(response.status_code, 200)

    def test_course_roster_student(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get(
            reverse('course-roster-view', args=[self.sandbox_course.pk]))
        self.assertEqual(response.status_code, 403)

    def test_course_roster_promote(self):
        """Test that a faculty can demote a user"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            reverse(
                'course-roster-promote-view', args=[self.sandbox_course.pk]),
            {'user_id': self.student.pk}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url,
                         "/course/{}/roster/".format(self.sandbox_course.pk))
        self.assertTrue(self.sandbox_course.is_true_faculty(self.student))

    def test_course_roster_demote(self):
        """Test that a faculty can demote a user"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            reverse(
                'course-roster-demote-view', args=[self.sandbox_course.pk]),
            {'user_id': self.faculty.pk}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url,
                         "/course/{}/roster/".format(self.sandbox_course.pk))
        # Check that the demoted user is still a member of the course
        self.assertTrue(self.sandbox_course.is_member(self.faculty))
        self.assertFalse(self.sandbox_course.is_true_faculty(self.faculty))

    def test_course_roster_non_members(self):
        """Test that users who are not faculty can not
        promote/demote course members"""
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.post(
            reverse(
                'course-roster-promote-view', args=[self.sandbox_course.pk]),
            {'user_id': self.student.pk}
        )
        self.assertEqual(response.status_code, 403)
        response = self.client.post(
            reverse(
                'course-roster-demote-view', args=[self.sandbox_course.pk]),
            {'user_id': self.student.pk}
        )
        self.assertEqual(response.status_code, 403)

    def test_course_roster_remove_student(self):
        """Test that a faculty can demote a user"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            reverse(
                'course-roster-remove-view', args=[self.sandbox_course.pk]),
            {'user_id': self.student.pk}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url,
                         "/course/{}/roster/".format(self.sandbox_course.pk))
        self.assertFalse(self.sandbox_course.is_true_member(self.student))

    def test_course_roster_remove_faculty(self):
        """Test that a faculty can demote a user"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        self.sandbox_course.faculty_group.user_set.add(self.student)
        response = self.client.post(
            reverse(
                'course-roster-remove-view', args=[self.sandbox_course.pk]),
            {'user_id': self.student.pk}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url,
                         "/course/{}/roster/".format(self.sandbox_course.pk))
        self.assertFalse(self.sandbox_course.is_true_member(self.student))

    def test_course_roster_remove_non_members(self):
        """Test that users who are not faculty can not
        remove course members"""
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.post(
            reverse(
                'course-roster-remove-view', args=[self.sandbox_course.pk]),
            {'user_id': self.student.pk}
        )
        self.assertEqual(response.status_code, 403)
        response = self.client.post(
            reverse(
                'course-roster-demote-view', args=[self.sandbox_course.pk]),
            {'user_id': self.faculty.pk}
        )
        self.assertEqual(response.status_code, 403)

    def test_course_roster_resend_invite(self):
        """Test that faculty can resend invite"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        addr = 'foo@bar.com'
        affil = GuestUserAffil(
            guest_email=addr,
            course=self.sandbox_course,
            invited_by=self.faculty
        )
        affil.save()
        response = self.client.post(
            reverse(
                'course-roster-resend-invite-view',
                args=[self.sandbox_course.pk]),
            {'user_email': addr}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url,
                         "/course/{}/roster/".format(self.sandbox_course.pk))

        self.assertEqual(len(mail.outbox), 1)

        self.assertEqual(
            mail.outbox[0].subject,
            'Locus Tempus Invite: {}'.format(self.sandbox_course.title))

    def test_course_roster_uninvite(self):
        """Test that faculty can uninvite a guest user"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        addr = 'foo@bar.com'
        affil = GuestUserAffil(
            guest_email=addr,
            course=self.sandbox_course,
            invited_by=self.faculty
        )
        affil.save()

        self.assertTrue(
            GuestUserAffil.objects.filter(
                course=self.sandbox_course, guest_email=addr).exists())

        response = self.client.post(
            reverse(
                'course-roster-uninvite-view', args=[self.sandbox_course.pk]),
            {'user_email': addr}
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url,
                         "/course/{}/roster/".format(self.sandbox_course.pk))

        self.assertFalse(
            GuestUserAffil.objects.filter(
                course=self.sandbox_course, guest_email=addr).exists())

    def test_course_roster_uninvite_non_faculty(self):
        """
        Tests that non-course faculty can't uninvite a
        user invited to another course.
        """
        # Set up course and an affil
        course = SandboxCourseFactory.create()
        addr = 'foo@bar.com'
        affil = GuestUserAffil(
            guest_email=addr,
            course=self.sandbox_course,
            invited_by=self.faculty
        )
        affil.save()

        # Log in a faculty for a different course and try
        # to uninvite foo@bar.com
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            reverse(
                'course-roster-uninvite-view', args=[course.pk]),
            {'user_email': addr}
        )
        self.assertEqual(response.status_code, 403)


class CourseRosterInviteUserTest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    def test_get_course_invite_page(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.get(
            reverse('course-roster-invite-user',
                    args=[self.sandbox_course.pk]))
        self.assertEqual(response.status_code, 200)

    def test_get_course_invite_page_student(self):
        self.assertTrue(
            self.client.login(
                username=self.student.username,
                password='test'
            )
        )
        response = self.client.get(
            reverse('course-roster-invite-user',
                    args=[self.sandbox_course.pk]))
        self.assertEqual(response.status_code, 403)

    def test_get_course_invite_page_anon(self):
        response = self.client.get(
            reverse('course-roster-invite-user',
                    args=[self.sandbox_course.pk]))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/accounts/login/?next=/course/{}/roster/invite/".format(
                self.sandbox_course.pk))

    def test_post_valid_uni(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            reverse(
                'course-roster-invite-user', args=[self.sandbox_course.pk]),
            {
                'uni-TOTAL_FORMS': '1',
                'uni-INITIAL_FORMS': '0',
                'uni-0-invitee': 'abc123',
                'email-TOTAL_FORMS': '1',
                'email-INITIAL_FORMS': '0'
            }
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/course/{}/roster/".format(self.sandbox_course.pk))

    def test_post_invalid_uni(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            reverse(
                'course-roster-invite-user', args=[self.sandbox_course.pk]),
            {
                'uni-TOTAL_FORMS': '1',
                'uni-INITIAL_FORMS': '0',
                'uni-0-invitee': 'foobar',
                'email-TOTAL_FORMS': '1',
                'email-INITIAL_FORMS': '0'
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertInHTML(
            'This is not a valid UNI.', response.content.decode('utf-8'))

    def test_post_email(self):
        """Tests that a guest user can be added"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        addr = 'foo@bar.com'
        response = self.client.post(
            reverse(
                'course-roster-invite-user', args=[self.sandbox_course.pk]),
            {
                'uni-TOTAL_FORMS': '1',
                'uni-INITIAL_FORMS': '0',
                'uni-0-invitee': '',
                'email-TOTAL_FORMS': '1',
                'email-INITIAL_FORMS': '0',
                'email-0-invitee': addr,
            }
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            "/course/{}/roster/".format(self.sandbox_course.pk))
        self.assertTrue(
            GuestUserAffil.objects.filter(
                course=self.sandbox_course, guest_email=addr).exists())
        self.assertEqual(2, len(self.sandbox_course.members))

    def test_post_cu_email(self):
        """Tests that a CU email address can not be added as a guest user"""
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        addr = 'roary@columbia.edu'
        response = self.client.post(
            reverse(
                'course-roster-invite-user', args=[self.sandbox_course.pk]),
            {
                'uni-TOTAL_FORMS': '1',
                'uni-INITIAL_FORMS': '0',
                'uni-0-invitee': '',
                'email-TOTAL_FORMS': '1',
                'email-INITIAL_FORMS': '0',
                'email-0-invitee': addr,
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(
            response,
            addr + ' is a Columbia University email address.')

    def test_guest_user_course_affil(self):
        """
        Tests that a guest user is added to the
        course upon registering for an account
        """
        affil = GuestUserAffil(
            guest_email='foo@bar.com',
            course=self.sandbox_course,
            invited_by=self.faculty
        )
        affil.save()
        guest = UserFactory.create(
            first_name='Guest',
            last_name='User',
            username='guest-user',
            email='foo@bar.com'
        )

        mock_sender = MagicMock()
        user_activated.send(sender=mock_sender, user=guest)
        self.assertTrue(self.sandbox_course.is_true_member(guest))

    def test_guest_user_exists(self):
        """
        Tests the case where a guest is invited to a course,
        and the user already has a Locus Tempus account.
        """
        addr = 'gueststudent@example.com'
        UserFactory.create(
            first_name='Guest',
            last_name='Student',
            username='guest-student',
            email=addr
        )
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            reverse(
                'course-roster-invite-user', args=[self.sandbox_course.pk]),
            {
                'uni-TOTAL_FORMS': '1',
                'uni-INITIAL_FORMS': '0',
                'uni-0-invitee': '',
                'email-TOTAL_FORMS': '1',
                'email-INITIAL_FORMS': '0',
                'email-0-invitee': addr,
            },
            follow=True
        )
        self.assertContains(
            response,
            'An email was sent to {} notifying the user.'.format(addr))

    def test_empty_form(self):
        self.assertTrue(
            self.client.login(
                username=self.faculty.username,
                password='test'
            )
        )
        response = self.client.post(
            reverse(
                'course-roster-invite-user', args=[self.sandbox_course.pk]),
            {
                'uni-TOTAL_FORMS': '1',
                'uni-INITIAL_FORMS': '0',
                'uni-0-invitee': '',
                'email-TOTAL_FORMS': '1',
                'email-INITIAL_FORMS': '0',
                'email-0-invitee': '',
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(
            response, 'A value must be entered in either field.')
