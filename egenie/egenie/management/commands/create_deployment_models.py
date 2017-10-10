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

# encoding:UTF-8
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from sd_store.models import SensorChannelPair, Sensor, Channel
from deployments.models import Deployment
from sensors.models import SensorDeploymentDetails
from egenie.models import SensorPosition, Plinth

from django.db import transaction


class Command(BaseCommand):
    """ Sets up a few model objects to ease deployment. This includes a deployment, plinth, 
    two sensors (one electricity, one temperature), and their associated channels."""
    help = 'Creates a few models to get started.'

    @transaction.atomic
    def handle(self, *args, **options):

        admin_user = User.objects.get(username='moj')

        temperature_channel = Channel.objects.create(
            name="temperature",
            unit="C",
            reading_frequency=60
        )

        electricity_channel = Channel.objects.create(
            name="electricity",
            unit="KWh",
            reading_frequency=60
        )

        temperature_sensor = Sensor.objects.create(
            mac="temperature_1",
            sensor_type="temperature",
            name="Office Temperature",
            user=admin_user,
        )
        temperature_sensor.channels.add(temperature_channel)
        SensorPosition.objects.create(
            sensor=temperature_sensor,
            x=20,
            y=20
        )

        electricity_sensor = Sensor.objects.create(
            mac="electricity_1",
            sensor_type="electricity",
            name="Office Electricity",
            user=admin_user,
        )
        electricity_sensor.channels.add(electricity_channel)
        SensorPosition.objects.create(
            sensor=electricity_sensor,
            x=10,
            y=10
        )

        temperature_pair = SensorChannelPair.objects.create(
            sensor=temperature_sensor,
            channel=temperature_channel,
        )
        electricity_pair = SensorChannelPair.objects.create(
            sensor=electricity_sensor,
            channel=electricity_channel,
        )

        deployment = Deployment.objects.create(
            client_name="New Deployment",
            address_line_one="10 Downing Street",
            post_code="",
            gas_pence_per_kwh=0,
            elec_pence_per_kwh=0,
        )
        deployment.pairs.add(temperature_pair)
        deployment.pairs.add(electricity_pair)

        deployment_details = SensorDeploymentDetails.objects.create(
            deployment=deployment,
            sensor=temperature_sensor,
            active=True
        )

        deployment_details = SensorDeploymentDetails.objects.create(
            deployment=deployment,
            sensor=electricity_sensor,
            active=True
        )

        plinth = Plinth.objects.create(
            location="Reception",
            printer="NA",
            pi_ip="127.0.0.1",
            deployment=deployment,
            x=0,
            y=0,
        )
