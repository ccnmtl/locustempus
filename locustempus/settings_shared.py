# Django settings for locustempus project.
import distro
import os.path
import sys
from ccnmtlsettings.shared import common
from courseaffils.columbia import CourseStringMapper

project = 'locustempus'
base = os.path.dirname(__file__)

locals().update(common(project=project, base=base))

PROJECT_APPS = [
    'locustempus.main',
]

USE_TZ = True

CAS_SERVER_URL = 'https://cas.columbia.edu/cas/'
CAS_VERSION = '3'
CAS_ADMIN_REDIRECT = False
CAS_MAP_AFFILIATIONS = True

# Translate CUIT's CAS user attributes to the Django user model.
# https://cuit.columbia.edu/content/cas-3-ticket-validation-response
CAS_APPLY_ATTRIBUTES_TO_USER = True
CAS_RENAME_ATTRIBUTES = {
    'givenName': 'first_name',
    'lastName': 'last_name',
    'mail': 'email',
}

# A note on installed apps, Django 3+ has automatic appconfig discovery.
INSTALLED_APPS.remove('djangowind')  # noqa
INSTALLED_APPS.remove('django_markwhat')  # noqa
INSTALLED_APPS += [  # noqa
    'bootstrap4',
    'django_extensions',
    'courseaffils',
    'lti_provider',
    'django_cas_ng',
    'locustempus.main',
    'widget_tweaks',
    'django_registration',
    'rest_framework',
    'generic_relations',
    's3sign',
    'contactus',
    'waffle',
    'markdownify.apps.MarkdownifyConfig',
]

MIDDLEWARE += [ # noqa
    'django.middleware.csrf.CsrfViewMiddleware',
    'django_cas_ng.middleware.CASMiddleware',
    'locustempus.main.middleware.WhoDidItMiddleware',
]

TEMPLATES[0]['OPTIONS']['context_processors'].remove(  # noqa
    'djangowind.context.context_processor')
TEMPLATES[0]['OPTIONS']['context_processors'].extend([  # noqa
    'locustempus.utils.get_sentry_dsn',
])

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    )
}

CONTACT_US_EMAIL = 'ctl-locustempus@columbia.edu'
SERVER_EMAIL = 'locustempus-noreply@mail.ctl.columbia.edu'
EMAIL_SUBJECT_PREFIX = 'Locus Tempus Contact Request'

THUMBNAIL_SUBDIR = "thumbs"
LOGIN_REDIRECT_URL = "/"

ACCOUNT_ACTIVATION_DAYS = 7
DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'lti_provider.auth.LTIBackend',
    'django_cas_ng.backends.CASBackend',
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
    'course_navigation': True,
    'new_tab': True,
    'frame_width': 1024,
    'frame_height': 1024,
    'allow_ta_access': False
}

COURSEAFFILS_COURSESTRING_MAPPER = CourseStringMapper

BLOCKED_EMAIL_DOMAINS = ['columbia.edu']

if 'ubuntu' in distro.id().lower():
    if distro.version() == '16.04':
        # 15.04 and later need this set, but it breaks
        # on trusty.
        SPATIALITE_LIBRARY_PATH = 'mod_spatialite'
    elif distro.version() == '18.04':
        # On Debian testing/buster, I had to do the following:
        # * Install the sqlite3 and libsqlite3-mod-spatialite packages.
        # * Add the following to writlarge/local_settings.py:
        # SPATIALITE_LIBRARY_PATH =
        # '/usr/lib/x86_64-linux-gnu/mod_spatialite.so' I think the
        # django docs might be slightly out of date here, or just not
        # cover all the cases.
        #
        # I've found that Ubuntu 18.04 also works with this full path
        # to the library file, but not 'mod_spatialite'. I'll raise
        # this issue with Django.
        SPATIALITE_LIBRARY_PATH = '/usr/lib/x86_64-linux-gnu/mod_spatialite.so'
elif 'debian' in distro.id().lower():
    SPATIALITE_LIBRARY_PATH = '/usr/lib/x86_64-linux-gnu/mod_spatialite.so'

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'locustempus',
        'HOST': '',
        'PORT': 5432,
        'USER': '',
        'PASSWORD': '',
        'ATOMIC_REQUESTS': True,
    }
}

DEFAULT_BASE_MAP = 'mapbox://styles/mapbox/light-v10'
GEOCODER = True

# Needed to get Cypress to run
if ('test' in sys.argv or 'jenkins' in sys.argv or 'validate' in sys.argv
        or 'check' in sys.argv or 'integrationserver' in sys.argv):
    DATABASES = {
        'default': {
            'ENGINE': 'django.contrib.gis.db.backends.spatialite',
            'NAME': ':memory:',
            'HOST': '',
            'PORT': '',
            'USER': '',
            'PASSWORD': '',
            'ATOMIC_REQUESTS': True,
        }
    }
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    PASSWORD_HASHERS = (
        'django.contrib.auth.hashers.MD5PasswordHasher',
    )
    DEFAULT_BASE_MAP = 'http://localhost:8888/style.json'
    GEOCODER = False

SECURE_REFERRER_POLICY = 'origin'
