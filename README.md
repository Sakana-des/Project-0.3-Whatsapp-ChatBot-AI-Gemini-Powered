# 🤖 WhatsApp AI Bot — Gemini Powered

Bot WhatsApp otomatis yang terhubung ke akun WhatsApp Anda, didukung oleh **Google AI** (Mendukung Gemini dan Gemma 3).

## ✨ Fitur Terbaru & Utama

| Fitur | Deskripsi |
|---|---|
| 🔗 Koneksi WhatsApp | Scan QR Code untuk menghubungkan akun WhatsApp Anda via Web. |
| 🤖 AI Generative | Menggunakan model cerdas terbaru (Saat ini diatur menggunakan `gemma-3-1b-it` / `gemini-3-flash-preview`). |
| 📱 Reply di Grup | Bot pintar yang bisa diatur untuk hanya membalas jika di-tag/mention di grup. |
| ⚙️ System Prompt | Atur kepribadian, gaya bahasa, dan perilaku AI secara umum. |
| 🎭 **AI Persona Khusus** | **[BARU]** Berikan prompt kepribadian unik ke setiap nomor yang berbeda (misal: si A dijawab dengan sinis, si B dijawab gaul). |
| ✅❌ Kontak Rules | Mode setuju otomatis, tolak otomatis, abaikan, atau jawaban kustom per kontak. |
| 📞 Auto Konversi Nomor | **[BARU]** Masukkan nomor dengan format lokal `08...` dan sistem otomatis mengenalinya sebagai `628...`. |
| 💬 Keyword Reply | Jawaban statis otomatis jika pesan mengandung kata kunci tertentu. |
| 📋 Log Pesan Detail | **[BARU]** Monitor semua chat langsung dari dashboard. Kini menampilkan **Nomor ID Asli** dari pengirim (Berguna untuk melihat ID tersembunyi `@lid` di Grup Komunitas). |
| 🎛️ **Control Panel UI** | **[BARU]** Dilengkapi aplikasi Python UI untuk menyalakan bot secara terpisah dan tombol **Emergency Stop**. |

## 🚀 Cara Pakai

### 1. Dapatkan Gemini API Key
Buka [Google AI Studio](https://aistudio.google.com/apikey) menggunakan akun Google Anda dan buat API key gratis.

### 2. Setup Awal
```bash
# 1. Install dependencies Node.js
npm install

# 2. Buat file .env dari template
cp .env.example .env

# 3. Edit file .env dan masukkan API key Anda di baris GEMINI_API_KEY
```

### 3. Menyalakan Bot
Terdapat 2 cara untuk menyalakan bot:

**Cara A (Menggunakan Control Panel GUI):**
```bash
python control_panel.py
```
Akan terbuka jendela dengan tombol **START SYSTEM** untuk menjalankan bot dan **EMERGENCY STOP** untuk mematikan paksa semua proses.

**Cara B (Menggunakan Terminal Klasik):**
```bash
npm start
# atau
node server.js
```

### 4. Hubungkan WhatsApp
1. Buka browser dan pergi ke `http://localhost:3000`
2. Scan QR Code yang muncul di layar dengan HP WhatsApp Anda.
3. Bot langsung siap bereaksi! 🎉

## 📱 Penggunaan Dashboard

### Mengatur Jawaban AI (System Prompt)
Di tab **AI Settings**, Anda dapat mengubah kepribadian utama bot (misal: menjadikannya asisten profesional atau teman gaul).

### Mengatur Aturan Per Kontak (Kontak Rules)
Fitur unggulan di mana Anda bisa mengatur perlakuan khusus ke orang tertentu:
- **AI Persona Khusus**: Bot tetap menggunakan AI, namun dengan prompt kepribadian yang *berbeda* khusus untuk orang tersebut.
- **Selalu Setuju / Tolak**: Mengiyakan atau menolak ajakan secara instan tanpa perlu AI.
- **Abaikan**: Memblokir interaksi dengan nomor tersebut.
- *Tip: Gunakan halaman **Log Pesan** untuk menyalin nomor/ID WhatsApp pengirim yang akurat (termasuk kode `@lid` di grup komunitas).*

## 📁 Struktur File Utama

```
Project 0.3/
├── server.js          # Backend utama (WhatsApp + AI Engine + API API)
├── control_panel.py   # Launcher Python dengan tombol Emergency
├── config.json        # Database pengaturan dari Dashboard (Otomatis)
├── config.example.json# Template database
├── package.json       # Dependencies Node.js
├── .env               # File API key rahasia Anda
├── .gitignore         # Pemblokir file rahasia untuk GitHub
└── public/
    ├── index.html     # Tampilan web dashboard
    ├── style.css      # Desain dashboard
    └── app.js         # Logika interaktif dashboard
```

## 🔒 Keamanan & Berbagi (Publishing)

Project ini **sudah 100% aman** untuk di-upload ke GitHub atau dibagikan ke publik karena sistem sudah dilengkapi dengan `.gitignore` tingkat lanjut.

Saat Anda menjalankan perintah `git push`, file-file di bawah ini **TIDAK AKAN** ter-upload demi menjaga keamanan Anda:
1. File `.env` (API Key Anda aman).
2. File `config.json` (Nomor telepon teman/kontak Anda aman).
3. Folder `.wwebjs_auth/` dan `.wwebjs_cache/` (Sesi login WhatsApp web Anda sangat aman dan anti dibajak).

Orang lain yang mendownload repo ini cukup menggunakan `config.example.json` dan `.env.example` sebagai panduan awal mereka.

## ⚠️ Peringatan Penggunaan API
- Model AI (khususnya versi non-lite) memiliki batasan request gratis per menit/hari. Jika Anda menerima pesan *Terjadi kesalahan* di terminal, kemungkinan besar kuota API harian Anda dari Google sudah habis.
- Solusi: Tunggu keesokan harinya, gunakan model `gemini-1.5-flash` / `gemma-3-1b-it`, atau gunakan API Key dari akun Google lain.
