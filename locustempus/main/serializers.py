from django.contrib.gis.geos import Point
from generic_relations.relations import GenericRelatedField
from locustempus.main.models import Layer, Project, Response, Event, Location
from rest_framework import serializers


class ProjectSerializer(serializers.HyperlinkedModelSerializer):
    layers = serializers.HyperlinkedRelatedField(
        read_only=True,
        many=True,
        view_name='api-layer-detail'
    )

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


class LocationSerializer(serializers.ModelSerializer):
    def validate_point(self, data):
        if 'lat' in data and 'lng' in data:
            return Point(data['lng'], data['lat'])

    class Meta:
        model = Location
        fields = ('point', 'polygon', 'lng_lat')


class EventSerializer(serializers.ModelSerializer):
    location = LocationSerializer()

    def create(self, validated_data):
        location_data = validated_data.pop('location')
        event = Event.objects.create(**validated_data)
        Location.objects.create(event=event, **location_data)
        return event

    def update(self, instance, validated_data):
        # For now, limits user to updating only these fields
        instance.label = validated_data.get('label', instance.label)
        instance.description = validated_data.\
            get('description', instance.label)
        instance.datetime = validated_data.get('datetime', instance.datetime)
        instance.save()
        return instance

    class Meta:
        model = Event
        fields = (
            'pk', 'label', 'layer', 'description', 'datetime', 'location')


class LayerSerializer(serializers.ModelSerializer):
    event_set = EventSerializer(many=True, read_only=True)
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
            'title', 'pk', 'content_object', 'event_set'
        )
