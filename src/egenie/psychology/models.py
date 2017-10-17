
from django.contrib.auth.models import User
from django.db import models


class PrintTask(models.Model):
    goal = models.CharField(max_length=16)
    printer = models.CharField(max_length=5)
    created = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User)


class StepView(models.Model):
    stage = models.CharField(max_length=16)
    user = models.ForeignKey(User)
    goal = models.CharField(max_length=16, blank=True)
    created = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return self.user.username + ", " + self.stage + ", " + self.goal
