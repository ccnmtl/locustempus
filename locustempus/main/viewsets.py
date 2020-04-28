"""The viewsets and views used for the API"""
from locustempus.main.models import Project
from locustempus.main.permissions import IsLoggedInCourse
from locustempus.main.serializers import ProjectSerializer
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.viewsets import GenericViewSet


class ProjectApiView(RetrieveModelMixin, GenericViewSet):
    """Retrieves a single project"""
    serializer_class = ProjectSerializer
    queryset = Project.objects.all()
    permission_classes = [IsLoggedInCourse]
