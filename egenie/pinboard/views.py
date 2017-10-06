from django.shortcuts import render
from django.views.generic import TemplateView
from django.conf import settings
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect


from spirit.comment.forms import CommentForm
from spirit.comment.utils import comment_posted
from spirit.topic.forms import TopicForm
from spirit.core.utils import markdown, paginator, render_form_errors, json_response

from spirit.category.models import Category
from spirit.topic.models import Topic
from spirit.comment.models import Comment
from spirit.core.utils.paginator import yt_paginate

from egenie.decorators import agree_required
from egenie.views import RotatingView
from pinboard.models import PinboardPhoto, UserPinboardProfile, CommentPhoto, CommentAuthor

from django.contrib.auth import get_user_model


@login_required
@agree_required
def comment_delete(request, pk):
    comment = get_object_or_404(Comment, pk=pk)
    Comment.objects.filter(pk=pk, user=None).update(is_removed=True)

    remaining = Comment.objects.filter(topic=comment.topic, is_removed=False)
    if remaining.count() == 0:
        category = comment.topic.category
        if category.slug == settings.PUBLIC_CATEGORY:
            return redirect('pinboard:public')
        elif category.slug == settings.PRIVATE_CATEGORY:
            return redirect('pinboard:private')
    else:
        return redirect('spirit:topic:detail', pk=comment.topic.pk)


def comment_publish(request, topic_id, pk=None):
    topic = get_object_or_404(
        Topic.objects.opened(),
        pk=topic_id
    )

    if request.method == 'POST':
        User = get_user_model()
        user = User.objects.get(username='anonymous')
        form = CommentForm(user=user, topic=topic, data=request.POST)

        category = topic.category

        if form.is_valid():
            comment = form.save()
            comment.user = user
            comment.save()

            author = request.POST.get('author', False)

            if author:
                comment_author = CommentAuthor(comment=comment, author=author)
                comment_author.save()

            comment_posted(comment=comment, mentions=form.mentions)

            if category.slug == settings.PUBLIC_CATEGORY:
                return redirect('pinboard:public')
            elif category.slug == settings.PRIVATE_CATEGORY:
                return redirect('pinboard:private')
    else:
        initial = None

        if pk:
            comment = get_object_or_404(
                Comment.objects.for_access(user=None), pk=pk)
            quote = markdown.quotify(comment.comment, comment.user.username)
            initial = {'comment': quote, }

        form = CommentForm(initial=initial)

    context = {
        'form': form,
        'topic': topic,
    }

    return render(request, 'spirit/comment/publish.html', context)


def topic_publish(request, category_id=None):
    if category_id:
        get_object_or_404(Category.objects.visible(),
                          pk=category_id)

    if request.method == 'POST':

        # no longer using user auth so set user to anonymous
        # author name entered later from form
        User = get_user_model()
        user = User.objects.get(username='anonymous')

        form = TopicForm(user=user, data=request.POST)
        cform = CommentForm(user=user, data=request.POST)
        photo_id = request.POST.get('photo', 0)

        if all([form.is_valid(), cform.is_valid()]):  # TODO: test!

            # wrap in transaction.atomic?
            topic = form.save()
            topic.user = user
            topic.save()
            cform.topic = topic
            comment = cform.save()
            comment.user = user
            comment.save()
            if photo_id:
                photo = get_object_or_404(PinboardPhoto, pk=photo_id)
                comment_photo = CommentPhoto(comment=comment, photo=photo)
                comment_photo.save()

            author = request.POST.get('author', False)

            if author:
                comment_author = CommentAuthor(comment=comment, author=author)
                comment_author.save()

            comment_posted(comment=comment, mentions=cform.mentions)

            if topic.category.slug == settings.PUBLIC_CATEGORY:
                return redirect('pinboard:public')
            elif topic.category.slug == settings.PRIVATE_CATEGORY:
                return redirect('pinboard:private')
    else:
        if not category_id:
            slug = request.GET.get('category', settings.PUBLIC_CATEGORY)
            category_id = Category.objects.get(slug=slug).id
        form = TopicForm(user=None, initial={'category': category_id, })
        cform = CommentForm()

    context = {
        'form': form,
        'cform': cform,
        'category': category_id,
    }

    photo_id = request.GET.get('photo', 0)
    if photo_id:
        context['photo'] = get_object_or_404(PinboardPhoto, pk=photo_id)

    return render(request, 'spirit/topic/publish.html', context)


def get_filtered_posts(topics):
    filtered = []
    for topic in topics:
        comments = Comment.objects.filter(
            topic=topic, is_removed=False).order_by('date')
        if comments.count() > 0:
            author = comments[0].comment_author.first()
            if author:
                setattr(comments[0], 'author', author.author)
            filtered.append(comments[0])

    return filtered


def post(request):
    context = {}
    return render(request, 'pinboard/post.html', context)


def delete_photo(request, id):
    photo = get_object_or_404(UserPinboardPhoto, pk=id)
    photo.delete()
    return redirect('pinboard:public')


class PinboardView(TemplateView):
    template_name = 'pinboard/index.html'
    category = settings.PUBLIC_CATEGORY

    @method_decorator(agree_required)
    def dispatch(self, *args, **kwargs):
        return super(PinboardView, self).dispatch(*args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(PinboardView, self).get_context_data(
            screen='pinboard:public', **kwargs)
        recent_topics = Topic.objects.filter(
            category__slug=self.category).order_by('-last_active')

        photos = PinboardPhoto.objects.order_by('-created')
        context['comments'] = get_filtered_posts(recent_topics)
        context['photos'] = photos

        #context['profile'] = UserPinboardProfile.objects.filter(user=self.request.user)[0]
        context['category'] = self.category
        return context


class DigestView(RotatingView):
    template_name = 'pinboard/digest.html'

    def get_context_data(self, **kwargs):
        context = super(DigestView, self).get_context_data(
            screen='pinboard:digest', **kwargs)

        # Base it on topics
        recent_topics = Topic.objects.filter(
            category__slug=settings.PUBLIC_CATEGORY).order_by('-last_active')[0:5]
        popular_topics = Topic.objects.filter(category__slug=settings.PUBLIC_CATEGORY).order_by(
            '-view_count', '-last_active')[0:5]
        fm_topics = Topic.objects.filter(
            category__slug=settings.PRIVATE_CATEGORY).order_by('-last_active')[0:5]

        context['recent'] = get_filtered_posts(recent_topics)
        context['popular'] = get_filtered_posts(popular_topics)
        context['mode'] = 'electricity'

        return context
