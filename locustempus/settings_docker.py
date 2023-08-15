# flake8: noqa
from locustempus.settings_shared import *
import os

GDAL_LIBRARY_PATH = '/usr/local/lib'

# docker-compose db container
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_NAME'),
        'USER': os.environ.get('POSTGRES_USER'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD'),
        'HOST': 'db',
        'PORT': 5432,
    }
}


try:
    from locustempus.local_settings import *  # noqa: F401,F403
except ImportError:
    pass
