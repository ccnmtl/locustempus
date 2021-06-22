import datetime
from random import randrange

from courseaffils.models import Course
from django.contrib.auth.models import User, Group
import factory

from locustempus.main.models import (
    Project, Activity, Response, Feedback, Layer)


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
    username = factory.Sequence('user{}'.format)
    password = factory.PostGenerationMethodCall('set_password', 'test')
    email = 'foo@bar.com'


class GroupFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Group
    name = factory.Sequence('group {}'.format)


class SandboxCourseFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Course
    title = factory.Sequence('course {}'.format)
    group = factory.SubFactory(GroupFactory)
    faculty_group = factory.SubFactory(GroupFactory)

    @factory.post_generation
    def generate_project(obj, create, extracted, **kwargs):
        ProjectFactory(course=obj)


class RegistrarCourseFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Course
    title = factory.Sequence('course {}'.format)
    group = factory.SubFactory(GroupFactory)
    faculty_group = factory.SubFactory(GroupFactory)

    @factory.post_generation
    def course_info(obj, create, extracted, **kwargs):
        obj.info.term = randrange(1, 3)
        current_year = datetime.datetime.now().year
        obj.info.year = randrange(current_year, current_year + 5)
        obj.info.save()

    @factory.post_generation
    def generate_project(obj, create, extracted, **kwargs):
        ProjectFactory(course=obj)


class LayerFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Layer


class ProjectFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Project
    title = factory.Sequence('Project {}'.format)
    description = factory.Sequence('A test description {}'.format)
    course = factory.SubFactory(SandboxCourseFactory)
    base_map = 'http://localhost:8888/style.json'

    @factory.post_generation
    def generate_layer(obj, create, extracted, **kwargs):
        LayerFactory(title='Untitled Layer', content_object=obj)


class ActivityFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Activity
    project = factory.SubFactory(ProjectFactory)
    instructions = factory.Faker('paragraph')


class FeedbackFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Feedback
    body = factory.Faker('paragraph')


class ResponseFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Response
    activity = factory.SubFactory(ActivityFactory)

    @factory.post_generation
    def generate_layer(obj, create, extracted, **kwargs):
        LayerFactory(title='Untitled Layer', content_object=obj)

    @factory.post_generation
    def owners(self, create, extracted, **kwargs):
        if not create:
            return
        if extracted:
            for user in extracted:
                self.owners.add(
                    user, through_defaults={'activity': self.activity})


class CourseTestMixin(object):
    def setup_course(self) -> None:
        # Users
        self.superuser: User = UserFactory.create(
            first_name='Super',
            last_name='User',
            email='superuser@example.com',
            is_superuser=True
        )
        self.student: User = UserFactory.create(
            first_name='Student',
            last_name='One',
            email='studentone@example.com'
        )
        self.faculty: User = UserFactory.create(
            first_name='Faculty',
            last_name='One',
            email='facultyone@example.com'
        )

        # Registrar Course
        self.registrar_course = RegistrarCourseFactory.create()
        self.registrar_course.group.user_set.add(self.student)
        self.registrar_course.group.user_set.add(self.faculty)
        self.registrar_course.faculty_group.user_set.add(self.faculty)
        self.registrar_course_project = ProjectFactory.create(
            course=self.registrar_course)
        self.registrar_course_activity = ActivityFactory.create(
            project=self.registrar_course_project)
        ResponseFactory.create(
            activity=self.registrar_course_activity, owners=[self.student])
        ProjectFactory.create(course=self.registrar_course)

        # Sandbox Course
        self.sandbox_course: Course = SandboxCourseFactory.create()
        self.sandbox_course.group.user_set.add(self.student)
        self.sandbox_course.group.user_set.add(self.faculty)
        self.sandbox_course.faculty_group.user_set.add(self.faculty)
        p2 = ProjectFactory.create(course=self.sandbox_course)
        self.sandbox_course_project = p2
        a2 = ActivityFactory.create(project=p2)
        self.sandbox_course_activity = a2
        self.sandbox_course_response = ResponseFactory.create(
            activity=a2, owners=[self.student])

        # Alt Course: A course with unrelated faculty and students. Used
        # to test that the faculty and student users above don't have
        # access to this courses resources
        self.alt_student: User = UserFactory.create(
            first_name='Student',
            last_name='Fake',
            email='fakestudent@example.com'
        )
        self.alt_faculty: User = UserFactory.create(
            first_name='Faculty',
            last_name='Fake',
            email='fakefaculty@example.com'
        )
        self.alt_course: Course = SandboxCourseFactory.create()
        self.alt_course.group.user_set.add(self.alt_student)
        self.alt_course.group.user_set.add(self.alt_faculty)
        self.alt_course.faculty_group.user_set.add(self.alt_faculty)
        p3 = ProjectFactory.create(course=self.alt_course)
        self.alt_course_project = p3
        a3 = ActivityFactory.create(project=p3)
        self.alt_course_activity = a3
        self.alt_course_response = ResponseFactory.create(
            activity=a3, owners=[self.alt_student])
