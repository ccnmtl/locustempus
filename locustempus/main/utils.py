"""Locus Tempus Utility Functions"""
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
