from django.urls import resolve
from courseaffils.lib import in_course
from locustempus.main.models import Activity, Response, Project
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

        # New projects can not be created the API
        if request.method == 'POST':
            return False

        return True

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_anonymous:
            return False

        # has_permission should prevent a POST from reaching this point
        if request.method == 'POST':
            return False

        if request.method not in permissions.SAFE_METHODS:
            return obj.course.is_faculty(request.user)

        return (
            obj.course.is_faculty(request.user) or
            (in_course(request.user.username, obj.course) and
             hasattr(obj, 'activity'))
        )


class ActivityPermission(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        user = request.user
        if user.is_anonymous:
            return False

        if request.method == 'POST':
            # Check that user is faculty in the project
            try:
                proj = Project.objects.get(
                    pk=request.data.get('project', None))
                return proj.course.is_true_faculty(user)
            except Project.DoesNotExist:
                return False

        return True

    def has_object_permission(self, request, view, obj):
        """
        An authenticated user may GET an activity if they are in the course.
        An authenticated user may POST, PUT, DELETE an activity if they are
        faculty in the course.
        """
        user = request.user
        course = obj.project.course
        in_course = course.is_true_member(user)
        is_faculty = course.is_true_faculty(user)

        if request.method in permissions.SAFE_METHODS:
            return in_course

        return is_faculty


class LayerPermission(permissions.IsAuthenticated):
    def layer_permission_helper(self, layer, user):
        """
        Checks all the possible conditions for a user to be able
        to read a layer.

        Project Layer:
        - If the Layer is associated with a Project, and the user is faculty in
          Layer => Project => Course
        - If the Layer is associated with a Project, the user is a student in
          Layer => Project => Course, and the Project has an Activity

        Response Layer:
        - If the Layer is associated with a Response, and the user is an owner
          of the Response
        - If the Layer is associated with a Response, the Response state is not
          "Draft", and the user is faculty in Layer => Response => Activity =>
          Project => Course
        - If the Layer is associated with a Response, the Response state is not
          "Draft", the user is owner of a Response related to Layer => Response
          => Activity, the state of the user's Response is not "Draft", and the
          user is a student in Layer => Response => Activity => Project =>
          Course
        """
        # Project Layer
        if isinstance(layer.content_object, Project):
            project = layer.content_object
            course = project.course
            is_faculty = course.is_true_faculty(user)
            is_student = not is_faculty \
                and course.is_true_member(user)

            if is_faculty:
                return True

            if is_student and hasattr(project, 'activity'):
                return True

        # Response Layer
        if isinstance(layer.content_object, Response):
            response = layer.content_object
            activity = response.activity
            project = activity.project
            course = project.course

            # Predicates
            is_not_draft = response.status in [
                Response.SUBMITTED, Response.REVIEWED]
            is_faculty = course.is_true_faculty(user)
            is_student = not is_faculty \
                and course.is_true_member(user)

            if user in response.owners.all():
                return True

            if is_not_draft and is_faculty:
                return True

            if is_not_draft and is_student:
                try:
                    student_response = Response.objects.get(
                        activity=activity, owners__in=[user])
                except Response.DoesNotExist:
                    return False

                student_has_submitted = student_response.status in [
                    Response.SUBMITTED, Response.REVIEWED
                ]
                return student_has_submitted

        return False

    def has_permission(self, request, view):
        user = request.user
        if user.is_anonymous:
            return False

        if request.method == 'POST':
            view, args, kwargs = resolve(request.data['content_object'])
            model_cls = view.cls._lt_model_cls
            if model_cls is Project:
                try:
                    proj = model_cls.objects.get(pk=kwargs['pk'])
                except Project.DoesNotExist:
                    return False

                return proj.course.is_true_faculty(user)

            if model_cls is Response:
                try:
                    response = Response.objects.get(pk=kwargs['pk'])
                except Response.DoesNotExist:
                    return False

                return user in response.owners.all()

            # Anyone else trying to POST should be blocked
            return False

        return True

    def has_object_permission(self, request, view, obj):
        user = request.user

        if request.method in permissions.SAFE_METHODS:
            return self.layer_permission_helper(obj, user)

        else:
            if isinstance(obj.content_object, Project):
                return obj.content_object.course.is_true_faculty(user)

            if isinstance(obj.content_object, Response):
                return user in obj.content_object.owners.all()

            return False

        return False


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
