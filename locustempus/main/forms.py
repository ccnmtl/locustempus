from courseaffils.models import Course
from django import forms
from django.conf import settings
from django.forms.formsets import formset_factory
from django.core.validators import RegexValidator


class CourseForm(forms.ModelForm):
    description = forms.CharField(widget=forms.Textarea)

    def save(self):
        course = super().save()
        description = self.cleaned_data.get('description', None)
        if description:
            course.add_detail('description', description)

        course.save()

        return course

    class Meta:
        model = Course
        fields = ['title']


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
