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

from sensors.views import (
    SensorDeploymentDetailsCreateView, SensorDeploymentDetailsDisableView,
    SensorDeploymentLocationUpdateView)


urlpatterns = [
    url(r'^sensor-deployment-details/create/$',
        SensorDeploymentDetailsCreateView.as_view(), name='sensor_deployment_details_create'),
    url(r'^sensor-deployment-details/(?P<pk>\d+)/update/disable/$',
        SensorDeploymentDetailsDisableView.as_view(), name='sensor_deployment_disable'),
    url(r'^sensor-deployment-details/(?P<pk>\d+)/update/location/$',
        SensorDeploymentLocationUpdateView.as_view(), name='sensor_deployment_update_location'),
]
