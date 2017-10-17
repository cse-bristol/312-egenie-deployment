# encoding:UTF-8

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

from django.core.management.base import BaseCommand, CommandError
from sd_store.models import *
from datetime import datetime, timedelta
import json

from django.contrib.auth.models import User


class Command(BaseCommand):
    """ This is an archaic command, used to take multiple sensors from a JSON
        file and aggregate them by summing up their readings. Useful when dealing
        with multiple circuits."""
    help = 'Create aggregated sensors'

    def handle(self, *args, **options):
        user = User.objects.get(username='cdec')
        now = datetime.now()
        with open('/srv/django-projects/catapult/aggregates.json', 'r') as fp:
            content = fp.read()
            obj = json.loads(content)
            for aggregate_sensor in obj:
                total = 0
                output_sensor = Sensor.objects.get(
                    name=aggregate_sensor['dest']['sensor'],
                    mac=aggregate_sensor['dest']['mac'],
                    user=user)
                output_channel = Channel.objects.get(
                    name=aggregate_sensor['dest']['channel'])
                for input_param in aggregate_sensor['sources']:
                    input_sensor = Sensor.objects.get(
                        name=input_param['sensor'])
                    input_channel = Channel.objects.get(
                        name=input_param['channel'])
                    latest_reading = SensorReading.objects.filter(sensor=input_sensor,
                                                                  channel=input_channel).order_by('-timestamp')[0]
                    total += latest_reading.value
                    print latest_reading.timestamp, input_sensor, input_channel, latest_reading.value
                reading = SensorReading(
                    sensor=output_sensor, channel=output_channel, timestamp=now, value=total)
                reading.save()
