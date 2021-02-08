"""Models for the Locus Tempus application"""
from courseaffils.models import Course
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import (
    GenericForeignKey, GenericRelation
)
from django.contrib.contenttypes.models import ContentType
from django.contrib.gis.db.models.fields import PointField, PolygonField
from django.dispatch import receiver
from django.db import models
from django_registration.signals import user_activated


BASE_MAPS = [
    ('streets-v11', 'Street'),
    ('outdoors-v11', 'Outdoors'),
    ('light-v10', 'Light'),
    ('dark-v10', 'Dark'),
    ('satellite-v9', 'Satellite'),
    ('satellite-streets-v11', 'Street - Satellite'),
    ('navigation-preview-day-v4', 'Navigation - Day'),
    ('navigation-preview-night-v4', 'Navigation - Night'),
    ('navigation-guidance-day-v4', 'Navigation/Guidance - Day'),
    ('navigation-guidance-night-v4', 'Navigation/Guidance - Night'),
]


class Layer(models.Model):
    title = models.CharField(max_length=32)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True
    )
    modified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True
    )


class MediaObject(models.Model):
    url = models.URLField()
    source = models.TextField(blank=True)
    caption = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True
    )
    modified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True
    )


class Event(models.Model):
    label = models.TextField()
    layer = models.ForeignKey(
        Layer,
        related_name='events',
        on_delete=models.CASCADE
    )
    description = models.TextField(blank=True)
    datetime = models.DateTimeField(blank=True, null=True)
    media = models.ManyToManyField(MediaObject, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True
    )
    modified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True
    )


class Location(models.Model):
    event = models.OneToOneField(
        Event,
        on_delete=models.CASCADE,
    )

    # NOTE: Coorindates are stored as (lng, lat)
    # This is done to match DeckGL's convention
    point = PointField(blank=True, null=True)
    polygon = PolygonField(blank=True, null=True)

    @property
    def lng_lat(self):
        return [
            self.point.coords[0], self.point.coords[1]
        ] if self.point else None

    class Meta:
        constraints = [
            models.CheckConstraint(
                name="value_either_point_or_polygon",
                check=(
                    models.Q(
                        point__isnull=False,
                        polygon__isnull=True
                    )
                    | models.Q(
                        point__isnull=True,
                        polygon__isnull=False
                    )
                )
            )
        ]


class Project(models.Model):
    title = models.CharField(
        max_length=256,
        default='Untitled project'
    )
    description = models.TextField(
        blank=True
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='projects')
    base_map = models.CharField(
        max_length=64,
        choices=BASE_MAPS,
        default='light-v10'
    )
    layers = GenericRelation(Layer, related_query_name='project')
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True
    )
    modified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True
    )

    def __str__(self):
        return self.title


class Activity(models.Model):
    project = models.OneToOneField(
        Project, on_delete=models.CASCADE, related_name='activity')
    instructions = models.CharField(max_length=256)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True
    )
    modified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True
    )

    @property
    def title(self):
        return self.project.title

    @property
    def description(self):
        return self.project.description


class Response(models.Model):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._old_status = self.status

    DRAFT = 'DRAFT'
    SUBMITTED = 'SUBMITTED'
    REVIEWED = 'REVIEWED'

    STATUS_CHOICES = [
        (DRAFT, 'Draft'),
        (SUBMITTED, 'Submitted'),
        (REVIEWED, 'Reviewed')
    ]

    activity = models.ForeignKey(
        Activity,
        on_delete=models.CASCADE,
        related_name='responses'
    )
    owners = models.ManyToManyField(
        User,
        through='ResponseOwner'
    )
    layers = GenericRelation(Layer, related_query_name='layer')
    status = models.CharField(
        max_length=12,
        choices=STATUS_CHOICES,
        default=DRAFT
    )
    reflection = models.TextField(
        blank=True
    )

    submitted_at = models.DateTimeField(
        null=True
    )
    submitted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True
    )
    modified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True
    )

    def owner_strings(self):
        return [
            owner.get_full_name() if owner.get_full_name() else owner.username
            for owner in self.owners.all()
        ]

    def save(self, *args, **kwargs):
        if self.status == self.SUBMITTED and \
                self._old_status != self.SUBMITTED:
            self.submitted_at = self.modified_at
            self.submitted_by = self.modified_by

        super().save(*args, **kwargs)


class ResponseOwner(models.Model):
    """
    Through table for response owners

    We need a custom through model with unique constraints on
    owner, response, and activity to address two possibilities:
    - Prevent a user from being added as an owner to a response multiple times
    - Prevent a user from being added as an owner to multiple responses
    """
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    response = models.ForeignKey(Response, on_delete=models.CASCADE)
    activity = models.ForeignKey(
        Activity,
        on_delete=models.CASCADE,
        related_name='+'
    )

    class Meta:
        unique_together = ('owner', 'activity')


class Feedback(models.Model):
    body = models.TextField(
        blank=True
    )
    response = models.OneToOneField(
        Response,
        on_delete=models.CASCADE,
        related_name='feedback'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True
    )
    modified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True
    )


class GuestUserAffil(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    guest_email = models.EmailField()
    invited_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='invited_by')
    invited_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    accepted_at = models.DateTimeField(null=True)
    accepted_user = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True)


@receiver(user_activated)
def add_user_to_course(sender, **kwargs):
    user = kwargs.get('user')
    try:
        affil = GuestUserAffil.objects.get(guest_email=user.email)
        affil.course.group.user_set.add(user)
    except GuestUserAffil.DoesNotExist:
        pass
