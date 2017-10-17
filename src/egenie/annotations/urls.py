from django.conf.urls import url
from annotations.views import AnnotationCreate, AnnotationUpdate, AnnotationDelete, AnnotationList

urlpatterns = [
    url(r'^$', AnnotationList.as_view(), name='list'),
    url(r'^create/$', AnnotationCreate.as_view(), name='add'),
    url(r'^(?P<pk>[0-9]+)/update/$', AnnotationUpdate.as_view(), name='update'),
    url(r'^(?P<pk>[0-9]+)/delete/$', AnnotationDelete.as_view(), name='delete'),
]