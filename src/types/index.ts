// Temel Tipler
export type AppMode = 'demo' | 'firebase';

export type CariTip = 'Müşteri' | 'Tedarikçi';

export type HesapTip = 'Kasa' | 'Banka';

export type OdemeYontemi = 'Nakit' | 'Banka' | 'Kredi Kartı';

export type CariHareketTip =
  | 'Alacak'
  | 'Borç'
  | 'Tahsilat'
  | 'Ödeme';

export type HesapHareketTip =
  | 'ParaGirişi'
  | 'ParaÇıkışı'
  | 'VirmanGelen'
  | 'VirmanGiden';

export type GiderKategori = string;

export type IslemTip = 'OLUŞTURMA' | 'GÜNCELLEME' | 'SİLME';

// Modeller
export interface Cari {
  id: string;
  ad: string;
  tip: CariTip;
  telefon?: string;
  adres?: string;
  notlar?: string;
  bakiye: number; // pozitif = alacak, negatif = borç
  olusturmaTarihi: string;
}

export interface CariHareket {
  id: string;
  cariId: string;
  tarih: string;
  tip: CariHareketTip;
  tutar: number;
  aciklama?: string;
  kaynakModul?: string; // 'OtoGaleri', 'Stok', 'Gider', vb.
  kaynakId?: string;
  kilitli?: boolean; // Başka modülden gelen işlemler kilitli
}

export interface Hesap {
  id: string;
  ad: string;
  tip: HesapTip;
  bakiye: number;
  aciklama?: string;
  olusturmaTarihi: string;
}

export interface HesapHareket {
  id: string;
  hesapId: string;
  tarih: string;
  tip: HesapHareketTip;
  tutar: number;
  aciklama?: string;
  kaynakModul?: string;
  kaynakId?: string;
  kilitli?: boolean;
}

export interface Gider {
  id: string;
  tarih: string;
  kategori: GiderKategori;
  tutar: number;
  odemeYontemi: OdemeYontemi;
  hesapId?: string; // Nakit veya Banka seçilirse
  krediKartiId?: string; // Kredi Kartı seçilirse
  aciklama?: string;
  olusturmaTarihi: string;
}

export interface KrediKarti {
  id: string;
  ad: string;
  banka: string;
  limit: number;
  bakiye: number; // Toplam borç
  hesapKesimGunu?: number;
  olusturmaTarihi: string;
}

export interface KrediKartiHareket {
  id: string;
  krediKartiId: string;
  tarih: string;
  tip: 'Harcama' | 'Ödeme';
  tutar: number;
  aciklama?: string;
  kaynakModul?: string;
  kaynakId?: string;
}

export interface IslemKaydi {
  id: string;
  tarih: string;
  modul: string;
  tip: IslemTip;
  aciklama: string;
  kullanici?: string;
  detaylar?: Record<string, any>;
}

// Ayarlar
export interface Ayarlar {
  giderKategorileri: string[];
  gelirKategorileri: string[];
  urunKategorileri: string[];
  subeler: string[];
}

// Uygulama State
export interface AppState {
  mode: AppMode;
  ayarlar: Ayarlar;
  cariler: Cari[];
  cariHareketler: CariHareket[];
  hesaplar: Hesap[];
  hesapHareketler: HesapHareket[];
  giderler: Gider[];
  krediKartlari: KrediKarti[];
  krediKartiHareketler: KrediKartiHareket[];
  islemKayitlari: IslemKaydi[];
}
