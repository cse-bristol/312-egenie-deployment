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

from django.shortcuts import render
from django.views.generic import TemplateView
from sd_store.models import Sensor, Channel, SensorReading
from graphs.models import PairColour
from egenie.views import RotatingView
import datetime
import pytz

from django.core.urlresolvers import reverse
from deployments.models import Deployment, DeploymentState
from annotations.models import DeploymentAnnotation
import datetime
from basicutils.djutils import to_dict
from django.http import Http404, HttpResponseBadRequest
from django.utils.dateparse import parse_datetime
from sd_store.forms import SampledIntervalForm
from sd_store import sdutils
from django.db.models import Sum
from django.http import HttpResponse
import json


class AnnotationView(RotatingView):
    """ Displays sensor readings from all electricity readings
        as line graphs, and lets users add annotations by selecting
        ranges of the graphs."""
    # model = Deployment
    template_name = 'graphs/annotation.html'

    def get_back_url(self):
        return reverse('home')

    def get_context_data(self, **kwargs):
        context = super(AnnotationView, self).get_context_data(
            screen='annotation', **kwargs)
        deployment = context['plinth'].deployment
        dateTo = datetime.datetime.now(tz=pytz.utc)  # - datetime.timedelta(days=21)
        dateFrom = dateTo.replace(hour=0, minute=0, second=0, microsecond=0)
        context['dateTo'] = dateTo.strftime("%Y-%m-%d %H:%M:%S")
        context['dateFrom'] = dateFrom.strftime("%Y-%m-%d %H:%M:%S")
        context['deployment'] = deployment
        context['mode'] = 'electricity'
        context['colours'] = PairColour.objects.all()
        context['all_sensors'] = Sensor.objects.filter(
            deployment_details__active=True, position__isnull=False)
        return context


# def generate_stats(deployment, sensor, channel, start, end, requested_interval):
#     readings = sdutils.filter_according_to_interval(
#         sensor, channel, start, end, requested_interval, 'generic')
#     values = [reading.value for reading in readings]

#     if len(values) == 0:
#         return {}
#     stats_obj = {}

#     stats_obj['max'] = round(max(values), 2)
#     stats_obj['min'] = round(min(values), 2)
#     stats_obj['ave'] = round(sum(values) / len(values), 2)
#     if channel.name in ['GASS', 'ELEC']:
#         total_obj = SensorReading.objects.filter(
#             sensor=sensor, channel=channel, timestamp__gte=start, timestamp__lte=end).aggregate(total=Sum('value'))
#         pre_mult = total_obj['total'] / 2
#         cost = 0
#         if channel.name == 'GASS':
#             cost = pre_mult * deployment.gas_pence_per_kwh
#         else:
#             cost = pre_mult * deployment.elec_pence_per_kwh
#         stats_obj['cost'] = cost

#     return stats_obj


def get_devices(request, pk):
    """ JSON data for the annotation view, including annotations, and pairs of sensors
        (sensor name and channel)."""
    deployment = Deployment.objects.get(pk=pk)
    annotations = DeploymentAnnotation.objects.filter(deployment=pk)

    form = SampledIntervalForm(request.GET)
    if not form.is_valid():
        return HttpResponseBadRequest("Invalid Parameters")

    requested_interval = form.cleaned_data['sampling_interval']
    start = form.cleaned_data['start']
    end = form.cleaned_data['end']

    out = {'sensors': [], 'annotations': [], 'stats': []}

    for annotation in annotations:
        obj = to_dict(annotation)
        out['annotations'].append(obj)

    for sensorpair in deployment.pairs.all():
        sensor = sensorpair.sensor
        channel = sensorpair.channel

        sensor_obj = {}
        sensor_obj['name'] = sensor.name
        # sensor_obj['location'] = sensor.deployment_details.filter(deployment__pk=pk)[0].location
        sensor_obj['channels'] = []
        sensor_obj['id'] = sensor.id
        channel_obj = {}
        channel_obj['id'] = channel.id
        channel_obj['name'] = channel.name
        channel_obj['selected'] = False
        if sensorpair.colour.exists():
            channel_obj['colour'] = sensorpair.colour.get().colour
        else:
            channel_obj['colour'] = 'hsla(281,93%,79%,1)'

        channel_obj['friendly_name'] = channel.name
        channel_obj['unit'] = channel.unit
        sensor_obj['channels'].append(channel_obj)

        out['sensors'].append(sensor_obj)
    return HttpResponse(json.dumps(out), content_type='application/json')
