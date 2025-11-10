import { useCallback } from 'react';
import type {
  AppState,
  Cari,
  CariHareket,
  Hesap,
  HesapHareket,
  Gider,
  Arac,
  AracMaliyet,
  TaksitliBorc,
  TaksitOdemesi,
  Urun,
  StokHareket,
  OdemeYontemi,
  KrediKarti,
  Kredi,
  KrediOdemesi,
  CekSenet,
  CekSenetDurum,
} from '../types';
import { generateId, getTodayDate, formatCurrency } from '../utils/formatters';

interface UseAppServiceProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const useAppService = ({ appState, setAppState }: UseAppServiceProps) => {
  // ==================== CARI HESAPLAR ====================

  const addCari = useCallback(
    (cari: Omit<Cari, 'id' | 'olusturmaTarihi' | 'bakiye'>) => {
      const newCari: Cari = {
        ...cari,
        id: generateId(),
        bakiye: 0,
        olusturmaTarihi: getTodayDate(),
      };

      setAppState((prev) => ({
        ...prev,
        cariler: [...prev.cariler, newCari],
        islemKayitlari: [
          ...prev.islemKayitlari,
          {
            id: generateId(),
            tarih: new Date().toISOString(),
            modul: 'CariHesaplar',
            tip: 'OLUŞTURMA',
            aciklama: `${cari.ad} eklendi`,
          },
        ],
      }));

      return newCari;
    },
    [setAppState]
  );

  const updateCari = useCallback(
    (id: string, updates: Partial<Cari>) => {
      setAppState((prev) => ({
        ...prev,
        cariler: prev.cariler.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
        islemKayitlari: [
          ...prev.islemKayitlari,
          {
            id: generateId(),
            tarih: new Date().toISOString(),
            modul: 'CariHesaplar',
            tip: 'GÜNCELLEME',
            aciklama: `Cari güncellendi`,
          },
        ],
      }));
    },
    [setAppState]
  );

  const deleteCari = useCallback(
    (id: string) => {
      const cari = appState.cariler.find((c) => c.id === id);
      if (!cari) return;

      // Cari hareketlerini de sil
      setAppState((prev) => ({
        ...prev,
        cariler: prev.cariler.filter((c) => c.id !== id),
        cariHareketler: prev.cariHareketler.filter((h) => h.cariId !== id),
        islemKayitlari: [
          ...prev.islemKayitlari,
          {
            id: generateId(),
            tarih: new Date().toISOString(),
            modul: 'CariHesaplar',
            tip: 'SİLME',
            aciklama: `${cari.ad} silindi`,
          },
        ],
      }));
    },
    [appState.cariler, setAppState]
  );

  const addCariHareket = useCallback(
    (hareket: Omit<CariHareket, 'id'>) => {
      const newHareket: CariHareket = {
        ...hareket,
        id: generateId(),
      };

      setAppState((prev) => {
        // Cari bakiyesini güncelle
        const updatedCariler = prev.cariler.map((cari) => {
          if (cari.id === hareket.cariId) {
            let yeniBakiye = cari.bakiye;

            if (hareket.tip === 'Alacak') {
              yeniBakiye += hareket.tutar;
            } else if (hareket.tip === 'Borç') {
              yeniBakiye -= hareket.tutar;
            } else if (hareket.tip === 'Tahsilat') {
              yeniBakiye -= hareket.tutar;
            } else if (hareket.tip === 'Ödeme') {
              yeniBakiye += hareket.tutar;
            }

            return { ...cari, bakiye: yeniBakiye };
          }
          return cari;
        });

        return {
          ...prev,
          cariler: updatedCariler,
          cariHareketler: [...prev.cariHareketler, newHareket],
        };
      });

      return newHareket;
    },
    [setAppState]
  );

  // ==================== KASA & BANKA ====================

  const addHesap = useCallback(
    (hesap: Omit<Hesap, 'id' | 'olusturmaTarihi' | 'bakiye'>) => {
      const newHesap: Hesap = {
        ...hesap,
        id: generateId(),
        bakiye: 0,
        olusturmaTarihi: getTodayDate(),
      };

      setAppState((prev) => ({
        ...prev,
        hesaplar: [...prev.hesaplar, newHesap],
        islemKayitlari: [
          ...prev.islemKayitlari,
          {
            id: generateId(),
            tarih: new Date().toISOString(),
            modul: 'Kasa&Banka',
            tip: 'OLUŞTURMA',
            aciklama: `${hesap.ad} eklendi`,
          },
        ],
      }));

      return newHesap;
    },
    [setAppState]
  );

  const updateHesap = useCallback(
    (id: string, updates: Partial<Hesap>) => {
      setAppState((prev) => ({
        ...prev,
        hesaplar: prev.hesaplar.map((h) =>
          h.id === id ? { ...h, ...updates } : h
        ),
      }));
    },
    [setAppState]
  );

  const deleteHesap = useCallback(
    (id: string) => {
      const hesap = appState.hesaplar.find((h) => h.id === id);
      if (!hesap) return;

      setAppState((prev) => ({
        ...prev,
        hesaplar: prev.hesaplar.filter((h) => h.id !== id),
        hesapHareketler: prev.hesapHareketler.filter((h) => h.hesapId !== id),
        islemKayitlari: [
          ...prev.islemKayitlari,
          {
            id: generateId(),
            tarih: new Date().toISOString(),
            modul: 'Kasa&Banka',
            tip: 'SİLME',
            aciklama: `${hesap.ad} silindi`,
          },
        ],
      }));
    },
    [appState.hesaplar, setAppState]
  );

  const addHesapHareket = useCallback(
    (hareket: Omit<HesapHareket, 'id'>) => {
      const newHareket: HesapHareket = {
        ...hareket,
        id: generateId(),
      };

      setAppState((prev) => {
        // Hesap bakiyesini güncelle
        const updatedHesaplar = prev.hesaplar.map((hesap) => {
          if (hesap.id === hareket.hesapId) {
            let yeniBakiye = hesap.bakiye;

            if (hareket.tip === 'ParaGirişi' || hareket.tip === 'VirmanGelen') {
              yeniBakiye += hareket.tutar;
            } else if (hareket.tip === 'ParaÇıkışı' || hareket.tip === 'VirmanGiden') {
              yeniBakiye -= hareket.tutar;
            }

            return { ...hesap, bakiye: yeniBakiye };
          }
          return hesap;
        });

        return {
          ...prev,
          hesaplar: updatedHesaplar,
          hesapHareketler: [...prev.hesapHareketler, newHareket],
        };
      });

      return newHareket;
    },
    [setAppState]
  );

  // ==================== GİDERLER ====================

