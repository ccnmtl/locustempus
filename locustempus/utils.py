from django.contrib.auth.models import User


def user_display_name(user: User) -> str:
    return user.get_full_name() or user.username
