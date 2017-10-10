from django.db import models
from django_extensions.db.models import TimeStampedModel
from sd_store.models import SensorChannelPair

class PairColour(models.Model):
	pair = models.ForeignKey(SensorChannelPair, related_name='colour')
	colour = models.CharField(max_length=32)