  const addGider = useCallback(
    (gider: Omit<Gider, 'id' | 'olusturmaTarihi'>) => {
      const newGider: Gider = {
        ...gider,
        id: generateId(),
        olusturmaTarihi: getTodayDate(),
      };

      setAppState((prev) => {
        let updatedHesaplar = prev.hesaplar;
        let updatedHesapHareketler = prev.hesapHareketler;
        let updatedKrediKartlari = prev.krediKartlari;
        let updatedKrediKartiHareketler = prev.krediKartiHareketler;

        // Ödeme yöntemine göre ilgili hesaptan para çıkışı yap
        if (gider.odemeYontemi === 'Nakit' || gider.odemeYontemi === 'Banka') {
          if (gider.hesapId) {
            // Hesap bakiyesini güncelle
            updatedHesaplar = prev.hesaplar.map((hesap) =>
              hesap.id === gider.hesapId
                ? { ...hesap, bakiye: hesap.bakiye - gider.tutar }
                : hesap
            );

            // Hesap hareketi ekle
            updatedHesapHareketler = [
              ...prev.hesapHareketler,
              {
                id: generateId(),
                hesapId: gider.hesapId,
                tarih: gider.tarih,
                tip: 'ParaÇıkışı',
                tutar: gider.tutar,
                aciklama: `Gider: ${gider.kategori}`,
                kaynakModul: 'Gider',
                kaynakId: newGider.id,
                kilitli: true,
              },
            ];
          }
        } else if (gider.odemeYontemi === 'Kredi Kartı' && gider.krediKartiId) {
          // Kredi kartı bakiyesini güncelle
          updatedKrediKartlari = prev.krediKartlari.map((kart) =>
            kart.id === gider.krediKartiId
              ? { ...kart, bakiye: kart.bakiye + gider.tutar }
              : kart
          );

          // Kredi kartı hareketi ekle
          updatedKrediKartiHareketler = [
            ...prev.krediKartiHareketler,
            {
              id: generateId(),
              krediKartiId: gider.krediKartiId,
              tarih: gider.tarih,
              tip: 'Harcama',
              tutar: gider.tutar,
              aciklama: `Gider: ${gider.kategori}`,
              kaynakModul: 'Gider',
              kaynakId: newGider.id,
            },
          ];
        }

        return {
          ...prev,
          giderler: [...prev.giderler, newGider],
          hesaplar: updatedHesaplar,
          hesapHareketler: updatedHesapHareketler,
          krediKartlari: updatedKrediKartlari,
          krediKartiHareketler: updatedKrediKartiHareketler,
          islemKayitlari: [
            ...prev.islemKayitlari,
            {
              id: generateId(),
              tarih: new Date().toISOString(),
              modul: 'Gider',
              tip: 'OLUŞTURMA',
              aciklama: `${gider.kategori} gideri eklendi (${gider.tutar} TL)`,
            },
          ],
        };
      });

      return newGider;
    },
    [setAppState]
  );

  const deleteGider = useCallback(
    (id: string) => {
      const gider = appState.giderler.find((g) => g.id === id);
      if (!gider) return;

      setAppState((prev) => {
        let updatedHesaplar = prev.hesaplar;
        let updatedHesapHareketler = prev.hesapHareketler;
        let updatedKrediKartlari = prev.krediKartlari;
        let updatedKrediKartiHareketler = prev.krediKartiHareketler;

        // İlgili hesap hareketini bul ve sil, bakiyeyi geri al
        if (gider.hesapId) {
          const ilgiliHareket = prev.hesapHareketler.find(
            (h) => h.kaynakModul === 'Gider' && h.kaynakId === id
          );

          if (ilgiliHareket) {
            updatedHesaplar = prev.hesaplar.map((hesap) =>
              hesap.id === gider.hesapId
                ? { ...hesap, bakiye: hesap.bakiye + gider.tutar }
                : hesap
            );

            updatedHesapHareketler = prev.hesapHareketler.filter(
              (h) => h.id !== ilgiliHareket.id
            );
          }
        }

        // İlgili kredi kartı hareketini bul ve sil
        if (gider.krediKartiId) {
          const ilgiliKartHareket = prev.krediKartiHareketler.find(
            (h) => h.kaynakModul === 'Gider' && h.kaynakId === id
          );

          if (ilgiliKartHareket) {
            updatedKrediKartlari = prev.krediKartlari.map((kart) =>
              kart.id === gider.krediKartiId
                ? { ...kart, bakiye: kart.bakiye - gider.tutar }
                : kart
            );

            updatedKrediKartiHareketler = prev.krediKartiHareketler.filter(
              (h) => h.id !== ilgiliKartHareket.id
            );
          }
        }

        return {
          ...prev,
          giderler: prev.giderler.filter((g) => g.id !== id),
          hesaplar: updatedHesaplar,
          hesapHareketler: updatedHesapHareketler,
          krediKartlari: updatedKrediKartlari,
          krediKartiHareketler: updatedKrediKartiHareketler,
          islemKayitlari: [
            ...prev.islemKayitlari,
            {
              id: generateId(),
              tarih: new Date().toISOString(),
              modul: 'Gider',
              tip: 'SİLME',
              aciklama: `${gider.kategori} gideri silindi`,
            },
          ],
        };
      });
    },
    [appState.giderler, setAppState]
  );

  // ==================== OTO GALERİ ====================

  const addAracPesin = useCallback(
    (aracData: {
      plaka: string;
      marka: string;
      model: string;
      yil: number;
      renk?: string;
      satirCekNo?: string;
      alisAciklama?: string;
      alisFiyati: number;
      alisTarihi: string;
      saticiCariId: string;
      hesapId: string;
    }) => {
      const newArac: Arac = {
        id: generateId(),
        ...aracData,
        durum: 'Stokta',
        toplamMaliyet: aracData.alisFiyati,
        olusturmaTarihi: getTodayDate(),
      };

      setAppState((prev) => {
        // 1. Satıcı carisine alacak hareketi (veresiye alış gibi)
        const alacakHareket: CariHareket = {
          id: generateId(),
          cariId: aracData.saticiCariId,
          tarih: aracData.alisTarihi,
          tip: 'Alacak',
          tutar: aracData.alisFiyati,
          aciklama: `Araç alışı: ${aracData.plaka}`,
          kaynakModul: 'OtoGaleri',
          kaynakId: newArac.id,
          kilitli: true,
        };

        // 2. Satıcı carisine ödeme hareketi (hemen ödedik)
        const odemeHareket: CariHareket = {
          id: generateId(),
          cariId: aracData.saticiCariId,
          tarih: aracData.alisTarihi,
          tip: 'Ödeme',
          tutar: aracData.alisFiyati,
          aciklama: `Araç alışı ödemesi: ${aracData.plaka}`,
          kaynakModul: 'OtoGaleri',
          kaynakId: newArac.id,
          kilitli: true,
        };

        // 3. Hesaptan para çıkışı
        const hesapHareket: HesapHareket = {
          id: generateId(),
          hesapId: aracData.hesapId,
          tarih: aracData.alisTarihi,
          tip: 'ParaÇıkışı',
          tutar: aracData.alisFiyati,
          aciklama: `Araç alışı: ${aracData.plaka}`,
          kaynakModul: 'OtoGaleri',
          kaynakId: newArac.id,
          kilitli: true,
        };

        // Hesap bakiyesini güncelle
        const updatedHesaplar = prev.hesaplar.map((h) =>
          h.id === aracData.hesapId
            ? { ...h, bakiye: h.bakiye - aracData.alisFiyati }
            : h
        );

        // Cari bakiyesi değişmez (alacak ve ödeme birbirini götürüyor)

        return {
          ...prev,
          araclar: [...prev.araclar, newArac],
          cariHareketler: [...prev.cariHareketler, alacakHareket, odemeHareket],
          hesaplar: updatedHesaplar,
          hesapHareketler: [...prev.hesapHareketler, hesapHareket],
          islemKayitlari: [
            ...prev.islemKayitlari,
            {
              id: generateId(),
              tarih: new Date().toISOString(),
              modul: 'OtoGaleri',
              tip: 'OLUŞTURMA',
              aciklama: `Peşin araç alışı: ${aracData.plaka}`,
            },
          ],
        };
      });

      return newArac;
    },
    [setAppState]
  );

