// Kerja Bakti Beneran - simulasi bermisi gotong royong (Modul Ajar, Lampiran 7A)
// Phaser 3 dimuat dari lib/phaser.min.js supaya tetap jalan tanpa internet.

const W = 1280, H = 720;
const FONT = "'Andika', 'Trebuchet MS', sans-serif";      // teks baca (aset: assets.js)
const DISPLAY = "'Baloo 2', 'Andika', sans-serif";         // judul
const CREAM = 0xFFF9E0;
const GREEN = 0x2F7A38, RED = 0xC8402F, LIME = 0x9CBF1F, MUSTARD = 0xD9A32E, TEAL = 0x3FA796;
const INK = '#4A2B12', KRIM = '#FFF3D0';
const SELESAI = new Set();   // misi yang sudah beres, hanya selama sesi (tanpa database)
const LIHAT = new Set();     // misi yang perubahan petanya sudah diperlihatkan

// Teks narasi: Lampiran 1B modul
const NARASI = {
  1: 'Sungai di dekat kampung penuh sampah. Awalnya hanya satu warga yang memungut sampah, dan pekerjaan terasa lambat. Ketika warga lain datang membawa karung dan sapu, sampah cepat berkurang. Sungai menjadi bersih dan airnya mengalir lancar. Anak-anak membantu di tepi dan tidak masuk ke dalam air.',
  2: 'Jalan kampung berlubang dan sulit dilewati. Warga membawa pasir, batu, dan cangkul. Mereka bekerja bergantian sambil saling menyemangati. Jalan pun rata dan aman dilewati semua orang.',
  3: 'Balai desa adalah milik semua warga. Bapak-bapak mengangkat bata dan mengaduk semen. Ibu-ibu menyiapkan minuman. Anak-anak membantu membawa barang yang ringan. Balai desa pun selesai dibangun bersama-sama.',
  4: 'Menjelang tujuh belas Agustus, warga membersihkan jalan kampung. Mereka memasang bendera merah putih dan umbul-umbul. Semua ikut bekerja dengan gembira untuk menyambut Hari Ulang Tahun Republik Indonesia.',
  5: 'Hari mulai gelap dan warga ingin kampung mereka aman. Pos ronda harus segera jadi. Ada warga yang mengangkat papan, memaku, dan mengecat. Ada juga warga yang hanya berdiri melihat. Bantu kepala kampung memilih warga yang ikut membantu sebelum waktu habis.',
};
const JUDUL = {
  1: 'Bersihkan Sungai', 2: 'Perbaiki Jalan', 3: 'Bangun Balai Desa',
  4: 'Sambut HUT RI', 5: 'Pos Ronda Darurat',
};

// ---------- suara ----------
let AC = null;
function ac() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* tanpa suara */ } }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(f, dur, type, vol, delay, f2) {
  const a = ac(); if (!a) return;
  const t = a.currentTime + (delay || 0);
  const o = a.createOscillator(), g = a.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(vol || 0.2, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(a.destination);
  o.start(t); o.stop(t + dur);
}
function noise(dur, vol, delay) {
  const a = ac(); if (!a) return;
  const n = Math.floor(a.sampleRate * dur);
  const b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = a.createBufferSource(); s.buffer = b;
  const g = a.createGain(); g.gain.value = vol;
  const f = a.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1200;
  s.connect(f); f.connect(g); g.connect(a.destination);
  s.start(a.currentTime + (delay || 0));
}
const SFX = {
  tap: () => tone(660, 0.08, 'square', 0.06),
  pop: () => tone(500, 0.12, 'sine', 0.2, 0, 900),
  bell: () => { tone(880, 0.8, 'sine', 0.2); tone(1320, 0.6, 'sine', 0.1, 0.02); },
  knock: () => tone(120, 0.12, 'triangle', 0.3, 0, 60),
  oops: () => tone(330, 0.35, 'sine', 0.15, 0, 200),
  star: () => [784, 988, 1175].forEach((f, i) => tone(f, 0.25, 'triangle', 0.18, i * 0.1)),
  clap: () => { for (let i = 0; i < 10; i++) noise(0.07, 0.18, i * 0.11); },
};
function sfx(name) { try { if (SFX[name]) SFX[name](); } catch (e) { /* abaikan */ } }

// ---------- musik latar ----------
// Lagu ceria dibuat langsung dari osilator (tanpa berkas audio): C - Am - F - G, 132 bpm, diulang terus.
const MUSIK = {
  langkah: 60 / 132 / 2,   // satu not per-delapan
  bass: [[48, 55], [45, 52], [41, 48], [43, 50]],
  akor: [[60, 64, 67], [57, 60, 64], [57, 60, 65], [59, 62, 67]],
  lagu: [
    79, 0, 79, 81, 79, 76, 72, 76,
    81, 0, 81, 84, 81, 79, 76, 0,
    77, 0, 77, 79, 81, 79, 77, 72,
    74, 0, 79, 77, 74, 71, 74, 0,
  ],
};
let musikGain = null, musikNoise = null, musikNext = 0, musikStep = 0, musikTimer = null;
function nada(m, t, dur, type, vol) {
  const a = AC, o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(musikGain);
  o.start(t); o.stop(t + dur + 0.02);
}
function musikLangkah(i, t) {
  const bar = (i >> 3) & 3, k = i & 7, d = MUSIK.langkah;
  if (k === 0 || k === 4) nada(MUSIK.bass[bar][k / 4], t, d * 1.8, 'sine', 0.55);
  if (k === 2 || k === 6) MUSIK.akor[bar].forEach((m) => nada(m, t, d * 0.9, 'triangle', 0.16));
  if (MUSIK.lagu[i]) nada(MUSIK.lagu[i], t, d * 1.5, 'triangle', 0.4);
  if (k & 1) {   // kocokan halus di sela ketukan
    const s = AC.createBufferSource(), g = AC.createGain();
    s.buffer = musikNoise;
    g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    s.connect(g); g.connect(musikGain); s.start(t);
  }
}
function musikJalan() {
  const a = AC;
  if (musikNext < a.currentTime) musikNext = a.currentTime + 0.05;
  while (musikNext < a.currentTime + 0.4) {
    musikLangkah(musikStep, musikNext);
    musikStep = (musikStep + 1) % 32;
    musikNext += MUSIK.langkah;
  }
}
function mulaiMusik() {
  if (musikTimer) return;
  try {
    const a = ac(); if (!a) return;
    musikGain = a.createGain(); musikGain.gain.value = 0.1; musikGain.connect(a.destination);
    const n = Math.floor(a.sampleRate * 0.05);
    musikNoise = a.createBuffer(1, n, a.sampleRate);
    const d = musikNoise.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    musikJalan();
    musikTimer = setInterval(musikJalan, 100);
  } catch (e) { /* tanpa musik */ }
}
['pointerdown', 'keydown'].forEach((e) => document.addEventListener(e, mulaiMusik, { once: true }));
document.addEventListener('visibilitychange', () => {   // diam saat tab disembunyikan
  if (!AC) return;
  if (document.hidden) AC.suspend(); else AC.resume();
});
function speak(text) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'id-ID'; u.rate = 0.9;
    speechSynthesis.speak(u);
  } catch (e) { /* teks tetap tampil di layar */ }
}
function hush() { try { speechSynthesis.cancel(); } catch (e) { /* abaikan */ } }

// ---------- komponen gambar ----------
function txt(s, x, y, str, size, color, extra) {
  return s.add.text(x, y, str, Object.assign({
    fontFamily: FONT, fontSize: size + 'px', fontStyle: 'bold', color: color || INK, align: 'center',
  }, extra || {})).setOrigin(0.5);
}

function judul(s, x, y, str, size, color, extra) {
  return txt(s, x, y, str, size, color, Object.assign({ fontFamily: DISPLAY, fontStyle: '800' }, extra || {}));
}

// kertas krem dengan bayangan lembut, untuk balon ucapan dan kartu hasil
function kertas(s, x, y, w, h, o) {
  o = o || {};
  const r = o.r || 26, g = s.add.graphics({ x, y });
  g.fillStyle(0x5A3418, 0.08); g.fillRoundedRect(-w / 2, -h / 2 + 12, w, h, r);
  g.fillStyle(0x5A3418, 0.10); g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, r);
  g.fillStyle(o.fill || 0xFFFBEA, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, r);
  g.lineStyle(o.bw || 5, o.border || GREEN, 1); g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
  return g;
}

