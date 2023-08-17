# flake8: noqa
from locustempus.settings_shared import *
import os

# docker-compose db container
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.environ.get('POSTGRES_NAME'),
        'USER': os.environ.get('POSTGRES_USER'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD'),
        'HOST': 'db',
        'PORT': 5432,
    }
}


try:
    from locustempus.local_docker_settings import *  # noqa: F401,F403
except ImportError:
    pass