  const addAracTaksitli = useCallback(
    (aracData: {
      plaka: string;
      marka: string;
      model: string;
      yil: number;
      renk?: string;
      satirCekNo?: string;
      alisAciklama?: string;
      alisFiyati: number;
      alisTarihi: string;
      saticiCariId: string;
      pesinat: number;
      hesapId?: string;
      taksitSayisi: number;
      baslangicTarihi: string;
    }) => {
      const newArac: Arac = {
        id: generateId(),
        plaka: aracData.plaka,
        marka: aracData.marka,
        model: aracData.model,
        yil: aracData.yil,
        renk: aracData.renk,
        satirCekNo: aracData.satirCekNo,
        alisAciklama: aracData.alisAciklama,
        durum: 'Stokta',
        alisFiyati: aracData.alisFiyati,
        toplamMaliyet: aracData.alisFiyati,
        alisTarihi: aracData.alisTarihi,
        saticiCariId: aracData.saticiCariId,
        olusturmaTarihi: getTodayDate(),
      };

      setAppState((prev) => {
        const kalanBorc = aracData.alisFiyati - aracData.pesinat;
        const taksitTutari = kalanBorc / aracData.taksitSayisi;

        // 1. TaksitliBorc kaydı oluştur
        const newTaksitliBorc: TaksitliBorc = {
          id: generateId(),
          baslik: `${aracData.marka} ${aracData.model} - ${aracData.plaka}`,
          cariId: aracData.saticiCariId,
          toplamTutar: kalanBorc,
          kalanTutar: kalanBorc,
          taksitSayisi: aracData.taksitSayisi,
          taksitTutari: taksitTutari,
          baslangicTarihi: aracData.baslangicTarihi,
          aciklama: `Araç alışı taksitli ödeme`,
          kaynakModul: 'OtoGaleri',
          kaynakId: newArac.id,
          olusturmaTarihi: getTodayDate(),
        };

        // 2. Taksit ödemelerini oluştur
        const taksitOdemeleri: TaksitOdemesi[] = [];
        const baslangic = new Date(aracData.baslangicTarihi);
        for (let i = 0; i < aracData.taksitSayisi; i++) {
          const vadeTarihi = new Date(baslangic);
          vadeTarihi.setMonth(vadeTarihi.getMonth() + i);
          taksitOdemeleri.push({
            id: generateId(),
            taksitliId: newTaksitliBorc.id,
            tip: 'Borç',
            taksitNo: i + 1,
            tutar: taksitTutari,
            vadeTarihi: vadeTarihi.toISOString().split('T')[0],
            durum: 'Beklemede',
          });
        }

        // 3. Satıcı carisine borç hareketi (kalanBorc kadar)
        const borcHareket: CariHareket = {
          id: generateId(),
          cariId: aracData.saticiCariId,
          tarih: aracData.alisTarihi,
          tip: 'Borç',
          tutar: kalanBorc,
          aciklama: `Araç alışı (taksitli): ${aracData.plaka}`,
          kaynakModul: 'OtoGaleri',
          kaynakId: newArac.id,
          kilitli: true,
        };

        // Cari bakiyesini güncelle
        const updatedCariler = prev.cariler.map((c) =>
          c.id === aracData.saticiCariId
            ? { ...c, bakiye: c.bakiye - kalanBorc }
            : c
        );

        let updatedHesaplar = prev.hesaplar;
        let updatedHesapHareketler = prev.hesapHareketler;

        // 4. Peşinat varsa hesaptan çıkış
        if (aracData.pesinat > 0 && aracData.hesapId) {
          const pesinatHareket: HesapHareket = {
            id: generateId(),
            hesapId: aracData.hesapId,
            tarih: aracData.alisTarihi,
            tip: 'ParaÇıkışı',
            tutar: aracData.pesinat,
            aciklama: `Araç alışı peşinatı: ${aracData.plaka}`,
            kaynakModul: 'OtoGaleri',
            kaynakId: newArac.id,
            kilitli: true,
          };

          updatedHesaplar = prev.hesaplar.map((h) =>
            h.id === aracData.hesapId
              ? { ...h, bakiye: h.bakiye - aracData.pesinat }
              : h
          );

          updatedHesapHareketler = [...prev.hesapHareketler, pesinatHareket];
        }

        return {
          ...prev,
          araclar: [...prev.araclar, newArac],
          taksitliBorclar: [...prev.taksitliBorclar, newTaksitliBorc],
          taksitOdemeleri: [...prev.taksitOdemeleri, ...taksitOdemeleri],
          cariHareketler: [...prev.cariHareketler, borcHareket],
          cariler: updatedCariler,
          hesaplar: updatedHesaplar,
          hesapHareketler: updatedHesapHareketler,
          islemKayitlari: [
            ...prev.islemKayitlari,
            {
              id: generateId(),
              tarih: new Date().toISOString(),
              modul: 'OtoGaleri',
              tip: 'OLUŞTURMA',
              aciklama: `Taksitli araç alışı: ${aracData.plaka}`,
            },
          ],
        };
      });

      return newArac;
    },
    [setAppState]
  );

