# This file is part of e-genie
#
# e-genie is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# e-genie is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with e-genie.  If not, see <http://www.gnu.org/licenses/>.

import imaplib
import email
from django.core.management.base import BaseCommand
from django.db.transaction import atomic
from pinboard.models import UserPinboardProfile, PinboardPhoto
from django.core.files.base import ContentFile
import os
from django.conf import settings

class Command(BaseCommand):
    help = 'Import photos from email'
    
    @atomic
    def handle(self, *args, **options):
        valid_types = ['image/jpeg',]
        mail = imaplib.IMAP4_SSL(settings.IMAP_URL)
        mail.login(settings.IMAP_USER, settings.IMAP_PASS)
        mail.select('inbox')

        result, data = mail.search(None, '(SEEN)')
        for mail_id in data[0].split():
            result, mail_data = mail.fetch(mail_id, '(RFC822)')
            email_message = email.message_from_string(str(mail_data[0][1]))
            for part in email_message.walk():
                ctype = part.get_content_type()
                if ctype in valid_types:
                    photo = PinboardPhoto()
                    payload = part.get_payload(decode=True)
                    photo.image.save(os.path.basename(part.get_filename()), ContentFile(payload))
                    photo.save()