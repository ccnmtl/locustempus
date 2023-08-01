"""Integrationserver: brings up a test server populated with fake data

This is meant to be used for two cases:
- Front-end integration testing: just point the testing framework at the
running test server.
- Local dev: It can be tedious to recreate models for local dev after
deleting a database.

This is largely copied from django.core.management.commands.testserver
It reimplements the testserver functionality except that it generates
test data dynamically using factories
"""
from courseaffils.models import Course
from django.contrib.auth.models import User
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import connection
from locustempus.main.tests.factories import (
    UserFactory, SandboxCourseFactory, RegistrarCourseFactory,
    ProjectFactory, ActivityFactory, ResponseFactory
)
from waffle.models import Flag


def reset_test_models():
    call_command('flush', verbosity=0, interactive=False)
    # Enable some flags
    Flag.objects.create(
        name='share_response_layers',
        everyone=True
    )

    # Create some models
    UserFactory.create(
        username='superuser',
        first_name='Super',
        last_name='User',
        email='superuser@example.com',
        is_superuser=True,
        is_staff=True
    )
    # Sandbox Course
    c1: Course = SandboxCourseFactory.create(title='Sandbox Workspace')
    s1: User = UserFactory.create(
        username='student-one',
        first_name='Student',
        last_name='One',
        email='studentone@example.com'
    )
    c1.group.user_set.add(s1)
    s1: User = UserFactory.create(
        username='student-three',
        first_name='Student',
        last_name='Three',
        email='studentthree@example.com'
    )
    c1.group.user_set.add(s1)

    f1: User = UserFactory.create(
        username='faculty-one',
        first_name='Faculty',
        last_name='One',
        email='facultyone@example.com'
    )
    c1.group.user_set.add(f1)
    c1.faculty_group.user_set.add(f1)

    a1: User = UserFactory.create(
        username='author-one',
        first_name='Author',
        last_name='One',
        email='authorone@example.com'
    )
    c1.group.user_set.add(a1)
    c1.faculty_group.user_set.add(a1)

    project = ProjectFactory.create(course=c1, title='Activity One')
    activity = ActivityFactory.create(project=project)
    ResponseFactory.create(
        activity=activity,
        owners=[s1]
    )

    # Registrar Course - generates a project too
    c2: Course = RegistrarCourseFactory.create()
    s2: User = UserFactory.create(
        username='student-two',
        first_name='Student',
        last_name='Two',
        email='studenttwo@example.com'
    )
    c2.group.user_set.add(s2)
    f2: User = UserFactory.create(
        username='faculty-two',
        first_name='Faculty',
        last_name='Two',
        email='facultytwo@example.com'
    )
    c2.group.user_set.add(f2)
    c2.faculty_group.user_set.add(f2)

    # No affiliations
    UserFactory.create(
        username='faculty-three',
        first_name='Faculty',
        last_name='Three',
        email='facultythree@example.com'
    )


class Command(BaseCommand):
    help = 'Runs a development server with data created by factories.'

    requires_system_checks = []

    def add_arguments(self, parser):
        parser.add_argument(
            '--noinput', '--no-input', action='store_false',
            dest='interactive',
            help='Tells Django to NOT prompt the user for input of any kind.',
        )
        parser.add_argument(
            '--addrport', default='',
            help='Port number or ipaddr:port to run the server on.',
        )
        parser.add_argument(
            '--ipv6', '-6', action='store_true', dest='use_ipv6',
            help='Tells Django to use an IPv6 address.',
        )

    def handle(self, *fixture_labels, **options):
        verbosity = options['verbosity']
        interactive = options['interactive']

        # Create a test database.
        db_name = connection.creation.create_test_db(
            verbosity=verbosity, autoclobber=not interactive, serialize=False)

        reset_test_models()

        shutdown_message = (
            '\nServer stopped.\nNote that the test database, %r, has not been '
            'deleted. You can explore it on your own.' % db_name
        )

        # - Because we defer to 'runserver' there's no easy way to clean up the
        # test database. Therefore, we always autoclobber it
        # - Turn off auto-reloading because it causes this handle() method
        # to be called multiple times.
        # - Always use_threading, requests from the integration server need
        # to be handled concurrently
        call_command(
            'runserver',
            addrport=options['addrport'],
            shutdown_message=shutdown_message,
            use_reloader=False,
            use_ipv6=options['use_ipv6'],
            use_threading=True
        )