  const addAracMaliyet = useCallback(
    (maliyetData: {
      aracId: string;
      tarih: string;
      kategori: string;
      tutar: number;
      odemeYontemi: 'Nakit' | 'Banka' | 'Kredi Kartı';
      hesapId?: string;
      krediKartiId?: string;
      aciklama?: string;
    }) => {
      // Önce gider kaydı oluştur
      const newGider: Gider = {
        id: generateId(),
        tarih: maliyetData.tarih,
        kategori: maliyetData.kategori,
        tutar: maliyetData.tutar,
        odemeYontemi: maliyetData.odemeYontemi,
        hesapId: maliyetData.hesapId,
        krediKartiId: maliyetData.krediKartiId,
        aciklama: maliyetData.aciklama,
        olusturmaTarihi: getTodayDate(),
      };

      const newMaliyet: AracMaliyet = {
        id: generateId(),
        ...maliyetData,
        giderId: newGider.id,
      };

      setAppState((prev) => {
        let updatedHesaplar = prev.hesaplar;
        let updatedHesapHareketler = prev.hesapHareketler;
        let updatedKrediKartlari = prev.krediKartlari;
        let updatedKrediKartiHareketler = prev.krediKartiHareketler;

        // Ödeme yöntemine göre işlem yap
        if (
          maliyetData.odemeYontemi === 'Nakit' ||
          maliyetData.odemeYontemi === 'Banka'
        ) {
          if (maliyetData.hesapId) {
            updatedHesaplar = prev.hesaplar.map((hesap) =>
              hesap.id === maliyetData.hesapId
                ? { ...hesap, bakiye: hesap.bakiye - maliyetData.tutar }
                : hesap
            );

            updatedHesapHareketler = [
              ...prev.hesapHareketler,
              {
                id: generateId(),
                hesapId: maliyetData.hesapId,
                tarih: maliyetData.tarih,
                tip: 'ParaÇıkışı',
                tutar: maliyetData.tutar,
                aciklama: `Araç maliyeti: ${maliyetData.kategori}`,
                kaynakModul: 'OtoGaleri',
                kaynakId: newMaliyet.id,
                kilitli: true,
              },
            ];
          }
        } else if (maliyetData.krediKartiId) {
          updatedKrediKartlari = prev.krediKartlari.map((kart) =>
            kart.id === maliyetData.krediKartiId
              ? { ...kart, bakiye: kart.bakiye + maliyetData.tutar }
              : kart
          );

          updatedKrediKartiHareketler = [
            ...prev.krediKartiHareketler,
            {
              id: generateId(),
              krediKartiId: maliyetData.krediKartiId,
              tarih: maliyetData.tarih,
              tip: 'Harcama',
              tutar: maliyetData.tutar,
              aciklama: `Araç maliyeti: ${maliyetData.kategori}`,
              kaynakModul: 'OtoGaleri',
              kaynakId: newMaliyet.id,
            },
          ];
        }

        // Araç toplamMaliyet'ini güncelle
        const updatedAraclar = prev.araclar.map((a) =>
          a.id === maliyetData.aracId
            ? { ...a, toplamMaliyet: a.toplamMaliyet + maliyetData.tutar }
            : a
        );

        return {
          ...prev,
          araclar: updatedAraclar,
          aracMaliyetler: [...prev.aracMaliyetler, newMaliyet],
          giderler: [...prev.giderler, newGider],
          hesaplar: updatedHesaplar,
          hesapHareketler: updatedHesapHareketler,
          krediKartlari: updatedKrediKartlari,
          krediKartiHareketler: updatedKrediKartiHareketler,
          islemKayitlari: [
            ...prev.islemKayitlari,
            {
              id: generateId(),
              tarih: new Date().toISOString(),
              modul: 'OtoGaleri',
              tip: 'OLUŞTURMA',
              aciklama: `Araç maliyeti eklendi: ${maliyetData.kategori}`,
            },
          ],
        };
      });

      return newMaliyet;
    },
    [setAppState]
  );

  // ==================== STOK YÖNETİMİ ====================

  const addUrun = useCallback(
    (urunData: Omit<Urun, 'id' | 'olusturmaTarihi' | 'stokMiktari'>) => {
      const newUrun: Urun = {
        ...urunData,
        id: generateId(),
        stokMiktari: 0,
        olusturmaTarihi: getTodayDate(),
      };

      setAppState((prev) => ({
        ...prev,
        urunler: [...prev.urunler, newUrun],
        islemKayitlari: [
          ...prev.islemKayitlari,
          {
            id: generateId(),
            tarih: new Date().toISOString(),
            modul: 'Stok',
            tip: 'OLUŞTURMA',
            aciklama: `Ürün oluşturuldu: ${urunData.ad}`,
          },
        ],
      }));

      return newUrun;
    },
    [setAppState]
  );

  const updateUrun = useCallback(
    (id: string, updates: Partial<Urun>) => {
      setAppState((prev) => ({
        ...prev,
        urunler: prev.urunler.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        islemKayitlari: [
          ...prev.islemKayitlari,
          {
            id: generateId(),
            tarih: new Date().toISOString(),
            modul: 'Stok',
            tip: 'GÜNCELLEME',
            aciklama: `Ürün güncellendi`,
          },
        ],
      }));
    },
    [setAppState]
  );

  const deleteUrun = useCallback(
    (id: string) => {
      const urun = appState.urunler.find((u) => u.id === id);
      if (!urun) return;

      setAppState((prev) => ({
        ...prev,
        urunler: prev.urunler.filter((u) => u.id !== id),
        stokHareketler: prev.stokHareketler.filter((h) => h.urunId !== id),
        islemKayitlari: [
          ...prev.islemKayitlari,
          {
            id: generateId(),
            tarih: new Date().toISOString(),
            modul: 'Stok',
            tip: 'SİLME',
            aciklama: `Ürün silindi: ${urun.ad}`,
          },
        ],
      }));
    },
    [appState.urunler, setAppState]
  );

