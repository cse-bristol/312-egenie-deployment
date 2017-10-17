from django.db import models


class FMMessage(models.Model):
    author = models.TextField()
    message = models.TextField()
    subject = models.CharField(max_length=128)

    def __unicode__(self):
        return self.subject
