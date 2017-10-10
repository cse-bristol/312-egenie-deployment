
from django.contrib.auth.models import User

class CTechMiddleware(object):
	def process_request(self, request):
		if (request.path.startswith('/sdstore/') and request.method == 'GET') or (request.path.startswith('/annotation/') and request.method == 'POST'):
			request.user = User.objects.get(username='anonymous')