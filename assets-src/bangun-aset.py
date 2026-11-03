# Membangun assets.js dari gambar di assets-src/masuk.
# Pakai: python -I bangun-aset.py <folder masuk> <folder olah> <assets.js>
# Gambar batch 2 (Misi 2-5) dibaca dari folder masuk2 di sebelah folder masuk.
# Isi: potong tokoh dan objek dari latar putih, olah latar, hitung tepi sungai,
# lalu tanam semua sebagai base64 WebP supaya game jalan dari file:// tanpa internet.
import sys, io, json, base64, os
import numpy as np
import cv2
from PIL import Image
from scipy import ndimage as ni

SRC, PREV, OUTJS = sys.argv[1], sys.argv[2], sys.argv[3]
FONTDIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'font')
os.makedirs(PREV, exist_ok=True)

ASET, META = {}, {}


def put(key, im, q=84):
    b = io.BytesIO()
    im.save(b, 'WEBP', quality=q, method=6, alpha_quality=92)
    ASET[key] = 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
    im.save(f'{PREV}/{key}.png')
    print(f'{key:22s} {im.size[0]:5d}x{im.size[1]:<5d} {len(b.getvalue()) // 1024:5d} KB')


def load(name, folder=None):
    return Image.open(f'{folder or SRC}/{name}.png').convert('RGB')


SRC2 = os.path.join(os.path.dirname(os.path.abspath(SRC)), 'masuk2')


# ---------- potong latar putih ----------
def cutout(im, min_hole=150):
    a = np.asarray(im).astype(float)
    dist = np.sqrt(((255 - a) ** 2).sum(axis=2))
    lab, _ = ni.label(dist < 40)
    edge = np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])
    bg = np.isin(lab, edge[edge > 0])
    # lubang putih yang tertutup (sela tangan, lubang ban). Gigi lebih krem, jadi tidak ikut.
    for i, s in enumerate(ni.find_objects(lab), 1):
        if i in edge:
            continue
        m = lab[s] == i
        if m.sum() >= min_hole and np.percentile(dist[s][m], 10) < 6:
            bg[s] |= m
    fg = ni.binary_opening(~bg, iterations=1)
    fg = ni.binary_erosion(fg, iterations=1)
    alpha = np.clip(ni.gaussian_filter(fg.astype(float), 0.8) * 1.6 - 0.45, 0, 1)
    al = alpha[..., None]
    rgb = np.where(al > 0.02, np.clip((a - 255 * (1 - al)) / np.maximum(al, 0.02), 0, 255), a)
    rgb = np.where(ni.binary_erosion(fg, iterations=2)[..., None], a, rgb)
    return np.dstack([rgb, alpha * 255]).astype('uint8'), fg


def pieces(rgba, fg, grow, min_area):
    lab, _ = ni.label(ni.binary_dilation(fg, iterations=grow))
    out = []
    for s in ni.find_objects(lab):
        if (s[0].stop - s[0].start) * (s[1].stop - s[1].start) > min_area:
            out.append(s)
    return out


# ---------- tokoh: 3 pose per lembar ----------
TOKOH = {'ibu': 'tokoh-ibu', 'bapak': 'tokoh-bapak', 'kepala': 'tokoh-kepala-kampung',
         'keriting': 'tokoh-keriting', 'kakek': 'tokoh-kakek',
         'anakp': 'tokoh-anak-perempuan', 'anakl': 'tokoh-anak-laki'}
TINGGI_REF = 520  # tinggi pose pertama pada tekstur

sheet_prev = []
for key, fn in TOKOH.items():
    rgba, fg = cutout(load(fn))
    boxes = pieces(rgba, fg, 10, 20000)
    boxes.sort(key=lambda s: s[1].start)
    assert len(boxes) == 3, (key, len(boxes))
    crops, cores = [], []
    for s in boxes:
        c = rgba[s]
        core = ni.binary_opening(c[..., 3] > 128, structure=np.ones((25, 25)))
        ys, xs = np.nonzero(core)
        cores.append((xs.mean(), ys.max(), ys.max() - ys.min()))
        crops.append(c)
    k = TINGGI_REF / cores[0][2]
    for i, c in enumerate(crops):
        im = Image.fromarray(c)
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        ax, ay = cores[i][0] * k, (cores[i][1] + 1) * k
        put(f'{key}-{i}', im, 86)
        META[f'{key}-{i}'] = {'ox': round(ax / im.width, 4), 'oy': round(ay / im.height, 4)}
        sheet_prev.append(im)
