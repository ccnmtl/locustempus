# Django settings for locustempus project.
import os.path
import sys
from ccnmtlsettings.shared import common

project = 'locustempus'
base = os.path.dirname(__file__)

locals().update(common(project=project, base=base))

PROJECT_APPS = [
    'locustempus.main',
]

USE_TZ = True

INSTALLED_APPS += [  # noqa
    'bootstrap4',
    'infranil',
    'django_extensions',
    'courseaffils',
    'lti_provider',
    'locustempus.main',
]


THUMBNAIL_SUBDIR = "thumbs"
LOGIN_REDIRECT_URL = "/"

ACCOUNT_ACTIVATION_DAYS = 7

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'lti_provider.auth.LTIBackend',
    'djangowind.auth.SAMLAuthBackend'
]

LTI_TOOL_CONFIGURATION = {
    'title': 'Locus Tempus',
    'description': 'Mapping events in time and space',
    'launch_url': 'lti/',
    'embed_url': '',
    'embed_icon_url': '',
    'embed_tool_id': '',
    'landing_url': '{}://{}/course/lti/{}/',
    'course_aware': True,
    'navigation': True,
    'new_tab': True,
    'frame_width': 1024,
    'frame_height': 1024
}

# Needed to get Cypress to run
if 'integrationserver' in sys.argv:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
            'HOST': '',
            'PORT': '',
            'USER': '',
            'PASSWORD': '',
            'ATOMIC_REQUESTS': True,
        }
    }

    PASSWORD_HASHERS = (
        'django.contrib.auth.hashers.MD5PasswordHasher',
    )
