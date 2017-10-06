from django.core.urlresolvers import reverse

from egenie.models import Participant


def agree_required(f):
    def wrapped(request, *args, **kwargs):
        url = reverse('info')
        participants = Participant.objects.filter(user=None)
        if participants.count() != 1:
            return f(request, *args, **kwargs)
        else:
            participant = participants[0]
            if not participant.agreed:
                return HttpResponseRedirect(url + '?next=' + request.get_full_path())
            else:
                return f(request, *args, **kwargs)
    return wrapped
