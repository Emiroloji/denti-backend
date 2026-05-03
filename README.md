# Denti - Diş Kliniği Stok ve Malzeme Yönetim Sistemi

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 12">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Ant%20Design-5.0-0170FE?style=for-the-badge&logo=antdesign&logoColor=white" alt="Ant Design">
</p>

<p align="center">
  <b>Türk yapımı, diş kliniklerine özel stok yönetim çözümü</b>
</p>

---

## Özellikler

### Güvenlik ve Yetkilendirme
- **Rol Bazlı Erişim Kontrolü** - Admin, doktor, asistan rolleri
- **İki Faktörlü Doğrulama (2FA)** - TOTP desteği
- **Çok Şirketli Mimari** - Birden fazla klinik/şube yönetimi
- **Şirket Bazlı Veri İzolasyonu** - Tenant güvenliği

### Stok Yönetimi
- **Batch Bazlı Takip** - Parti numarası ile detaylı izleme
- **Son Kullanma Tarihi** - Otomatik uyarılar (7, 30 gün)
- **Düşük Stok Uyarıları** - Yapılandırılabilir eşik değerleri
- **Alt Birim Desteği** - Tablet/kapsül gibi alt birimler
- **Barkod Desteği** - Hızlı ürün tanımlama
- **Çok Klinik Desteği** - Şube bazlı stok takibi

### Stok Hareketleri
- **Giriş/Çıkış/Transfer** - Detaylı hareket kayıtları
- **Klinikler Arası Transfer** - Onay akışlı transfer sistemi
- **Stok Düzeltme** - Manuel düzeltme kayıtları
- **İade Yönetimi** - Tedarikçi iadeleri

### Uyarı Sistemi
- **Düşük Stok** - Eşik değerinin altına inince
- **Kritik Stok** - Acil sipariş gerektiren seviye
- **Son Kullanma** - Yaklaşan/Geçmiş tarih uyarıları
- **Toplu Çözümleme** - Çoklu uyarı yönetimi

### Raporlama
- **Stok Durumu** - Anlık stok özeti
- **Hareket Geçmişi** - Detaylı işlem kayıtları
- **Finansal Değer** - Stok değeri hesaplamaları
- **PDF/Excel Export** - Rapor dışa aktarım

---

## Kurulum

### Gereksinimler
- PHP 8.2 veya üzeri
- MySQL 8.0+ veya PostgreSQL 14+
- Node.js 18+
- Composer 2.5+
- Redis (opsiyonel, kuyruk için)

### Adım Adım Kurulum

```bash
# 1. Projeyi klonlayın
git clone https://github.com/yourcompany/denti.git
cd denti

# 2. PHP bağımlılıkları
composer install

# 3. JavaScript bağımlılıkları
npm install

# 4. Ortam dosyasını oluşturun
cp .env.example .env

# 5. Uygulama anahtarı oluşturun
php artisan key:generate

# 6. Veritabanı yapılandırması
# .env dosyasında DB ayarlarını yapın, sonra:
php artisan migrate --seed

# 7. Frontend build
npm run build

# 8. Geliştirme sunucusu
php artisan serve
npm run dev  # Ayrı terminalde
```

### Demo Veri
Seed edilen demo verileri kullanarak hemen başlayabilirsiniz:

```
Şirket Kodu: DEMO
Kullanıcı Adı: admin
Şifre: password123
```

---

## Proje Yapısı

```
denti/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/    # API endpoint'leri
│   │   ├── Resources/          # API response formatlayıcı
│   │   └── Requests/           # Form validasyon
│   ├── Models/                 # Eloquent modeller
│   ├── Services/               # İş mantığı (Business Logic)
│   ├── Repositories/           # Veri erişim katmanı
│   ├── Observers/              # Model olay dinleyicileri
│   ├── Mail/                   # E-posta şablonları
│   └── Policies/               # Yetkilendirme politikaları
├── database/
│   ├── migrations/             # Veritabanı şemaları
│   └── seeders/                # Demo veri
├── resources/
│   └── js/
│       └── Modules/
│           ├── stock/           # Stok modülü
│           ├── alerts/          # Uyarı modülü
│           ├── clinics/         # Klinik yönetimi
│           ├── users/           # Kullanıcı yönetimi
│           └── auth/            # Kimlik doğrulama
├── routes/
│   ├── web.php                # Inertia sayfa rotaları
│   └── api.php                # API rotaları
└── tests/
    ├── Unit/                   # Birim testleri
    ├── Feature/                # Entegrasyon testleri
    └── E2E/                    # Playwright E2E testleri
```

---

## Geliştirme

### Kod Standartları
```bash
# PHP kod stil kontrolü
./vendor/bin/pint

# Frontend lint
npm run lint

# TypeScript tip kontrolü
npx tsc --noEmit
```

### Test
```bash
# Backend testleri
php artisan test

# Frontend testleri
npm run test

# E2E testleri
npx playwright test
```

### Build
```bash
# Production build
npm run build

# Optimize edilmiş Laravel
php artisan optimize
```

---

## Güvenlik Özellikleri

- **Spatie Permission** - Detaylı yetkilendirme
- **2FA (Two Factor Auth)** - Google Authenticator desteği
- **Rate Limiting** - Brute force koruması
- **CSRF Protection** - Form güvenliği
- **SQL Injection Koruması** - Prepared statements
- **XSS Koruması** - Blade escaping
- **Tenant İzolasyonu** - Global scope ile veri ayrımı

---

## API Dokümantasyonu

API dokümantasyonuna `/docs` adresinden erişebilirsiniz (Scribe ile oluşturulmuştur).

### Kimlik Doğrulama
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "company_code": "DEMO",
    "username": "admin",
    "password": "password123"
  }'
```

### Örnek: Ürün Listeleme
```bash
curl -X GET http://localhost:8000/api/products \
  -H "Authorization: Bearer {token}"
```

---

## Test Kullanıcıları

| Rol | Kullanıcı Adı | Şifre | Yetkiler |
|-----|---------------|-------|----------|
| Admin | admin | password123 | Tüm yetkiler |
| Doktor | doctor | password123 | Stok görüntüleme, kullanma |
| Asistan | assistant | password123 | Sadece görüntüleme |

---

## Deployment

### Production Checklist
- **`.env` production ayarları**
- **`APP_DEBUG=false`**
- **`APP_ENV=production`**
- **SSL sertifikası**
- **Queue worker (Supervisor)**
- **Scheduler (Cron job)**
- **Log rotation**
- **Backup stratejisi**

### Docker (Opsiyonel)
```bash
docker-compose up -d
# Geliştirme ortamı hazır!
```

---

## Destek

- **Email**: support@denti.com.tr
- **Telefon**: +90 555 123 4567
- **Web**: https://denti.com.tr

---

## Lisans

Bu proje [MIT](LICENSE) lisansı ile lisanslanmıştır.

---

<p align="center">
  **Türk yapımı, yerel destek**
</p>

<p align="center">
  Made with ❤️ in Istanbul
</p>
