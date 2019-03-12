"""
WSGI config for egenie project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/howto/deployment/wsgi/
"""

import os

try:
    import pkg_resources
except:
    print('something wrong with pkg_resources!!')
    import sys
    print("prefix:", sys.prefix)
    print("exec prefix:", sys.exec_prefix)
    print("path", sys.path)


from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "egenie.settings")

application = get_wsgi_application()
