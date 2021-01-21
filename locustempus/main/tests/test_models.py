from django.contrib.auth.models import User
from django.db.utils import IntegrityError
from django.test import TestCase
from locustempus.main.tests.factories import (
    RegistrarCourseFactory, ProjectFactory, ActivityFactory,
    ResponseFactory, UserFactory
)


class ResponseModelTest(TestCase):
    def test_unique_owner_per_response(self):
        """
        Test that a user can not be added as an owner to response
        multiple times.

        Noting that Django's default behavior is to prevent
        multiple instances of many to many relation.
        """
        student: User = UserFactory.create(
            first_name='Student',
            last_name='One',
            email='studentone@example.com'
        )
        course = RegistrarCourseFactory.create()
        project = ProjectFactory.create(course=course)
        activity = ActivityFactory.create(project=project)
        response = ResponseFactory.create(
            activity=activity, owners=[student])
        self.assertEqual(response.owners.count(), 1)
        response.owners.add(student)
        self.assertEqual(response.owners.count(), 1)

    def test_unique_owner_per_activity(self):
        """
        Test that a user can not be added as an owner to multiple responses
        for a single activity.
        """
        # Add a new activity response to an existing activity
        student: User = UserFactory.create(
            first_name='Student',
            last_name='One',
            email='studentone@example.com'
        )
        course = RegistrarCourseFactory.create()
        project = ProjectFactory.create(course=course)
        activity = ActivityFactory.create(project=project)
        ResponseFactory.create(
            activity=activity, owners=[student])

        # Try adding self.student to this new response
        with self.assertRaises(IntegrityError):
            ResponseFactory.create(
                activity=activity, owners=[student])

    def test_submitted_by_on(self):
        student: User = UserFactory.create(
            first_name='Student',
            last_name='One',
            email='studentone@example.com'
        )
        course = RegistrarCourseFactory.create()
        project = ProjectFactory.create(course=course)
        activity = ActivityFactory.create(project=project)
        response = ResponseFactory.create(
            activity=activity, owners=[student])

        # Assert that submitted_* are null
        self.assertIsNone(response.submitted_at)

        # Then submit the assignment
        response.status = response.SUBMITTED
        response.save()

        # Check that the fields have updated
        self.assertIsNot(response.submitted_at, None)
