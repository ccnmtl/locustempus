from django.contrib.auth.models import User
from django.db.utils import IntegrityError
from django.test import TestCase
from locustempus.main.tests.factories import (
    RegistrarCourseFactory, ProjectFactory, AssignmentFactory,
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
        assignment = AssignmentFactory.create(project=project)
        response = ResponseFactory.create(
            assignment=assignment, owners=[student])
        self.assertEqual(response.owners.count(), 1)
        response.owners.add(student)
        self.assertEqual(response.owners.count(), 1)

    def test_unique_owner_per_assignment(self):
        """
        Test that a user can not be added as an owner to multiple responses
        for a single assignment.
        """
        # Add a new assignment response to an existing assignment
        student: User = UserFactory.create(
            first_name='Student',
            last_name='One',
            email='studentone@example.com'
        )
        course = RegistrarCourseFactory.create()
        project = ProjectFactory.create(course=course)
        assignment = AssignmentFactory.create(project=project)
        ResponseFactory.create(
            assignment=assignment, owners=[student])

        # Try adding self.student to this new response
        with self.assertRaises(IntegrityError):
            ResponseFactory.create(
                assignment=assignment, owners=[student])
