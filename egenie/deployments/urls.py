# This file is part of e-genie
#
# e-genie is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# e-genie is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with e-genie.  If not, see <http://www.gnu.org/licenses/>.

from django.conf.urls import url

from deployments.views import (
    DeploymentAddHubView, DeploymentCreateView, DeploymentEndView,
    DeploymentRemoveHubView, DeploymentStartView, DeploymentUpdateView,
    DeploymentUpdatePhotoView, DeploymentDetailView, )


urlpatterns = [
    url(r'^create/$', DeploymentCreateView.as_view(),
        name='create'),
    url(r'^(?P<pk>\d+)/end/$',
        DeploymentEndView.as_view(), name='end'),
    url(r'^(?P<pk>\d+)/start/$',
        DeploymentStartView.as_view(), name='start'),
    url(r'^(?P<pk>\d+)/update/$',
        DeploymentUpdateView.as_view(), name='update'),
    url(r'^(?P<pk>\d+)/update-photo/$',
        DeploymentUpdatePhotoView.as_view(), name='update-photo'),
    url(r'^(?P<pk>\d+)/update/add-hub/$',
        DeploymentAddHubView.as_view(), name='add_hub'),
    url(r'^(?P<pk>\d+)/update/remove-hub/$',
        DeploymentRemoveHubView.as_view(), name='remove_hub'),
    url(r'^(?P<pk>\d+)/fragment$',
        DeploymentDetailView.as_view(), name='fragment'),
]
