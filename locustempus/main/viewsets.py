"""The viewsets and views used for the API"""
from locustempus.main.models import Layer, Project, Event
from locustempus.main.permissions import IsLoggedInCourse
from locustempus.main.serializers import (
    LayerSerializer, ProjectSerializer, EventSerializer
)
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.viewsets import GenericViewSet, ModelViewSet


class ProjectApiView(ModelViewSet):
    """Retrieves a single project"""
    serializer_class = ProjectSerializer
    queryset = Project.objects.all()
    permission_classes = [IsLoggedInCourse]


class LayerApiView(ModelViewSet):
    """Retrieves a layer"""
    serializer_class = LayerSerializer
    queryset = Layer.objects.all()


class EventApiView(ModelViewSet):
    """Retrieves events"""
    serializer_class = EventSerializer
    queryset = Event.objects.all()
