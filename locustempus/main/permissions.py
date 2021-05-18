from courseaffils.lib import in_course
from locustempus.main.models import Activity, Response
from rest_framework import permissions


class IsLoggedInCourse(permissions.IsAuthenticated):
    """
    Checks if the current user is a member of a course

    If so, it then checks they are faculty or a student. If a student, it
    checks if an activity exists for the course.
    """
    def has_permission(self, request, view):
        # Runs on GET / requests
        user = request.user
        if user.is_anonymous:
            return False
        return True

    def has_object_permission(self, request, view, obj):
        return (
            obj.course.is_faculty(request.user) or
            (in_course(request.user.username, obj.course) and
             hasattr(obj, 'activity'))
        )


class IsLoggedInFaculty(permissions.IsAuthenticated):
    """Checks if the current user is faculty a course"""
    def has_object_permission(self, request, view, obj):
        return obj.course.is_faculty(request.user)


class IsResponseOwnerOrFaculty(permissions.IsAuthenticated):
    """
    This permission class implements the following:

    List GET request, w/ no querystring args:
    - Only authenticated users may only retrieve responses that they own

    List GET w/ activity querystring
    - If user is faculty for that activity's course, then return
      all response objects that have that activity as a foreign key
    _ If a user is a student in the related course, then return only
      the responses they own.

    Single GET
    - The user must be faculty in the course AND the status needs to be not set
      to 'DRAFT'
    - OR the user must be a member of the course and an owner of the
      response

    DELETE
    - No users may delete a response via the API

    POST, PUT requires an activity PK
    - If user is faculty in the related course, they don't have
      permission to create or edit responses for that activity
    - If a user is student in the related course, they may create
      a new response object

    PATCH
    - If a user is faculty for the related course, they do not have permission.
      When they create a Feedback model, it will update the response status for
      them.
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
                    pk=request.data.get('activity'))
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

        if request.method == 'DELETE':
            return False

        course = obj.activity.project.course
        if course.is_true_faculty(user) and\
                request.method in permissions.SAFE_METHODS and\
                obj.status is not obj.DRAFT:
            return True

        if user in obj.owners.all():
            return True

        return False


class IsFeedbackFacultyOrStudentRecipient(permissions.IsAuthenticated):
    """
    =============================================
    | User    | Create | Read | Update | Delete |
    =============================================
    | Faculty | X      | X    | X      | 0      |
    | Student | 0      | X*   | 0      | 0      |
    | Anon    | 0      | 0    | 0      | 0      |
    =============================================
    *Students should only be able to read Feedback associated with a response
    that they own
    """
    def has_permission(self, request, view):
        # Runs on GET / requests
        user = request.user
        if user.is_anonymous:
            return False

        # First try to get an activity from query string params, then
        # from data in the reqest, else None
        response_pk = request.data.get('response', None)

        if not response_pk:
            return False

        try:
            activity = Response.objects.get(pk=response_pk).activity
        except Response.DoesNotExist:
            return False

        course = activity.project.course

        if request.method not in permissions.SAFE_METHODS:
            return course.is_true_faculty(user)
        else:
            return course.is_true_member(user)

    def has_object_permission(self, request, view, obj):
        # Note that this will not run when the user is requesting a list
        user = request.user

        if request.method == 'DELETE':
            return False

        course = obj.response.activity.project.course
        if course.is_true_faculty(user):
            return True
        elif course.is_true_member(user) and \
                request.method in permissions.SAFE_METHODS and \
                user in obj.response.owners.all():
            return True

        return False
