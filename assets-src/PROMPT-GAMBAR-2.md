# Prompt Gambar Batch 2: Misi 2 sampai 5

18 gambar: 7 lembar pose tokoh, 10 latar, 1 lembar objek. Simpan semuanya ke `assets-src/masuk2/` dengan **nama file persis** seperti tertulis.

## Cara pakai

Sama seperti batch 1, dengan dua tambahan.

1. Lampirkan file **Referensi** tiap prompt dari `assets-src/referensi/`, lalu tempel teks prompt apa adanya.
2. Minta landscape 16:9 dengan resolusi setinggi mungkin.
3. **Latar Misi 2 dan Misi 3 dibuat berantai.** Gambar 1 dibuat dari nol. Gambar 2, 3, dan 4 dibuat dengan melampirkan **gambar sebelumnya** sebagai referensi, dan prompt-nya bilang "ubah hanya satu hal". Tujuannya supaya kamera, pohon, dan rumahnya sama persis dan game bisa memudarkan gambar satu ke gambar berikutnya.
4. Kalau hasil edit berantai bergeser banyak (kamera, bentuk jalan, posisi pohon), ulang edit itu sekali. Jangan lanjut ke gambar berikutnya dari hasil yang sudah bergeser.

## Cek sebelum disimpan

- Nggak ada tulisan, angka, logo, atau **bendera** di gambar. Bendera digambar di kode karena AI sering salah urutan warnanya.
- Tangan wajar, jari nggak aneh, alat dipegang dengan benar.
- Gaya lembut seperti sampul, tanpa garis tepi hitam tebal.
- Lembar tokoh dan objek: latar **putih polos** dan antar sosok nggak saling menempel.
- Tokoh sama persis dengan lembar batch 1: baju, warna kulit, rambut, dan sandal.

## Urutan yang disarankan hemat kuota

1. `tokoh-bapak-b` dulu. Kalau masih satu keluarga dengan lembar bapak batch 1, tool-nya cocok untuk 6 lembar tokoh lainnya.
2. Enam lembar tokoh lainnya.
3. Latar berantai Misi 2, lalu Misi 3.
4. `latar-misi4`, `latar-misi5`, `objek-2`.

---

# A. Lembar tokoh (7)

Kalimat dasar tiap prompt sama. Yang beda cuma tokoh dan posenya. **Pose dihadapkan agak ke kanan** (tiga perempat) supaya mudah dibalik di game.

## 1. `tokoh-bapak-b.png`

**Referensi:** `sampul.png`, `tokoh-bapak.png`

```text
Using exactly the soft illustration style of the reference images (children's book art with fine grain, soft shading, no dark outlines), draw one character sheet of the same Indonesian father character as in the second reference: same face, same hair, same clothes, same sandals. Show him four times, full body, clearly separated with wide gaps: 1) three-quarter view facing right, swinging a farmer's hoe (cangkul) up over his shoulder, 2) three-quarter view facing right, carrying a stack of red bricks in both arms, 3) three-quarter view facing right, bending slightly and hammering a nail into a short wooden post with a hammer, 4) standing facing the viewer, both arms raised high in joyful cheering with a big smile. Natural hands with correct fingers. Plain solid white background, no ground shadow, no text, no flags.
```

## 2. `tokoh-ibu-b.png`

**Referensi:** `sampul.png`, `tokoh-ibu.png`

```text
Using exactly the soft illustration style of the reference images (children's book art with fine grain, soft shading, no dark outlines), draw one character sheet of the same Indonesian mother character as in the second reference: same hijab, same long mustard dress, same face, same sandals. Show her four times, full body, clearly separated with wide gaps: 1) three-quarter view facing right, carrying a large grey stone in both arms, 2) three-quarter view facing right, holding a round wooden tray with three glasses of water in both hands, 3) three-quarter view facing right, painting with a paintbrush held in one hand and a small open paint can in the other, 4) standing facing the viewer, both arms raised high in joyful cheering with a big smile. Natural hands with correct fingers. Plain solid white background, no ground shadow, no text, no flags.
```

## 3. `tokoh-keriting-b.png`

**Referensi:** `sampul.png`, `tokoh-keriting.png`

```text
Using exactly the soft illustration style of the reference images (children's book art with fine grain, soft shading, no dark outlines), draw one character sheet of the same Indonesian young woman as in the second reference: same big curly hair, same teal shirt, same brown skirt, same skin colour, same sandals. Show her four times, full body, clearly separated with wide gaps: 1) three-quarter view facing right, tipping a burlap sack so that pale sand pours out, 2) three-quarter view facing right, carrying a long wooden plank on one shoulder with one hand holding it, 3) standing facing slightly right, holding a tall plain wooden pole upright beside her with both hands, the pole rises above her head and its top is bare, no flag and no cloth on it, 4) standing facing the viewer, both arms raised high in joyful cheering with a big smile. Natural hands with correct fingers. Plain solid white background, no ground shadow, no text, no flags.
```

## 4. `tokoh-kakek-b.png`

**Referensi:** `sampul.png`, `tokoh-kakek.png`

