"""The viewsets and views used for the API"""
from locustempus.main.models import Layer, Project
from locustempus.main.permissions import IsLoggedInCourse
from locustempus.main.serializers import (
    LayerSerializer, ProjectSerializer
)
from rest_framework.mixins import RetrieveModelMixin, DestroyModelMixin
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import GenericViewSet, ModelViewSet


class ProjectApiView(RetrieveModelMixin, GenericViewSet):
    """Retrieves a single project"""
    serializer_class = ProjectSerializer
    queryset = Project.objects.all()
    permission_classes = [IsLoggedInCourse]


class LayerApiView(ModelViewSet):
    """Retrieves a layer"""
    serializer_class = LayerSerializer
    queryset = Layer.objects.all()