  const addStokGiris = useCallback(
    (stokData: {
      urunId: string;
      miktar: number;
      birimFiyat: number;
      tarih: string;
      cariId?: string; // Tedarikçi
      odemeYontemi: OdemeYontemi;
      hesapId?: string;
      krediKartiId?: string;
      aciklama?: string;
    }) => {
      const urun = appState.urunler.find((u) => u.id === stokData.urunId);
      if (!urun) {
        throw new Error('Ürün bulunamadı');
      }

      const toplamTutar = stokData.miktar * stokData.birimFiyat;
      const stokHareketId = generateId();

      setAppState((prev) => {
        let newState = { ...prev };

        // 1. Stok hareketini oluştur
        const newStokHareket: StokHareket = {
          id: stokHareketId,
          urunId: stokData.urunId,
          tarih: stokData.tarih,
          tip: 'Giriş',
          miktar: stokData.miktar,
          birimFiyat: stokData.birimFiyat,
          toplamTutar,
          cariId: stokData.cariId,
          aciklama: stokData.aciklama,
          olusturmaTarihi: new Date().toISOString(),
        };

        // 2. Ürün stok miktarını güncelle ve alış fiyatını güncelle
        newState.urunler = prev.urunler.map((u) =>
          u.id === stokData.urunId
            ? {
                ...u,
                stokMiktari: u.stokMiktari + stokData.miktar,
                alisFiyati: stokData.birimFiyat, // Son alış fiyatı
              }
            : u
        );

        // 3. Eğer tedarikçi varsa, cari hareketi oluştur (Borç)
        if (stokData.cariId) {
          const cariHareket: CariHareket = {
            id: generateId(),
            cariId: stokData.cariId,
            tarih: stokData.tarih,
            tip: 'Borç',
            tutar: toplamTutar,
            aciklama: `Stok alışı: ${urun.ad} (${stokData.miktar} ${urun.birim})`,
            kaynakModul: 'Stok',
            kaynakId: stokHareketId,
            kilitli: true,
          };

          newState.cariHareketler = [...prev.cariHareketler, cariHareket];

          // Cari bakiyesini güncelle (borç = negatif)
          newState.cariler = prev.cariler.map((c) =>
            c.id === stokData.cariId
              ? { ...c, bakiye: c.bakiye - toplamTutar }
              : c
          );
        }

        // 4. Ödeme yöntemine göre hesap/kredi kartı işlemi
        if (stokData.odemeYontemi === 'Nakit' || stokData.odemeYontemi === 'Banka') {
          if (!stokData.hesapId) {
            throw new Error('Hesap seçmelisiniz');
          }

          const hesapHareket: HesapHareket = {
            id: generateId(),
            hesapId: stokData.hesapId,
            tarih: stokData.tarih,
            tip: 'ParaÇıkışı',
            tutar: toplamTutar,
            aciklama: `Stok alışı: ${urun.ad}`,
            kaynakModul: 'Stok',
            kaynakId: stokHareketId,
            kilitli: true,
          };

          newState.hesapHareketler = [...prev.hesapHareketler, hesapHareket];

          // Hesap bakiyesini güncelle
          newState.hesaplar = prev.hesaplar.map((h) =>
            h.id === stokData.hesapId
              ? { ...h, bakiye: h.bakiye - toplamTutar }
              : h
          );
        } else if (stokData.odemeYontemi === 'Kredi Kartı') {
          if (!stokData.krediKartiId) {
            throw new Error('Kredi kartı seçmelisiniz');
          }

          const kkHareket = {
            id: generateId(),
            krediKartiId: stokData.krediKartiId,
            tarih: stokData.tarih,
            tip: 'Harcama' as const,
            tutar: toplamTutar,
            aciklama: `Stok alışı: ${urun.ad}`,
            kaynakModul: 'Stok',
            kaynakId: stokHareketId,
          };

          newState.krediKartiHareketler = [
            ...prev.krediKartiHareketler,
            kkHareket,
          ];

          // Kredi kartı bakiyesini güncelle
          newState.krediKartlari = prev.krediKartlari.map((k) =>
            k.id === stokData.krediKartiId
              ? { ...k, bakiye: k.bakiye + toplamTutar }
              : k
          );
        }

        // 5. Gider kaydı oluştur
        const gider: Gider = {
          id: generateId(),
          tarih: stokData.tarih,
          kategori: 'Stok Alışı',
          tutar: toplamTutar,
          odemeYontemi: stokData.odemeYontemi,
          hesapId: stokData.hesapId,
          krediKartiId: stokData.krediKartiId,
          aciklama: `Stok alışı: ${urun.ad} (${stokData.miktar} ${urun.birim})`,
          olusturmaTarihi: new Date().toISOString(),
        };

        return {
          ...newState,
          stokHareketler: [...prev.stokHareketler, newStokHareket],
          giderler: [...newState.giderler, gider],
          islemKayitlari: [
            ...newState.islemKayitlari,
            {
              id: generateId(),
              tarih: new Date().toISOString(),
              modul: 'Stok',
              tip: 'OLUŞTURMA',
              aciklama: `Stok girişi: ${urun.ad} (${stokData.miktar} ${urun.birim})`,
            },
          ],
        };
      });

      return stokHareketId;
    },
    [appState.urunler, setAppState]
  );

  const addStokCikis = useCallback(
    (stokData: {
      urunId: string;
      miktar: number;
      birimFiyat: number;
      tarih: string;
      cariId?: string; // Müşteri
      odemeYontemi: OdemeYontemi;
      hesapId?: string;
      aciklama?: string;
    }) => {
      const urun = appState.urunler.find((u) => u.id === stokData.urunId);
      if (!urun) {
        throw new Error('Ürün bulunamadı');
      }

      if (urun.stokMiktari < stokData.miktar) {
        throw new Error('Yetersiz stok miktarı');
      }

      const toplamTutar = stokData.miktar * stokData.birimFiyat;
      const stokHareketId = generateId();

      setAppState((prev) => {
        let newState = { ...prev };

        // 1. Stok hareketini oluştur
        const newStokHareket: StokHareket = {
          id: stokHareketId,
          urunId: stokData.urunId,
          tarih: stokData.tarih,
          tip: 'Çıkış',
          miktar: stokData.miktar,
          birimFiyat: stokData.birimFiyat,
          toplamTutar,
          cariId: stokData.cariId,
          aciklama: stokData.aciklama,
          olusturmaTarihi: new Date().toISOString(),
        };

        // 2. Ürün stok miktarını azalt
        newState.urunler = prev.urunler.map((u) =>
          u.id === stokData.urunId
            ? { ...u, stokMiktari: u.stokMiktari - stokData.miktar }
            : u
        );

        // 3. Eğer müşteri varsa, cari hareketi oluştur (Alacak)
        if (stokData.cariId) {
          const cariHareket: CariHareket = {
            id: generateId(),
            cariId: stokData.cariId,
            tarih: stokData.tarih,
            tip: 'Alacak',
            tutar: toplamTutar,
            aciklama: `Stok satışı: ${urun.ad} (${stokData.miktar} ${urun.birim})`,
            kaynakModul: 'Stok',
            kaynakId: stokHareketId,
            kilitli: true,
          };

          newState.cariHareketler = [...prev.cariHareketler, cariHareket];

          // Cari bakiyesini güncelle (alacak = pozitif)
          newState.cariler = prev.cariler.map((c) =>
            c.id === stokData.cariId
              ? { ...c, bakiye: c.bakiye + toplamTutar }
              : c
          );
        }

        // 4. Ödeme yöntemine göre hesap işlemi (sadece Nakit veya Banka)
        if (
          stokData.odemeYontemi === 'Nakit' ||
          stokData.odemeYontemi === 'Banka'
        ) {
          if (!stokData.hesapId) {
            throw new Error('Hesap seçmelisiniz');
          }

          const hesapHareket: HesapHareket = {
            id: generateId(),
            hesapId: stokData.hesapId,
            tarih: stokData.tarih,
            tip: 'ParaGirişi',
            tutar: toplamTutar,
            aciklama: `Stok satışı: ${urun.ad}`,
            kaynakModul: 'Stok',
            kaynakId: stokHareketId,
            kilitli: true,
          };

          newState.hesapHareketler = [...prev.hesapHareketler, hesapHareket];

          // Hesap bakiyesini güncelle
          newState.hesaplar = prev.hesaplar.map((h) =>
            h.id === stokData.hesapId
              ? { ...h, bakiye: h.bakiye + toplamTutar }
              : h
          );
        }

        return {
          ...newState,
          stokHareketler: [...prev.stokHareketler, newStokHareket],
          islemKayitlari: [
            ...newState.islemKayitlari,
            {
              id: generateId(),
              tarih: new Date().toISOString(),
              modul: 'Stok',
              tip: 'OLUŞTURMA',
              aciklama: `Stok çıkışı: ${urun.ad} (${stokData.miktar} ${urun.birim})`,
            },
          ],
        };
      });

      return stokHareketId;
    },
    [appState.urunler, setAppState]
  );

