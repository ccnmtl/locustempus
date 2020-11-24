from courseaffils.lib import in_course
from locustempus.main.models import Activity
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


class IsResponseOwnerOrFaculty(permissions.IsAuthenticated):
    """
    This permission class implements the following:

    List GET request, w/ no querystring args:
    - Only authed users, can only retrieve responses that they own

    List GET w/ activity querystring
    - If user is faculty for the course for that activity, then return
      all response objects that have that activity as a foriegn key
    _ If a user is a student in the related course, then return only
      the responses they own.

    Single GET
    - The user must be faculty in the course
    - OR the user must be a member of the course and an owner of the
      response

    POST, PUT, DELETE requires an activity PK
    - If user is faculty in the related course, they don't have
      permission to create new response for that activity
    - If a user is student in the related course, they may create
      a new response object

    PATCH
    - If a user is faculty for the related course, they do have permission, so
      that they can provide a response to the reflection
    _ If a user is a student in the course, and they are an owner of the
      response, then they do have permission to edit.
    """
    def has_permission(self, request, view):
        user = request.user
        if user.is_anonymous:
            return False

        if request.method not in permissions.SAFE_METHODS:
            try:
                activity = Activity.objects.get(
                    pk=request.POST.get('activity'))
            except Activity.DoesNotExist:
                return False

            course = activity.project.course
            if course.is_true_faculty(user):
                return False
            elif course.is_true_member(user):
                return True
            else:
                return False

        return True

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_anonymous:
            return False

        course = obj.activity.project.course
        if course.is_true_faculty(user) and\
                request.method not in ['POST', 'PUT', 'DELETE']:
            return True

        if user in obj.owners.all():
            return True

        return False