// papan kayu 9-slice: sudutnya tidak melar, tinggi tekstur menentukan skala
function kayu(s, key, w, h, ins) {
  const tinggi = s.textures.get(key).getSourceImage().height, k = h / tinggi;
  return s.add.nineslice(0, 0, key, null, w / k, tinggi, ins[0], ins[1], ins[2], ins[3]).setScale(k);
}
const KAYU_TOMBOL = [50, 50, 40, 40], KAYU_PAPAN = [110, 110, 60, 55];

function button(s, x, y, w, h, label, cb, size) {
  const c = s.add.container(x, y);
  const sh = s.add.graphics();
  sh.fillStyle(0x3a1f0a, 0.10); sh.fillRoundedRect(-w / 2, -h / 2 + 12, w, h, h * 0.4);
  sh.fillStyle(0x3a1f0a, 0.14); sh.fillRoundedRect(-w / 2 + 2, -h / 2 + 7, w, h, h * 0.4);
  const body = kayu(s, 'tombol', w, h, KAYU_TOMBOL);
  const t = txt(s, 0, 0, label, size || 32, KRIM, { wordWrap: { width: w - 40 } });
  c.add([sh, body, t]);
  c.setSize(w, h).setInteractive({ useHandCursor: true });
  c.disabled = false;
  c.on('pointerover', () => { if (!c.disabled) c.setScale(1.04); });
  c.on('pointerout', () => c.setScale(1));
  c.on('pointerdown', () => { if (c.disabled) return; sfx('tap'); c.setScale(0.97); cb(); });
  c.on('pointerup', () => { if (!c.disabled) c.setScale(1.04); });
  c.setEnabled = (on) => { c.disabled = !on; body.setTint(on ? 0xffffff : 0x8c8c8c); c.setAlpha(on ? 1 : 0.75); if (!on) c.setScale(1); };
  return c;
}

// kartu jawaban Misi 5: kartu kertas hijau atau merah, tulisan besar supaya tidak bergantung pada warna
function kartuJawab(s, x, y, w, h, warna, besar, kecil, miring, cb) {
  const c = s.add.container(x, y).setDepth(30).setAngle(miring);
  const g = s.add.graphics();
  g.fillStyle(0x2b1a0a, 0.16); g.fillRoundedRect(-w / 2, -h / 2 + 8, w, h, 14);
  g.fillStyle(warna); g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
  g.lineStyle(3, 0xFFFDF6, 0.9); g.strokeRoundedRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 9);
  const a = judul(s, 0, 3, besar, 50, '#FFFDF6'), b = txt(s, 0, 0, kecil, 32, '#FFFDF6');
  const jarak = 26, total = a.width + jarak + b.width;
  a.setX(-total / 2 + a.width / 2); b.setX(total / 2 - b.width / 2);
  c.add([g, a, b]);
  c.setSize(w, h).setInteractive({ useHandCursor: true });
  c.on('pointerover', () => c.setScale(1.04));
  c.on('pointerout', () => c.setScale(1));
  c.on('pointerdown', () => { sfx('tap'); c.setScale(0.97); cb(); });
  c.on('pointerup', () => c.setScale(1.04));
  return c;
}

// balon ucapan kepala kampung; ekornya menunjuk kepalanya
function balonKepala(s, o) {
  const kepala = warga(s, 'kepala', o.x, o.y, o.k);
  const t = txt(s, 0, 0, o.teks, 32, INK, { wordWrap: { width: o.lebar } }).setDepth(21);
  const w = t.width + 56, h = t.height + 40, by = o.y - o.k * TOKOH_H.kepala - 28;
  const cx = 24 + w / 2, cy = by - h / 2;
  const kotak = kertas(s, cx, cy, w, h, { r: 26 }).setDepth(20);
  t.setPosition(cx, cy);
  const ekor = s.add.graphics().setDepth(20);
  const ex = Math.max(70, o.x);
  ekor.fillStyle(0xFFFBEA); ekor.fillTriangle(ex - 18, by - 3, ex + 18, by - 3, ex, by + 24);
  ekor.lineStyle(5, GREEN); ekor.lineBetween(ex - 18, by - 1, ex, by + 24); ekor.lineBetween(ex + 18, by - 1, ex, by + 24);
  let pudar = false;
  return {
    kepala, teks: t,
    pudar: () => { if (pudar) return; pudar = true; s.tweens.add({ targets: [kotak, ekor, t], alpha: 0, duration: 300 }); },
  };
}

// latar bertahap: gambar dengan kamera yang sama, memudar dari satu tahap ke tahap berikutnya
function platBertahap(s, kunci) {
  const img = kunci.map((k, i) => s.add.image(W / 2, H / 2, k).setDisplaySize(W, H).setDepth(0).setAlpha(i ? 0 : 1));
  return { ke: (i) => s.tweens.add({ targets: img[i], alpha: 1, duration: 650 }) };
}

