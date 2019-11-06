from courseaffils.models import Course
from django.contrib.auth.models import User, Group
import factory


class UserFactory(factory.DjangoModelFactory):
    class Meta:
        model = User
    username = factory.Sequence(lambda n: 'user{}'.format(n))
    password = factory.PostGenerationMethodCall('set_password', 'test')
    email = 'foo@bar.com'


class GroupFactory(factory.DjangoModelFactory):
    class Meta:
        model = Group
    name = factory.Sequence(lambda n: 'group {}'.format(n))


class CourseFactory(factory.DjangoModelFactory):
    class Meta:
        model = Course
    title = factory.Sequence(lambda n: 'course {}'.format(n))
    group = factory.SubFactory(GroupFactory)
    faculty_group = factory.SubFactory(GroupFactory)


class CourseTestMixin(object):
    def setup_course(self):
        self.superuser = UserFactory(
            first_name='Super',
            last_name='User',
            email='superuser@example.com',
            is_superuser=True
        )
        self.course = CourseFactory()
        self.student = UserFactory(
            first_name='Student',
            last_name='One',
            email='studentone@example.com'
        )
        self.course.group.user_set.add(self.student)
        self.faculty = UserFactory(
            first_name='Faculty',
            last_name='One',
            email='facultyone@example.com'
        )
        self.course.faculty_group.user_set.add(self.faculty)
