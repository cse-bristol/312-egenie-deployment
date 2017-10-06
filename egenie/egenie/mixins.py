from django.conf import settings

from django.contrib.auth.views import redirect_to_login
from django.core.exceptions import ImproperlyConfigured, PermissionDenied

from egenie.models import Participant, Plinth
from ipware.ip import get_ip


class PlinthMixin(object):
    """ PlinthMixin is responsible for detecting whether the user is present at
    a plinth or not (i.e. looking at an installed on-site tablet). This is based on a plinthid cookie that is set in the on-tablet browser by visiting /setup. 
    This allows also apps to identify which plinth the user is at, for when location is important."""

    def get_context_data(self, **kwargs):
        context = super(PlinthMixin, self).get_context_data(**kwargs)
        plinthid = self.request.COOKIES.get('plinthid', None)
        if plinthid:
            context['at_plinth'] = True
            try:
                context['plinth'] = Plinth.objects.get(pk=plinthid)
            except:
                context['plinth'] = Plinth.objects.all()[0]
        else:
            context['at_plinth'] = False
            context['plinth'] = Plinth.objects.all()[0]
        return context


class RestrictedMixin(object):
    """
    RestrictedMixin adds two context variables that are available to apps: ip contains the IP address of the user, while onsite is a boolean which is True if the
    user is classed as being within the building of the deployment. This is controlled by SITE_IPS in settings.py, with the IP matching if it starts with one of
    the SITE_IPS values (i.e. 152.78. would match any address starting with 152.78.).
    """

    def get_context_data(self, **kwargs):
        context = super(RestrictedMixin, self).get_context_data(**kwargs)
        user_ip = get_ip(self.request)
        context['onsite'] = False
        context['ip'] = user_ip
        if user_ip == None:
            context['onsite'] = False
        else:
            for ip in settings.SITE_IPS:
                if user_ip.startswith(ip):
                    context['onsite'] = True
        return context


class AjaxableResponseMixin(object):
    """
    Mixin to add AJAX support to a form.
    Must be used with an object-based FormView (e.g. CreateView)
    """

    def form_invalid(self, form):
        response = super(AjaxableResponseMixin, self).form_invalid(form)
        if self.request.is_ajax():
            return JsonResponse(form.errors, status=400)
        else:
            return response

    def form_valid(self, form):
        # We make sure to call the parent's form_valid() method because
        # it might do some processing (in the case of CreateView, it will
        # call form.save() for example).
        response = super(AjaxableResponseMixin, self).form_valid(form)
        if self.request.is_ajax():
            data = {
                'pk': self.object.pk,
            }
            return JsonResponse(data)
        else:
            return response