// panah penanda giliran
function panah(s) {
  const c = s.add.container(0, 0).setDepth(23);
  const g = s.add.graphics();
  g.fillStyle(0x3a1f0a, 0.18); g.fillTriangle(-21, -20, 21, -20, 0, 24);
  g.fillStyle(MUSTARD); g.fillTriangle(-22, -26, 22, -26, 0, 18);
  g.fillRect(-9, -50, 18, 26);
  c.add(g);
  s.tweens.add({ targets: g, y: 12, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  return c;
}

// ucapan pendek yang muncul sebentar di atas kepala warga
function ucap(s, x, y, teks) {
  const t = txt(s, 0, 0, teks, 32, INK);
  const w = t.width + 40, xx = Phaser.Math.Clamp(x, w / 2 + 10, W - w / 2 - 10);
  const c = s.add.container(xx, y).setDepth(40);
  c.add([kertas(s, 0, 0, w, 64, { r: 20, bw: 4 }), t]);
  c.setScale(0.6);
  s.tweens.add({ targets: c, scale: 1, duration: 200, ease: 'Back.easeOut' });
  s.tweens.add({ targets: c, alpha: 0, duration: 300, delay: 1200, onComplete: () => c.destroy() });
}

function centang(s, x, y) {
  const g = s.add.graphics({ x, y });
  g.fillStyle(GREEN); g.fillCircle(0, 0, 27);
  g.lineStyle(7, 0xFFF3D0); g.beginPath(); g.moveTo(-12, 0); g.lineTo(-3, 10); g.lineTo(13, -9); g.strokePath();
  return g;
}

// kain bendera merah putih: merah di atas, digambar di kode supaya urutannya pasti benar
function kainBendera(s, x, y, w, h) {
  const g = s.add.graphics({ x, y });
  g.fillStyle(RED); g.fillRect(0, 0, w, h / 2);
  g.fillStyle(0xFFFDF6); g.fillRect(0, h / 2, w, h / 2);
  g.lineStyle(1.5, 0xC9BFA8, 1); g.strokeRect(0, h / 2, w, h / 2);
  return g;
}

// bintang berkilau saat jawaban benar
function kilau(s, x, y) {
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2, st = s.add.star(x, y, 5, 8, 20, MUSTARD).setDepth(45).setScale(0.4);
    s.tweens.add({ targets: st, x: x + Math.cos(a) * 110, y: y + Math.sin(a) * 90, scale: 1.1, alpha: 0, angle: 120, duration: 750, ease: 'Sine.easeOut', onComplete: () => st.destroy() });
  }
}

// ---------- tokoh gambar (3 pose per tokoh, ganti pose = bergerak) ----------
const TOKOH_H = { ibu: 330, bapak: 350, kepala: 330, keriting: 335, kakek: 315, anakp: 250, anakl: 255 };
function warga(s, nama, x, y, k) {
  const im = s.add.image(x, y, nama + '-0');
  im.setPose = (i) => {
    const m = ASET_META[nama + '-' + i];
    im.poseNo = i;
    return im.setTexture(nama + '-' + i).setOrigin(m.ox, m.oy);
  };
  im.setScale((k || 1) * TOKOH_H[nama] / 520).setPose(0).setDepth(10 + y / 100);   // di bawah UI (depth 20+)
  return im;
}

function confetti(s, n) {
  for (let i = 0; i < n; i++) {
    const r = s.add.rectangle(Phaser.Math.Between(0, W), -20, 12, 18,
      Phaser.Utils.Array.GetRandom([RED, 0xFFFDF6, MUSTARD, TEAL, LIME])).setDepth(60);
    s.tweens.add({
      targets: r, y: H + 30, angle: Phaser.Math.Between(-360, 360),
      duration: Phaser.Math.Between(1500, 2800), delay: Phaser.Math.Between(0, 800),
      onComplete: () => r.destroy(),
    });
  }
}

// ---------- scene dasar misi ----------
class Mission extends Phaser.Scene {
  constructor(key, n) { super(key); this.n = n; }

  create() {
    this.cameras.main.setBackgroundColor(CREAM);
    this.finished = false;
    this.narasi = null;
    this.build();
    this.hud();
  }

  hud() {
    kayu(this, 'papan', 560, 108, KAYU_PAPAN).setPosition(290, 56).setDepth(20);
    judul(this, 290, 66, 'Misi ' + this.n + ': ' + JUDUL[this.n], 38, KRIM).setDepth(21);
    const dengar = button(this, 985, 50, 220, 68, 'Dengar', () => this.showNarasi(), 32).setDepth(22);
    dengar.list[2].x = 24;   // geser tulisan, ikon speaker di kiri
    const ik = this.add.graphics({ x: -66, y: 0 });
    ik.fillStyle(0xFFF3D0); ik.fillRect(-14, -7, 9, 14);
    ik.fillPoints([{ x: -5, y: -7 }, { x: 8, y: -17 }, { x: 8, y: 17 }, { x: -5, y: 7 }], true);
    ik.lineStyle(3.5, 0xFFF3D0); ik.beginPath(); ik.arc(10, 0, 9, -0.9, 0.9); ik.strokePath();
    ik.beginPath(); ik.arc(10, 0, 17, -0.9, 0.9); ik.strokePath();
    dengar.add(ik);
    button(this, 1190, 50, 150, 68, 'Menu', () => { hush(); this.scene.start('Menu'); }, 32).setDepth(22);
    this.instruksiUI();
  }

  showNarasi() {
    if (this.narasi) { this.narasi.destroy(); this.narasi = null; hush(); return; }
    const c = this.add.container(W / 2, H - 150).setDepth(70);
    const bg = kertas(this, 0, 0, 1200, 250, { r: 30 });
    const hit = this.add.rectangle(0, 0, 1200, 250, 0xffffff, 0.001);
    const t = txt(this, 0, 0, NARASI[this.n], 32, INK, { wordWrap: { width: 1120 }, align: 'left' });
    c.add([bg, hit, t]);
    hit.setInteractive().on('pointerdown', () => { c.destroy(); this.narasi = null; hush(); });
    this.narasi = c;
    speak(NARASI[this.n]);
  }

  finish(msg, sub, stars) {
    if (this.finished) return;
    this.finished = true;
    SELESAI.add(this.n);
    sfx('clap');
    const shade = this.add.rectangle(W / 2, H / 2, W * 3, H * 5, 0x2b1a0a, 0.5).setDepth(80).setInteractive();
    const c = this.add.container(W / 2, H / 2).setDepth(81);
    const ada = !!stars, dy = ada ? 0 : 45;   // tanpa bintang, kartu lebih pendek
    c.add(kertas(this, 0, 0, 1060, ada ? 470 : 380, { r: 36, bw: 6 }));
    c.add(judul(this, 0, -150 + dy, msg, 52, '#2F7A38', { wordWrap: { width: 960 } }));
    c.add(txt(this, 0, -70 + dy, sub, 32, INK, { wordWrap: { width: 940 } }));
    if (stars) {
      for (let i = 0; i < 3; i++) {
        const s = this.add.star(-110 + i * 110, 28, 5, 24, 54, i < stars ? MUSTARD : 0xE6DCC0).setScale(0);
        c.add(s);
        this.tweens.add({ targets: s, scale: 1, duration: 320, delay: 350 + i * 260, ease: 'Back.easeOut' });
      }
      sfx('star');
    }
    const y = 160 - dy;
    c.add(button(this, this.n < 5 ? -345 : -170, y, 270, 80, 'Main lagi', () => { shade.destroy(); this.scene.restart(); }));
    if (this.n < 5) c.add(button(this, 0, y, 340, 80, 'Misi berikutnya', () => this.scene.start('M' + (this.n + 1))));
    c.add(button(this, this.n < 5 ? 345 : 170, y, 230, 80, 'Menu', () => this.scene.start('Menu')));
    c.setScale(0.85); this.tweens.add({ targets: c, scale: 1, duration: 260, ease: 'Back.easeOut' });
  }
}

// ---------- muat aset ----------
// Semua gambar dan font ditanam di assets.js (base64) supaya jalan dari file:// tanpa internet.
class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    this.cameras.main.setBackgroundColor(CREAM);
    this.add.text(W / 2, H / 2, 'Memuat...', { fontFamily: 'sans-serif', fontSize: '40px', color: INK }).setOrigin(0.5);
    const css = document.createElement('style');
    css.textContent = FONT_CSS;
    document.head.appendChild(css);
    const keys = Object.keys(ASET);
    let sisa = keys.length + 1, mulai = false;
    const lanjut = () => { if (!mulai) { mulai = true; this.scene.start('Title'); } };
    const done = () => { if (--sisa === 0) lanjut(); };
    Promise.all([document.fonts.load("700 32px 'Andika'"), document.fonts.load("800 32px 'Baloo 2'")]).then(done, done);
    keys.forEach((k) => { this.textures.once('addtexture-' + k, done); this.textures.addBase64(k, ASET[k]); });
    this.time.delayedCall(8000, lanjut);   // jaga-jaga kalau ada aset yang gagal
  }
}

