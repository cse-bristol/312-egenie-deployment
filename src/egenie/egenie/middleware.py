
from django.contrib.auth.models import User

class CTechMiddleware(object):
    """ Some URLs require an anonymous user, especially sdstore and annotation creation. This middleware replaces the logged in user in these instances."""
    def process_request(self, request):
        if (request.path.startswith('/sd_store/') and request.method == 'GET') or (request.path.startswith('/annotation/') and request.method == 'POST'):
            request.user = User.objects.get(username='anonymous')
