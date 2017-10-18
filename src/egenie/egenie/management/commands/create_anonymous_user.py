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
from spirit.user.models import UserProfile
from django.db import transaction


@transaction.atomic
class Command(BaseCommand):
    """ An anonymous user is used in some places in e-Genie, especially when
    sending feedback or writing on the pinboard. This user is used in these situations."""
    help = 'Create anonymous user'

    def handle(self, *args, **options):
        anonymous = User.objects.create_user(username='anonymous',
                                             email='anonymous@e-genie.co.uk',
                                             password='')

        # Is this automatic?
        UserProfile.objects.create(user=anonymous)
