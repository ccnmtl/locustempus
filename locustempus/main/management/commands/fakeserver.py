"""Fakeserver: site populated with fake data

This is largely copied from django.core.management.commands.testserver
It reimplements the testserver functionality except that it generates
test data dynamically using factories
"""
from courseaffils.models import Course
from django.contrib.auth.models import User, Group
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django.db import connection
from locustempus.main.tests.factories import (
    UserFactory, GroupFactory, CourseFactory
)


class Command(BaseCommand):
    help = 'Runs a development server with data created by factories.'

    requires_system_checks = False

    def add_arguments(self, parser):
        parser.add_argument(
            'args', metavar='fixture', nargs='*',
            help='Path(s) to fixtures to load before running the server.',
        )
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

        # Create some models
        UserFactory.create(
            username='superuser',
            first_name='Super',
            last_name='User',
            email='superuser@example.com',
            is_superuser=True
        )
        course: Course = CourseFactory.create()
        student: User = UserFactory.create(
            first_name='Student',
            last_name='One',
            email='studentone@example.com'
        )
        course.group.user_set.add(student)
        faculty: User = UserFactory.create(
            first_name='Faculty',
            last_name='One',
            email='facultyone@example.com'
        )
        course.group.user_set.add(faculty)
        course.faculty_group.user_set.add(faculty)

        # Run the development server. Turn off auto-reloading because it causes
        # a strange error -- it causes this handle() method to be called
        # multiple times.
        shutdown_message = (
            '\nServer stopped.\nNote that the test database, %r, has not been '
            'deleted. You can explore it on your own.' % db_name
        )
        use_threading = connection.features.test_db_allows_multiple_connections

        # Because we defer to 'runserver' there's no easy way to clean up the
        # test database. Therefore, we always autoclobber it
        call_command(
            'runserver',
            addrport=options['addrport'],
            shutdown_message=shutdown_message,
            use_reloader=False,
            use_ipv6=options['use_ipv6'],
            use_threading=use_threading
        )
