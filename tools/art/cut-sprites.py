"""
Cut the transparent sprite sheet (tools/art/sprite-sheet.png) into separate images
in static/img/art/<name>.webp.

    python tools/art/cut-sprites.py [--preview out.png]

The sheet's "transparent" background still has alpha 1-15 in places (it shows as dark
fringes), so alpha below CUTOFF is cleared first. Each sprite has a hand-placed box;
inside it only the largest connected shape is kept ('largest'), or every shape that
lies fully inside the box ('all', e.g. the robot and its sparkles), so neighbours that
reach into the box are dropped.
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
SHEET = os.path.join(os.path.dirname(__file__), 'sprite-sheet.png')
OUT = os.path.join(ROOT, 'static', 'img', 'art')
CUTOFF = 40

# name: (x0, y0, x1, y1, mode)
SPRITES = {
    'robot': (0, 10, 368, 352, 'all'),
    'panel-scene': (400, 26, 738, 372, 'largest'),
    'panel-tools': (735, 44, 826, 352, 'largest'),
    'panel-events': (848, 10, 1212, 402, 'largest'),
    'island': (12, 358, 862, 850, 'largest'),
    'penguin': (0, 733, 114, 862, 'largest'),
    'monster': (110, 743, 224, 862, 'largest'),
    'sprout-block': (222, 752, 315, 852, 'largest-nodark'),
    'icon-bar': (792, 412, 1212, 558, 'largest'),
    'tile-gamepad': (1220, 12, 1398, 172, 'largest'),
    'tile-gear': (1406, 6, 1588, 168, 'largest'),
    'tile-code': (1596, 10, 1780, 172, 'largest'),
    'tile-play': (1226, 172, 1392, 312, 'largest'),
    'dirt-block': (1400, 198, 1528, 312, 'largest'),
    'coin': (1530, 198, 1636, 308, 'largest'),
    'flag': (1642, 176, 1758, 328, 'largest'),
    'tree': (1228, 316, 1358, 468, 'largest'),
    'rock': (1368, 338, 1502, 452, 'largest'),
    'mushroom': (1520, 333, 1630, 448, 'largest'),
    'star': (1652, 335, 1768, 452, 'largest'),
    'fence': (1220, 486, 1342, 588, 'largest'),
    'bridge': (1348, 478, 1512, 598, 'largest'),
    'waterfall': (1510, 460, 1650, 602, 'largest'),
    'grass-block': (1646, 486, 1772, 598, 'largest'),
    'coin-small': (860, 570, 957, 678, 'largest'),
    'flag-small': (953, 561, 1062, 714, 'largest'),
    'tree-small': (1066, 568, 1172, 692, 'largest'),
    'rock-small': (1190, 608, 1297, 702, 'largest'),
    'mushroom-small': (1378, 613, 1467, 712, 'largest'),
    'star-small': (1493, 616, 1587, 707, 'largest'),
    'cube-grass': (658, 726, 802, 848, 'largest'),
    'cube-water': (803, 726, 927, 848, 'largest'),
    'cube-stone': (928, 726, 1042, 838, 'largest'),
    'block-when': (1053, 733, 1264, 812, 'largest'),
    'block-collide': (1268, 731, 1562, 809, 'largest'),
    'block-sound': (1563, 731, 1788, 807, 'largest'),
    'block-add': (1268, 806, 1562, 870, 'largest'),
}

im = np.array(Image.open(SHEET).convert('RGBA'))
a = im[..., 3].astype(np.float32)
a = np.clip((a - CUTOFF) * 255 / (255 - CUTOFF), 0, 255)
im[..., 3] = a.astype(np.uint8)
os.makedirs(OUT, exist_ok=True)

preview = sys.argv[sys.argv.index('--preview') + 1] if '--preview' in sys.argv else None
cards = []
for name, (x0, y0, x1, y1, mode) in SPRITES.items():
    crop = im[y0:y1, x0:x1].copy()
    if mode.endswith('-nodark'):
        # Drop the island tray's dark navy pixels that overlap this sprite in the sheet.
        rgb = crop[..., :3].astype(np.int32)
        mx, mn = rgb.max(axis=2), rgb.min(axis=2)
        navy = (rgb[..., 0] < 95) & (rgb[..., 2] > rgb[..., 0]) & (rgb[..., 1] < 150)
        navy[int(crop.shape[0] * 0.3):] = False  # the tray only overlaps the top edge
        crop[..., 3] = np.where(navy, 0, crop[..., 3])
        mode = mode[:-len('-nodark')]
    shape = ndimage.binary_dilation(crop[..., 3] > 140, iterations=1)
    labels, n = ndimage.label(shape)
    if n == 0:
        print('empty', name)
        continue
    if mode == 'largest':
        sizes = ndimage.sum(shape, labels, range(1, n + 1))
        keep = labels == (int(np.argmax(sizes)) + 1)
    else:
        keep = np.zeros_like(shape)
        for i, sl in enumerate(ndimage.find_objects(labels), start=1):
            touches = sl[0].start == 0 or sl[1].start == 0 or sl[0].stop == shape.shape[0] or sl[1].stop == shape.shape[1]
            size = (labels[sl] == i).sum()
            if size > 40 and (not touches or size > 2000):
                keep |= labels == i
    crop[..., 3] = np.where(keep, crop[..., 3], 0)
    # Trim to the kept pixels (+2 px).
    ys, xs = np.nonzero(crop[..., 3] > 0)
    crop = crop[max(0, ys.min() - 2):ys.max() + 3, max(0, xs.min() - 2):xs.max() + 3]
    img = Image.fromarray(crop)
    img.save(os.path.join(OUT, name + '.webp'), quality=90, method=6)
    cards.append((name, img))
print(len(cards), 'sprites ->', os.path.normpath(OUT))

if preview:
    cell = 220
    cols = 8
    rows = (len(cards) + cols - 1) // cols
    sheet = Image.new('RGBA', (cols * cell, rows * (cell + 20)), (40, 44, 52, 255))
    d = ImageDraw.Draw(sheet)
    for i, (name, img) in enumerate(cards):
        t = img.copy()
        t.thumbnail((cell - 10, cell - 10))
        x, y = (i % cols) * cell, (i // cols) * (cell + 20)
        sheet.alpha_composite(t, (x + (cell - t.width) // 2, y + (cell - t.height) // 2))
        d.text((x + 6, y + cell + 4), name, fill=(255, 255, 255, 255))
    sheet.convert('RGB').save(preview)
