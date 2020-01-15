from courseaffils.models import Course
from django.contrib.auth.models import User, Group
import factory


class UserFactory(factory.DjangoModelFactory):
    class Meta:
        model = User
    username = factory.Sequence('user{}'.format)
    password = factory.PostGenerationMethodCall('set_password', 'test')
    email = 'foo@bar.com'


class GroupFactory(factory.DjangoModelFactory):
    class Meta:
        model = Group
    name = factory.Sequence('group {}'.format)


class CourseFactory(factory.DjangoModelFactory):
    class Meta:
        model = Course
    title = factory.Sequence('course {}'.format)
    group = factory.SubFactory(GroupFactory)
    faculty_group = factory.SubFactory(GroupFactory)


class CourseTestMixin(object):
    def setup_course(self) -> None:
        self.superuser: User = UserFactory(
            first_name='Super',
            last_name='User',
            email='superuser@example.com',
            is_superuser=True
        )
        self.course: Course = CourseFactory.create()
        self.student: User = UserFactory(
            first_name='Student',
            last_name='One',
            email='studentone@example.com'
        )
        self.course.group.user_set.add(self.student)
        self.faculty: User = UserFactory(
            first_name='Faculty',
            last_name='One',
            email='facultyone@example.com'
        )
        self.course.faculty_group.user_set.add(self.faculty)
