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

from django.db import models
from django.utils import timezone

from django_extensions.db.models import TimeStampedModel
from sensors.models import SensorDeploymentDetails


class Deployment(TimeStampedModel):
    """
    Records information about a deployment. While the hub might not be permanent
    (if it gets reassigned to another deployment) the sensor readings are
    permanent to this deployment via :class:`~sensors.models.SensorDeploymentDetails`.
    """

    client_name = models.CharField(max_length=255)
    """The client name: might be a home owner's name (Mrs Jones), or a company name (ABC Ltd), for example."""

    address_line_one = models.CharField(max_length=255)
    """The first line of the deployment's physical address."""
    post_code = models.CharField(max_length=255)
    """The deployment's postcode."""

    notes = models.TextField(null=True, blank=True)
    """Any notes that go along with the deployment."""

    photo = models.ImageField(
        upload_to='deployment_photos', null=True, blank=True)
    """A photo to represent the deployment - might be a picture of a room or a building."""

    gas_pence_per_kwh = models.IntegerField(default=0)
    """How much gas costs per KWh in the location."""
    elec_pence_per_kwh = models.IntegerField(default=0)
    """How much electricity costs per KWh in the location."""

    hub = models.OneToOneField(
        'hubs.Hub', blank=True, null=True)
    """The hub that has been deployed at the site. This is optional until the deployment needs to be started."""

    # sensors = models.ManyToManyField(
    #     'sd_store.Sensor',
    #     through='sensors.SensorDeploymentDetails')

    pairs = models.ManyToManyField('sd_store.SensorChannelPair')
    """A set of sensor/channel pairs associated with this deployment. e.g. temperature_1 / temperature. 

  .. warning:: Check that this is actually used."""

    def __unicode__(self):
        return self.client_name

    def end(self):
        """ End this deployment. The end_date is set to the current date and time, any sensors that are active in the deployment are deactivated, and the hub is cleared for use in other deployments."""
        try:
            deployment_state = self.deployment_states.get(
                end_date__isnull=True)

            deployment_state.end_date = timezone.datetime.now()

            deployment_state.save()
        except DeploymentState.DoesNotExist:
            raise ValueError("Deployment isn't running so can't be ended")

        # # Free up hub and sensors
        sensor_deployment_details = SensorDeploymentDetails.objects.filter(
            deployment=self)
        for sensor_deployment_record in sensor_deployment_details:
            sensor_deployment_record.active = False
            sensor_deployment_record.save()
        self.hub = None
        self.save()

    @property
    def running(self):
        """ True if the deployment is running (i.e. does not have `end_date` set), False otherwise."""
        if self.deployment_states.filter(end_date__isnull=True):
            return True
        return False

    def start(self):
        """ Start the deployment if not already running. Creates a new DeploymentState, and clears any existing sensor readings. Raises a ValueError if the Deployment is running already."""
        if self.running:
            raise ValueError('Deployment is already running')

        deployment_state = DeploymentState(
            deployment=self
        )
        deployment_state.save()

        # Clear out any existing readings
        sensor_deployment_details = SensorDeploymentDetails.objects.filter(
            deployment=self)
        for sensor_deployment_record in sensor_deployment_details:
            sensor_deployment_record.sensor_readings.clear()

        return deployment_state

    @property
    def status(self):
        """
        Returns the current status of the deployment. Options are:
        (1, 'Details Incomplete')
        (2, 'Deployment not running')
        (3, 'Deployment Running')
        (4, 'Deployment Ended')
        """
        if self.deployment_states.filter(end_date__isnull=False):
            return (4, 'Deployment Ended')
        elif self.hub and self.sensors.exists():
            if self.running:
                return (3, 'Deployment Running')
            else:
                return (2, 'Deployment not running')

        return (1, 'Details Incomplete')


class DeploymentState(TimeStampedModel):
    """
    Records when a deployment started and when it ended.
    The start date is found via the built-in created field (i.e. when the DeploymentState was created).
    """
    end_date = models.DateTimeField(null=True)

    deployment = models.ForeignKey(
        'deployments.Deployment', related_name='deployment_states',
        blank=True, null=True)

    def __unicode__(self):
        return 'Deployment state for {deployment}'.format(
            deployment=self.deployment.client_name)
