from django.contrib import admin
from lti_tool.models import Key


@admin.register(Key)
class KeyAdmin(admin.ModelAdmin):
    list_display = ("uuid", "is_active", "datetime_created")
