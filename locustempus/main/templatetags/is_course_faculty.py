from django import template
from django.contrib.auth.models import User
from django.template import Context
register = template.Library()


@register.simple_tag(takes_context=True)
def is_course_faculty(context: Context, user: User) -> bool:
    """Template tag to identify faculty in a course """
    return context['course'].is_true_faculty(user)
