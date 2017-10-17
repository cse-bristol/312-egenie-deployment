from django.shortcuts import render
from django.views.generic import TemplateView
from sd_store.models import Sensor, Channel
from egenie.views import RotatingView
from deployments.models import Deployment
from egenie.mixins import PlinthMixin


class TemperatureView(RotatingView):
    template_name = 'temperature/index.html'

    def get_context_data(self, **kwargs):
        context = super(TemperatureView, self).get_context_data(
            screen='temperature', **kwargs)

        deployment = context['plinth'].deployment
        temp_channel = Channel.objects.get(name='temperature')

        # EC: select all sensors in the deployment (this assumes they all have
        # temperature)
        sensors = Sensor.objects.filter(
            channels__in=[temp_channel],
            deployment_details__deployment=deployment,
            deployment_details__active=True).order_by('name')
        sensors_ids = [p.sensor.pk for p in deployment.pairs.all()]
        sensors = Sensor.objects.filter(pk__in=sensors_ids)

        # EC: this seems to be unused, so commenting out
        #sensors_available = sensors.count()

        # EC: ignoring single sensor ID
        #sensor_id = int(self.request.GET.get('sensor', 0))
        #filtered = sensors.filter(pk=sensor_id)
        filtered = sensors

        if filtered.count() == 0:
            sensor_to_show = sensors[0]
        else:
            sensor_to_show = filtered[0]

        context['sensor'] = sensor_to_show
        context['available'] = sensors
        # EC: we just consider all sensors in the deployment, nothing more
        #context['all_sensors'] = Sensor.objects.filter(channels__in=[temp_channel], deployment_details__active=True)
        context['all_sensors'] = sensors
        context['all_deployments'] = Deployment.objects.all()
        context['mode'] = 'heating'

        return context
