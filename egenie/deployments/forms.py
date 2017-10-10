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

from deployments.models import Deployment
from crispy_forms.helper import FormHelper
from crispy_forms.layout import *
from crispy_forms.bootstrap import StrictButton, FormActions
from django.core.urlresolvers import reverse


class DeploymentAddHubForm(forms.ModelForm):

    class Meta:
        fields = ['hub']
        model = Deployment
        widgets = {
            'hub': forms.HiddenInput()
        }

    def __init__(self, *args, **kwargs):
        super(DeploymentAddHubForm, self).__init__(*args, **kwargs)

        self.fields['hub'].label = "Hub Identifier"

    def clean_hub(self):
        hub = self.cleaned_data['hub']

        if self.instance.hub:
            raise forms.ValidationError(
                "There is already a hub assigned to this deployment.")

        try:
            old_deployment = hub.deployment
            old_deployment.hub = None
            old_deployment.save()
        except (AttributeError, Deployment.DoesNotExist):
            pass

        return hub


class DeploymentCreateForm(forms.ModelForm):
    gas_pence_per_kwh = forms.IntegerField(label='Gas Cost (pence per KWh)')
    elec_pence_per_kwh = forms.IntegerField(
        label='Electricity Cost (pence per KWh)')

    def __init__(self, *args, **kwargs):
        super(DeploymentCreateForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_class = 'form-horizontal'
        self.helper.label_class = 'col-lg-2'
        self.helper.field_class = 'col-lg-8'
        self.helper.form_method = 'post'
        self.helper.form_action = 'deployments:create'
        self.helper.layout = Layout(
            Fieldset('', 'client_name', 'address_line_one', 'post_code',
                     'notes', 'photo', 'elec_pence_per_kwh', 'gas_pence_per_kwh'),
            FormActions(Submit('save', 'Save Changes'))
        )

    class Meta:
        fields = [
            'client_name', 'address_line_one', 'post_code', 'notes', 'photo', 'elec_pence_per_kwh', 'gas_pence_per_kwh']
        model = Deployment


class DeploymentEndForm(forms.ModelForm):

    class Meta:
        fields = ['id']
        model = Deployment

    def save(self):
        self.instance.end()


class DeploymentRemoveHubForm(forms.ModelForm):

    class Meta:
        fields = ['id']
        model = Deployment

    def save(self):
        deployment = self.instance

        deployment.hub = None
        deployment.save()


class DeploymentStartForm(forms.ModelForm):

    class Meta:
        fields = ['id']
        model = Deployment

    def save(self):
        self.instance.start()


class DeploymentUpdatePhotoForm(forms.ModelForm):

    class Meta:
        fields = ['photo', ]
        model = Deployment


class DeploymentUpdateForm(forms.ModelForm):
    gas_pence_per_kwh = forms.IntegerField(label='Gas Cost (pence per KWh)')
    elec_pence_per_kwh = forms.IntegerField(
        label='Electricity Cost (pence per KWh)')

    def __init__(self, *args, **kwargs):
        super(DeploymentUpdateForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_class = 'form-horizontal'
        self.helper.label_class = 'col-lg-2'
        self.helper.field_class = 'col-lg-8'
        self.helper.form_method = 'post'
        self.helper.layout = Layout(
            Fieldset('', 'client_name', 'address_line_one', 'post_code',
                     'notes', 'elec_pence_per_kwh', 'gas_pence_per_kwh'),
            FormActions(Submit('save', 'Save Changes'))
        )

    class Meta:
        fields = [
            'client_name', 'address_line_one', 'post_code', 'notes', 'elec_pence_per_kwh', 'gas_pence_per_kwh']
        model = Deployment
