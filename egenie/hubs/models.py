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

import binascii
import hashlib

from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone

from django_extensions.db.models import TimeStampedModel

from deployments.models import Deployment
from sd_store.models import Sensor
from hubs.managers import HubManager


class Hub(TimeStampedModel):
    """
    A virtual version on the Raspberry Pi and what sensors are attached to it.
    """
    name = models.CharField(max_length=255, unique=True)
    mac_address = models.CharField(max_length=255)
    external_network_address = models.GenericIPAddressField(
        blank=True, null=True)
    network_address = models.GenericIPAddressField(blank=True, null=True)
    user = models.ForeignKey(User, blank=True, null=True)

    image = models.ImageField(
        upload_to='hub_images', null=True, blank=True)

    objects = HubManager()

    def __unicode__(self):
        return '{name} with MAC address {mac_address}'.format(
            name=self.name, mac_address=self.mac_address
        )

    @property
    def connection_status(self):
        if self.connection_status_object.online_since:
            now = timezone.now()

            time_difference = now - self.connection_status_object.last_ping

            if time_difference.seconds < settings.HUB_OFFLINE_TIME:

                time_online = now - self.connection_status_object.online_since

                one_hour_in_seconds = 60 * 60

                if time_online.seconds >= one_hour_in_seconds:
                    time_online_string = '{time} hours'.format(
                        time=divmod(
                            time_online.seconds, one_hour_in_seconds)[0]
                    )

                elif time_online.seconds >= 60:
                    time_online_string = '{time} minutes'.format(
                        time=divmod(
                            time_online.seconds,
                            60)[0]
                    )

                else:
                    time_online_string = '{time} seconds'.format(
                        time=time_online.seconds
                    )

                return (True, 'Online', time_online_string)

        return (False, 'Awaiting Connection')

    @property
    def password(self):
        password_unencoded = self.mac_address + settings.EXTRA_PASSWORD_CHARACTERS

        password = hashlib.sha224(password_unencoded).hexdigest()

        return password

    @property
    def mac_address_encoded(self):
        return binascii.hexlify(self.mac_address.upper())

    @property
    def sensors(self):
        try:
            return self.deployment.sensors.filter(
                deployment_details__active=True).distinct()
        except Deployment.DoesNotExist:
            return Sensor.objects.none()

    def save(self, *args, **kwargs):
        first_time = False

        if not self.pk:
            first_time = True

            user = User(username=self.mac_address)
            user.save()

            self.user = user

        self.mac_address = self.mac_address.lower()

        hub = super(Hub, self).save(*args, **kwargs)

        if first_time:
            HubConnectionStatus(hub=self).save()

        user = self.user
        user.username = self.mac_address
        user.set_password(self.password)
        user.save()

        return hub


class HubConnectionStatus(TimeStampedModel):
    """
    Keeps track of when a hub last came online and when the last ping was.
    """
    hub = models.OneToOneField(
        'hubs.Hub', related_name='connection_status_object')
    online_since = models.DateTimeField(blank=True, null=True)
    last_ping = models.DateTimeField(blank=True, null=True)

    def __unicode__(self):
        return 'Connection status for {hub}'.format(hub=self.hub)

    def update(self):
        now = timezone.now()

        if self.last_ping:
            time_difference = (
                now - self.last_ping)

            if time_difference.seconds > settings.HUB_OFFLINE_TIME:
                self.online_since = now
        else:
            self.online_since = now

        self.last_ping = now

        self.save()

    class Meta:
        verbose_name_plural = "Hub connection statuses"
