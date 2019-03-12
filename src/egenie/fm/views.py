
from django.shortcuts import render
from fm.forms import MessageForm
from fm.models import FMMessage
from django.views.generic.edit import FormView
from django.core.urlresolvers import reverse
# Create your views here.


class SendMessageView(FormView):
    """ Screen to let users send email to a facilities manager, 
        with the email address coming from FM_EMAIL in settings. 
        Messages are stored in the database before sending."""

    template_name = 'fm/index.html'
    form_class = MessageForm

    def get_success_url(self):
        return reverse('fm:success')

    def form_valid(self, form):
        # Save message
        message = FMMessage(subject=form.cleaned_data['subject'],
                            message=form.cleaned_data['message'],
                            author=form.cleaned_data['author'])

        message.save()
        form.send_email()
        return super(SendMessageView, self).form_valid(form)
