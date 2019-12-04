from courseaffils.models import Course
from django.contrib import messages
from django.contrib.auth.mixins import (
    LoginRequiredMixin
)
from django.http import HttpResponse
from django.urls.base import reverse
from django.views.generic.base import TemplateView
from django.views.generic.detail import DetailView
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.views.generic.list import ListView

from locustempus.mixins import (
    LoggedInCourseMixin, LoggedInFacultyMixin, LoggedInSuperuserMixin
)


class IndexView(LoginRequiredMixin, TemplateView):
    template_name = 'main/index.html'


class CourseCreateView(LoggedInSuperuserMixin, CreateView):
    model = Course
    template_name = 'main/course_create.html'
    fields = ['title', 'group', 'faculty_group']

    def get_success_url(self) -> str:
        return reverse('course-list-view')

    def form_valid(self, form) -> HttpResponse:
        title = form.cleaned_data['title']

        result = CreateView.form_valid(self, form)

        messages.add_message(
            self.request, messages.SUCCESS,
            '<strong>{}</strong> cohort created.'.format(title),
            extra_tags='safe'
        )

        return result


class CourseListView(LoginRequiredMixin, ListView):
    model = Course
    template_name = 'main/course_list.html'


class CourseDetailView(LoggedInCourseMixin, DetailView):
    model = Course
    template_name = 'main/course_detail.html'


class CourseEditView(LoggedInFacultyMixin, UpdateView):
    model = Course
    template_name = 'main/course_edit.html'
    fields = ['title']

    def get_success_url(self):
        return reverse('course-detail-view', kwargs={'pk': self.object.pk})


class CourseDeleteView(LoggedInFacultyMixin, DeleteView):
    model = Course
    template_name = 'main/course_delete.html'

    def get_success_url(self) -> str:
        return reverse('course-list-view')
