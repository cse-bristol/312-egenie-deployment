from django.contrib import admin

from django.contrib import admin
from spirit.comment.models import Comment
from spirit.topic.models import Topic
from spirit.category.models import Category
from pinboard.models import PinboardPhoto, UserPinboardProfile, CommentAuthor, CommentPhoto
from spirit.user.models import UserProfile

admin.site.register(Comment)
admin.site.register(Topic)
admin.site.register(Category)
admin.site.register(PinboardPhoto)
admin.site.register(UserPinboardProfile)
admin.site.register(CommentPhoto)
admin.site.register(CommentAuthor)
admin.site.register(UserProfile)
