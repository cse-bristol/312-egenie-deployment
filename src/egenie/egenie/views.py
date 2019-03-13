from django.shortcuts import render, redirect
from django.views.generic import TemplateView, RedirectView, View
from django.views.generic.edit import CreateView
from django.core.urlresolvers import reverse
from egenie.mixins import RestrictedMixin, PlinthMixin, AjaxableResponseMixin
from django.contrib.auth import logout
from egenie.models import Participant, Plinth
from django.contrib.auth.models import User
from django.core.mail import EmailMultiAlternatives
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse

from django.template.loader import get_template
from django.template import Context
from django.conf import settings
import datetime


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


class RegisterView(AjaxableResponseMixin, CreateView):
    model = User
    # fields = ['email']

    def make_unique_username(self, username):
        if not User.objects.filter(username=username).exists():
            return username

        for x in range(1, 500):
            new_username = username + str(x)
            if not User.objects.filter(username=new_username).exists():
                return new_username

    def form_invalid(self, form):
        status = form.errors.as_data()['email'][0].code
        return JsonResponse({'status': status})

    def form_valid(self, form):
        obj = form.save(commit=False)
        email = form.cleaned_data['email']
        username = email.split("@")[0]
        obj.username = self.make_unique_username(username)
        obj.password = User.objects.make_random_password()
        obj.save()

        textmail = get_template('egenie/register_email.txt')
        htmlmail = get_template('egenie/register_email.html')
        d = {'username': obj.username}
        subject, from_email, to = 'Welcome to GENIE', 'mailer@e-genie.co.uk', email
        text_content = textmail.render(d)
        html_content = htmlmail.render(d)
        msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
        msg.attach_alternative(html_content, 'text/html')
        msg.send()

        return JsonResponse({'status': 'success'})


class SetupView(RestrictedMixin, PlinthMixin, TemplateView):
    template_name = 'egenie/setup.html'

    def post(self, request, *args, **kwargs):
        response = redirect('setup')

        if self.request.POST.get('btn-reset', False):
            response.delete_cookie(key='plinthid')
        elif self.request.POST.get('btn-update', False):
            plinthid = self.request.POST.get('plinthid', 0)
            if plinthid:
                response.set_cookie(key='plinthid', value=plinthid, expires=datetime.datetime.now(
                ) + datetime.timedelta(days=365))

        return response


class ApproveView(RedirectView):

    def get(self, request, *args, **kwargs):
        response = super(ApproveView, self).get(request, *args, **kwargs)

        participant = Participant.objects.get(user=request.user)
        participant.agreed = True
        participant.save()
        return response

    def get_redirect_url(self, *args, **kwargs):
        return self.request.GET.get('next')


class RotatingView(RestrictedMixin, PlinthMixin, TemplateView):
    """ Rotating View """

    def get(self, request, *args, **kwargs):

        # All rotating views use a logged out state
        logout(request)
        context = self.get_context_data(**kwargs)
        response = self.render_to_response(context)
        return response

    def get_context_data(self, **kwargs):
        context = super(RotatingView, self).get_context_data(**kwargs)

        if context['onsite']:
            SCREEN_ORDER = settings.ONSITE_SCREEN_ORDER
        else:
            SCREEN_ORDER = settings.OFFSITE_SCREEN_ORDER

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
