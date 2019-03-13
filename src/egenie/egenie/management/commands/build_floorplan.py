# encoding:UTF-8

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

from django.core.management.base import BaseCommand, CommandError
from sd_store.models import *
import json

from django.contrib.auth.models import User
from PIL import Image
import os
import math


class Command(BaseCommand):
    """ Builds tiles that are suitable for leaflet. Given the images in static/ctech/updated_floorplan
        it crops them into suitable sized tiles and writes them out into ctech/static/ctech/imgs/tiles/.
        """
    help = 'Build floorplans for leaflet'

    def add_arguments(self, parser):
        parser.add_argument('level_1', type=str, nargs=1)
        parser.add_argument('level_2', type=str, nargs=1)
        parser.add_argument('level_3', type=str, nargs=1)
        parser.add_argument('level_4', type=str, nargs=1)
        parser.add_argument('level_5', type=str, nargs=1)

    def slice_image(self, image, path):
        tile_width = 256
        tile_height = 256

        (width, height) = image.size

        # Convert to multiple of tile_width/tile_height
        padded_w = int(math.ceil(float(width) / tile_width) * tile_width)
        padded_h = int(math.ceil(float(height) / tile_height) * tile_height)
        padded_im = Image.new('RGBA', (padded_w, padded_h), (255, 255, 255, 0))
        padded_im.paste(image, (0, 0, width, height))

        for x_i, x in enumerate(range(0, padded_w, tile_width)):
            for y_i, y in enumerate(range(0, padded_h, tile_height)):

                print(x_i, y_i, x, y)
                box = (x, y, x + tile_width - 1, y + tile_height - 1)
                print(box)
                cropped = padded_im.crop(box)
                cropped.save(path + "map_" + str(x_i) +
                             "_" + str(y_i) + ".png")

    def handle(self, *args, **options):
        LEVELS = [14, 15, 16, 17, 18]
        SCALES = [16, 8, 4, 2, 1]
        IMAGES = [args[0],
                  args[1] or args[0],
                  args[2] or args[0],
                  args[3] or args[0],
                  args[4] or args[0]]
        
        # IMAGES = ['floorplan_nocolour.png','floorplan_nocolour.png','floorplan_detailed.png','floorplan_detailed.png','floorplan_detailed.png']
        OUTPUT_PATH = '/static/egenie/imgs/tiles/'
        # Start off by working out the size of the largest image
        im = Image.open(IMAGES[0])
        (width, height) = im.size

        for i, level in enumerate(LEVELS):
            print(level, IMAGES[i])
            path = OUTPUT_PATH + str(level) + "/"
            try:
                os.makedirs(path)
            except:
                print(path + " exists")
            im = Image.open(IMAGES[i])
            im.thumbnail(
                (width / SCALES[i], height / SCALES[i]), Image.ANTIALIAS)
            im.save(path + "full.png")

            # Slice image
            self.slice_image(im, path)
