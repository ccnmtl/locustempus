from courseaffils.models import Course
from courseaffils.lib import in_course
from django.contrib.auth.mixins import UserPassesTestMixin


class LoggedInCourseMixin(UserPassesTestMixin):
    """Mixin for class-based views that handle courseaffils Course

    Returns True if a user is a member/student of a given course.

    Note that this mixin can not be stacked with other
    mixins that implement test_func
    https://docs.djangoproject.com/en/2.2/topics/auth/default/#django.contrib.auth.mixins.UserPassesTestMixin
    """
    def test_func(self):
        if self.request.user.is_superuser:
            return True

        # Because this is a mixin in a class-based view, its not neccessary to
        # to raise a 404 response here, hence this pattern.
        try:
            course_pk = self.kwargs.get('pk')
            course = Course.objects.get(pk=course_pk)
        except Course.DoesNotExist:
            return False

        return (
            in_course(self.request.user.username, course) or
            course.is_faculty(self.request.user)
        )


class LoggedInFacultyMixin(UserPassesTestMixin):
    """Mixin for class-based views that handle courseaffils Course

    Returns True if a user is an instructor of a given course.

    Note that this mixin can not be stacked with other
    mixins that implement test_func
    https://docs.djangoproject.com/en/2.2/topics/auth/default/#django.contrib.auth.mixins.UserPassesTestMixin
    """
    def test_func(self):
        if self.request.user.is_superuser:
            return True

        try:
            course_pk = self.kwargs.get('pk')
            course = Course.objects.get(pk=course_pk)
        except Course.DoesNotExist:
            return False

        return course.is_faculty(self.request.user)


class LoggedInSuperuserMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_superuser
