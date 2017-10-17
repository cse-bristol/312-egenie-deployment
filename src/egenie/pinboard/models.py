from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.contrib.auth.models import User

from spirit.comment.models import Comment

import random
import string


class PinboardPhoto(models.Model):
    image = models.ImageField(upload_to='uploads')
    created = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return self.image.name


class CommentPhoto(models.Model):
    comment = models.ForeignKey(Comment, related_name='comment_photo')
    photo = models.ForeignKey(PinboardPhoto, related_name='photo_comment')


class CommentAuthor(models.Model):
    comment = models.ForeignKey(Comment, related_name='comment_author')
    author = models.CharField(max_length=50)


class UserPinboardProfile(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    code = models.CharField(max_length=6)

    def __unicode__(self):
        return self.user.username


def create_pinboard_profile(sender, **kw):
    user = kw['instance']
    if kw['created']:
        code = ''.join(random.choice(string.ascii_uppercase +
                                     string.digits) for _ in range(5))
        profile = UserPinboardProfile(user=user, code=code)
        profile.save()

post_save.connect(create_pinboard_profile, sender=User,
                  dispatch_uid="users-pinboardprofile-signal")
