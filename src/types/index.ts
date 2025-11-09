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

export type AracDurum = 'Stokta' | 'Satıldı';

export type TaksitDurum = 'Beklemede' | 'Ödendi' | 'Gecikmiş';

export type CekSenetTip = 'Çek' | 'Senet';

export type CekSenetDurum = 'Portföyde' | 'Tahsil Edildi' | 'Ciro Edildi' | 'Ödendi';

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

// Oto Galeri
export interface Arac {
  id: string;
  plaka: string;
  marka: string;
  model: string;
  yil: number;
  renk?: string;
  satirCekNo?: string;
  alisAciklama?: string;
  durum: AracDurum;
  alisFiyati: number;
  satisFiyati?: number;
  toplamMaliyet: number; // alisFiyati + maliyetler
  alisTarihi: string;
  satisTarihi?: string;
  saticiCariId: string; // Kimden alındı
  musteriCariId?: string; // Kime satıldı
  olusturmaTarihi: string;
}

export interface AracMaliyet {
  id: string;
  aracId: string;
  tarih: string;
  kategori: string;
  tutar: number;
  odemeYontemi: OdemeYontemi;
  hesapId?: string;
  krediKartiId?: string;
  aciklama?: string;
  giderId: string; // İlişkili gider kaydı
}

// Taksitli İşlemler
export interface TaksitliBorc {
  id: string;
  baslik: string;
  cariId: string; // Tedarikçi
  toplamTutar: number;
  kalanTutar: number;
  taksitSayisi: number;
  taksitTutari: number;
  baslangicTarihi: string;
  aciklama?: string;
  kaynakModul: string; // 'OtoGaleri' veya 'Stok'
  kaynakId: string;
  olusturmaTarihi: string;
}

export interface TaksitliAlacak {
  id: string;
  baslik: string;
  cariId: string; // Müşteri
  toplamTutar: number;
  kalanTutar: number;
  taksitSayisi: number;
  taksitTutari: number;
  baslangicTarihi: string;
  aciklama?: string;
  kaynakModul: string;
  kaynakId: string;
  olusturmaTarihi: string;
}

export interface TaksitOdemesi {
  id: string;
  taksitliId: string; // TaksitliBorc veya TaksitliAlacak ID
  tip: 'Borç' | 'Alacak';
  taksitNo: number;
  tutar: number;
  vadeTarihi: string;
  odemeTarihi?: string;
  durum: TaksitDurum;
}

// Stok
export interface Urun {
  id: string;
  ad: string;
  kategori: string;
  barkod?: string;
  birim: string; // Adet, Kg, Lt, vb.
  stokMiktari: number;
  minStok?: number;
  alisFiyati: number;
  satisFiyati: number;
  aciklama?: string;
  olusturmaTarihi: string;
}

export interface StokHareket {
  id: string;
  urunId: string;
  tarih: string;
  tip: 'Giriş' | 'Çıkış';
  miktar: number;
  birimFiyat: number;
  toplamTutar: number;
  cariId?: string; // Tedarikçi (giriş) veya Müşteri (çıkış)
  aciklama?: string;
  olusturmaTarihi: string;
}

// Çek & Senet
export interface CekSenet {
  id: string;
  tip: CekSenetTip;
  durum: CekSenetDurum;
  cekSenetNo: string;
  tutar: number;
  vadeTarihi: string;
  cariId: string; // Alınan: müşteri, Verilen: tedarikçi
  banka?: string;
  sube?: string;
  hesapNo?: string;
  aciklama?: string;
  tahsilTarihi?: string;
  odemeTarihi?: string;
  ciroEdilenCariId?: string; // Ciro edildiği cari
  ciroTarihi?: string;
  olusturmaTarihi: string;
}

// Krediler
export interface Kredi {
  id: string;
  ad: string;
  banka: string;
  toplamTutar: number;
  kalanTutar: number;
  faizOrani?: number;
  taksitSayisi: number;
  aylikTaksit: number;
  baslangicTarihi: string;
  bitisTarihi: string;
  aciklama?: string;
  olusturmaTarihi: string;
}

export interface KrediOdemesi {
  id: string;
  krediId: string;
  taksitNo: number;
  tutar: number;
  vadeTarihi: string;
  odemeTarihi?: string;
  durum: TaksitDurum;
  hesapId?: string;
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
  // Oto Galeri
  araclar: Arac[];
  aracMaliyetler: AracMaliyet[];
  // Taksitli İşlemler
  taksitliBorclar: TaksitliBorc[];
  taksitliAlacaklar: TaksitliAlacak[];
  taksitOdemeleri: TaksitOdemesi[];
  // Stok
  urunler: Urun[];
  stokHareketler: StokHareket[];
  // Çek & Senet
  cekSenetler: CekSenet[];
  // Krediler
  krediler: Kredi[];
  krediOdemeleri: KrediOdemesi[];
}
