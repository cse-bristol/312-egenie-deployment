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

from django.core import serializers
from django.core.urlresolvers import reverse
from django.views.generic import CreateView, ListView, UpdateView, DetailView

from egenie.mixins import BackButtonMixin, LoginRequiredMixin
from hubs.models import Hub
from sd_store.models import Sensor
from sensors.forms import (
    SensorDeploymentDetailsCreateForm, SensorDeploymentDetailsDisableForm,
    SensorDeploymentLocationUpdateForm)
from deployments.forms import (
    DeploymentAddHubForm, DeploymentCreateForm, DeploymentEndForm,
    DeploymentRemoveHubForm, DeploymentStartForm, DeploymentUpdateForm,
    DeploymentUpdatePhotoForm)
from deployments.models import Deployment


class DeploymentAddHubView(LoginRequiredMixin, UpdateView):
    form_class = DeploymentAddHubForm
    model = Deployment

    def get_success_url(self):
        return reverse('deployments:update', args=(self.kwargs['pk'],))


class DeploymentCreateView(LoginRequiredMixin, BackButtonMixin, CreateView):
    form_class = DeploymentCreateForm
    model = Deployment
    template_name = 'deployments/deployment_create.html'

    def get_back_url(self):
        return reverse('home')

    def get_success_url(self):
        return reverse('deployments:update', args=(self.object.id,))


class DeploymentEndView(LoginRequiredMixin, UpdateView):
    form_class = DeploymentEndForm
    model = Deployment

    def get_success_url(self):
        return reverse('home')


class DeploymentListView(LoginRequiredMixin, ListView):
    context_object_name = 'deployments'
    model = Deployment
    template_name = 'deployments/deployment_list.html'

    def get_context_data(self, **kwargs):
        context = super(DeploymentListView, self).get_context_data(**kwargs)
        ended_deployments = []
        deployments = []
        for deployment in Deployment.objects.all():
            if deployment.status[0] == 4:
                ended_deployments.append(deployment)
            else:
                deployments.append(deployment)

        context['ended_deployments'] = ended_deployments
        context['deployments'] = deployments
        return context


class DeploymentRemoveHubView(LoginRequiredMixin, UpdateView):
    form_class = DeploymentRemoveHubForm
    model = Deployment

    def get_success_url(self):
        return reverse('deployments:update', args=(self.kwargs['pk'],))


class DeploymentStartView(LoginRequiredMixin, UpdateView):
    form_class = DeploymentStartForm
    model = Deployment

    def get_success_url(self):
        return reverse('home')


class DeploymentUpdatePhotoView(LoginRequiredMixin, UpdateView):
    form_class = DeploymentUpdatePhotoForm
    model = Deployment

    def get_success_url(self):
        return reverse('deployments:update', args=(self.kwargs['pk'],))


class DeploymentUpdateView(LoginRequiredMixin, BackButtonMixin, UpdateView):
    context_object_name = 'deployment'
    form_class = DeploymentUpdateForm
    model = Deployment
    template_name = 'deployments/deployment_update.html'

    def get_back_url(self):
        return reverse('home')

    def get_context_data(self, **kwargs):
        context = super(DeploymentUpdateView, self).get_context_data(**kwargs)

        deployment = self.get_object()
        context['update_photo_form'] = DeploymentUpdatePhotoForm(
            instance=deployment)

        if deployment.hub:
            context['remove_hub_form'] = DeploymentRemoveHubForm(
                instance=deployment)
            context['add_sensor_form'] = SensorDeploymentDetailsCreateForm(
                initial={'deployment': deployment})

            if deployment.sensors.all().exists():
                context[
                    'sensor_update_location_form'] = SensorDeploymentLocationUpdateForm()
                context['sensor_disable_form'] = SensorDeploymentDetailsDisableForm(
                    initial={'active': False})

        else:
            context['add_hub_form'] = DeploymentAddHubForm(
                instance=deployment)

        context['hubs_json'] = serializers.serialize(
            'json', Hub.objects.filter(deployment=None), fields=('id', 'name'))

        context['sensors_json'] = serializers.serialize(
            'json', Sensor.objects.exclude(
                deployment_details__active=True),
            fields=('id', 'mac'))
        context['form'].helper.form_action = reverse(
            'deployments:update', args=[deployment.id])

        return context

    def get_success_url(self):
        return reverse('home')


class DeploymentDetailView(LoginRequiredMixin, DetailView):
    model = Deployment
    template_name = 'deployments/deployment_fragment.html'
