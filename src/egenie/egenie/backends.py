# -*- coding: UTF-8 -*-

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

from django.conf import settings
from django.contrib.auth.models import User


class SimpleBackend(object):
    """ eGenie needs a slightly more involved approach to logging in than normal: a password is optional, but only if the user is not an administrator (i.e. superuser or staff). """

    def authenticate(self, request, username=None, password=None):
        """ Authenticate given a username and password. Users are deemed to be authenticated if either a) they are an administrator and have provided the correct password, or b) they are not an administrator. """
        try:
            user = User.objects.get(username=username)
            # Admins can only log in with a password
            if user and (user.is_superuser or user.is_staff):
                pwd_valid = user.check_password(password)
                if not pwd_valid:
                    return None
        except User.DoesNotExist:
            return None
        return user

    def get_user(self, user_id):
        """ Retrieve a user given a User ID. """
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
