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

from django.core.urlresolvers import reverse
from django.views.generic import CreateView, UpdateView

from sensors.forms import (
    SensorDeploymentDetailsCreateForm, SensorDeploymentDetailsDisableForm,
    SensorDeploymentLocationUpdateForm)
from sensors.models import SensorDeploymentDetails


class SensorDeploymentDetailsCreateView(CreateView):
    form_class = SensorDeploymentDetailsCreateForm
    model = SensorDeploymentDetails

    def get_success_url(self):
        return reverse(
            'deployments:update',
            args=(self.object.deployment.id,))


class SensorDeploymentDetailsDisableView(UpdateView):
    form_class = SensorDeploymentDetailsDisableForm
    model = SensorDeploymentDetails

    def get_success_url(self):
        return reverse(
            'deployments:update',
            args=(self.object.deployment.id,))


class SensorDeploymentLocationUpdateView(UpdateView):
    form_class = SensorDeploymentLocationUpdateForm
    model = SensorDeploymentDetails

    def get_success_url(self):
        return reverse(
            'deployments:update',
            args=(self.object.deployment.id,))
