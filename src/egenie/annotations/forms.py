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

from django import forms

from annotations.models import DeploymentAnnotation
from django.contrib.auth.models import User


class DeploymentAnnotationForm(forms.ModelForm):
    """ A form to represent a Deployment Annotation. Note that author is provided as a User (typically the request user), and converted to a username. 'start' and 'end' are in dd/mm/YYYY HH:MM:SS form."""

    class Meta:
        fields = ['start', 'end', 'deployment', 'text', 'author']
        model = DeploymentAnnotation

    start = forms.DateTimeField(input_formats=['%d/%m/%Y %H:%M:%S'])
    end = forms.DateTimeField(input_formats=['%d/%m/%Y %H:%M:%S'])
    author = forms.ModelChoiceField(
        queryset=User.objects.all(), to_field_name="username")