```text
Using exactly the soft illustration style of the reference images (children's book art with fine grain, soft shading, no dark outlines), draw one character sheet of the same Indonesian grandfather as in the second reference: same woven conical hat, same grey moustache, same cream shirt, same brown trousers, same sandals. Show him three times, full body, clearly separated with wide gaps: 1) three-quarter view facing right, digging and levelling with a shovel, 2) three-quarter view facing right, carrying a long wooden plank on one shoulder with one hand holding it, 3) standing facing the viewer, one thumb up and a warm encouraging smile. Natural hands with correct fingers. Plain solid white background, no ground shadow, no text, no flags.
```

## 5. `tokoh-anak-perempuan-b.png`

**Referensi:** `sampul.png`, `tokoh-anak-perempuan.png`

```text
Using exactly the soft illustration style of the reference images (children's book art with fine grain, soft shading, no dark outlines), draw one character sheet of the same small Indonesian girl as in the second reference: same pigtails, same mustard shirt, same teal overalls, barefoot. Show her three times, full body, clearly separated with wide gaps: 1) three-quarter view facing right, carrying a small light cardboard box in both arms, 2) standing facing slightly right with her arms folded across her chest, a neutral watching face with a small curious smile, empty hands and no tool, 3) standing facing the viewer, both arms raised high in joyful cheering with a big smile. Natural hands with correct fingers. Plain solid white background, no ground shadow, no text, no flags.
```

## 6. `tokoh-anak-laki-b.png`

**Referensi:** `sampul.png`, `tokoh-anak-laki.png`

```text
Using exactly the soft illustration style of the reference images (children's book art with fine grain, soft shading, no dark outlines), draw one character sheet of the same small Indonesian boy as in the second reference: same curly hair, same teal striped singlet, same brown shorts, barefoot. Show him three times, full body, clearly separated with wide gaps: 1) three-quarter view facing right, carrying one small grey stone in both hands, 2) standing facing slightly right with his arms folded across his chest, a neutral watching face with a small curious smile, empty hands and no tool, 3) standing facing the viewer, both arms raised high in joyful cheering with a big smile. Natural hands with correct fingers. Plain solid white background, no ground shadow, no text, no flags.
```

## 7. `tokoh-kepala-kampung-b.png`

**Referensi:** `sampul.png`, `tokoh-kepala-kampung.png`

```text
Using exactly the soft illustration style of the reference images (children's book art with fine grain, soft shading, no dark outlines), draw one character sheet of the same Indonesian village head as in the second reference: same black peci cap, same moustache, same green shirt, same dark sarong, same sandals. Show him three times, full body, clearly separated with wide gaps: 1) standing facing the viewer, holding up one plain solid deep green rectangular card in his raised hand, the card is blank with no text or symbol, kind smile, 2) standing facing the viewer, holding up one plain solid red rectangular card in his raised hand, the card is blank with no text or symbol, gentle encouraging smile, 3) standing facing the viewer, looking at the wrist watch on his left wrist with a slightly concerned but kind face. Natural hands with correct fingers. Plain solid white background, no ground shadow, no text, no flags.
```

---

# B. Latar Misi 2: jalan (4, berantai)

Semua gambar ini **tanpa orang, kendaraan, tulisan, dan bendera**. Rumput kosong di sepertiga bawah gambar untuk tempat warga berdiri.

## 8. `latar-misi2-1.png` (jalan berlubang, dari nol)

**Referensi:** `sampul.png`, `latar-misi1.png`

```text
Using the soft illustration style of the first reference (flat children's book art, fine grain, no dark outlines, cream sky, lime hills, lush trees with teal shadows and blue trunks), and the same colours and trees as the second reference, draw a wide landscape of a kampung road. A wide asphalt village road runs horizontally across the middle of the picture from the left edge to the right edge, seen from slightly above. In the exact centre of the road is one big deep pothole, oval, about one third of the road's width, dark brown earth inside with broken asphalt edges, clearly visible. Behind the road: green hedges, a few kampung houses with tiled roofs, lush trees and soft hills, a small cream sky strip at the very top. In front of the road: open empty lime grass filling the bottom third of the picture. No people, no vehicles, no signs, no flags, no text.
```

## 9. `latar-misi2-2.png` (lubang diisi pasir)

**Referensi:** `latar-misi2-1.png` (hasil nomor 8)

```text
Edit the reference image. Keep everything exactly identical: the composition, camera, road, houses, trees, grass, colours and lighting. Change only one thing: the pothole is now completely filled with a smooth mound of pale tan sand, slightly higher than the road surface, with only a thin edge of broken asphalt around it. No people, no text.
```

## 10. `latar-misi2-3.png` (lapis batu)

**Referensi:** `latar-misi2-2.png` (hasil nomor 9)

```text
Edit the reference image. Keep everything exactly identical: the composition, camera, road, houses, trees, grass, colours and lighting. Change only one thing: the patch in the middle of the road is now covered with a layer of grey crushed stones and gravel instead of sand, same oval outline, slightly mounded. No people, no text.
```

## 11. `latar-misi2-4.png` (jalan rata)

