
from egenie.settings.base import *
from egenie.settings.secure import *

import os

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ['MYSQL_DATABASE'],
        'USER': os.environ['MYSQL_USER'],
        'PASSWORD': os.environ['MYSQL_PASSWORD'],
        'HOST': 'db',
    }
}

STATIC_ROOT = '/static'
STATIC_URL = '/static/'
MEDIA_ROOT = '/media/'
MEDIA_URL = '/media/'
