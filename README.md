# oGaleri

Küçük ve orta ölçekli işletmelerin finansal operasyonlarını takip etmesi için geliştirilmiş modüler bir web uygulaması.

## 🌐 Demo

**Canlı Demo:** [https://kolayhesapcomtr.github.io/ogaleri/](https://kolayhesapcomtr.github.io/ogaleri/)

## Özellikler

- 📊 **Dashboard** - Genel bakış ve istatistikler
- 👥 **Cari Hesaplar** - Müşteri/Tedarikçi borç-alacak takibi
- 💰 **Kasa & Banka** - Nakit ve banka hesapları yönetimi
- 💸 **Giderler** - Gider takibi ve kategorileme
- 🚗 **Oto Galeri** - Araç alım-satım yönetimi (peşin/taksitli)
- 📦 **Stok** - Ürün stok takibi ve yönetimi
- 📅 **Taksitler** - Borç/alacak taksit takibi
- 💳 **Kredi Kartları** - Kart yönetimi ve ödeme takibi
- 📋 **İşlem Kayıtları** - Tüm işlemlerin audit log takibi
- 📝 **Çek & Senet** - Çek/senet takibi (yakında)
- ⚙️ **Ayarlar** - Uygulama ayarları (yakında)

## Teknolojiler

- React 19 + TypeScript
- Tailwind CSS
- Firebase/Firestore
- Chart.js
- Vite

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Firebase yapılandırması için `.env` dosyası oluşturun:
```bash
cp .env.example .env
```

3. `.env` dosyasını Firebase bilgilerinizle güncelleyin.

4. Uygulamayı başlatın:
```bash
npm run dev
```

## Çalışma Modları

- **Demo Mod**: Önceden hazırlanmış verilerle test etme (tarayıcı belleğinde)
- **Firebase Mod**: Gerçek veriler, bulut tabanlı senkronizasyon

## Geliştirme

```bash
# Geliştirme sunucusu
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## Lisans

MIT