**Referensi:** `latar-misi2-3.png` (hasil nomor 10)

```text
Edit the reference image. Keep everything exactly identical: the composition, camera, houses, trees, grass, colours and lighting. Change only one thing: the road is now completely smooth and flat across its whole width, with freshly levelled dark asphalt where the pothole was, the repair barely visible. No people, no text.
```

---

# C. Latar Misi 3: balai desa (4, berantai)

Gaya balai seperti di peta: pendopo besar dengan beranda terbuka, tiang kayu, atap genteng merah. Bangunan di tengah gambar, rumput kosong di sepertiga bawah.

## 12. `latar-misi3-1.png` (lahan kosong, dari nol)

**Referensi:** `sampul.png`, `peta-beres.png`

```text
Using the soft illustration style of the first reference (flat children's book art, fine grain, no dark outlines, lime hills, lush trees with teal shadows and blue trunks, cream sky), draw a wide landscape of a flat cleared building plot in a kampung, in the middle of the picture. The plot is flat bare tan earth marked out with wooden stakes and a string rectangle on the ground, nothing built yet, with a small pile of bamboo poles lying on the side. Behind the plot: lush trees, a few kampung houses and soft hills, a small cream sky strip at the very top. In front of the plot: open empty lime grass filling the bottom third of the picture. Front view from slightly above. No people, no vehicles, no signs, no flags, no text.
```

## 13. `latar-misi3-2.png` (lantai dan tiang)

**Referensi:** `latar-misi3-1.png` (hasil nomor 12), `peta-beres.png`

```text
Edit the first reference image. Keep everything exactly identical: the composition, camera, trees, houses, hills, grass, colours and lighting. Change only one thing: on the plot now stands the foundation of a large village hall like the one in the second reference: a low cream stone platform with front steps and eight tall wooden pillars standing on it with a simple wooden beam frame on top, no roof yet. No people, no text.
```

## 14. `latar-misi3-3.png` (atap)

**Referensi:** `latar-misi3-2.png` (hasil nomor 13)

```text
Edit the reference image. Keep everything exactly identical: the composition, camera, trees, houses, hills, grass, platform, pillars, colours and lighting. Change only one thing: a large red-orange tiled hip roof now sits on top of the pillars, like a traditional Indonesian village hall. The sides are still open. No people, no text.
```

## 15. `latar-misi3-4.png` (balai jadi)

**Referensi:** `latar-misi3-3.png` (hasil nomor 14)

```text
Edit the reference image. Keep everything exactly identical: the composition, camera, trees, houses, hills, grass, platform, pillars, roof, colours and lighting. Change only one thing: the village hall is now finished and welcoming: wooden benches and long tables inside the open veranda, two potted plants beside the front steps, a swept stone path in front. No people, no flags, no text.
```

---

# D. Latar Misi 4 dan 5

## 16. `latar-misi4.png` (jalan kampung bersih dan cerah)

**Referensi:** `sampul.png`, `latar-misi1.png`

```text
Using the soft illustration style of the first reference (flat children's book art, fine grain, no dark outlines, cream sky, lime hills, lush trees with teal shadows and blue trunks), and the same colours as the second reference, draw a wide, bright, sunny kampung street, tidy and clean, getting ready to celebrate. A wide grey village road runs horizontally across the lower middle of the picture from the left edge to the right edge, seen from slightly above, with a neat low fence and tidy front gardens along its far side, and four cheerful kampung houses with red tiled roofs standing in a row behind the fence, lush trees between them. A cream sky strip at the top. In front of the road: a narrow strip of lime grass at the very bottom. No people, no vehicles, no rubbish, no flags, no banners, no bunting, no signs, no text.
```

## 17. `latar-misi5.png` (senja dengan pos ronda)

**Referensi:** `sampul.png`, `peta-beres.png`

```text
Using the soft illustration style of the first reference (flat children's book art, fine grain, no dark outlines), and the wooden neighbourhood guard post (pos ronda) from the bottom right of the second reference, draw a wide kampung scene at early dusk: a warm peach and apricot sky fading to soft lavender at the top, long soft shadows, the hills and trees in gentle teal and green. On the right third of the picture stands the wooden guard post, with a red tiled roof, a raised wooden floor and railings, a small front step, and three lamps hanging from its roof edge and front, all three lamps switched off. The post faces the viewer, seen from slightly above. The left two thirds of the picture is an open dirt path and grass with a few kampung houses far away, left empty. No people, no flags, no signs, no text.
```

---

# E. Lembar objek tambahan

## 18. `objek-2.png`

**Referensi:** `sampul.png`

```text
Using the soft illustration style of the reference (flat children's book art, fine grain, no dark outlines), draw a sheet of separate objects with wide empty gaps between them, on a plain solid white background with no shadows and no text. First row, seen from the side facing right: a small blue kampung car, a boy riding a bicycle with a smile, a wooden wheelbarrow full of sand. Second row: a pile of grey stones, a burlap sack of sand tied at the top, a neat stack of red bricks. Third row: a stack of wooden planks, a wooden bucket of water, a mound of loose tan sand. No flags.
```
