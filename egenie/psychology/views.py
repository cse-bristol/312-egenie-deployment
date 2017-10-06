from django.shortcuts import render, redirect
from django.http import JsonResponse
from psychology.models import PrintTask
from psychology.models import StepView
import datetime
import time
import json

from egenie.mixins import PlinthMixin
from django.views.generic import TemplateView
from django.contrib.auth import get_user_model


class StudyView(PlinthMixin, TemplateView):

    def get_context_data(self, **kwargs):

        User = get_user_model()
        user = User.objects.get(username='anonymous')

        context = super(StudyView, self).get_context_data(**kwargs)
        context['mode'] = self.request.GET.get('mode', 'heating')
        stepview = StepView(user=user, stage=kwargs[
                            'stage'], goal=context['mode'])
        stepview.save()
        return context


class WizardView(StudyView):
    template_name = 'psychology/wizard.html'

    def get_context_data(self, **kwargs):
        context = super(WizardView, self).get_context_data(
            stage='wizard', **kwargs)
        return context


class GoalView(StudyView):
    template_name = 'psychology/goal.html'

    def get_context_data(self, **kwargs):
        context = super(GoalView, self).get_context_data(
            stage='goal', **kwargs)
        return context


class ImplementationView(StudyView):
    template_name = 'psychology/imp.html'

    def get_context_data(self, **kwargs):
        step = kwargs['step']

        if step == 4:
            tasks = PrintTask.objects.filter(user=self.request.user)

        context = super(ImplementationView, self).get_context_data(
            stage='imp' + str(step), **kwargs)
        return context

    def get_template_names(self):
        return ['psychology/imp%s.html' % self.kwargs['step']]


class PrintView(StudyView):

    template_name = 'psychology/printed.html'

    def get_context_data(self, **kwargs):

        User = get_user_model()
        user = User.objects.get(username='anonymous')

        context = super(PrintView, self).get_context_data(
            stage='print', **kwargs)
        printer = self.request.GET.get('printer', '')

        task = PrintTask(printer=printer, user=user, goal=context['mode'])
        task.save()

        return context

# def implementation(request, step):
# 	mode = request.GET.get('mode','heating')
# 	if step == 4:
# 		tasks = PrintTask.objects.filter(user=request.user)

# 	view = StepView(user=request.user, stage='imp'+str(step), goal=mode)
# 	view.save()

# 	return render(request, 'psychology/imp%s.html' % step, {'mode':mode})


def pledges(request, printer):
    tasks = PrintTask.objects.filter(printer=printer)
    out = []
    for task in tasks:
        out.append({'goal': task.goal, 'user': task.user.username})
        task.delete()
    return JsonResponse(out, safe=False)

# def print_pledge(request):
# 	mode = request.GET.get('mode', 'heating')
# 	printer = request.GET.get('printer', '')

# 	view = StepView(user=request.user, stage='print', goal=mode)
# 	view.save()

# 	task = PrintTask(printer=printer, user=request.user, goal=mode)
# 	task.save()
# 	return redirect('root')
