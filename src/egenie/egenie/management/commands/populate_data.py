# -*- coding: UTF-8 -*-

# This file is part of sd_store
#
# sd_store is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# sd_store is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with sd_store.  If not, see <http://www.gnu.org/licenses/>.

from random import random
from datetime import datetime, timedelta

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from sd_store.models import Sensor, Channel, SensorGroup, SensorReading
from django.db.transaction import atomic


@atomic
class Command(BaseCommand):
    #args = '<poll_id poll_id ...>'
    help = 'Populates the db for the pricing applications'

    def handle(self, *args, **options):
        self.stdout.write("populating sd_store.. \n")
        self.stdout.write("please wait, this can take few minutes\n\n")

        s1 = Sensor.objects.get(mac='temperature_1')
        ch1 = Channel.objects.get(name='temperature')
        s2 = Sensor.objects.get(mac='electricity_1')
        ch2 = Channel.objects.get(name='electricity')

        # generate some random-ish data
        end = datetime(2017, 10, 9, 14, 00, 00)
        start = end - timedelta(days=14)
        for i in range(14 * 24 * 30):
            msg = "%4d out of %d\r" % (i, 14 * 24 * 30)
            self.stdout.write(msg)

            delta_t = i * timedelta(minutes=2)
            t = start + delta_t

            value = 21 + random()
            r = SensorReading(sensor=s1,
                              channel=ch1,
                              timestamp=t,
                              value=value)
            r.save()

            r = SensorReading(sensor=s2,
                              channel=ch2,
                              timestamp=t,
                              value=value)
            r.save()

        self.stdout.write("\n..done\n")
