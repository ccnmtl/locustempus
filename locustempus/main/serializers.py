from courseaffils.models import Course
from django.contrib.gis.geos import Point
from generic_relations.relations import GenericRelatedField
from locustempus.main.models import (
    Layer, Project, Response, Event, Location, Activity, ResponseOwner,
    MediaObject, Feedback, RasterLayer
)
from rest_framework import serializers
from rest_framework.reverse import reverse
from waffle import flag_is_active


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

    aggregated_layers = serializers.SerializerMethodField()

    def get_aggregated_layers(self, obj):
        # If:
        # - the user is a contributor in the project's course
        # - the project has an activity
        # - the user has response for the activity
        # - the status of the user's response is either submitted or reviewed
        # THEN return a list of other contributor's submitted
        #   or reviewed response layers

        request = self.context['request']
        user = request.user
        course = obj.course

        if not flag_is_active(request, 'share_response_layers'):
            return []

        # Conditions
        is_contributor = course.is_true_member(user) and \
            not course.is_true_faculty(user)
        has_activity = hasattr(obj, 'activity')
        has_submitted_response = False
        if has_activity:
            has_submitted_response = Response.objects.filter(
                activity=obj.activity,
                owners__in=[user],
                status__in=[Response.SUBMITTED, Response.REVIEWED]
            ).exists()

        if is_contributor and has_activity and has_submitted_response:
            aggregated_layers = []
            responses = obj.activity.responses.filter(
                status__in=[Response.SUBMITTED, Response.REVIEWED]
            )
            for response in responses:
                aggregated_layers.extend([
                    reverse(
                        'api-layer-detail',
                        args=[lyr.pk],
                        request=request
                    ) for lyr in response.layers.all()
                ])

            return aggregated_layers

        return []

    class Meta:
        model = Project
        read_only_fields = ('activity', 'pk', 'course')
        fields = (
            'title', 'description', 'base_map', 'layers', 'raster_layers',
            'activity', 'pk', 'course', 'aggregated_layers'
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
        fields = ['url', 'source', 'caption', 'alt']


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
                current_media.alt = updated_media.get('alt', current_media.alt)
                current_media.source = updated_media.get(
                    'source', current_media.source)
                current_media.save()
            else:
                instance.media.set(
                    [MediaObject.objects.create(**m) for m in media_lst])
        else:
            # Handles the case where media should be deleted
            # Implicitly there's no media object on the request, but there is
            # a media object for the instance
            current_media = instance.media.first()
            if current_media:
                current_media.delete()

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
        read_only_fields = ('owner',)
        fields = (
            'title', 'pk', 'content_object', 'events', 'owner'
        )
