"""Models for the Locus Tempus application"""
from courseaffils.models import Course
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import (
    GenericForeignKey, GenericRelation
)
from django.contrib.contenttypes.models import ContentType
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


class Project(models.Model):
    title = models.CharField(max_length=256)
    description = models.CharField(max_length=256)
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='projects')
    base_map = models.CharField(
        max_length=64,
        choices=BASE_MAPS,
        default='dark-v10'
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


class Assignment(models.Model):
    project = models.OneToOneField(
        Project, on_delete=models.CASCADE, related_name='assignment')
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
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='responses'
    )
    owners = models.ManyToManyField(
        User,
        through='ResponseOwner'
    )
    layers = GenericRelation(Layer, related_query_name='layer')

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


class ResponseOwner(models.Model):
    """
    Through table for response owners

    We need a custom through model with unique constraints on
    owner, response, and assignment to address two possibilities:
    - Prevent a user from being added as an owner to a response multiple times
    - Prevent a user from being added as an owner to multiple responses
    """
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    response = models.ForeignKey(Response, on_delete=models.CASCADE)
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='+'
    )

    class Meta:
        unique_together = ('owner', 'assignment')


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
