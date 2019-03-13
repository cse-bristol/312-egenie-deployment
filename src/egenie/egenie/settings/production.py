
from egenie.settings.base import *

import os

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ['MYSQL_DATABASE'],
        'USER': 'egenie',
        'PASSWORD': 'egenie',
        'OPTIONS': {
            'unix_socket': '/run/mysqld/mysqld.sock'
        }
    }
}

STATIC_ROOT = '/static'
STATIC_URL = '/static/'
MEDIA_ROOT = '/media/'
MEDIA_URL = '/media/'
SECRET_KEY = 'spinge'

ALLOWED_HOSTS = ['*']

ONSITE_SCREEN_ORDER = ['alwayson', 'temperature', 'annotation', 'pinboard:public']
OFFSITE_SCREEN_ORDER = ['alwayson', 'temperature', 'annotation']
