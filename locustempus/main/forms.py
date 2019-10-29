from courseaffils.models import Course
from django import forms


class CourseCreateForm(forms.ModelForm):
    class Meta:
        model = Course
