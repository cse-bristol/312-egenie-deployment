from django.conf.urls import patterns, url
from psychology import views
from egenie.decorators import agree_required
from django.contrib.auth.decorators import login_required

urlpatterns = [url(r'^goal$', views.GoalView.as_view(), name='goal'),
               url(r'^implementation/(?P<step>\d+)$',
                   views.ImplementationView.as_view(), name='implementation'),
               url(r'^wizard$', views.WizardView.as_view(), name='wizard'),
               url(r'^print$', views.PrintView.as_view(),
                   name='print_pledge'),
               url(r'^pledges/(?P<printer>[A-Z]+)$',
                   views.pledges, name='pledges'),
               ]
