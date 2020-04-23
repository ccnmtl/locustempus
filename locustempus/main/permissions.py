from courseaffils.lib import in_course
from rest_framework import permissions


class IsLoggedInCourse(permissions.IsAuthenticated):
    """Checks if the current user is a member of a course"""
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        return (
            in_course(request.user.username, obj.course) or
            obj.course.is_faculty(request.user)
        )


class IsLoggedInFaculty(permissions.IsAuthenticated):
    """Checks if the current user is faculty a course"""
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True

        return obj.course.is_faculty(request.user)
