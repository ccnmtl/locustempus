from django.contrib import admin
from django.contrib.contenttypes.admin import GenericTabularInline
from locustempus.main.models import RasterLayer, Project, Response


class RasterLayerInline(GenericTabularInline):
    model = RasterLayer


class ProjectAdmin(admin.ModelAdmin):
    inlines = [
        RasterLayerInline,
    ]


class ResponseAdmin(admin.ModelAdmin):
    inlines = [
        RasterLayerInline,
    ]


admin.site.register(Project, ProjectAdmin)
admin.site.register(Response, ResponseAdmin)
admin.site.register(RasterLayer)
