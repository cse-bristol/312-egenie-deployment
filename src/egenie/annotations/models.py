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


from django.conf import settings
from django.contrib.auth.models import User
from django.db import models

from django_extensions.db.models import TimeStampedModel
from deployments.models import Deployment


class DeploymentAnnotation(TimeStampedModel):
    """
    An annotation associated with a deployment. Contains some text, the date/time range, and the creator. Has a foreign key reference to the creating user and the deployment.
    """
    text = models.TextField()
    start = models.DateTimeField()
    end = models.DateTimeField()
    author = models.ForeignKey(User)
    deployment = models.ForeignKey(Deployment)

    def __str__(self):
        return self.text