// ---------- layar judul dan menu ----------
class Title extends Phaser.Scene {
  constructor() { super('Title'); }
  create() {
    this.cameras.main.setBackgroundColor(CREAM);
    this.add.image(W / 2, H / 2, 'latar-judul').setDisplaySize(W, H);
    const bayang = { shadow: { offsetX: 0, offsetY: 6, color: 'rgba(90,52,24,0.28)', blur: 10, fill: true } };
    judul(this, W / 2, 128, 'KERJA BAKTI', 112, '#2F7A38', bayang);
    judul(this, W / 2, 250, 'BENERAN', 150, '#2F7A38', bayang);
    const sapa = txt(this, W / 2, 360, 'Ayo jadi warga Kampung Gotong Royong!', 32, INK).setDepth(2);
    kertas(this, W / 2, 360, sapa.width + 36, sapa.height + 14, { r: 20, bw: 4 }).setDepth(1);

    // warga datang dari kiri dan kanan sambil melambai
    [['ibu', 190, 0.9, 0], ['anakp', 365, 0.95, 250], ['anakl', 915, 0.95, 450], ['bapak', 1090, 0.9, 150]].forEach(([n, x, k, tunda]) => {
      const w = warga(this, n, x < W / 2 ? -150 : W + 150, 690, k);
      this.tweens.add({ targets: w, x, duration: 1100, delay: tunda, ease: 'Sine.easeOut' });
      this.tweens.add({ targets: w, y: 678, duration: 160, delay: tunda, yoyo: true, repeat: 3 });
      this.tweens.add({ targets: w, angle: { from: -1.6, to: 1.6 }, duration: 900, delay: tunda + 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });
    button(this, W / 2, 575, 380, 104, 'Mulai', () => this.scene.start('Menu'), 48).setDepth(30);
  }
}

// lima tempat di peta: pusat tempat, daerah ketuk, dan posisi papan
const TEMPAT = [
  { n: 1, cx: 150, cy: 230, w: 330, h: 270, sx: 205, sy: 400 },
  { n: 2, cx: 615, cy: 225, w: 330, h: 260, sx: 615, sy: 372 },
  { n: 3, cx: 1070, cy: 195, w: 340, h: 260, sx: 1045, sy: 378 },
  { n: 4, cx: 345, cy: 520, w: 520, h: 280, sx: 345, sy: 648 },
  { n: 5, cx: 1020, cy: 530, w: 340, h: 250, sx: 1020, sy: 652 },
];

class Menu extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    this.cameras.main.setBackgroundColor(CREAM);
    this.add.image(W / 2, H / 2, 'peta').setDisplaySize(W, H);
    // tempat yang belum beres tampak kusam; yang baru selesai berubah cerah di depan mata
    TEMPAT.forEach((tp) => {
      const m = ASET_META['kusam-' + tp.n];
      const lapis = this.add.image(m.x * 0.8, m.y * 0.8, 'kusam-' + tp.n).setOrigin(0).setScale(0.8).setDepth(2);
      if (SELESAI.has(tp.n)) {
        if (LIHAT.has(tp.n)) lapis.destroy();
        else {
          LIHAT.add(tp.n);
          this.tweens.add({ targets: lapis, alpha: 0, duration: 1400, delay: 500, onStart: () => sfx('star'), onComplete: () => lapis.destroy() });
        }
      }
    });
    kayu(this, 'papan', 460, 104, KAYU_PAPAN).setPosition(W / 2, 52).setDepth(20);
    judul(this, W / 2, 62, 'Pilih Misi', 54, KRIM).setDepth(21);

    TEMPAT.forEach((tp) => {
      const zona = this.add.zone(tp.cx, tp.cy, tp.w, tp.h).setDepth(5).setInteractive({ useHandCursor: true });
      const papan = this.add.container(tp.sx, tp.sy).setDepth(10);
      const sh = this.add.graphics();
      sh.fillStyle(0x3a1f0a, 0.10); sh.fillRoundedRect(-190, -39 + 12, 380, 78, 30);
      sh.fillStyle(0x3a1f0a, 0.14); sh.fillRoundedRect(-188, -39 + 7, 380, 78, 30);
      papan.add([sh, kayu(this, 'tombol', 380, 78, KAYU_TOMBOL)]);
      const beres = SELESAI.has(tp.n);
      if (beres) papan.add(centang(this, -150, 0));
      else {
        const lencana = this.add.graphics({ x: -150, y: 0 });
        lencana.fillStyle(MUSTARD); lencana.fillCircle(0, 0, 27);
        papan.add([lencana, judul(this, -150, 3, String(tp.n), 38, INK)]);
      }
      papan.add(txt(this, 28, 0, JUDUL[tp.n], 30, KRIM, { wordWrap: { width: 310 } }));
      const buka = () => { sfx('tap'); this.scene.start('M' + tp.n); };
      zona.on('pointerdown', buka);
      zona.on('pointerover', () => papan.setScale(1.06));
      zona.on('pointerout', () => papan.setScale(1));
      papan.setSize(380, 78).setInteractive({ useHandCursor: true }).on('pointerdown', buka);
    });

    if (SELESAI.size === TEMPAT.length) {   // semua misi beres
      const k = warga(this, 'kepala', 80, 700, 0.8).setPose(2).setDepth(40);
      const t = txt(this, 0, 0, 'Kampung kita sudah beres!', 32, INK);
      const bw = t.width + 56;
      kertas(this, 150 + bw / 2, 505, bw, 76, { r: 24 }).setDepth(40);
      t.setPosition(150 + bw / 2, 505).setDepth(41);
      this.tweens.add({ targets: k, y: 690, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }
}

// ---------- Misi 1: Bersihkan Sungai ----------
// Anak hanya di tepi, tidak masuk ke air. Warga baru datang dari tepi layar lalu langsung bekerja.
const WARGA_M1 = [   // urutan datang; x,y = posisi kaki, k = skala (makin jauh makin kecil)
  { n: 'ibu', x: 215, y: 630, k: 1.0, kiri: true, kerja: [1, 2], ms: 480 },
  { n: 'bapak', x: 1170, y: 612, k: 1.05, kiri: false, kerja: [1, 2], ms: 520 },
  { n: 'keriting', x: 1010, y: 545, k: 0.88, kiri: false, kerja: [1, 2], ms: 900 },
  { n: 'anakp', x: 340, y: 520, k: 0.95, kiri: true, kerja: [1, 2], ms: 600 },
  { n: 'anakl', x: 1100, y: 590, k: 0.95, kiri: false, kerja: [1, 2], ms: 560 },
];
const KARUNG_M1 = [{ x: 365, y: 470 }, { x: 955, y: 482 }, { x: 1105, y: 462 }];

class M1 extends Mission {
  constructor() { super('M1', 1); this.instruksi = 'Ketuk "Tambah Warga" satu per satu. Lihat apa yang terjadi!'; }

  build() {
    this.add.image(W / 2, H / 2, 'latar-misi1').setDisplaySize(W, H).setDepth(0);
    // sungai keruh: potongan melintang yang jernih satu per satu dari hulu ke hilir
    const N = 30, tinggi = 900 / N;
    this.strips = [];
    for (let i = 0; i < N; i++) {
      const s = this.add.image(W / 2, H / 2, 'sungai-keruh').setDisplaySize(W, H).setCrop(0, i * tinggi, 1600, tinggi + 1).setDepth(4);
      s.mulai = Math.max(0, Math.min(1, ((i + 0.5) * tinggi - 330) / 570)) * 92;   // % kemajuan saat potongan ini mulai jernih
      this.strips.push(s);
    }
    const tepi = ASET_META.sungaiTepi;
    const lebar = (y) => { let r = tepi[0]; for (const e of tepi) if (Math.abs(e[0] - y) < Math.abs(r[0] - y)) r = e; return r; };

    // sampah: hilang saat potongan sungai di tempatnya mulai jernih
    this.trash = [];
    const jenis = ['botol', 'kresek', 'kaleng', 'ban', 'kardus', 'kulit'];
    for (let i = 0; i < 24; i++) {
      let y, x, e, coba = 0;   // sebar dengan jarak, supaya tidak menumpuk
      do {
        y = Phaser.Math.Between(305, 625); e = lebar(y); x = Phaser.Math.Between(e[1] + 70, e[2] - 70); coba++;
      } while (coba < 40 && this.trash.some((o) => Math.hypot(o.x - x, (o.y - y) * 1.6) < 85));
      const p = 0.5 + 0.5 * (y - 300) / 330;
      const r = this.add.image(x, y, Phaser.Utils.Array.GetRandom(jenis)).setScale(0.54 * p).setAngle(Phaser.Math.Between(-30, 30)).setDepth(5);
      r.ambang = ((y / 0.8 - 330) / 570 * 92 | 0) + 4;
      r.bank = x < (e[1] + e[2]) / 2 ? e[1] - 30 : e[2] + 30;
      this.tweens.add({ targets: r, y: y + 4, angle: r.angle + Phaser.Math.Between(-6, 6), duration: Phaser.Math.Between(1100, 1800), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.trash.push(r);
    }
    this.karung = KARUNG_M1.map((p) => this.add.image(p.x, p.y, 'karung').setScale(0.4).setOrigin(0.5, 1).setDepth(10 + p.y / 100).setVisible(false));

    this.warga = [];
    this.n_ = 0; this.progress = 0; this.elapsed = 0; this.tamat = false;

    // baris bawah: tombol, tali kemajuan (botol -> ikan), jumlah warga
    this.btn = button(this, 180, 668, 290, 80, 'Tambah Warga', () => this.addWarga()).setDepth(30);
    this.add.image(358, 668, 'botol').setScale(0.4).setDepth(30);
    this.add.image(897, 668, 'ikan-oren').setScale(0.42).setDepth(30);
    kayu(this, 'tombol', 480, 64, KAYU_TOMBOL).setPosition(625, 668).setDepth(30);
    this.isi = this.add.graphics().setDepth(31);
    kayu(this, 'tombol', 250, 72, KAYU_TOMBOL).setPosition(1075, 668).setDepth(30);
    this.count = txt(this, 1075, 668, 'Warga: 0', 36, KRIM).setDepth(31);
    this.addWarga();
  }

  instruksiUI() {
    const b = balonKepala(this, { x: 58, y: 575, k: 0.82, lebar: 450, teks: this.instruksi });
    this.kepala = b.kepala; this.balon = b.teks;
  }

  addWarga() {
    if (this.n_ >= WARGA_M1.length) return;
    const c = WARGA_M1[this.n_];
    const w = warga(this, c.n, c.kiri ? -170 : W + 170, c.y, c.k).setFlipX(!c.kiri);
    this.warga.push(w);
    sfx('pop');
    this.tweens.add({ targets: w, x: c.x, duration: 950, ease: 'Sine.easeOut' });
    this.tweens.add({ targets: w, y: c.y - 14, duration: 160, yoyo: true, repeat: 2 });
    this.time.delayedCall(1000, () => {   // sampai di tepi, langsung kerja
      if (this.tamat) return;
      w.setPose(c.kerja[0]);
      w.kerja = this.time.addEvent({ delay: c.ms, loop: true, callback: () => w.setPose(w.poseNo === c.kerja[0] ? c.kerja[1] : c.kerja[0]) });
    });
    this.n_++;
    this.count.setText('Warga: ' + this.n_);
    if (this.n_ >= WARGA_M1.length) this.btn.setEnabled(false);
  }

  ambil(r) {   // sampah diangkat ke tepi
    r.ambil = true;
    this.tweens.killTweensOf(r);
    this.tweens.add({ targets: r, x: r.bank, y: r.y - 60, scale: r.scale * 0.4, alpha: 0, duration: 650, ease: 'Sine.easeIn', onComplete: () => r.destroy() });
  }

  selesai() {
    sfx('bell');
    this.warga.forEach((w) => { if (w.kerja) w.kerja.remove(); w.setPose(0); w.setAngle(0); });
    this.kepala.setPose(2);
    this.balon.setText('Sungai sudah bersih!');
    const tepi = ASET_META.sungaiTepi;
    [['ikan-oren', 380], ['ikan-biru', 470], ['ikan-oren', 560]].forEach(([k, y], i) => {
      const e = tepi.reduce((a, b) => (Math.abs(b[0] - y) < Math.abs(a[0] - y) ? b : a));
      const f = this.add.image(e[1] + 100, y, k).setScale(0).setDepth(6);
      this.tweens.add({ targets: f, scale: 0.44 * (0.55 + y / 900), duration: 400, delay: i * 250, ease: 'Back.easeOut' });
      const ke = () => this.tweens.add({ targets: f, x: e[2] - 100, duration: 2200 + i * 300, ease: 'Sine.easeInOut', yoyo: true, repeat: -1,
        onYoyo: () => f.setFlipX(true), onRepeat: () => f.setFlipX(false) });
      this.time.delayedCall(i * 250 + 400, ke);
    });
    this.time.delayedCall(2300, () => this.finish('Selesai lebih cepat kalau bersama!',
      this.n_ + ' warga membersihkan sungai dalam ' + Math.round(this.elapsed) + ' detik.'));
  }

  update(t, dt) {
    if (this.tamat || !this.n_) return;
    this.elapsed += dt / 1000;
    this.progress = Math.min(100, this.progress + 3 * this.n_ * dt / 1000);
    const p = this.progress;
    this.strips.forEach((s) => s.setAlpha(Phaser.Math.Clamp(1 - (p - s.mulai) / 8, 0, 1)));
    this.trash.forEach((r) => { if (!r.ambil && p >= r.ambang) this.ambil(r); });
    this.karung.forEach((k, i) => { if (!k.visible && p >= 25 * (i + 1)) { k.setVisible(true).setScale(0); this.tweens.add({ targets: k, scale: 0.4, duration: 350, ease: 'Back.easeOut' }); sfx('pop'); } });
    this.isi.clear();
    this.isi.fillStyle(LIME, 1);
    const lebarIsi = 448 * p / 100;
    if (lebarIsi > 1) this.isi.fillRoundedRect(625 - 224, 668 - 15, lebarIsi, 30, Math.min(15, lebarIsi / 2));
    if (p >= 100) { this.tamat = true; this.selesai(); }
  }
}

// ---------- Misi 2: Perbaiki Jalan ----------
// Tiga kelompok bergantian: pasir, batu, cangkul. Tiap giliran mengubah lubang, lalu kendaraan bisa lewat.
const KELOMPOK_M2 = [
  { x: 270, label: 'Pasir', prop: 'karung-pasir', a: { n: 'keriting', diam: 2, kerja: 'b0', sorak: 'b3' }, b: { n: 'anakp', diam: 2, kerja: 2, sorak: 'b2' } },
  { x: 660, label: 'Batu', prop: 'batu-tumpuk', a: { n: 'ibu', diam: 'b0', kerja: 'b0', sorak: 'b3' }, b: { n: 'anakl', diam: 'b0', kerja: 'b0', sorak: 'b2' } },
  { x: 1060, label: 'Cangkul', prop: 'gerobak', a: { n: 'bapak', diam: 'b0', kerja: 'b0', sorak: 'b3' }, b: { n: 'kakek', diam: 'b0', kerja: 'b0', sorak: 'b2' } },
];

class M2 extends Mission {
  constructor() { super('M2', 2); this.instruksi = 'Ketuk kelompok warga yang ditandai, bergantian menutup lubang.'; }

  build() {
    this.plat = platBertahap(this, ['latar-misi2-1', 'latar-misi2-2', 'latar-misi2-3', 'latar-misi2-4']);
    this.groups = KELOMPOK_M2.map((d, i) => {
      const kanan = d.x > W / 2;   // kelompok di kanan menghadap ke lubang (kiri)
      this.add.image(d.x + (kanan ? 142 : -118), 628, d.prop).setOrigin(0.5, 1).setScale(0.5).setDepth(10);
      const a = warga(this, d.a.n, d.x - 58, 628, 0.62).setPose(d.a.diam).setFlipX(kanan);
      const b = warga(this, d.b.n, d.x + 58, 628, 0.62).setPose(d.b.diam).setFlipX(kanan);
      const papan = this.add.container(d.x, 672).setDepth(25);
      papan.add([kayu(this, 'tombol', 210, 68, KAYU_TOMBOL), txt(this, 0, 0, d.label, 34, KRIM)]);
      const zona = this.add.zone(d.x, 520, 280, 320).setDepth(24).setInteractive({ useHandCursor: true });
      zona.on('pointerdown', () => this.pilih(i));
      papan.setSize(210, 68).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.pilih(i));
      return { d, a, b, papan, kanan };
    });
    this.next = 0; this.busy = false;
    this.tanda = panah(this);
    this.moveRing();
  }

  instruksiUI() {
    this.balon = balonKepala(this, { x: 58, y: 600, k: 0.7, lebar: 540, teks: this.instruksi });
    this.kepala = this.balon.kepala;
  }

  moveRing() {
    if (this.next > 2) { this.tanda.setVisible(false); return; }
    this.tanda.setVisible(true);
    const g = this.groups[this.next];
    this.tanda.setPosition(g.d.x, 628 - 0.62 * 350 - 22);
  }

  pilih(i) {
    if (this.busy || this.next > 2 || this.finished) return;
    const g = this.groups[i];
    if (i !== this.next) {   // bukan gilirannya: bergoyang pelan
      sfx('oops');
      [g.a, g.b].forEach((w) => this.tweens.add({ targets: w, x: w.x + 10, duration: 70, yoyo: true, repeat: 3 }));
      return;
    }
    this.busy = true;
    this.balon.pudar();
    this.tanda.setVisible(false);
    sfx('tap');
    const kiri = { x: g.a.x, y: g.a.y }, kanan = { x: g.b.x, y: g.b.y }, bl = g.a.flipX, br = g.b.flipX;
    g.a.setFlipX(false); g.b.setFlipX(true);
    this.tweens.add({ targets: g.a, x: 440, y: 520, duration: 650, ease: 'Sine.easeInOut' });
    this.tweens.add({
      targets: g.b, x: 810, y: 520, duration: 650, ease: 'Sine.easeInOut',
      onComplete: () => {
        g.a.setPose(g.d.a.kerja); g.b.setPose(g.d.b.kerja);
        [0, 300, 600].forEach((t) => this.time.delayedCall(t, () => sfx('knock')));
        this.tweens.add({ targets: [g.a, g.b], angle: { from: -3, to: 3 }, duration: 150, yoyo: true, repeat: 2, onComplete: () => { g.a.setAngle(0); g.b.setAngle(0); } });
        this.time.delayedCall(350, () => this.plat.ke(i + 1));
        this.time.delayedCall(1100, () => {
          g.a.setFlipX(bl); g.b.setFlipX(br);
          this.tweens.add({ targets: g.a, x: kiri.x, y: kiri.y, duration: 650, ease: 'Sine.easeInOut' });
          this.tweens.add({
            targets: g.b, x: kanan.x, y: kanan.y, duration: 650, ease: 'Sine.easeInOut',
            onComplete: () => {
              g.a.setPose(g.d.a.sorak); g.b.setPose(g.d.b.sorak);
              ucap(this, g.d.x, 628 - 0.62 * 350 - 40, 'Semangat!');   // saling menyemangati
              this.busy = false; this.next++; this.moveRing();
              if (this.next > 2) this.selesai();
            },
          });
        });
      },
    });
  }

  selesai() {
    sfx('bell');
    this.kepala.setPose(2);
    const mobil = this.add.image(-220, 470, 'mobil').setOrigin(0.5, 1).setScale(0.72).setDepth(9);
    const sepeda = this.add.image(-180, 505, 'sepeda').setOrigin(0.5, 1).setScale(0.62).setDepth(9.5);
    this.tweens.add({ targets: mobil, y: 467, duration: 160, yoyo: true, repeat: -1 });
    this.tweens.add({
      targets: mobil, x: W + 240, duration: 2400, ease: 'Linear',
      onComplete: () => {
        sfx('bell');
        this.tweens.add({
          targets: sepeda, x: W + 200, duration: 2300, ease: 'Linear',
          onComplete: () => this.finish('Jalan sudah rata dan aman!', 'Warga saling membantu dan bergantian bekerja.'),
        });
      },
    });
  }
}

// ---------- Misi 3: Bangun Balai Desa ----------
// Setiap tugas yang dipilih menambah satu bagian bangunan, urutan tugas bebas.
const TUGAS_M3 = [
  { x: 262, label: 'Bapak mengangkat bata', n: 'bapak', diam: 'b1', sorak: 'b3' },
  { x: 655, label: 'Ibu menyiapkan minuman', n: 'ibu', diam: 'b1', sorak: 'b3' },
  { x: 1050, label: 'Anak membawa barang ringan', n: 'anakp', diam: 'b0', sorak: 'b2' },
];

class M3 extends Mission {
  constructor() { super('M3', 3); this.instruksi = 'Ketuk bapak, ibu, dan anak. Setiap tugas menambah bangunan!'; }

  build() {
    this.plat = platBertahap(this, ['latar-misi3-1', 'latar-misi3-2', 'latar-misi3-3', 'latar-misi3-4']);
    this.done_ = 0;
    this.bahan = [
      this.add.image(120, 600, 'bata').setOrigin(0.5, 1).setScale(0.55).setDepth(10),
      this.add.image(1215, 600, 'papan-tumpuk').setOrigin(0.5, 1).setScale(0.5).setDepth(10),
    ];
    this.warga = TUGAS_M3.map((d) => {
      const w = warga(this, d.n, d.x, 614, 0.74).setPose(d.diam);
      const papan = this.add.container(d.x, 666).setDepth(25);
      papan.add([kayu(this, 'tombol', 375, 98, KAYU_TOMBOL), txt(this, 0, 0, d.label, 32, KRIM, { wordWrap: { width: 325 } })]);
      const pilih = () => this.pilih(d, w, papan);
      this.add.zone(d.x, 480, 300, 300).setDepth(24).setInteractive({ useHandCursor: true }).on('pointerdown', pilih);
      papan.setSize(375, 98).setInteractive({ useHandCursor: true }).on('pointerdown', pilih);
      this.tweens.add({ targets: w, y: 609, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      return w;
    });
  }

  instruksiUI() {
    this.balon = balonKepala(this, { x: 54, y: 606, k: 0.7, lebar: 440, teks: this.instruksi });
    this.kepala = this.balon.kepala;
    this.kepala.setDepth(15);
  }

  pilih(d, w, papan) {
    if (papan.used || this.finished) return;
    papan.used = true;
    this.balon.pudar();
    sfx('knock');
    this.tweens.killTweensOf(w);
    const asal = w.scaleX;
    let bangun = false;
    this.tweens.add({
      targets: w, y: 560, scaleX: asal * 0.86, scaleY: asal * 0.86, duration: 420, ease: 'Sine.easeOut', yoyo: true, hold: 260,
      onYoyo: () => {
        if (bangun) return;
        bangun = true;
        sfx('knock');
        this.done_++;
        this.plat.ke(this.done_);
      },
      onComplete: () => {
        w.setPose(d.sorak);
        papan.add(centang(this, -187, 0));
        if (this.done_ === 3) this.time.delayedCall(600, () => this.selesai());
      },
    });
  }

  selesai() {
    sfx('bell');
    this.tweens.add({ targets: this.bahan, alpha: 0, duration: 500 });
    this.kepala.setPose(2);
    // bendera dinaikkan di tiang depan balai
    const tiang = this.add.graphics().setDepth(9);
    tiang.fillStyle(0x8A5A2B); tiang.fillRoundedRect(1196, 150, 9, 395, 4);
    tiang.fillStyle(MUSTARD); tiang.fillCircle(1200.5, 148, 8);
    const kain = kainBendera(this, 1205, 500, 96, 64).setDepth(9);
    this.tweens.add({ targets: kain, y: 160, duration: 1500, ease: 'Sine.easeOut' });
    this.time.delayedCall(2000, () => this.finish('Balai desa sudah jadi!', 'Setiap orang punya tugas sesuai kemampuan.'));
  }
}

// ---------- Misi 4: Sambut HUT RI ----------
// Awalnya kotor dan sepi. Warga datang setelah sapu diketuk, warna kampung naik di tiap langkah.
const PILAR_M4 = [80, 287, 471, 635, 808, 984, 1179];   // tiang pagar di latar
const PUNCAK_M4 = 362;

class M4 extends Mission {
  constructor() { super('M4', 4); this.instruksi = 'Ketuk tombol sesuai urutan: sapu, bendera, lalu umbul-umbul.'; }

  build() {
    this.add.image(W / 2, H / 2, 'latar-misi4').setDisplaySize(W, H).setDepth(0);
    this.kusam = this.add.image(W / 2, H / 2, 'latar-misi4-kusam').setDisplaySize(W, H).setDepth(1);
    this.trash = [];
    const jenis = ['botol', 'kresek', 'kaleng', 'kardus', 'kulit'];
    for (let i = 0; i < 16; i++) {
      let x, y, coba = 0;
      do {
        x = Phaser.Math.Between(50, W - 50); y = Phaser.Math.Between(485, 580); coba++;
      } while (coba < 40 && this.trash.some((o) => Math.hypot(o.x - x, (o.y - y) * 2) < 85));
      this.trash.push(this.add.image(x, y, Phaser.Utils.Array.GetRandom(jenis)).setScale(0.36).setAngle(Phaser.Math.Between(-40, 40)).setDepth(5));
    }
    this.warga = [];
    this.step = 0;
    this.btns = [
      button(this, 220, 668, 380, 80, '1. Sapu jalan', () => this.aksi(0)).setDepth(30),
      button(this, 640, 668, 380, 80, '2. Pasang bendera', () => this.aksi(1)).setDepth(30),
      button(this, 1060, 668, 380, 80, '3. Umbul-umbul', () => this.aksi(2)).setDepth(30),
    ];
    this.btns[1].setEnabled(false); this.btns[2].setEnabled(false);
    this.tanda = panah(this).setDepth(31);
    this.tandai();
  }

  instruksiUI() {
    this.balon = balonKepala(this, { x: 58, y: 615, k: 0.7, lebar: 450, teks: this.instruksi });
    this.kepala = this.balon.kepala;
  }

  tandai() {
    if (this.step > 2) { this.tanda.setVisible(false); return; }
    this.tanda.setPosition(this.btns[this.step].x, 600);
  }

  aksi(i) {
    if (i !== this.step) return;
    this.balon.pudar();
    this.btns[i].setEnabled(false);
    this.tanda.setVisible(false);
    const lanjut = (ms) => this.time.delayedCall(ms, () => {
      this.step = i + 1;
      if (this.step < 3) { this.btns[this.step].setEnabled(true); this.tanda.setVisible(true); this.tandai(); }
    });
    if (i === 0) { this.sapu(); lanjut(2400); }
    else if (i === 1) { this.pasangBendera(); lanjut(1500); }
    else { this.pasangUmbul(); this.time.delayedCall(1500, () => this.meriah()); }
  }

  sapu() {
    const sapuan = [
      { n: 'ibu', dari: -150, ke: 380, y: 590 },
      { n: 'kakek', dari: -340, ke: 640, y: 560 },
      { n: 'bapak', dari: W + 150, ke: 850, y: 595 },
    ];
    sapuan.forEach((c) => {
      const w = warga(this, c.n, c.dari, c.y, 0.8).setFlipX(c.ke > 800).setPose(1);
      w.kerja = this.time.addEvent({ delay: 280, loop: true, callback: () => { w.setPose(w.poseNo === 1 ? 2 : 1); sfx('tap'); } });
      this.tweens.add({
        targets: w, x: c.ke, duration: 2100, ease: 'Linear',
        onUpdate: () => this.trash.forEach((r) => { if (!r.ambil && Math.abs(r.x - w.x) < 115) this.buang(r); }),
        onComplete: () => { w.kerja.remove(); w.setPose(0); },
      });
      this.warga.push(w);
    });
    this.time.delayedCall(2150, () => this.trash.forEach((r) => { if (!r.ambil) this.buang(r); }));
    this.tweens.add({ targets: this.kusam, alpha: 0.62, duration: 2100 });
  }

  buang(r) {
    r.ambil = true;
    this.tweens.add({ targets: r, y: r.y - 26, scale: 0.1, alpha: 0, duration: 320, onComplete: () => r.destroy() });
  }

  pasangBendera() {
    sfx('pop');
    this.tweens.add({ targets: this.kusam, alpha: 0.3, duration: 1200 });
    const k = warga(this, 'keriting', -120, 600, 0.72).setPose('b2');
    this.warga.push(k);
    // kain bendera di tiang yang dibawa warga
    const m = ASET_META.tiangKeriting;
    const dx = () => k.x + (m.x - k.originX) * k.displayWidth, dy = 600 - (k.originY - m.y) * k.displayHeight + 4;
    const kain = kainBendera(this, dx(), dy, 62, 42).setDepth(k.depth);
    this.tweens.add({ targets: k, x: 172, duration: 700, ease: 'Sine.easeOut', onUpdate: () => kain.setX(dx()) });
    [0, 2, 4, 6].forEach((p, i) => this.time.delayedCall(250 + i * 260, () => {
      sfx('pop');
      const x = PILAR_M4[p], t = 150;
      const g = this.add.graphics({ x, y: PUNCAK_M4 }).setDepth(9).setScale(1, 0);
      g.fillStyle(0x8A5A2B); g.fillRoundedRect(-3, -t, 6, t + 4, 3);
      g.fillStyle(MUSTARD); g.fillCircle(0, -t - 2, 6);
      g.fillStyle(RED); g.fillRect(3, -t, 66, 22);
      g.fillStyle(0xFFFDF6); g.fillRect(3, -t + 22, 66, 22);
      g.lineStyle(1.5, 0xC9BFA8, 1); g.strokeRect(3, -t + 22, 66, 22);
      this.tweens.add({ targets: g, scaleY: 1, duration: 340, ease: 'Back.easeOut' });
    }));
  }

  pasangUmbul() {
    sfx('pop');
    this.tweens.add({ targets: this.kusam, alpha: 0, duration: 1200 });
    const warna = [0xFFFDF6, RED];
    // umbul-umbul tinggi di tiang pagar yang kosong, tali segitiga di antara semua tiang
    [1, 3, 5].forEach((p, i) => {
      const x = PILAR_M4[p], g = this.add.graphics({ x, y: PUNCAK_M4 }).setDepth(9).setAlpha(0);
      g.lineStyle(6, 0x8A6A36); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -135); g.lineTo(26, -190); g.strokePath();
      g.fillStyle(i === 1 ? TEAL : MUSTARD);
      g.fillPoints([{ x: 3, y: -135 }, { x: 26, y: -190 }, { x: 40, y: -130 }, { x: 34, y: -50 }, { x: 22, y: -22 }, { x: 16, y: -50 }, { x: 8, y: -100 }], true);
      this.tweens.add({ targets: g, alpha: 1, duration: 300, delay: 150 + i * 200 });
    });
    for (let s = 0; s < PILAR_M4.length - 1; s++) {
      const x0 = PILAR_M4[s], x1 = PILAR_M4[s + 1], y0 = 268, n = Math.round((x1 - x0) / 34);
      const g = this.add.graphics().setDepth(9).setAlpha(0);
      g.lineStyle(3, 0x8A6A36); g.beginPath();
      for (let i = 0; i <= 12; i++) { const t = i / 12; const px = x0 + (x1 - x0) * t, py = y0 + 20 * 4 * t * (1 - t); if (i) g.lineTo(px, py); else g.moveTo(px, py); }
      g.strokePath();
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n, px = x0 + (x1 - x0) * t, py = y0 + 20 * 4 * t * (1 - t);
        g.fillStyle(warna[(i + s) % 2]);
        g.fillTriangle(px - 13, py, px + 13, py, px, py + 32);
      }
      this.tweens.add({ targets: g, alpha: 1, duration: 280, delay: s * 110 });
    }
  }

  meriah() {
    sfx('clap');
    const sorak = { ibu: 'b3', bapak: 'b3', keriting: 'b3', kakek: 'b2' };
    this.warga.forEach((w, k) => {
      w.setPose(sorak[w.texture.key.split('-')[0]]).setFlipX(false);
      this.tweens.add({ targets: w, y: w.y - 26, duration: 230, yoyo: true, repeat: 5, delay: k * 90 });
    });
    this.kepala.setPose(2);
    [['anakp', 1040], ['anakl', 1170]].forEach(([n, x], i) => {
      const w = warga(this, n, W + 120 + i * 120, 600, 0.82).setPose('b2');
      this.tweens.add({ targets: w, x, duration: 600, ease: 'Sine.easeOut' });
      this.tweens.add({ targets: w, y: 572, duration: 230, yoyo: true, repeat: 5, delay: 150 });
    });
    const hore = judul(this, W / 2 + 90, 150, 'Hore!', 110, KRIM, { stroke: '#5A3418', strokeThickness: 14 }).setDepth(26);
    this.tweens.add({ targets: hore, scale: 1.14, duration: 300, yoyo: true, repeat: 3 });
    confetti(this, 60);
    this.time.delayedCall(2300, () => this.finish('Kampung jadi meriah!', 'Semua ikut bekerja dengan gembira untuk tujuan bersama.'));
  }
}

// ---------- Misi 5: Pos Ronda Darurat (permainan) ----------
// Hari makin gelap mengikuti waktu 45 detik. Warga yang membantu masuk pos dan menyalakan lampu;
// warga yang hanya menonton tetap di luar pos (ciri modul: hanya yang ikut bekerja disebut bergotong royong).
const LAMPU_M5 = [{ x: 727, y: 322 }, { x: 971, y: 305 }, { x: 1200, y: 318 }];
const DI_POS_M5 = [{ x: 806, y: 508 }, { x: 910, y: 508 }, { x: 1014, y: 508 }, { x: 1118, y: 508 }];
const DI_LUAR_M5 = [{ x: 96, y: 462 }, { x: 204, y: 452 }];

class M5 extends Mission {
  constructor() { super('M5', 5); this.instruksi = 'Pilih warga yang ikut membantu. Kelas mengangkat kartu hijau atau merah.'; }

  build() {
    this.add.image(W / 2, H / 2, 'latar-misi5').setDisplaySize(W, H).setDepth(0);
    this.gelap = this.add.rectangle(W / 2, H / 2, W * 3, H * 5, 0x241F55, 1).setAlpha(0).setDepth(8);
    if (!this.textures.exists('cahaya')) {
      const c = this.textures.createCanvas('cahaya', 256, 256), x = c.getContext();
      const gr = x.createRadialGradient(128, 128, 4, 128, 128, 128);
      gr.addColorStop(0, 'rgba(255,240,170,1)'); gr.addColorStop(0.18, 'rgba(255,214,110,0.75)'); gr.addColorStop(1, 'rgba(255,190,80,0)');
      x.fillStyle = gr; x.fillRect(0, 0, 256, 256); c.refresh();
    }
    this.lamps = LAMPU_M5.map((l) => this.add.image(l.x, l.y, 'cahaya').setScale(0.9).setAlpha(0).setDepth(9).setBlendMode(Phaser.BlendModes.ADD));

    this.queue = Phaser.Utils.Array.Shuffle([
      { n: 'bapak', pose: 'b2', help: true }, { n: 'ibu', pose: 'b2', help: true },
      { n: 'keriting', pose: 'b1', help: true }, { n: 'kakek', pose: 'b1', help: true },
      { n: 'anakp', pose: 'b1', help: false }, { n: 'anakl', pose: 'b1', help: false },
    ]);
    this.idx = 0; this.benar = 0; this.waktu = 45; this.main = false; this.cur = null; this.nPos = 0; this.nLuar = 0; this.locked = false;

    this.chip = this.add.container(722, 50).setDepth(22).setVisible(false);
    this.chip.add(kertas(this, 0, 0, 270, 72, { r: 22 }));
    this.timerTxt = judul(this, 0, 3, 'Waktu: 45', 44, INK);
    this.chip.add(this.timerTxt);
    this.pos = this.add.container(1000, 578).setDepth(25).setVisible(false);
    this.masuk = txt(this, 0, 0, 'Di pos: 0 / 4', 32, KRIM);
    this.pos.add([kayu(this, 'tombol', 290, 62, KAYU_TOMBOL), this.masuk]);

    this.btnY = kartuJawab(this, 320, 668, 500, 88, GREEN, 'YA', 'Membantu', -1, () => this.jawab(true)).setVisible(false);
    this.btnN = kartuJawab(this, 960, 668, 500, 88, RED, 'TIDAK', 'Hanya menonton', 1, () => this.jawab(false)).setVisible(false);
    this.mulai = button(this, 660, 470, 360, 104, 'Mulai', () => this.mulaiMain(), 48).setDepth(30);
  }

  instruksiUI() {
    this.balon = balonKepala(this, { x: 110, y: 625, k: 0.82, lebar: 500, teks: this.instruksi });
    this.kepala = this.balon.kepala;
  }

  mulaiMain() {
    this.mulai.destroy();
    this.balon.pudar();
    this.main = true;
    this.chip.setVisible(true); this.pos.setVisible(true); this.btnY.setVisible(true); this.btnN.setVisible(true);
    this.tweens.add({ targets: this.kepala, x: 640, duration: 700, ease: 'Sine.easeInOut' });
    this.muncul();
  }

  muncul() {
    if (this.idx >= this.queue.length) return this.selesai();
    const q = this.queue[this.idx];
    this.cur = warga(this, q.n, -180, 618, 1.12).setPose(q.pose);
    this.locked = true;
    this.tweens.add({ targets: this.cur, x: 310, duration: 600, ease: 'Sine.easeOut', onComplete: () => { this.locked = false; } });
    this.tweens.add({ targets: this.cur, y: 606, duration: 150, yoyo: true, repeat: 1 });
  }

  jawab(bilangMembantu) {
    if (!this.main || this.locked || !this.cur) return;
    const q = this.queue[this.idx], w = this.cur;
    if (bilangMembantu !== q.help) {   // salah: bergoyang pelan, suara lembut
      sfx('oops');
      speak('Ayo coba lagi');
      ucap(this, w.x, w.y - w.displayHeight - 20, 'Ayo coba lagi');
      this.tweens.add({ targets: w, angle: { from: -3, to: 3 }, duration: 110, yoyo: true, repeat: 3, onComplete: () => w.setAngle(0) });
      return;
    }
    this.locked = true;
    this.benar++; this.idx++;
    sfx('star');
    kilau(this, w.x, w.y - w.displayHeight * 0.6);
    this.kepala.setPose(q.help ? 'b0' : 'b1');
    this.time.delayedCall(1000, () => { if (this.main) this.kepala.setPose(this.waktu <= 15 ? 'b2' : 0); });
    const tuju = q.help ? DI_POS_M5[this.nPos++] : DI_LUAR_M5[this.nLuar++];
    this.tweens.add({
      targets: w, x: tuju.x, y: tuju.y, scaleX: w.scaleX * 0.48, scaleY: w.scaleY * 0.48, duration: 800, ease: 'Sine.easeInOut',
      onComplete: () => {
        w.setDepth(10 + tuju.y / 100);
        if (q.help) { this.masuk.setText('Di pos: ' + this.nPos + ' / 4'); sfx('knock'); }
        this.nyalakan();
        this.muncul();
      },
    });
  }

  nyalakan() {   // tiap dua jawaban benar satu lampu menyala
    this.lamps.forEach((l, i) => { if (this.benar >= i * 2 + 1 && l.alpha === 0) this.tweens.add({ targets: l, alpha: 1, duration: 450 }); });
  }

  update(t, dt) {
    if (!this.main || this.finished) return;
    this.waktu -= dt / 1000;
    const sisa = Math.max(0, Math.ceil(this.waktu));
    this.timerTxt.setText('Waktu: ' + sisa);
    this.gelap.setAlpha((1 - Math.max(0, this.waktu) / 45) * 0.58);
    if (sisa <= 10) this.timerTxt.setColor('#B3261E');
    if (sisa <= 15 && this.kepala.poseNo === 0) this.kepala.setPose('b2');
    if (this.waktu <= 0) this.selesai();
  }

  selesai() {
    if (!this.main || this.finished) return;
    this.main = false;
    const b = this.benar, bintang = b >= 6 ? 3 : b >= 4 ? 2 : 1;
    const msg = b >= 6 ? 'Hebat! Pos ronda sudah jadi!' : 'Waktu habis!';
    const akhir = () => this.finish(msg, b + ' dari 6 jawaban benar.', bintang);
    if (b >= 6) {   // kampung terang oleh lampu pos
      sfx('bell');
      this.kepala.setPose(2);
      this.tweens.add({ targets: this.gelap, alpha: 0.12, duration: 900 });
      this.tweens.add({ targets: this.lamps, scale: 1.5, duration: 900 });
      this.time.delayedCall(1500, akhir);
    } else this.time.delayedCall(500, akhir);
  }
}

// layar penuh: area main tetap 1280x720 di tengah, sisi kiri-kanan diisi cerminan latar agar sambungannya menyatu
function penuhkan(s) {
  const asli = s.children.list.filter((o) => o.type === 'Image' && (o.texture.key.startsWith('kusam-') || (o.x === W / 2 && o.y === H / 2 && Math.abs(o.displayWidth - W) < 1)));
  const salinan = [];
  for (const a of asli) for (const k of [-1, 1]) {
    const cx = a.x + (0.5 - a.originX) * a.displayWidth, cy = a.y + (0.5 - a.originY) * a.displayHeight;
    const m = s.add.image(k * W + W - cx, cy, a.texture.key).setScale(a.scaleX, a.scaleY).setDepth(a.depth).setFlipX(true);
    if (a.isCropped) m.setCrop(a._crop.x, a._crop.y, a._crop.width, a._crop.height);
    salinan.push([a, m]);
  }
  const selaras = () => {
    const cam = s.cameras.main, ukuran = s.scale.baseSize;   // scene yang dibuka ulang kameranya kembali ke 1280x720
    if (cam.width !== ukuran.width || cam.height !== ukuran.height) cam.setSize(ukuran.width, ukuran.height);
    cam.setScroll(Math.round((W - cam.width) / 2), Math.round((H - cam.height) / 2));
    for (const [a, m] of salinan) m.setAlpha(a.alpha).setVisible(a.active && a.visible);
  };
  selaras();
  s.events.on('postupdate', selaras);
  s.events.once('shutdown', () => s.events.off('postupdate', selaras));
}
[Boot, Title, Menu, Mission].forEach((C) => {
  const create = C.prototype.create;
  C.prototype.create = function () { create.call(this); penuhkan(this); };
});

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: W,
  height: H,
  backgroundColor: '#FFF9E0',
  scale: { mode: Phaser.Scale.EXPAND, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [Boot, Title, Menu, M1, M2, M3, M4, M5],
});
