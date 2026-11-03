# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Guru kelas 1 SD yang menjalankan game secara klasikal lewat laptop dan proyektor atau televisi, dibantu peserta didik (usia 6 sampai 7 tahun) yang maju bergantian. Sebagian peserta didik belum lancar membaca. Kelas berisi sekitar 20 sampai 28 anak yang menonton dari bangkunya. Karya ini juga dinilai oleh dosen sebagai bagian dari modul ajar.

## Product Purpose

Kerja Bakti Beneran adalah simulasi bermisi berbasis website untuk Pendidikan Pancasila Kelas 1 (Fase A), Bab 4 B "Aku Suka Bergotong Royong", dengan model CTL. Lima misi membantu peserta didik mengamati contoh gotong royong dan menemukan cirinya: dikerjakan bersama, saling membantu, dan untuk tujuan bersama. Misi 5 menjadi cek pemahaman dengan kartu hijau dan merah.

Sukses berarti karya ini bagus saat dinilai dosen dan tetap terbaca serta lancar saat dipakai di kelas.

## Positioning

Dipasangkan dengan media non digital Kotak Misteri Kampung. Kartu hijau dan merah yang dipegang anak di kelas adalah alat jawab yang sama pada Misi 5.

## Operating Context

- Dipakai pada Sintak 2 (Misi 1 sampai 4) dan Sintak 3 (Misi 5), serta untuk remedial (Misi 1 dan Misi 5).
- Guru membacakan petunjuk. Tombol speaker memutar narasi.
- Cadangan bila perangkat bermasalah: rekaman layar MP4 atau tangkapan layar.

## Capabilities and Constraints

- Phaser 3 dari `lib/phaser.min.js`. Harus jalan offline dan bisa dibuka langsung sebagai `file://`.
- Teks narasi lima misi mengikuti Lampiran 1B modul dan tidak diubah.
- Mekanik lima misi mengikuti Lampiran 7A modul. Setiap misi dapat diulang.
- Misi 1: warga anak hanya membantu di tepi sungai, tidak masuk ke air.
- Misi 5: waktu mundur 45 detik, enam warga, bintang 1 sampai 3.

## Brand Commitments

Gaya tampilan dari Lampiran 7 bersifat mengikat: ilustrasi datar berwarna cerah, latar krem dan hijau lembut senada sampul modul, teks besar dan tebal minimal 32 px, tombol besar yang mudah diketuk, satu tujuan untuk satu layar.

## Evidence on Hand

- Modul ajar: `../Modul_Ajar_IPS_CTL.docx` (Lampiran 1B dan Lampiran 7A).
- Sampul modul sebagai acuan visual, tertanam di file docx yang sama.
- Dokumen media pasangan: `../PRD.md`, `../Product.MD`.
- Belum ada hasil uji coba di kelas. Jangan mengklaim hasil belajar.

## Product Principles

1. Anak harus bisa memahami apa yang terjadi dari gambar, tanpa membaca.
2. Yang dirayakan adalah kerja bersama, bukan skor perorangan.
3. Salah jawab ditanggapi dengan lembut.
4. Isi mengikuti modul. Kalau tampilan dan modul berbeda, modul yang menang atau modulnya direvisi dengan sadar.

## Accessibility & Inclusion

- Kartu hijau dan merah juga dibedakan dengan tulisan "YA" dan "TIDAK", tidak bergantung pada warna saja.
- Harus terbaca lewat proyektor yang pudar dari bangku belakang.
- Warga digambarkan beragam, seperti pada sampul modul.

## Open Decisions

- Status ilustrasi AI terhadap kalimat modul "dibuat sendiri atau memakai gambar berlisensi terbuka" perlu dikonfirmasi ke penyusun modul atau dosen.
