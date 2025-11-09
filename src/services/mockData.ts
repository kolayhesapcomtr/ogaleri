import type { AppState } from '../types';
import { DEFAULT_AYARLAR } from '../constants';
import { generateId, getTodayDate } from '../utils/formatters';

export const getMockData = (): AppState => {
  const today = getTodayDate();

  // Demo Cariler
  const cari1 = generateId();
  const cari2 = generateId();
  const cari3 = generateId();

  // Demo Hesaplar
  const hesap1 = generateId();
  const hesap2 = generateId();

  return {
    mode: 'demo',
    ayarlar: DEFAULT_AYARLAR,

    cariler: [
      {
        id: cari1,
        ad: 'Ahmet Yılmaz',
        tip: 'Müşteri',
        telefon: '0532 123 45 67',
        adres: 'İstanbul',
        bakiye: 5000, // 5000 TL alacak
        olusturmaTarihi: today,
      },
      {
        id: cari2,
        ad: 'Mehmet Demir',
        tip: 'Müşteri',
        telefon: '0533 234 56 78',
        bakiye: -3000, // 3000 TL borç
        olusturmaTarihi: today,
      },
      {
        id: cari3,
        ad: 'XYZ Tedarik Ltd.',
        tip: 'Tedarikçi',
        telefon: '0212 345 67 89',
        adres: 'Ankara',
        bakiye: -8000, // 8000 TL borç (bize)
        olusturmaTarihi: today,
      },
    ],

    cariHareketler: [
      {
        id: generateId(),
        cariId: cari1,
        tarih: today,
        tip: 'Alacak',
        tutar: 5000,
        aciklama: 'Veresiye satış',
      },
      {
        id: generateId(),
        cariId: cari2,
        tarih: today,
        tip: 'Borç',
        tutar: 3000,
        aciklama: 'Veresiye alış',
      },
    ],

    hesaplar: [
      {
        id: hesap1,
        ad: 'Kasa',
        tip: 'Kasa',
        bakiye: 25000,
        aciklama: 'Merkez kasa',
        olusturmaTarihi: today,
      },
      {
        id: hesap2,
        ad: 'Ziraat Bankası',
        tip: 'Banka',
        bakiye: 50000,
        aciklama: 'TR12 3456 7890 1234 5678',
        olusturmaTarihi: today,
      },
    ],

    hesapHareketler: [
      {
        id: generateId(),
        hesapId: hesap1,
        tarih: today,
        tip: 'ParaGirişi',
        tutar: 10000,
        aciklama: 'Başlangıç bakiyesi',
      },
      {
        id: generateId(),
        hesapId: hesap2,
        tarih: today,
        tip: 'ParaGirişi',
        tutar: 50000,
        aciklama: 'Başlangıç bakiyesi',
      },
    ],

    giderler: [
      {
        id: generateId(),
        tarih: today,
        kategori: 'Kira',
        tutar: 5000,
        odemeYontemi: 'Banka',
        hesapId: hesap2,
        aciklama: 'Ocak ayı kira',
        olusturmaTarihi: today,
      },
      {
        id: generateId(),
        tarih: today,
        kategori: 'Elektrik',
        tutar: 800,
        odemeYontemi: 'Nakit',
        hesapId: hesap1,
        aciklama: 'Elektrik faturası',
        olusturmaTarihi: today,
      },
    ],

    krediKartlari: [],
    krediKartiHareketler: [],
    islemKayitlari: [],
  };
};
