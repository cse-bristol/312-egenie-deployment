
from django.conf.urls import url
from django.contrib.auth.decorators import login_required

from egenie.decorators import agree_required
from pinboard import views

app_name = 'pinboard'
urlpatterns = [
    url(r'^$', agree_required(views.PinboardView.as_view(
        category="user-posts")), name='public'),
    url(r'^private/$', login_required(agree_required(
        views.PinboardView.as_view(category="fm-messages"))), name='private'),
    url(r'^digest/$', views.DigestView.as_view(), name='digest'),
    url(r'^photo/delete/(?P<id>\d+)$',
        views.delete_photo, name='delete_photo'),
    url(r'^post$', views.post, name='post'),

    # Spirit overrides
    url(r'^topic/publish/$', views.topic_publish,
        name='topic_publish'),
    url(r'^topic/publish/(?P<category_id>\d+)/$',
        views.topic_publish, name='topic_publish'),
    url(r'^comment/(?P<topic_id>\d+)/publish/$',
        views.comment_publish, name='comment_publish'),
    url(r'^comment/(?P<topic_id>\d+)/publish/(?P<pk>\d+)/quote/$',
        views.comment_publish, name='comment_publish'),
    url(r'^comment/(?P<pk>\d+)/delete/$',
        views.comment_delete, name='comment_delete'),
]
