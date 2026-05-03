# 🤖 WhatsApp AI Bot — Gemini Powered

Bot WhatsApp otomatis yang terhubung ke akun WhatsApp Anda, didukung oleh **Google Gemini AI**.

## ✨ Fitur

| Fitur | Deskripsi |
|---|---|
| 🔗 Koneksi WhatsApp | Scan QR Code untuk menghubungkan akun WhatsApp Anda |
| 🤖 AI Gemini | Jawaban cerdas menggunakan Google Gemini 2.0 Flash |
| 📱 Reply di Grup | Bot hanya menjawab ketika Anda di-tag/mention di grup |
| ⚙️ System Prompt | Atur kepribadian & gaya jawaban AI sesuai keinginan |
| ✅❌ Auto Setuju/Tolak | Setting per nomor untuk selalu setuju atau tolak otomatis |
| 💬 Keyword Reply | Jawaban otomatis berdasarkan keyword tertentu |
| 📋 Log Pesan | Monitor semua pesan masuk dan balasan bot |
| 🌐 Web Dashboard | Kontrol semua pengaturan melalui browser |

## 🚀 Cara Pakai

### 1. Dapatkan Gemini API Key
Buka [Google AI Studio](https://aistudio.google.com/apikey) dan buat API key gratis.

### 2. Setup
```bash
# Install dependencies
npm install

# Edit file .env dan masukkan API key Anda
# GEMINI_API_KEY=your_api_key_here

# Jalankan bot
npm start
```

### 3. Hubungkan WhatsApp
1. Buka browser ke `http://localhost:3000`
2. Scan QR Code yang muncul dengan WhatsApp Anda
3. Bot siap digunakan! 🎉

## 📱 Penggunaan

### Mengatur Jawaban AI
Di tab **AI Settings**, Anda bisa:
- Mengubah **System Prompt** untuk mengatur gaya jawaban AI
- Mengaktifkan/nonaktifkan auto-reply
- Mengatur apakah bot hanya reply saat di-tag

### Mengatur Aturan Per Kontak
Di tab **Kontak Rules**, Anda bisa:
- **Selalu Setuju** — Bot otomatis menyetujui pesan dari nomor tertentu
- **Selalu Tidak Setuju** — Bot otomatis menolak pesan dari nomor tertentu
- **Jawaban Custom** — Bot menjawab dengan teks yang Anda tentukan
- **Abaikan** — Bot tidak membalas pesan dari nomor tersebut

### Auto Reply Keyword
Di tab **Auto Reply**, tambahkan keyword dan jawaban otomatis.
Contoh: keyword `jadwal` → jawaban `Jadwal akan diumumkan segera.`

## 📁 Struktur File

```
Project 0.3/
├── server.js          # Server utama (WhatsApp + Gemini + API)
├── config.json        # Konfigurasi bot (User Settings)
├── config.example.json # Template konfigurasi
├── package.json       # Dependencies
├── .env               # API key (RAHASIA!)
├── .env.example       # Template environment
├── .gitignore         # Mencegah file rahasia ter-upload
└── public/
    ├── index.html     # Dashboard web
    ├── style.css      # Styling dashboard
    └── app.js         # Frontend logic
```

## 🔒 Keamanan & Berbagi (Sharing)

Jika Anda ingin membagikan project ini (misalnya ke GitHub atau teman):

1.  **JANGAN PERNAH** membagikan file `.env` dan `config.json`. File ini berisi API Key dan daftar kontak pribadi Anda.
2.  **JANGAN PERNAH** membagikan folder `.wwebjs_auth` dan `.wwebjs_cache`. Folder ini berisi session WhatsApp Anda.
3.  **Gunakan `.gitignore`**: Project ini sudah dilengkapi `.gitignore` untuk mencegah file sensitif (`.env`, `config.json`, folder auth) ter-upload secara tidak sengaja.
4.  **Template**: Orang lain cukup menyalin `.env.example` ke `.env` dan `config.example.json` ke `config.json` untuk memulai.

## ⚠️ Penting

- **Jangan bagikan file `.env`** yang berisi API key Anda
- Bot menggunakan **whatsapp-web.js** yang terhubung via WhatsApp Web
- Pastikan koneksi internet stabil agar bot tetap aktif
- WhatsApp bisa men-disconnect jika mendeteksi aktivitas tidak biasa
