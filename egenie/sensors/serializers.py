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

from django.utils import timezone

from rest_framework import serializers

from hubs.models import Hub
from sd_store.models import Channel, Sensor, SensorReading
from sensors.models import SensorDeploymentDetails
from sensors.models import SensorExtraDetails


class SensorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Sensor
        fields = ('mac',)


class SensorExtraDetailsSerializer(serializers.ModelSerializer):

    class Meta:
        model = SensorExtraDetails
        fields = ('battery_percentage',)


class ChannelSerializer(serializers.ModelSerializer):

    class Meta:
        model = Channel
        fields = ('name',)


class SensorReadingSerializer(serializers.ModelSerializer):
    # hub = serializers.IntegerField()

    class Meta:
        model = SensorReading
        fields = ('channel', 'sensor', 'value')

    # def save(self, **kwargs):
    #     """
    #     Save the deserialized object and return it.
    #     """
    #     # Clear cached _data, which may be invalidated by `save()`
    #     self._data = None

        # if isinstance(self.object, list):
        #     [self.save_object(item, **kwargs) for item in self.object]

        #     if self.object._deleted:
        #         [self.delete_object(item) for item in self.object._deleted]
        # else:
        # self.save_object(self.object, **kwargs)

        # return self.object
    def create(self, validated_data):
        validated_data['timestamp'] = timezone.now()
        return SensorReading.objects.create(**validated_data)

    def validate(self, attrs):
        """
        Check that the sensor is registred to the hub and that there's a
        deployment running.
        """
        # print attrs
        # del attrs['hub']
        # try:
        #     hub = Hub.objects.get(id=attrs['hub'])

        #     sensor_deployment_details = SensorDeploymentDetails.objects.get(
        #         deployment=hub.deployment,
        #         sensor=attrs['sensor']
        #     )

        # except:
        #     raise serializers.ValidationError(
        #         "That sensor isn't registred to this hub")

        # if not hub.deployment.running:
        #     raise serializers.ValidationError(
        #         "The deployment isn't currently running")

        # if not sensor_deployment_details.active:
        #     raise serializers.ValidationError(
        #         "This sensor has been removed from the hub")

        return attrs
