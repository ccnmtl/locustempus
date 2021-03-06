from courseaffils.models import Course
from django.contrib.gis.geos import Point
from generic_relations.relations import GenericRelatedField
from locustempus.main.models import (
    Layer, Project, Response, Event, Location, Activity, ResponseOwner,
    MediaObject, Feedback, RasterLayer
)
from rest_framework import serializers


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        read_only_fields = ('title', 'pk')
        fields = ('title', 'pk')


class RasterLayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = RasterLayer
        read_only_fields = ('pk', 'title', 'url')
        fields = ('pk', 'title', 'url')


class ProjectSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    layers = serializers.HyperlinkedRelatedField(
        read_only=True,
        many=True,
        view_name='api-layer-detail'
    )
    raster_layers = RasterLayerSerializer(
        read_only=True,
        many=True
    )

    class Meta:
        model = Project
        read_only_fields = ('activity', 'pk', 'course')
        fields = (
            'title', 'description', 'base_map', 'layers', 'raster_layers',
            'activity', 'pk', 'course'
        )


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        read_only_fields = ('pk',)
        fields = (
            'pk', 'project', 'instructions'
        )


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        read_only_fields = (
            'pk', 'submitted_at_formatted', 'modified_at_formatted',
            'feedback_from'
        )
        fields = (
            'pk', 'body', 'response', 'submitted_at_formatted',
            'modified_at_formatted', 'feedback_from'
        )


class ResponseSerializer(serializers.HyperlinkedModelSerializer):
    layers = serializers.HyperlinkedRelatedField(
        read_only=True,
        many=True,
        view_name='api-layer-detail'
    )
    raster_layers = RasterLayerSerializer(
        read_only=True,
        many=True
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
            'layers', 'pk', 'owners', 'submitted_at', 'submitted_at_formatted',
            'modified_at', 'modified_at_formatted', 'feedback')
        fields = (
            'pk', 'activity', 'owners', 'layers', 'raster_layers',
            'reflection', 'status', 'submitted_at', 'submitted_at_formatted',
            'modified_at', 'modified_at_formatted', 'feedback')


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
        fields = ['url', 'source', 'caption']


class EventSerializer(serializers.ModelSerializer):
    location = LocationSerializer()
    media = MediaObjectSerializer(many=True, allow_null=True)

    def create(self, validated_data):
        location_data = validated_data.pop('location')

        media_lst = validated_data.pop('media')

        event = Event.objects.create(**validated_data)
        Location.objects.create(event=event, **location_data)

        if media_lst:
            event.media.set(
                [MediaObject.objects.create(**m) for m in media_lst])

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
        media_lst = validated_data.pop('media')
        if media_lst:
            current_media = instance.media.first()
            updated_media = media_lst[0]
            if current_media:
                current_media.url = updated_media.get('url', current_media.url)
                current_media.caption = updated_media.get(
                    'caption', current_media.caption)
                current_media.source = updated_media.get(
                    'source', current_media.source)
                current_media.save()
            else:
                instance.media.set(
                    [MediaObject.objects.create(**m) for m in media_lst])

        return instance

    class Meta:
        model = Event
        fields = (
            'pk', 'label', 'layer', 'description', 'datetime',
            'location', 'media', 'owner', 'short_description'
        )
        read_only_fields = ('owner', 'short_description')


class LayerSerializer(serializers.ModelSerializer):
    events = EventSerializer(many=True, read_only=True)
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
            'title', 'pk', 'content_object', 'events'
        )
