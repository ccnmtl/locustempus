from django.conf import settings
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.template import loader


def send_template_email(subject, template_name, params, recipient):
    validate_email(recipient)

    template = loader.get_template(template_name)
    message = template.render(params)
    send_mail(subject, message, settings.SERVER_EMAIL, [recipient])
