"""Locus Tempus Utility Functions"""
from courseaffils.models import Course
from django.conf import settings
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.template import loader

from typing import Any, Dict


def send_template_email(subject: str, template_name: str,
                        context: Dict[str, Any], recipient: str) -> None:
    """Validate address and send a template email"""
    validate_email(recipient)

    template = loader.get_template(template_name)
    message = template.render(context)
    send_mail(subject, message, settings.SERVER_EMAIL, [recipient])


def get_courses_for_user(user):
    courses = Course.objects.none()
    if not user.is_anonymous:
        courses = Course.objects.filter(group__user=user)
    return courses.order_by('-info__year', '-info__term', 'title')


def get_courses_for_instructor(user):
    courses = Course.objects.none()
    if not user.is_anonymous:
        courses = Course.objects.filter(faculty_group__user=user)

    courses = courses.order_by('-info__year', '-info__term', 'title')
    return courses.select_related(
            'info', 'group', 'faculty_group', 'settings').prefetch_related(
                'coursedetails_set')
