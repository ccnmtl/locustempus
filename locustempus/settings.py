# flake8: noqa
from locustempus.settings_shared import *

try:
    from locustempus.local_settings import *
except ImportError:
    pass
