
from egenie.settings.base import *

import os

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ['MYSQL_DATABASE'],
        
        'OPTIONS': {
            'unix_socket': '/run/mysql/mysqld.sock'
        }
    }
}

STATIC_ROOT = '/static'
STATIC_URL = '/static/'
MEDIA_ROOT = '/media/'
MEDIA_URL = '/media/'
SECRET_KEY = 'spinge'

ALLOWED_HOSTS = ['*']
