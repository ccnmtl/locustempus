from django.contrib.gis.geos import Point
from generic_relations.relations import GenericRelatedField
from locustempus.main.models import (
    Layer, Project, Response, Event, Location, Activity, ResponseOwner,
    MediaObject, Feedback
)
from rest_framework import serializers


class ProjectSerializer(serializers.ModelSerializer):
    layers = serializers.HyperlinkedRelatedField(
        read_only=True,
        many=True,
        view_name='api-layer-detail'
    )

    class Meta:
        model = Project
        read_only_fields = ('activity',)
        fields = (
            'title', 'description', 'base_map', 'layers', 'activity'
        )


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        read_only_fields = ('title', 'pk', 'description')
        fields = (
            'title', 'pk', 'project', 'description', 'instructions'
        )


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        read_only_fields = ('pk',)
        fields = ('pk', 'feedback')


class ResponseSerializer(serializers.HyperlinkedModelSerializer):
    layers = serializers.HyperlinkedRelatedField(
        read_only=True,
        many=True,
        view_name='api-layer-detail'
    )
    activity = serializers.PrimaryKeyRelatedField(
        queryset=Activity.objects.all())

    owners = serializers.ReadOnlyField(source='owner_strings')

    feedback = FeedbackSerializer(read_only=True)

    def create(self, validated_data):
        a = validated_data.get('activity')
        r = Response.objects.create(activity=a)
        ResponseOwner.objects.create(
            response=r, owner=self.context['request'].user, activity=a)
        return r

    class Meta:
        model = Response
        read_only_fields = (
            'layers', 'pk', 'owners', 'submitted_at', 'feedback')
        fields = (
            'pk', 'activity', 'owners', 'layers', 'reflection', 'status',
            'submitted_at', 'feedback'
        )


class LocationSerializer(serializers.ModelSerializer):
    def validate_point(self, data):
        if 'lat' in data and 'lng' in data:
            return Point(data['lng'], data['lat'])

    class Meta:
        model = Location
        fields = ('point', 'polygon', 'lng_lat')


class MediaObjectSerializer(serializers.ModelSerializer):
    url = serializers.URLField()

    class Meta:
        model = MediaObject
        fields = ['url']


class EventSerializer(serializers.ModelSerializer):
    location = LocationSerializer()
    media = MediaObjectSerializer(many=True, allow_null=True)

    def create(self, validated_data):
        location_data = validated_data.pop('location')
        media_urls = validated_data.pop('media')

        event = Event.objects.create(**validated_data)
        Location.objects.create(event=event, **location_data)

        if media_urls:
            event.media.set(
                [MediaObject.objects.create(url=m['url']) for m in media_urls])

        return event

    def update(self, instance, validated_data):
        # For now, limits user to updating only these fields
        instance.label = validated_data.get('label', instance.label)
        instance.description = validated_data.\
            get('description', instance.label)
        instance.datetime = validated_data.get('datetime', instance.datetime)
        instance.save()

        # Update the location object
        loc = validated_data.get('location')
        point = loc.get('point') if loc else None
        if point:
            instance.location.point = point
            instance.location.save()

        # Update media urls
        media_urls = validated_data.pop('media')
        if media_urls:
            instance.media.set(
                [MediaObject.objects.create(url=m['url']) for m in media_urls])
        return instance

    class Meta:
        model = Event
        fields = (
            'pk', 'label', 'layer', 'description', 'datetime',
            'location', 'media'
        )


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
