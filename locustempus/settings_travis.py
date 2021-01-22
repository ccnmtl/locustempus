# flake8: noqa
import sys
from locustempus.settings_shared import *


try:
    from locustempus.local_settings import *
except ImportError:
    pass


if ('test' in sys.argv or 'jenkins' in sys.argv or 'validate' in sys.argv
        or 'check' in sys.argv or 'integrationserver' in sys.argv):
    DATABASES = {
        'default': {
            'ENGINE': 'django.contrib.gis.db.backends.postgis',
            'NAME': 'locustempus',
            'HOST': 'localhost',
            'PORT': '5432',
            'USER': 'postgres',
            'PASSWORD': 'postgres',
            'ATOMIC_REQUESTS': True,
        }
    }

