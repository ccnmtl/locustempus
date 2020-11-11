"""The viewsets and views used for the API"""
from django.contrib.auth.models import User
from locustempus.main.models import (
    Layer, Project, Event, Activity, Response
)
from locustempus.main.permissions import IsLoggedInCourse
from locustempus.main.serializers import (
    LayerSerializer, ProjectSerializer, EventSerializer, ActivitySerializer,
    ResponseSerializer
)
from rest_framework.viewsets import ModelViewSet


class ProjectApiView(ModelViewSet):
    """Retrieves a single project"""
    serializer_class = ProjectSerializer
    queryset = Project.objects.all()
    permission_classes = [IsLoggedInCourse]


class ActivityApiView(ModelViewSet):
    """Retrieves a single project"""
    serializer_class = ActivitySerializer
    queryset = Activity.objects.all()


class LayerApiView(ModelViewSet):
    """Retrieves a layer"""
    serializer_class = LayerSerializer
    queryset = Layer.objects.all()


class EventApiView(ModelViewSet):
    """Retrieves events"""
    serializer_class = EventSerializer
    queryset = Event.objects.all()


class ResponseApiView(ModelViewSet):
    """Retrieves responses"""
    serializer_class = ResponseSerializer

    def get_queryset(self):
        qs = Response.objects.all()

        activity_qs = self.request.query_params.get('activity', None)
        owner_qs = self.request.query_params.get('owner', None)
        if activity_qs and owner_qs:
            try:
                activity = Activity.objects.get(pk=activity_qs)
                owner = User.objects.get(pk=owner_qs)
                if activity and owner:
                    qs = Response.objects.filter(
                        activity=activity,
                        owners__in=[owner]
                    )
            except (Activity.DoesNotExist, User.DoesNotExist):
                return []

        return qs
