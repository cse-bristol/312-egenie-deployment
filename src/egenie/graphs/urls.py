from django.conf.urls import url

from graphs.views import (AnnotationView, get_devices)

urlpatterns = [
    url(r'^$', AnnotationView.as_view(), name='annotation'),
    url(r'^(?P<pk>\d+)/devices$',
        get_devices, name='devices'),
]
