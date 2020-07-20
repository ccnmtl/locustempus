from generic_relations.relations import GenericRelatedField
from locustempus.main.models import Layer, Project, Response
from rest_framework import serializers


class ProjectSerializer(serializers.HyperlinkedModelSerializer):
    layers = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Layer.objects.all())

    class Meta:
        model = Project
        fields = (
            'title', 'description', 'base_map', 'layers'
        )


class ResponseSerializer(serializers.HyperlinkedModelSerializer):
    layers = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Layer.objects.all())

    class Meta:
        model = Response
        fields = (
            'activity', 'layer'
        )


class LayerSerializer(serializers.ModelSerializer):
    content_object = GenericRelatedField({
        Project: serializers.HyperlinkedRelatedField(
            queryset=Project.objects.all(),
            view_name='api-project-detail'
        ),
        Response: serializers.HyperlinkedRelatedField(
            queryset=Response.objects.all(),
            view_name='api-response-detail'
        ),
    })

    class Meta:
        model = Layer
        fields = (
            'title', 'content_object'
        )
