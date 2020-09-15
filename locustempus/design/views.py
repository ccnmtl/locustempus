from django.shortcuts import render
from django.views.generic.base import View


class Index(View):
    template_name = 'design/index.html'

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)


class Identity(View):
    template_name = 'design/identity.html'

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)


class Colors(View):
    template_name = 'design/colors.html'

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)


class Typography(View):
    template_name = 'design/typography.html'

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)


class Components(View):
    template_name = 'design/components.html'

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)
