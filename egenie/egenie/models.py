
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.db import models
# from deployments.models import Deployment
# from sd_store.models import Sensor


class Participant(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    agreed = models.BooleanField(default=False)

    def __unicode__(self):
        return self.user.username + " (" + str(self.agreed) + ")"


def create_participant(sender, **kw):
    user = kw['instance']
    if kw['created']:
        participant = Participant(user=user, agreed=False)
        participant.save()


class Plinth(models.Model):
    location = models.CharField(max_length=32)
    printer = models.CharField(max_length=5)
    pi_ip = models.GenericIPAddressField()
    # deployment = models.ForeignKey(Deployment, blank=True, null=True)
    x = models.IntegerField()
    y = models.IntegerField()

    def __unicode__(self):
        return self.location

# class SensorPosition(models.Model):
# 	sensor = models.OneToOneField(Sensor, related_name='position')
# 	x = models.IntegerField()
# 	y = models.IntegerField()
# 	def __unicode__(self):
# 		return self.sensor.name+" ("+str(self.x)+","+str(self.y)+")"

post_save.connect(create_participant, sender=User,
                  dispatch_uid="users-participantcreation-signal")
