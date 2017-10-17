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

import json

from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.core.urlresolvers import reverse_lazy
from annotations.models import DeploymentAnnotation
from django.contrib.auth.decorators import login_required
from egenie.mixins import *
from annotations.forms import DeploymentAnnotationForm
from basicutils.djutils import to_dict

from django.contrib.auth.models import User
from django.views.generic import CreateView, ListView, UpdateView, DeleteView


class AnnotationList(LoginRequiredMixin, AjaxableListMixin, ListView):
    """ List all annotations for a deployment."""
    model = DeploymentAnnotation
    form_class = DeploymentAnnotationForm
    fields = ['start', 'end', 'text', 'deployment']
    context_object_name = 'annotations'


class AnnotationCreate(LoginRequiredMixin, AjaxableResponseMixin, CreateView):
    """ Create a new annotation associated with a deployment."""
    model = DeploymentAnnotation
    form_class = DeploymentAnnotationForm

    def get_success_url(self):
        return reverse('annotations:update', args=(self.object.id,))


class AnnotationUpdate(LoginRequiredMixin, AjaxableResponseMixin, UpdateView):
    """ Update an existing deployment annotation. """
    model = DeploymentAnnotation
    form_class = DeploymentAnnotationForm
    fields = ['start', 'end', 'text', 'deployment']

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super(AnnotationUpdate, self).form_valid(form)

    def form_invalid(self, form):
        form.instance.author = self.request.user
        return super(AnnotationUpdate, self).form_invalid(form)

    def get_success_url(self):
        return reverse('annotations:update', args=(self.kwargs['pk'],))


class AnnotationDelete(LoginRequiredMixin, AjaxableResponseMixin, DeleteView):
    """ Delete an annotation associated with a deployment. """
    model = DeploymentAnnotation

    def get_success_url(self):
        return reverse('annotations:list')