  // ==================== TAKSİTLİ ALACAKLAR/BORÇLAR ====================

  const payBorcTaksit = useCallback(
    (taksitId: string, odemeTarihi: string, hesapId: string) => {
      const taksit = appState.taksitOdemeleri.find((t) => t.id === taksitId);
      if (!taksit || taksit.tip !== 'Borç') {
        throw new Error('Taksit bulunamadı');
      }

      if (taksit.durum === 'Ödendi') {
        throw new Error('Bu taksit zaten ödenmiş');
      }

      const taksitliBorc = appState.taksitliBorclar.find(
        (b) => b.id === taksit.taksitliId
      );
      if (!taksitliBorc) {
        throw new Error('Taksitli borç bulunamadı');
      }

      setAppState((prev) => {
        let newState = { ...prev };

        // 1. Taksit durumunu güncelle
        newState.taksitOdemeleri = prev.taksitOdemeleri.map((t) =>
          t.id === taksitId
            ? { ...t, odemeTarihi, durum: 'Ödendi' }
            : t
        );

        // 2. Taksitli borcun kalan tutarını güncelle
        newState.taksitliBorclar = prev.taksitliBorclar.map((b) =>
          b.id === taksitliBorc.id
            ? { ...b, kalanTutar: b.kalanTutar - taksit.tutar }
            : b
        );

        // 3. Cari hareketi oluştur (Ödeme)
        const cariHareket: CariHareket = {
          id: generateId(),
          cariId: taksitliBorc.cariId,
          tarih: odemeTarihi,
          tip: 'Ödeme',
          tutar: taksit.tutar,
          aciklama: `Taksit ödemesi: ${taksitliBorc.baslik} (${taksit.taksitNo}/${taksitliBorc.taksitSayisi})`,
          kaynakModul: 'Taksitler',
          kaynakId: taksitId,
          kilitli: true,
        };

        newState.cariHareketler = [...prev.cariHareketler, cariHareket];

        // Cari bakiyesini güncelle (ödeme = borcu azaltır = pozitif)
        newState.cariler = prev.cariler.map((c) =>
          c.id === taksitliBorc.cariId
            ? { ...c, bakiye: c.bakiye + taksit.tutar }
            : c
        );

        // 4. Hesap hareketi oluştur (para çıkışı)
        const hesapHareket: HesapHareket = {
          id: generateId(),
          hesapId,
          tarih: odemeTarihi,
          tip: 'ParaÇıkışı',
          tutar: taksit.tutar,
          aciklama: `Taksit ödemesi: ${taksitliBorc.baslik}`,
          kaynakModul: 'Taksitler',
          kaynakId: taksitId,
          kilitli: true,
        };

        newState.hesapHareketler = [...prev.hesapHareketler, hesapHareket];

        // Hesap bakiyesini güncelle
        newState.hesaplar = prev.hesaplar.map((h) =>
          h.id === hesapId ? { ...h, bakiye: h.bakiye - taksit.tutar } : h
        );

        return {
          ...newState,
          islemKayitlari: [
            ...newState.islemKayitlari,
            {
              id: generateId(),
              tarih: new Date().toISOString(),
              modul: 'Taksitler',
              tip: 'OLUŞTURMA',
              aciklama: `Taksit ödendi: ${taksitliBorc.baslik} (${taksit.taksitNo}/${taksitliBorc.taksitSayisi})`,
            },
          ],
        };
      });
    },
    [appState.taksitOdemeleri, appState.taksitliBorclar, setAppState]
  );

  const payAlacakTaksit = useCallback(
    (taksitId: string, odemeTarihi: string, hesapId: string) => {
      const taksit = appState.taksitOdemeleri.find((t) => t.id === taksitId);
      if (!taksit || taksit.tip !== 'Alacak') {
        throw new Error('Taksit bulunamadı');
      }

      if (taksit.durum === 'Ödendi') {
        throw new Error('Bu taksit zaten tahsil edilmiş');
      }

      const taksitliAlacak = appState.taksitliAlacaklar.find(
        (a) => a.id === taksit.taksitliId
      );
      if (!taksitliAlacak) {
        throw new Error('Taksitli alacak bulunamadı');
      }

      setAppState((prev) => {
        let newState = { ...prev };

        // 1. Taksit durumunu güncelle
        newState.taksitOdemeleri = prev.taksitOdemeleri.map((t) =>
          t.id === taksitId
            ? { ...t, odemeTarihi, durum: 'Ödendi' }
            : t
        );

        // 2. Taksitli alacağın kalan tutarını güncelle
        newState.taksitliAlacaklar = prev.taksitliAlacaklar.map((a) =>
          a.id === taksitliAlacak.id
            ? { ...a, kalanTutar: a.kalanTutar - taksit.tutar }
            : a
        );

        // 3. Cari hareketi oluştur (Tahsilat)
        const cariHareket: CariHareket = {
          id: generateId(),
          cariId: taksitliAlacak.cariId,
          tarih: odemeTarihi,
          tip: 'Tahsilat',
          tutar: taksit.tutar,
          aciklama: `Taksit tahsilatı: ${taksitliAlacak.baslik} (${taksit.taksitNo}/${taksitliAlacak.taksitSayisi})`,
          kaynakModul: 'Taksitler',
          kaynakId: taksitId,
          kilitli: true,
        };

        newState.cariHareketler = [...prev.cariHareketler, cariHareket];

        // Cari bakiyesini güncelle (tahsilat = alacağı azaltır = negatif)
        newState.cariler = prev.cariler.map((c) =>
          c.id === taksitliAlacak.cariId
            ? { ...c, bakiye: c.bakiye - taksit.tutar }
            : c
        );

        // 4. Hesap hareketi oluştur (para girişi)
        const hesapHareket: HesapHareket = {
          id: generateId(),
          hesapId,
          tarih: odemeTarihi,
          tip: 'ParaGirişi',
          tutar: taksit.tutar,
          aciklama: `Taksit tahsilatı: ${taksitliAlacak.baslik}`,
          kaynakModul: 'Taksitler',
          kaynakId: taksitId,
          kilitli: true,
        };

        newState.hesapHareketler = [...prev.hesapHareketler, hesapHareket];

        // Hesap bakiyesini güncelle
        newState.hesaplar = prev.hesaplar.map((h) =>
          h.id === hesapId ? { ...h, bakiye: h.bakiye + taksit.tutar } : h
        );

        return {
          ...newState,
          islemKayitlari: [
            ...newState.islemKayitlari,
            {
              id: generateId(),
              tarih: new Date().toISOString(),
              modul: 'Taksitler',
              tip: 'OLUŞTURMA',
              aciklama: `Taksit tahsil edildi: ${taksitliAlacak.baslik} (${taksit.taksitNo}/${taksitliAlacak.taksitSayisi})`,
            },
          ],
        };
      });
    },
    [appState.taksitOdemeleri, appState.taksitliAlacaklar, setAppState]
  );

