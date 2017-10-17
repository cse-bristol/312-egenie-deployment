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

from rest_framework import serializers

from hubs.models import Hub


class HubSerializer(serializers.ModelSerializer):

    class Meta:
        model = Hub
        fields = ('id', 'external_network_address', 'network_address')

    def save(self, **kwargs):
        super_object = super(HubSerializer, self).save(**kwargs)

        hub_connection_status = self.object.connection_status_object

        hub_connection_status.update()

        return self.object
