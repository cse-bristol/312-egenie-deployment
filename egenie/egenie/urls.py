"""egenie URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import include, url
from django.contrib import admin
from egenie.views import RootView, InfoView, ChoiceView
from egenie.decorators import agree_required
import spirit.urls

urlpatterns = [
    url(r'^$', RootView.as_view(), name='root'),
    url(r'^info$', InfoView.as_view(), name='info'),
    url(r'^choice$', agree_required(ChoiceView.as_view()), name='choice'),
    url(r'^admin/', admin.site.urls),
]


urlpatterns.extend([
    # Inner Views
    url(r'^study/', include('psychology.urls',
                            namespace='psychology'), name='psychology'),
    url(r'^fm/', include('fm.urls')),
    url(r'^pinboard/', include('pinboard.urls', namespace='pinboard')),
    url(r'^spirit/', include(spirit.urls), name='spirit'),
])
