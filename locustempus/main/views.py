from courseaffils.models import Course
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls.base import reverse
from django.views.generic.base import TemplateView
from django.views.generic.edit import CreateView


class IndexView(LoginRequiredMixin, TemplateView):
    template_name = 'main/index.html'


class CourseCreateView(LoginRequiredMixin, CreateView):
    model = Course
    template_name = 'main/course_form.html'
    fields = ['title']

    def get_success_url(self):
        return reverse('course-list-view')

    def form_valid(self, form):
        title = form.cleaned_data['title']

        result = CreateView.form_valid(self, form)

        messages.add_message(
            self.request, messages.SUCCESS,
            '<strong>{}</strong> cohort created.'.format(title),
            extra_tags='safe'
        )

        return result
