
from django.views.generic import TemplateView, RedirectView, View
from django.core.urlresolvers import reverse
from egenie.mixins import RestrictedMixin, PlinthMixin
from django.contrib.auth import logout
from egenie.models import Participant, Plinth


class RootView(RedirectView):

    def get_redirect_url(self, *args, **kwargs):
        return reverse('temperature')


class InfoView(TemplateView):
    template_name = 'egenie/info.html'

    def get_context_data(self, **kwargs):
        context = super(InfoView, self).get_context_data(**kwargs)
        context['next'] = self.request.GET.get('next')
        return context


class ChoiceView(TemplateView):
    template_name = 'egenie/choice.html'

    def get_context_data(self, **kwargs):
        context = super(ChoiceView, self).get_context_data(**kwargs)
        context['mode'] = self.request.GET.get('mode', 'heating')
        return context


class RotatingView(RestrictedMixin, PlinthMixin, TemplateView):
    """ Rotating View """

    def get(self, request, *args, **kwargs):

        # All rotating views use a logged out state
        logout(request)
        context = self.get_context_data(**kwargs)
        response = self.render_to_response(context)
        return response

    def get_context_data(self, **kwargs):
        context = super(RotatingView, self).get_context_data(**kwargs)

        if context['onsite']:
            # If we're onsite, show all 4 options.
            # EC: trying to get rid of the annotation page
            #SCREEN_ORDER = ['alwayson', 'temperature', 'annotation', 'pinboard:public']
            SCREEN_ORDER = ['pinboard:public']
            # SCREEN_ORDER = ['alwayson', 'temperature',
            # 'pinboard:public', 'annotation']
        else:
            # Otherwise skip the pinboard screen
            # EC: trying to get rid of the annotation page
            # SCREEN_ORDER = ['alwayson', 'temperature', 'annotation']
            # SCREEN_ORDER = ['pinboard:public']

            SCREEN_ORDER = ['pinboard:public']
            # SCREEN_ORDER = ['alwayson', 'temperature', 'annotation']

        if context['screen'] in SCREEN_ORDER:
            i = SCREEN_ORDER.index(context['screen'])
            prev_pos = i - 1
            next_pos = i + 1
            if prev_pos < 0:
                prev_pos = len(SCREEN_ORDER) - 1
            if next_pos > len(SCREEN_ORDER) - 1:
                next_pos = 0
        else:
            next_pos = 0
            prev_pos = 0
        context['next_screen'] = SCREEN_ORDER[next_pos]
        context['prev_screen'] = SCREEN_ORDER[prev_pos]
        return context
