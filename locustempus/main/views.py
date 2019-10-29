from courseaffils.models import Course
from django.contrib import messages
from django.contrib.auth.mixins import (
    LoginRequiredMixin, UserPassesTestMixin
)
from django.shortcuts import render
from django.urls.base import reverse
from django.views.generic.base import TemplateView
from django.views.generic.detail import DetailView
from django.views.generic.edit import CreateView, UpdateView
from django.views.generic.list import ListView


class IndexView(LoginRequiredMixin, TemplateView):
    template_name = 'main/index.html'


class CourseCreateView(UserPassesTestMixin, LoginRequiredMixin, CreateView):
    model = Course
    template_name = 'main/course_create.html'
    fields = ['title', 'group', 'faculty_group']

    def get_success_url(self):
        return reverse('course-list-view')

    def form_valid(self, form):
        title = form.cleaned_data['title']

        result = CreateView.form_valid(self, form)
        # error handling here

        messages.add_message(
            self.request, messages.SUCCESS,
            '<strong>{}</strong> cohort created.'.format(title),
            extra_tags='safe'
        )

        return result

    def test_func(self):
        return self.request.user.is_superuser


class CourseListView(UserPassesTestMixin, LoginRequiredMixin, ListView):
    model = Course
    template_name = 'main/course_list.html'

    def test_func(self):
        return self.request.user.is_superuser


class CourseDetailView(UserPassesTestMixin, LoginRequiredMixin, DetailView):
    model = Course
    template_name = 'main/course_detail.html'

    def test_func(self):
        # if user is superuser or in course faculty group
        return self.request.user.is_superuser


class CourseEditView(UserPassesTestMixin, LoginRequiredMixin, UpdateView):
    model = Course
    template_name = 'main/course_edit.html'
    fields = ['title']

    def test_func(self):
        # if user is superuser or in course faculty group
        return self.request.user.is_superuser

    def get_success_url(self):
        return reverse('course-detail-view', kwargs={'pk': self.object.pk})
