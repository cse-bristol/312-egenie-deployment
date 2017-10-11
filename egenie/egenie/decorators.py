from django.core.urlresolvers import reverse

from egenie.models import Participant


def agree_required(f):
    """ Some screens require that the user agrees to the study's conditions. If they have already agreed, they are forwarded on to the URL. Otherwise, they are redirected to an information page where they can choose to continue.

.. warning:: This is disabled at the moment (user=None rather than user=request.user).
    """

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
