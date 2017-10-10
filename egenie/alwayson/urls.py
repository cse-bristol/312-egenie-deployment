from django.conf.urls import url
from django.views.decorators.cache import never_cache
from alwayson.views import (AlwaysOnView)

urlpatterns = [
    url(r'^$', never_cache(
        AlwaysOnView.as_view()), name='alwayson'),
]
