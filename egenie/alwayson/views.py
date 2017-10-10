from django.shortcuts import render
from django.views.generic import TemplateView
from egenie.views import RotatingView
from sd_store.models import Sensor


class AlwaysOnView(RotatingView):
    """ Always On front screen. Displays the energy use in a calendar form.
    *This currently has a hardcoded sensor to display. This should become a configuration option.*
    """
    template_name = 'alwayson/index.html'

    def get_context_data(self, **kwargs):
        context = super(AlwaysOnView, self).get_context_data(
            screen='alwayson', **kwargs)
        building_sensor = Sensor.objects.get(mac='electricity_1')
        context['sensor'] = building_sensor
        context['mode'] = 'electricity'
        return context
