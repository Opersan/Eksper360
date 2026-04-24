# Oto Ekspertiz Sistemi

React + Vite + TypeScript ile geliştirilmiş web tabanlı araç ekspertiz yönetim sistemi.

## Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Ortam Değişkenleri

`.env` dosyasını düzenleyin:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Not:** `.env` boş bırakılırsa uygulama mock data ile çalışır. Demo giriş: `demo@ekspertiz.com` / `demo1234`

### 3. Supabase Kurulumu

1. [supabase.com](https://supabase.com) → Yeni proje oluştur
2. **SQL Editor** → `supabase_schema.sql` dosyasının içeriğini çalıştır
3. **Storage** → `expertise-photos` bucket oluştur (public)
4. **Authentication** → E-posta/şifre etkinleştir
5. Proje URL ve Anon Key'i `.env` dosyasına yaz

### 4. Uygulamayı Çalıştır

```bash
npm run dev
```

http://localhost:5173 adresinden açılır.

## Özellikler

- **Giriş**: E-posta/şifre ile kimlik doğrulama
- **Dashboard**: Ekspertiz istatistikleri ve son kayıtlar
- **Liste**: Plaka araması ve durum filtreleme
- **Yeni Kayıt**: Hızlı araç kaydı oluşturma
- **Adım Adım Form**: 7 adımlı detaylı ekspertiz formu
  - Genel araç bilgileri + fotoğraf yükleme
  - Kaporta durumları
  - İç/dış kontroller
  - Lastik bilgileri
  - Motor notu
  - Mekanik not
  - Önizleme ve tamamlama
- **Detay Görüntüleme**: Tüm ekspertiz bilgilerini görüntüle
- **Rapor/PDF**: Yazdırılabilir A4 ekspertiz raporu

## Tech Stack

- React 18 + Vite + TypeScript
- Tailwind CSS
- Supabase (Auth + PostgreSQL + Storage)
- react-router-dom v6
- react-hook-form + zod
- lucide-react
- react-to-print + jsPDF + html2canvas

## Proje Yapısı

```
src/
├── components/
│   ├── steps/          # Adım adım form bileşenleri
│   └── ui/             # Ortak UI bileşenler
├── constants/          # Sabitler (parçalar, durumlar, vb.)
├── hooks/              # useAuth
├── layouts/            # AppLayout (sidebar + header)
├── pages/              # Sayfa bileşenleri
├── routes/             # Router + ProtectedRoute
├── services/           # Supabase servisler
├── types/              # TypeScript tipleri
└── utils/              # Tarih, PDF yardımcıları
```