W = sum(i.width for i in sheet_prev) + 10 * len(sheet_prev)
H = max(i.height for i in sheet_prev)
ks = Image.new('RGBA', (W, H), (156, 191, 31, 255))
x = 0
for im in sheet_prev:
    ks.alpha_composite(im, (x, 0)); x += im.width + 10
ks.convert('RGB').resize((W // 4, H // 4), Image.LANCZOS).save(f'{PREV}/_kontak-tokoh.png')

# ---------- objek ----------
rgba, fg = cutout(load('objek'))
boxes = pieces(rgba, fg, 5, 3000)
assert len(boxes) == 12, len(boxes)
rows = sorted(boxes, key=lambda s: (s[0].start + s[0].stop) / 2)
r1 = sorted(rows[:6], key=lambda s: s[1].start)
r2 = sorted(rows[6:9], key=lambda s: s[1].start)
r3 = sorted(rows[9:], key=lambda s: s[1].start)
names = ['botol', 'kresek', 'kaleng', 'ban', 'kardus', 'kulit', 'ikan-oren', 'ikan-biru', 'karung', 'papan', 'tombol', 'tombol-kotak']
maks = {'botol': 150, 'kresek': 150, 'kaleng': 150, 'ban': 170, 'kardus': 170, 'kulit': 150,
        'ikan-oren': 150, 'ikan-biru': 150, 'karung': 230}
tinggi = {'papan': 190, 'tombol': 120, 'tombol-kotak': 120}
kontak = []
for nm, s in zip(names, r1 + r2 + r3):
    c = Image.fromarray(rgba[s])
    if nm in tinggi:
        k = tinggi[nm] / c.height
    else:
        k = maks[nm] / max(c.size)
    c = c.resize((round(c.width * k), round(c.height * k)), Image.LANCZOS)
    if nm.startswith('tombol') or nm == 'papan':  # kayu dibuat lebih tua supaya teks krem terbaca dari jauh
        a = np.asarray(c).astype(float)
        a[..., :3] *= 0.74
        c = Image.fromarray(a.clip(0, 255).astype('uint8'))
    put(nm, c, 88)
    kontak.append(c)
Wk = sum(i.width for i in kontak) + 10 * len(kontak)
ko = Image.new('RGBA', (Wk, 260), (156, 191, 31, 255))
x = 0
for im in kontak:
    ko.alpha_composite(im, (x, 0)); x += im.width + 10
ko.convert('RGB').save(f'{PREV}/_kontak-objek.png')

# ---------- batch 2: tokoh dengan pose kerja ----------
# tinggi berdiri tiap lembar (piksel sumber, kepala sampai kaki), supaya ukuran tokoh sama dengan batch 1
TOKOH2 = {'bapak': ('tokoh-bapak-b', 4, 686), 'ibu': ('tokoh-ibu-b', 4, 700), 'keriting': ('tokoh-keriting-b', 4, 663),
          'kakek': ('tokoh-kakek-b', 3, 790), 'anakp': ('tokoh-anak-perempuan-b', 3, 780),
          'anakl': ('tokoh-anak-laki-b', 3, 815), 'kepala': ('tokoh-kepala-kampung-b', 3, 837)}


def potong_label(rgba, fg, grow, min_area):
    # seperti pieces(), tetapi bagian tetangga di dalam kotak dibuang
    lab, _ = ni.label(ni.binary_dilation(fg, iterations=grow))
    out = []
    for i, s in enumerate(ni.find_objects(lab), 1):
        if (s[0].stop - s[0].start) * (s[1].stop - s[1].start) > min_area:
            c = rgba[s].copy()
            c[..., 3][lab[s] != i] = 0
            out.append((s, c))
    return out


for key, (fn, n, berdiri) in TOKOH2.items():
    rgba, fg = cutout(load(fn, SRC2))
    bag = potong_label(rgba, fg, 6, 20000)
    bag.sort(key=lambda b: b[0][1].start)
    assert len(bag) == n, (key, len(bag))
    k = TINGGI_REF / berdiri
    for i, (s, c) in enumerate(bag):
        core = ni.binary_opening(c[..., 3] > 128, structure=np.ones((25, 25)))
        ys, xs = np.nonzero(core)
        im = Image.fromarray(c)
        im2 = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        put(f'{key}-b{i}', im2, 86)
        META[f'{key}-b{i}'] = {'ox': round(xs.mean() * k / im2.width, 4), 'oy': round((ys.max() + 1) * k / im2.height, 4)}
        if key == 'keriting' and i == 2:  # puncak tiang, tempat kain bendera dipasang
            al = c[..., 3] > 128
            top = np.nonzero(al.any(axis=1))[0][0]
            xt = np.nonzero(al[top + 6])[0].mean()
            META['tiangKeriting'] = {'x': round(xt * k / im2.width, 4), 'y': round(top * k / im2.height, 4)}

# ---------- batch 2: objek ----------
rgba, fg = cutout(load('objek-2', SRC2), min_hole=60)
bag = potong_label(rgba, fg, 5, 3000)
assert len(bag) == 9, len(bag)
bag.sort(key=lambda b: (b[0][0].start + b[0][0].stop) / 2)
urut = sorted(bag[:3], key=lambda b: b[0][1].start) + sorted(bag[3:6], key=lambda b: b[0][1].start) + sorted(bag[6:], key=lambda b: b[0][1].start)
for nm, mx, (s, c) in zip(['mobil', 'sepeda', 'gerobak', 'batu-tumpuk', 'karung-pasir', 'bata', 'papan-tumpuk', 'ember', 'pasir'],
                          [340, 260, 280, 230, 190, 230, 240, 170, 240], urut):
    im = Image.fromarray(c)
    k = mx / max(im.size)
    put(nm, im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS), 88)

# ---------- latar ----------
def desat(im, f):
    h, s, v = im.convert('HSV').split()
    s = s.point(lambda p: int(p * f))
    return Image.merge('HSV', (h, s, v)).convert('RGB')


def hsv(im):
    h, s, v = [np.asarray(c).astype(int) for c in im.convert('HSV').split()]
    return h, s, v


GW, GH = 1600, 900
misi1 = desat(load('latar-misi1'), 0.9).resize((GW, GH), Image.LANCZOS)
put('latar-misi1', misi1, 84)
put('latar-judul', desat(load('latar-judul'), 0.9).resize((GW, GH), Image.LANCZOS), 84)

# sungai: topeng biru -> lapisan keruh + tepi sungai per baris
h, s, v = hsv(misi1)
m = (h >= 128) & (h <= 165) & (s > 70) & (v > 140)
lab, n = ni.label(ni.binary_closing(m, iterations=3))
big = np.argmax(ni.sum(m, lab, range(1, n + 1))) + 1
river = ni.binary_fill_holes(ni.binary_closing(lab == big, iterations=8))
Image.fromarray((river * 255).astype('uint8')).resize((640, 360)).save(f'{PREV}/_topeng-sungai.png')
a = np.asarray(misi1).astype(float)
lum = (a @ np.array([0.3, 0.59, 0.11])) / 255
base = np.array([122, 94, 60])
murky = base[None, None, :] * (0.72 + 0.55 * lum[..., None])
al = np.clip(ni.gaussian_filter(ni.binary_dilation(river, iterations=5).astype(float), 2), 0, 1) * 0.94
keruh = np.dstack([murky.clip(0, 255), al * 255]).astype('uint8')
put('sungai-keruh', Image.fromarray(keruh), 80)
rm = np.asarray(Image.fromarray((river * 255).astype('uint8')).resize((1280, 720))) > 127
edges = []
for y in range(0, 720, 8):
    xs = np.nonzero(rm[y])[0]
    if len(xs):
        edges.append([y, int(xs.min()), int(xs.max())])
META['sungaiTepi'] = edges

# ---------- peta menu ----------
peta = np.asarray(desat(load('peta-beres'), 0.9)).astype(float)


def fix_flag(arr, box):
    x0, y0, x1, y1 = box
    c = arr[y0:y1, x0:x1]
    red = (c[..., 0] > 170) & (c[..., 1] < 120) & (c[..., 2] < 100)
    lab, n = ni.label(red)
    comps = sorted([(ni.center_of_mass(lab == i)[0], i) for i in range(1, n + 1) if (lab == i).sum() > 200])
    print('bendera', box, 'bagian merah:', len(comps))
    if len(comps) == 2:  # merah-putih-merah: bagian merah bawah dihapus dan diisi latar
        low = ni.binary_dilation(lab == comps[1][1], iterations=3)
        reg = np.ascontiguousarray(c.clip(0, 255).astype('uint8'))
        fixed = cv2.inpaint(reg, low.astype('uint8') * 255, 6, cv2.INPAINT_TELEA)
        c[...] = fixed


fix_flag(peta, (235, 520, 305, 650))
fix_flag(peta, (630, 545, 690, 660))
petaim = Image.fromarray(peta.clip(0, 255).astype('uint8')).resize((GW, GH), Image.LANCZOS)
put('peta', petaim, 84)

# versi kusam dibagi per tempat dengan pembagian lembut (jumlah bobot = 1)
HP = np.asarray(petaim.convert('HSV')).copy()
HP[..., 1] = (HP[..., 1] * 0.32).astype('uint8')
dull = np.asarray(Image.fromarray(HP, 'HSV').convert('RGB')).astype(float)
dull = dull * 0.92 * np.array([1.0, 0.96, 0.88])
sc = GW / 1672
tempat = [(190, 300, 320, 240), (800, 290, 300, 220), (1390, 250, 320, 230), (450, 690, 460, 230), (1330, 700, 330, 220)]
yy, xx = np.mgrid[0:GH, 0:GW]
wts = []
for cx, cy, rx, ry in tempat:
    d2 = ((xx - cx * sc) / (rx * sc)) ** 2 + ((yy - cy * sc) / (ry * sc)) ** 2
    wts.append(np.exp(-d2 / (2 * 0.55 ** 2)))
tot = np.sum(wts, axis=0) + 1e-9
for i, w in enumerate(wts, 1):
    alpha = w / tot
    ys, xs = np.nonzero(alpha > 0.01)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    piece = np.dstack([dull, alpha * 255])[y0:y1, x0:x1].astype('uint8')
    put(f'kusam-{i}', Image.fromarray(piece), 80)
    META[f'kusam-{i}'] = {'x': int(x0), 'y': int(y0)}

# ---------- batch 2: latar ----------
for nm in ['latar-misi2-1', 'latar-misi2-2', 'latar-misi2-3', 'latar-misi2-4', 'latar-misi3-1', 'latar-misi3-2', 'latar-misi3-3', 'latar-misi3-4']:
    put(nm, desat(load(nm, SRC2), 0.9).resize((GW, GH), Image.LANCZOS), 82)
m4 = desat(load('latar-misi4', SRC2), 0.9).resize((GW, GH), Image.LANCZOS)
put('latar-misi4', m4, 82)
hp = np.asarray(m4.convert('HSV')).copy()
hp[..., 1] = (hp[..., 1] * 0.25).astype('uint8')
d4 = np.asarray(Image.fromarray(hp, 'HSV').convert('RGB')).astype(float) * 0.86 * np.array([1.0, 0.96, 0.88])
put('latar-misi4-kusam', Image.fromarray(d4.clip(0, 255).astype('uint8')), 80)
put('latar-misi5', desat(load('latar-misi5', SRC2), 0.92).resize((GW, GH), Image.LANCZOS), 84)

# ---------- font ----------
css = ''
for fam, fn, wt in (('Andika', 'andika-700.woff2', 700), ('Baloo 2', 'baloo2-800.woff2', 800)):
    b64 = base64.b64encode(open(f'{FONTDIR}/{fn}', 'rb').read()).decode()
    css += "@font-face{font-family:'%s';font-weight:%d;src:url(data:font/woff2;base64,%s) format('woff2');}" % (fam, wt, b64)

total = sum(len(v) for v in ASET.values()) + len(css)
with open(OUTJS, 'w', encoding='utf-8') as f:
    f.write('// Dibuat oleh assets-src/bangun-aset.py. Jangan diedit tangan.\n')
    f.write('const ASET = ' + json.dumps(ASET) + ';\n')
    f.write('const ASET_META = ' + json.dumps(META) + ';\n')
    f.write('const FONT_CSS = ' + json.dumps(css) + ';\n')
print('assets.js', total // 1024, 'KB')
