from django.conf import settings
from django.contrib.auth.models import User


def user_display_name(user: User) -> str:
    return user.get_full_name() or user.username


def get_sentry_dsn(request):
    return {
        'SENTRY_DSN': getattr(settings, 'SENTRY_DSN', None)
    }
