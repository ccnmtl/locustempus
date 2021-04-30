from django import forms
from django.conf import settings
from django.core.validators import RegexValidator
from django.forms.formsets import formset_factory
from django_registration.forms import RegistrationForm

from django_registration.signals import user_registered


class CourseRosterInviteUNIForm(forms.Form):
    invitee = forms.CharField(
        max_length=24,
        validators=[
            RegexValidator(
                regex=r'^[a-z]{1,3}\d+$',
                message='This is not a valid UNI.'
            )
        ]
    )


class CourseRosterInviteEmailForm(forms.Form):
    invitee = forms.EmailField()

    def clean_invitee(self):
        email = self.cleaned_data['invitee']
        for suffix in settings.BLOCKED_EMAIL_DOMAINS:
            if email.endswith(suffix):
                msg = ('{} is a Columbia University email address. To invite'
                       ' a student or instructor with a UNI, please use the'
                       ' above "Add Users by UNI" form.')

                msg = msg.format(email)
                raise forms.ValidationError(msg)

        return email


InviteUNIFormset = formset_factory(
    CourseRosterInviteUNIForm, extra=1)
InviteEmailFormset = formset_factory(
    CourseRosterInviteEmailForm, extra=1)


class CustomRegistrationForm(RegistrationForm):
    first_name = forms.CharField(required=False)
    last_name = forms.CharField(required=False)


def user_created(sender, user, request, **kwargs):
    """
    Called via signals when user registers. Creates different profiles and
    associations
    """
    form = CustomRegistrationForm(request.POST)
    # Update first and last name for user
    user.first_name = form.data['first_name']
    user.last_name = form.data['last_name']
    user.save()


user_registered.connect(user_created)
