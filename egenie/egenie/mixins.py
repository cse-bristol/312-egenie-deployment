from django.conf import settings

from django.contrib.auth.views import redirect_to_login
from django.core.exceptions import ImproperlyConfigured, PermissionDenied
from django.contrib.auth import REDIRECT_FIELD_NAME
from egenie.models import Participant, Plinth
from ipware.ip import get_ip

from django.http import HttpResponseRedirect, HttpResponse, JsonResponse


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


class AjaxableListMixin(object):
    """ Provides a list response in JSON form, as opposed to the AjaxableResponseMixin
        which returns a dictionary."""

    def render_to_json_response(self, context, **response_kwargs):
        data = json.dumps(context)
        response_kwargs['content_type'] = 'application/json'
        return HttpResponse(data, **response_kwargs)

    def dispatch(self, request, *args, **kwargs):
        return super(AjaxableListMixin, self).dispatch(request, *args, **kwargs)

    def get_queryset(self):
        return super(AjaxableListMixin, self).get_queryset()

    def get(self, request, *args, **kwargs):
        out = []
        for x in self.get_queryset():
            out.append(to_dict(x))
        return self.render_to_json_response(out)


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


class BackButtonMixin(object):
    """
    BackButtonMixin specifies a link (back_url in the context variables) to return to when the back button is pressed. Override the get_back_url function to provide this.
    """

    def get_back_url(self):
        raise ImproperlyConfigured(
            'You need to overwrite get_back_address to return a URL')

    def get_context_data(self, **kwargs):
        context = super(BackButtonMixin, self).get_context_data(**kwargs)

        context['back_url'] = self.get_back_url

        return context


class AccessMixin(object):
    """
    'Abstract' mixin that gives access mixins the same customizable
    functionality. This is copied from django-braces to get around 
    us not having a later 1.4.x version installed.
    """
    login_url = None
    raise_exception = False  # Default whether to raise an exception to none
    redirect_field_name = REDIRECT_FIELD_NAME  # Set by django.contrib.auth

    def get_login_url(self):
        """
        Override this method to customize the login_url.
        """
        return settings.LOGIN_URL

    def get_redirect_field_name(self):
        """
        Override this method to customize the redirect_field_name.
        """
        if self.redirect_field_name is None:
            raise ImproperlyConfigured(
                '{0} is missing the '
                'redirect_field_name. Define {0}.redirect_field_name or '
                'override {0}.get_redirect_field_name().'.format(
                    self.__class__.__name__))
        return self.redirect_field_name


class LoginRequiredMixin(AccessMixin):
    """
    View mixin which verifies that the user is authenticated and redirects appropriately (to a Forbidden response if an issue occurs during authentication, otherwise to the login screen)
    NOTE: This should be the left-most mixin of a view, except when combined with CsrfExemptMixin - which in that case should be the left-most mixin.
    """

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated():
            if self.raise_exception:
                raise PermissionDenied  # return a forbidden response
            else:
                return redirect_to_login(request.get_full_path(),
                                         self.get_login_url(),
                                         self.get_redirect_field_name())

        return super(LoginRequiredMixin, self).dispatch(
            request, *args, **kwargs)
