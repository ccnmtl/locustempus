from django import forms
from django.conf import settings
from django.forms.formsets import formset_factory
from django.core.validators import RegexValidator


class CourseRosterInviteUNIForm(forms.Form):
    invitee = forms.CharField(
        max_length=24,
        validators=[
            RegexValidator(
                regex=r'^[a-z]{1,3}\d+$',
                message='This is not a valid UNI'
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


InviteUNIFormset = formset_factory(CourseRosterInviteUNIForm, extra=1)
InviteEmailFormset = formset_factory(CourseRosterInviteEmailForm, extra=1)
