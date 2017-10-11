
from django.conf.urls import include, url
from django.contrib import admin
from egenie.views import RootView, InfoView, ChoiceView, ApproveView, SetupView, RegisterView
from egenie.forms import SimpleLoginForm, UserCreateForm
from egenie.decorators import agree_required
from django.contrib.admin.views.decorators import staff_member_required
import spirit.urls
from django.contrib.auth.views import login, logout

urlpatterns = [
    url(r'^$', RootView.as_view(), name='root'),
    url(r'^info$', InfoView.as_view(), name='info'),
    url(r'^approve$', ApproveView.as_view(), name='approve'),
    url(r'^choice$', agree_required(ChoiceView.as_view()), name='choice'),
    url(r'^setup$', staff_member_required(SetupView.as_view()), name='setup'),

]


urlpatterns.extend([
    # Carousel Views
    url(r'^temperature/', include('temperature.urls'), name='temperature'),
    url(r'^alwayson/', include('alwayson.urls'), name='alwayson'),
    url(r'^graphs/', include('graphs.urls'), name='graphs'),

    # Inner Views
    url(r'^study/', include('psychology.urls',
                            namespace='psychology'), name='psychology'),
    url(r'^fm/', include('fm.urls')),
    url(r'^pinboard/', include('pinboard.urls', namespace='pinboard')),

    # Support Applications
    url(r'^sdstore/', include('sd_store.urls')),
    url(r'^annotation/', include('annotations.urls', namespace='annotations')),
    url(r'^spirit/', include(spirit.urls), name='spirit'),
    url(r'^sensors/', include('sensors.urls', namespace='sensors')),
    url(r'^deployments/', include('deployments.urls', namespace='deployments')),
])

urlpatterns.extend([
    # Login and Admin
    url(r'^accounts/login/$', login,
        {'authentication_form': SimpleLoginForm}, name='login'),
    url(r'^accounts/logout/$', logout, {'next_page': '/'}, name='logout'),
    url(r'^accounts/register/$',
        RegisterView.as_view(form_class=UserCreateForm), name='register'),
    url(r'^admin/', include(admin.site.urls)),
])