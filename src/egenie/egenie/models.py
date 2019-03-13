
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.db import models
from deployments.models import Deployment
from sd_store.models import Sensor


class Participant(models.Model):
    """ When a User is created, a Participant model is also created. It only has two properties - the user, and whether they have agreed to participate in the study."""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    agreed = models.BooleanField(default=False)

    def __unicode__(self):
        return self.user.username + " (" + str(self.agreed) + ")"


def create_participant(sender, **kw):
    """ Create a Participant model when a User is created. """
    user = kw['instance']
    if kw['created']:
        participant = Participant(user=user, agreed=False)
        participant.save()


class Plinth(models.Model):
    """ A Plinth represents a physical podium within the deployment location, which displays the eGenie interface on a tablet. """

    location = models.CharField(max_length=32)
    """ Where this tablet is (e.g. Reception, Office). """

    printer = models.CharField(max_length=5)
    """ The unique code for the printer associated with this Plinth. """

    pi_ip = models.GenericIPAddressField()
    """ The psychology implementation can show a video feed of the user. This IP address points to the video stream. """

    deployment = models.ForeignKey(Deployment, blank=True, null=True)
    """ The Deployment associated with this Plint. """

    x = models.IntegerField(default = 0)
    """ The x co-ordinate of the Plinth on the floorplan in pixels. """
    y = models.IntegerField(default = 0)
    """ The y co-ordinate of the Plinth on the floorplan in pixels. """

    def __unicode__(self):
        return self.location


class SensorPosition(models.Model):
    """ Specifies where a Sensor is positioned on the Deployment's floor plan. """
    sensor = models.OneToOneField(Sensor, related_name='position')
    """ The Sensor this position refers to. """
    x = models.IntegerField(default = 0)
    """ The x pixel coordinate of the Sensor on the floor plan. """
    y = models.IntegerField(default = 0)
    """ The y pixel coordinate of the Sensor on the floor plan. """

    def __unicode__(self):
        return self.sensor.name + " (" + str(self.x) + "," + str(self.y) + ")"

post_save.connect(create_participant, sender=User,
                  dispatch_uid="users-participantcreation-signal")
