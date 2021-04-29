from courseaffils.models import Course
from django import template
from django.contrib.auth.models import User
from django.template import Context
from locustempus.main.models import Response

register = template.Library()


@register.filter
def course_faculty_string(course):
    if not isinstance(course, Course):
        raise Exception(
            'Object passed to course_faculty_string is not a Course object')

    return ', '.join((p.get_full_name() or p.username for p in course.faculty))


@register.filter
def course_description(course):
    if not isinstance(course, Course):
        raise Exception(
            'Object passed to course_description is not a Course object')

    return course.get_detail('description', None)
