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

from django.conf import settings
from django.db import models
from django.db.models.signals import m2m_changed, post_save
from django.core.exceptions import ValidationError
from django.utils import timezone

from django_extensions.db.models import TimeStampedModel

from sd_store.models import Channel, Sensor
from sensors.managers import SensorDeploymentDetailsManager


class SensorDeploymentDetails(TimeStampedModel):
    """
    Used as a m2m through model. Stores location and readings for a sensor on a
    particular deployment.
    """
    deployment = models.ForeignKey(
        'deployments.Deployment', related_name='sensor_details')
    sensor = models.ForeignKey(
        'sd_store.Sensor', related_name='deployment_details')

    location = models.CharField(max_length=255, blank=True, null=True)
    sensor_readings = models.ManyToManyField(
        'sd_store.SensorReading', related_name='deployments', blank=True)

    image = models.ImageField(
        upload_to='sensor_images', null=True, blank=True)

    active = models.BooleanField(default=True)

    objects = SensorDeploymentDetailsManager()

    class Meta:
        verbose_name_plural = "Sensor deployment details"
        unique_together = ("deployment", "sensor")

    def __unicode__(self):
        return '{sensor} for {deployment}'.format(
            sensor=self.sensor, deployment=self.deployment
        )

    @property
    def battery_percentage(self):
        try:
            battery_reading = self.sensor_readings.filter(
                channel__name='BATT').order_by('-timestamp')[0]
            return battery_reading.value
            # return round(battery_reading.value / float(3) * 100)
        except IndexError:
            return False

    @property
    def connection_status(self):
        if self.connection_status_object.online_since:
            now = timezone.now()

            time_difference = now - self.connection_status_object.last_ping

            if time_difference.seconds < settings.SENSOR_OFFLINE_TIME:

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
    def earliest_reading_date(self):
        return self.sensor_readings.order_by('timestamp')[0].timestamp

    @property
    def latest_reading_date(self):
        try:
            return self.sensor_readings.order_by('-timestamp')[0].timestamp
        except IndexError:
            pass

    @property
    def latest_readings(self):
        """
        Returns the latest reading for each channel this sensor has recorded
        data for. Will exclude BATT.
        """
        latest_readings = []

        for channel in self.sensor.channels.all():
            sensor_readings = self.sensor_readings.filter(
                channel=channel, sensor=self.sensor).order_by('-timestamp')

            try:
                sensor_reading = sensor_readings[0]

                latest_readings.append({
                    'name': sensor_reading.channel.name,
                    'reading': sensor_reading.value,
                    'unit': sensor_reading.channel.unit
                })
            except:
                continue

        return latest_readings

    def save(self, *args, **kwargs):
        first_save = False

        if not self.id:
            first_save = True

            try:
                SensorDeploymentDetails.objects.get(
                    deployment=self.deployment,
                    sensor=self.sensor
                )
                raise ValidationError(
                    'A SensorDeploymentDetails with that deployment and sensor combo already exists')
            except SensorDeploymentDetails.DoesNotExist:
                pass

        super(SensorDeploymentDetails, self).save(*args, **kwargs)

        if first_save:
            connection_status = SensorDeploymentDetailsConnectionStatus(
                sensor_deployment_details=self
            )

            connection_status.save()


class SensorDeploymentDetailsConnectionStatus(TimeStampedModel):
    """
    Saves us from doing some complicated logic to work out when the sensor was
    online from.
    """
    sensor_deployment_details = models.OneToOneField(
        SensorDeploymentDetails, related_name='connection_status_object')
    online_since = models.DateTimeField(blank=True, null=True)

    def __unicode__(self):
        return 'Connection status for {sensor_deployment_detail}'.format(
            sensor_deployment_detail=self.sensor_deployment_details)

    @property
    def last_ping(self):
        try:
            return self.sensor_deployment_details.sensor_readings.order_by(
                '-timestamp')[0].timestamp
        except IndexError:
            return None

    def update(self):
        now = timezone.now()

        if self.last_ping:
            time_difference = (
                now - self.last_ping)

            if time_difference.seconds > settings.SENSOR_OFFLINE_TIME:
                self.online_since = now
        else:
            self.online_since = now

        self.save()


class ChannelExtraDetails(TimeStampedModel):
    """
    Records extra details about a channel.
    """
    channel = models.OneToOneField(
        'sd_store.Channel', related_name='extra_details')
    friendly_name = models.CharField(max_length=64)

    def __unicode__(self):
        return '{name} ({channel})'.format(
            channel=self.channel, name=self.friendly_name
        )

    class Meta:
        verbose_name_plural = "Channel extra details"


class SensorExtraDetails(TimeStampedModel):
    """
    Records extra details about a sensor.
    """
    sensor = models.OneToOneField(
        'sd_store.Sensor', related_name='extra_details')
    battery_percentage = models.IntegerField(blank=True, null=True)

    def __unicode__(self):
        return '{sensor} has battery life of {battery_percentage}'.format(
            sensor=self.sensor, battery_percentage=self.battery_percentage
        )

    class Meta:
        verbose_name_plural = "Sensor extra details"

# Signals


def create_channel_extra_details_signal(sender, **kwargs):
    instance = kwargs['instance']

    if kwargs['created']:
        ChannelExtraDetails(channel=instance).save()


def create_sensor_extra_details_signal(sender, **kwargs):
    instance = kwargs['instance']

    if kwargs['created']:
        SensorExtraDetails(sensor=instance).save()

post_save.connect(create_sensor_extra_details_signal, sender=Sensor)
post_save.connect(create_channel_extra_details_signal, sender=Channel)


def sensor_reading_added(sender, **kwargs):
    kwargs['instance'].connection_status_object.update()

m2m_changed.connect(
    sensor_reading_added,
    sender=SensorDeploymentDetails.sensor_readings.through)
