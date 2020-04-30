"""Tests for Assignment views"""
from courseaffils.columbia import CourseStringMapper
from courseaffils.models import Course
from django.conf import settings
from django.contrib.auth.models import Group
from django.core import mail
from django.test import TestCase
from django.urls.base import reverse
from django_registration.signals import user_activated
from locustempus.main.models import GuestUserAffil
from lti_provider.models import LTICourseContext
from lti_provider.tests.factories import LTICourseContextFactory


from locustempus.main.tests.factories import (
    SandboxCourseFactory, CourseTestMixin, ProjectFactory, UserFactory,
)
from unittest.mock import MagicMock


class AssignmentTest(CourseTestMixin, TestCase):
    def setUp(self):
        self.setup_course()

    def test_assignment_detail(self):
        pass
