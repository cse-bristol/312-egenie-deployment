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

from spirit.category.models import Category

from django.db import transaction
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User


class Command(BaseCommand):
    """ Create two initial categories for the pinboard. """

    help = 'Creates categories for pinboard (public and fm posts)'

    @transaction.atomic
    def handle(self, *args, **options):
        Category.objects.create(title='user-posts')
        Category.objects.create(title='fm-messages')
