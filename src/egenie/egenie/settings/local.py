
from egenie.settings.base import *
from egenie.settings.secure import *


# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

DEBUG = True

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

FM_EMAIL = "fm@example.com"

SITE_IPS = ['127.0.0.1', '62.255']