  // ==================== KREDİ KARTLARI ====================

  const addKrediKarti = useCallback(
    (krediKartiData: Omit<KrediKarti, 'id' | 'olusturmaTarihi' | 'bakiye'>) => {
      const newKrediKarti: KrediKarti = {
        ...krediKartiData,
        id: generateId(),
        bakiye: 0,
        olusturmaTarihi: getTodayDate(),
      };

      setAppState((prev) => ({
        ...prev,
        krediKartlari: [...prev.krediKartlari, newKrediKarti],
        islemKayitlari: [
          ...prev.islemKayitlari,
          {
            id: generateId(),
            tarih: new Date().toISOString(),
            modul: 'KrediKartları',
            tip: 'OLUŞTURMA',
            aciklama: `Kredi kartı eklendi: ${krediKartiData.ad}`,
          },
        ],
      }));

      return newKrediKarti;
    },
    [setAppState]
  );

  const updateKrediKarti = useCallback(
    (id: string, updates: Partial<KrediKarti>) => {
      setAppState((prev) => ({
        ...prev,
        krediKartlari: prev.krediKartlari.map((k) =>
          k.id === id ? { ...k, ...updates } : k
        ),
        islemKayitlari: [
          ...prev.islemKayitlari,
          {
            id: generateId(),
            tarih: new Date().toISOString(),
            modul: 'KrediKartları',
            tip: 'GÜNCELLEME',
            aciklama: `Kredi kartı güncellendi`,
          },
        ],
      }));
    },
    [setAppState]
  );

  const deleteKrediKarti = useCallback(
    (id: string) => {
      const krediKarti = appState.krediKartlari.find((k) => k.id === id);
      if (!krediKarti) return;

      setAppState((prev) => ({
        ...prev,
        krediKartlari: prev.krediKartlari.filter((k) => k.id !== id),
        krediKartiHareketler: prev.krediKartiHareketler.filter(
          (h) => h.krediKartiId !== id
        ),
        islemKayitlari: [
          ...prev.islemKayitlari,
          {
            id: generateId(),
            tarih: new Date().toISOString(),
            modul: 'KrediKartları',
            tip: 'SİLME',
            aciklama: `Kredi kartı silindi: ${krediKarti.ad}`,
          },
        ],
      }));
    },
    [appState.krediKartlari, setAppState]
  );

  const payKrediKartiBorc = useCallback(
    (krediKartiId: string, tutar: number, hesapId: string, tarih: string) => {
      const krediKarti = appState.krediKartlari.find(
        (k) => k.id === krediKartiId
      );
      if (!krediKarti) {
        throw new Error('Kredi kartı bulunamadı');
      }

      if (tutar > krediKarti.bakiye) {
        throw new Error('Ödeme tutarı borçtan fazla olamaz');
      }

      setAppState((prev) => {
        let newState = { ...prev };

        // 1. Kredi kartı bakiyesini güncelle (borcu azalt)
        newState.krediKartlari = prev.krediKartlari.map((k) =>
          k.id === krediKartiId
            ? { ...k, bakiye: k.bakiye - tutar }
            : k
        );

        // 2. Kredi kartı hareketi oluştur (Ödeme)
        const kkHareket = {
          id: generateId(),
          krediKartiId,
          tarih,
          tip: 'Ödeme' as const,
          tutar,
          aciklama: `Kredi kartı borç ödemesi`,
          kaynakModul: 'KrediKartları',
          kaynakId: krediKartiId,
        };

        newState.krediKartiHareketler = [
          ...prev.krediKartiHareketler,
          kkHareket,
        ];

        // 3. Hesap hareketi oluştur (para çıkışı)
        const hesapHareket: HesapHareket = {
          id: generateId(),
          hesapId,
          tarih,
          tip: 'ParaÇıkışı',
          tutar,
          aciklama: `Kredi kartı ödemesi: ${krediKarti.ad}`,
          kaynakModul: 'KrediKartları',
          kaynakId: krediKartiId,
          kilitli: true,
        };

        newState.hesapHareketler = [...prev.hesapHareketler, hesapHareket];

        // Hesap bakiyesini güncelle
        newState.hesaplar = prev.hesaplar.map((h) =>
          h.id === hesapId ? { ...h, bakiye: h.bakiye - tutar } : h
        );

        return {
          ...newState,
          islemKayitlari: [
            ...newState.islemKayitlari,
            {
              id: generateId(),
              tarih: new Date().toISOString(),
              modul: 'KrediKartları',
              tip: 'OLUŞTURMA',
              aciklama: `Kredi kartı ödemesi: ${formatCurrency(tutar)}`,
            },
          ],
        };
      });
    },
    [appState.krediKartlari, setAppState]
  );

  // ==================== KREDİLER ====================

  const addKredi = useCallback(
    (krediData: Omit<Kredi, 'id' | 'olusturmaTarihi' | 'kalanTutar'> & {
      hesapId: string;
    }) => {
      const { hesapId, ...krediInfo } = krediData;
      const newKredi: Kredi = {
        ...krediInfo,
        id: generateId(),
        kalanTutar: krediInfo.toplamTutar,
        olusturmaTarihi: getTodayDate(),
      };

      // Taksit ödemelerini oluştur
      const taksitler: KrediOdemesi[] = [];
      const baslangic = new Date(krediData.baslangicTarihi);

      for (let i = 1; i <= krediData.taksitSayisi; i++) {
        const vadeTarihi = new Date(baslangic);
        vadeTarihi.setMonth(vadeTarihi.getMonth() + i);

        taksitler.push({
          id: generateId(),
          krediId: newKredi.id,
          taksitNo: i,
          tutar: krediData.aylikTaksit,
          vadeTarihi: vadeTarihi.toISOString().split('T')[0],
          durum: 'Beklemede',
        });
      }

      setAppState((prev) => {
        let newState = { ...prev };

        // Kredi tutarını hesaba gir
        const hesapHareket: HesapHareket = {
          id: generateId(),
          hesapId,
          tarih: krediData.baslangicTarihi,
          tip: 'ParaGirişi',
          tutar: krediData.toplamTutar,
          aciklama: `Kredi: ${krediData.ad}`,
          kaynakModul: 'Krediler',
          kaynakId: newKredi.id,
          kilitli: true,
        };

        newState.hesapHareketler = [...prev.hesapHareketler, hesapHareket];
        newState.hesaplar = prev.hesaplar.map((h) =>
          h.id === hesapId
            ? { ...h, bakiye: h.bakiye + krediData.toplamTutar }
            : h
        );

        return {
          ...newState,
          krediler: [...prev.krediler, newKredi],
          krediOdemeleri: [...prev.krediOdemeleri, ...taksitler],
          islemKayitlari: [
            ...newState.islemKayitlari,
            {
              id: generateId(),
              tarih: new Date().toISOString(),
              modul: 'Krediler',
              tip: 'OLUŞTURMA',
              aciklama: `Kredi eklendi: ${krediData.ad}`,
            },
          ],
        };
      });

      return newKredi;
    },
    [setAppState]
  );

