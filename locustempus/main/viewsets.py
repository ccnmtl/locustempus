"""The viewsets and views used for the API"""
from courseaffils.views import get_courses_for_user, get_courses_for_instructor
from django.db.models import Q
from locustempus.main.models import (
    Layer, Project, Event, Activity, Response, Feedback
)
from locustempus.main.permissions import (
    IsLoggedInCourse, IsResponseOwnerOrFaculty,
    IsFeedbackFacultyOrStudentRecipient, ActivityPermission
)
from locustempus.main.serializers import (
    LayerSerializer, ProjectSerializer, EventSerializer, ActivitySerializer,
    ResponseSerializer, FeedbackSerializer
)
from rest_framework.viewsets import ModelViewSet


class ProjectApiView(ModelViewSet):
    """Retrieves a single project"""
    serializer_class = ProjectSerializer

    def get_queryset(self):
        """
        Users in a course MAY be able to view a project if:
        A) They are faculty in the course
        OR
        B) They are in the course and the project has an activity
        """
        user = self.request.user
        instructor_courses = get_courses_for_instructor(user)
        user_courses = get_courses_for_user(user)
        return Project.objects.filter(
            (Q(course__in=instructor_courses)) |
            (Q(course__in=user_courses) & Q(activity__isnull=False))
        )

    permission_classes = [IsLoggedInCourse]


class ActivityApiView(ModelViewSet):
    """Retrieves a single project"""
    # Similar to Projects, only users in the course should be able to read
    # activities. Only project authors can create, edit, or delete activities
    serializer_class = ActivitySerializer
    permission_classes = [ActivityPermission]

    def get_queryset(self):
        """
        A user can GET / Activityies if the user is in the
        course group for the related Course object
        """
        user = self.request.user
        courses = get_courses_for_user(user)
        return Activity.objects.filter(
            project__course__in=courses
        )


class LayerApiView(ModelViewSet):
    """Retrieves a layer"""
    # If an author in a course, can
    serializer_class = LayerSerializer
    queryset = Layer.objects.all()


class EventApiView(ModelViewSet):
    """Retrieves events"""
    serializer_class = EventSerializer
    queryset = Event.objects.all()


class ResponseApiView(ModelViewSet):
    """Retrieves responses"""
    serializer_class = ResponseSerializer
    permission_classes = [IsResponseOwnerOrFaculty]

    def get_queryset(self):
        """
        If no querystring param is provided, then return a queryset
        that has the current user as owner

        If a querystring is provided:
        - If user is faculty for the course for that activity, then return
          all response objects that have that activity as a foriegn key
        _ If a user is a student in the related course, then return only
          the responses they own.
        """
        user = self.request.user
        activity_qs = self.request.query_params.get('activity', None)

        if activity_qs:
            try:
                activity = Activity.objects.get(pk=activity_qs)
            except Activity.DoesNotExist:
                return Response.objects.none()

            course = activity.project.course
            if course.is_true_faculty(user):
                return Response.objects.filter(activity=activity)\
                    .exclude(status=Response.DRAFT)

            if course.is_true_member(user):
                return Response.objects.filter(
                    activity=activity,
                    owners__in=[user]
                )

            # If a user is not faculty nor a student in the course, then return
            # an empty queryset
            return Response.objects.none()
        else:
            # Handles the case if no activity is specified in the querystring
            return Response.objects.filter(
                owners__in=[user]
            )


class FeedbackAPIView(ModelViewSet):
    """Retrieves feedback"""
    serializer_class = FeedbackSerializer
    permission_classes = [IsFeedbackFacultyOrStudentRecipient]

    def get_queryset(self):
        """
        If no querystring param is provided, then return a queryset
        that has the current user as owner

        If a querystring is provided:
        - If user is faculty for the course for that activity, then return
          all response objects that have that activity as a foriegn key
        _ If a user is a student in the related course, then return only
          the responses they own.
        """
        user = self.request.user
        activity_qs = self.request.query_params.get('activity', None)

        if activity_qs:
            try:
                activity = Activity.objects.get(pk=activity_qs)
            except Activity.DoesNotExist:
                return Feedback.objects.none()

            course = activity.project.course
            if course.is_true_faculty(user):
                # Return feedback for only that particular activity
                return Feedback.objects.filter(response__activity=activity)

            if course.is_true_member(user):
                # Return the feedback for responses owned by the student
                return Feedback.objects.filter(
                    response__activity=activity,
                    response__activity__owners__in=[user]
                )

            # If a user is not faculty nor a student in the course, then return
            # an empty queryset
            return Feedback.objects.none()
        else:
            # Return feedback created by this user
            return Feedback.objects.filter(created_by=user)
