from django import forms
from django.core.mail import send_mail
from django.conf import settings


class MessageForm(forms.Form):
    subject = forms.CharField()
    message = forms.CharField()
    author = forms.CharField()

    def send_email(self):
        """ Creates and sends an email to the FM. """
        send_mail("E-Genie Message: " + self.cleaned_data['subject'] + ' from ' + self.cleaned_data[
                  'author'], self.cleaned_data['message'], 'genie@e-genie.co.uk', [settings.FM_EMAIL], fail_silently=False)
