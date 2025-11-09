import { useCallback } from 'react';
import {
  AppState,
  Cari,
  CariHareket,
  Hesap,
  HesapHareket,
  Gider,
  IslemKaydi,
} from '../types';
import { generateId, getTodayDate } from '../utils/formatters';

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
  };
};
