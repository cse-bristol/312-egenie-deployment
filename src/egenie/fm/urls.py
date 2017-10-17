from django.conf.urls import url
from fm import views
from django.views.generic import TemplateView

# from ctech.views import agree_required
from django.contrib.auth.decorators import login_required

app_name = 'fm'
urlpatterns = [
    url(r'^$', views.SendMessageView.as_view(), name='message'),
    url(r'^success$', TemplateView.as_view(
        template_name='fm/success.html'), name='success'),
]
