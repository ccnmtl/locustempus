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


class Layer(models.Model):
    title = models.CharField(max_length=32)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')


class Project(models.Model):
    title = models.CharField(max_length=256)
    description = models.CharField(max_length=256)
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='projects')
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
    base_map = models.CharField(
        max_length=64,
        choices=BASE_MAPS,
        default='dark-v10'
    )
    layers = GenericRelation(Layer, related_query_name='project')

    def __str__(self):
        return self.title


class Response(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='responses'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='+'
    )
    layers = GenericRelation(Layer, related_query_name='layer')


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