  const payKrediTaksit = useCallback(
    (taksitId: string, odemeTarihi: string, hesapId: string) => {
      const taksit = appState.krediOdemeleri.find((t) => t.id === taksitId);
      if (!taksit) {
        throw new Error('Taksit bulunamadı');
      }

      if (taksit.durum === 'Ödendi') {
        throw new Error('Bu taksit zaten ödenmiş');
      }

      const kredi = appState.krediler.find((k) => k.id === taksit.krediId);
      if (!kredi) {
        throw new Error('Kredi bulunamadı');
      }

      setAppState((prev) => {
        let newState = { ...prev };

        // Taksit durumunu güncelle
        newState.krediOdemeleri = prev.krediOdemeleri.map((t) =>
          t.id === taksitId
            ? { ...t, odemeTarihi, durum: 'Ödendi', hesapId }
            : t
        );

        // Kalan tutarı güncelle
        newState.krediler = prev.krediler.map((k) =>
          k.id === kredi.id
            ? { ...k, kalanTutar: k.kalanTutar - taksit.tutar }
            : k
        );

        // Hesap hareketi
        const hesapHareket: HesapHareket = {
          id: generateId(),
          hesapId,
          tarih: odemeTarihi,
          tip: 'ParaÇıkışı',
          tutar: taksit.tutar,
          aciklama: `Kredi taksit ödemesi: ${kredi.ad} (${taksit.taksitNo}/${kredi.taksitSayisi})`,
          kaynakModul: 'Krediler',
          kaynakId: taksitId,
          kilitli: true,
        };

        newState.hesapHareketler = [...prev.hesapHareketler, hesapHareket];
        newState.hesaplar = prev.hesaplar.map((h) =>
          h.id === hesapId ? { ...h, bakiye: h.bakiye - taksit.tutar } : h
        );

        return {
          ...newState,
          islemKayitlari: [
            ...newState.islemKayitlari,
            {
              id: generateId(),
              tarih: new Date().toISOString(),
              modul: 'Krediler',
              tip: 'OLUŞTURMA',
              aciklama: `Kredi taksiti ödendi: ${kredi.ad}`,
            },
          ],
        };
      });
    },
    [appState.krediOdemeleri, appState.krediler, setAppState]
  );

  // ==================== ÇEK & SENET ====================

  const addCekSenet = useCallback(
    (cekSenetData: Omit<CekSenet, 'id' | 'olusturmaTarihi'>) => {
      const newCekSenet: CekSenet = {
        ...cekSenetData,
        id: generateId(),
        olusturmaTarihi: getTodayDate(),
      };

      setAppState((prev) => ({
        ...prev,
        cekSenetler: [...prev.cekSenetler, newCekSenet],
        islemKayitlari: [
          ...prev.islemKayitlari,
          {
            id: generateId(),
            tarih: new Date().toISOString(),
            modul: 'ÇekSenet',
            tip: 'OLUŞTURMA',
            aciklama: `${cekSenetData.tip} eklendi: ${cekSenetData.cekSenetNo}`,
          },
        ],
      }));

      return newCekSenet;
    },
    [setAppState]
  );

  const updateCekSenetDurum = useCallback(
    (
      id: string,
      durum: CekSenetDurum,
      tarih: string,
      hesapId?: string,
      ciroEdilenCariId?: string
    ) => {
      const cekSenet = appState.cekSenetler.find((c) => c.id === id);
      if (!cekSenet) {
        throw new Error('Çek/Senet bulunamadı');
      }

      setAppState((prev) => {
        let newState = { ...prev };

        // Durum güncelle
        const updates: Partial<CekSenet> = { durum };

        if (durum === 'Tahsil Edildi' && hesapId) {
          updates.tahsilTarihi = tarih;

          const hesapHareket: HesapHareket = {
            id: generateId(),
            hesapId,
            tarih,
            tip: 'ParaGirişi',
            tutar: cekSenet.tutar,
            aciklama: `${cekSenet.tip} tahsil edildi: ${cekSenet.cekSenetNo}`,
            kaynakModul: 'ÇekSenet',
            kaynakId: id,
            kilitli: true,
          };

          newState.hesapHareketler = [...prev.hesapHareketler, hesapHareket];
          newState.hesaplar = prev.hesaplar.map((h) =>
            h.id === hesapId
              ? { ...h, bakiye: h.bakiye + cekSenet.tutar }
              : h
          );
        } else if (durum === 'Ödendi' && hesapId) {
          updates.odemeTarihi = tarih;

          const hesapHareket: HesapHareket = {
            id: generateId(),
            hesapId,
            tarih,
            tip: 'ParaÇıkışı',
            tutar: cekSenet.tutar,
            aciklama: `${cekSenet.tip} ödendi: ${cekSenet.cekSenetNo}`,
            kaynakModul: 'ÇekSenet',
            kaynakId: id,
            kilitli: true,
          };

          newState.hesapHareketler = [...prev.hesapHareketler, hesapHareket];
          newState.hesaplar = prev.hesaplar.map((h) =>
            h.id === hesapId
              ? { ...h, bakiye: h.bakiye - cekSenet.tutar }
              : h
          );
        } else if (durum === 'Ciro Edildi' && ciroEdilenCariId) {
          updates.ciroTarihi = tarih;
          updates.ciroEdilenCariId = ciroEdilenCariId;
        }

        newState.cekSenetler = prev.cekSenetler.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        );

        return {
          ...newState,
          islemKayitlari: [
            ...newState.islemKayitlari,
            {
              id: generateId(),
              tarih: new Date().toISOString(),
              modul: 'ÇekSenet',
              tip: 'GÜNCELLEME',
              aciklama: `${cekSenet.tip} durumu güncellendi: ${durum}`,
            },
          ],
        };
      });
    },
    [appState.cekSenetler, setAppState]
  );

  return {
    // Cari
    addCari,
    updateCari,
    deleteCari,
    addCariHareket,

    // Hesap
    addHesap,
    updateHesap,
    deleteHesap,
    addHesapHareket,

    // Gider
    addGider,
    deleteGider,

    // Oto Galeri
    addAracPesin,
    addAracTaksitli,
    addAracMaliyet,

    // Stok
    addUrun,
    updateUrun,
    deleteUrun,
    addStokGiris,
    addStokCikis,

    // Taksitler
    payBorcTaksit,
    payAlacakTaksit,

    // Kredi Kartları
    addKrediKarti,
    updateKrediKarti,
    deleteKrediKarti,
    payKrediKartiBorc,

    // Krediler
    addKredi,
    payKrediTaksit,

    // Çek & Senet
    addCekSenet,
    updateCekSenetDurum,
  };
};
