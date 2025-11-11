import { useState, useMemo } from 'react';
import type { AppState } from '../../types';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface RaporlarPageProps {
  appState: AppState;
}

type RaporTipi =
  | 'gelir-gider'
  | 'cari-bakiye'
  | 'arac-satis'
  | 'taksit-takvim'
  | 'gider-kategori'
  | 'stok-durum'
  | 'kar-zarar'
  | 'vadesi-gecmis';

export const RaporlarPage = ({ appState }: RaporlarPageProps) => {
  const [raporTipi, setRaporTipi] = useState<RaporTipi>('gelir-gider');
  const [baslangicTarihi, setBaslangicTarihi] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0]
  );
  const [bitisTarihi, setBitisTarihi] = useState(
    new Date().toISOString().split('T')[0]
  );

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const raporTipleri = [
    { value: 'gelir-gider', label: 'Gelir-Gider Raporu' },
    { value: 'cari-bakiye', label: 'Cari Bakiye Raporu' },
    { value: 'arac-satis', label: 'Araç Satış Raporu' },
    { value: 'taksit-takvim', label: 'Taksit Ödeme Takvimi' },
    { value: 'gider-kategori', label: 'Gider Kategori Analizi' },
    { value: 'stok-durum', label: 'Stok Durum Raporu' },
    { value: 'kar-zarar', label: 'Kar-Zarar Raporu (Araç Bazında)' },
    { value: 'vadesi-gecmis', label: 'Vadesi Geçmiş Alacaklar/Borçlar' },
  ];

  // ==================== GELIR-GIDER RAPORU ====================
  const gelirGiderData = useMemo(() => {
    const filteredGiderler = appState.giderler.filter(
      (g) => g.tarih >= baslangicTarihi && g.tarih <= bitisTarihi
    );
    const toplamGider = filteredGiderler.reduce((sum, g) => sum + g.tutar, 0);

    // Gelir hesaplama: Satılan araçlar + Stok çıkışları
    const satisGeliri = appState.araclar
      .filter(
        (a) =>
          a.durum === 'Satıldı' &&
          a.satisTarihi &&
          a.satisTarihi >= baslangicTarihi &&
          a.satisTarihi <= bitisTarihi
      )
      .reduce((sum, a) => sum + (a.satisFiyati || 0), 0);

    const stokCikisGeliri = appState.stokHareketler
      .filter(
        (sh) =>
          sh.tip === 'Çıkış' &&
          sh.tarih >= baslangicTarihi &&
          sh.tarih <= bitisTarihi
      )
      .reduce((sum, sh) => sum + sh.toplamTutar, 0);

    const toplamGelir = satisGeliri + stokCikisGeliri;

    return {
      toplamGelir,
      toplamGider,
      netKar: toplamGelir - toplamGider,
      chartData: [
        { name: 'Gelir', tutar: toplamGelir },
        { name: 'Gider', tutar: toplamGider },
      ],
    };
  }, [appState, baslangicTarihi, bitisTarihi]);

  // ==================== CARİ BAKİYE RAPORU ====================
  const cariBakiyeData = useMemo(() => {
    return appState.cariler
      .map((cari) => ({
        ...cari,
        tip: cari.bakiye < 0 ? 'Alacak' : cari.bakiye > 0 ? 'Borç' : 'Denk',
        mutlakBakiye: Math.abs(cari.bakiye),
      }))
      .filter((c) => c.mutlakBakiye > 0)
      .sort((a, b) => b.mutlakBakiye - a.mutlakBakiye);
  }, [appState.cariler]);

  const cariBakiyeOzet = useMemo(() => {
    const toplamAlacak = cariBakiyeData
      .filter((c) => c.tip === 'Alacak')
      .reduce((sum, c) => sum + c.mutlakBakiye, 0);
    const toplamBorc = cariBakiyeData
      .filter((c) => c.tip === 'Borç')
      .reduce((sum, c) => sum + c.mutlakBakiye, 0);

    return { toplamAlacak, toplamBorc, netDurum: toplamBorc - toplamAlacak };
  }, [cariBakiyeData]);

  // ==================== ARAÇ SATIŞ RAPORU ====================
  const aracSatisData = useMemo(() => {
    const satilanAraclar = appState.araclar.filter(
      (a) =>
        a.durum === 'Satıldı' &&
        a.satisTarihi &&
        a.satisTarihi >= baslangicTarihi &&
        a.satisTarihi <= bitisTarihi
    );

    const toplamSatis = satilanAraclar.reduce(
      (sum, a) => sum + (a.satisFiyati || 0),
      0
    );
    const toplamMaliyet = satilanAraclar.reduce(
      (sum, a) => sum + a.toplamMaliyet,
      0
    );
    const toplamKar = toplamSatis - toplamMaliyet;

    return {
      satilanAraclar,
      adet: satilanAraclar.length,
      toplamSatis,
      toplamMaliyet,
      toplamKar,
      ortalamaSatisFiyati:
        satilanAraclar.length > 0 ? toplamSatis / satilanAraclar.length : 0,
      ortalamaKar:
        satilanAraclar.length > 0 ? toplamKar / satilanAraclar.length : 0,
    };
  }, [appState.araclar, baslangicTarihi, bitisTarihi]);

  // ==================== TAKSİT TAKVİMİ ====================
  const taksitTakvimData = useMemo(() => {
    const bekleyenTaksitler = appState.taksitOdemeleri.filter(
      (t) => t.durum === 'Beklemede'
    );

    const buAyTaksitler = bekleyenTaksitler.filter((t) => {
      const vade = new Date(t.vadeTarihi);
      const buAy = new Date();
      return (
        vade.getMonth() === buAy.getMonth() &&
        vade.getFullYear() === buAy.getFullYear()
      );
    });

    const gecikmisTaksitler = bekleyenTaksitler.filter(
      (t) => new Date(t.vadeTarihi) < new Date()
    );

    return {
      bekleyenTaksitler,
      buAyTaksitler,
      gecikmisTaksitler,
      toplamBekleyen: bekleyenTaksitler.reduce((sum, t) => sum + t.tutar, 0),
      toplamBuAy: buAyTaksitler.reduce((sum, t) => sum + t.tutar, 0),
      toplamGecikmis: gecikmisTaksitler.reduce((sum, t) => sum + t.tutar, 0),
    };
  }, [appState.taksitOdemeleri]);

  // ==================== GİDER KATEGORİ ANALİZİ ====================
  const giderKategoriData = useMemo(() => {
    const filteredGiderler = appState.giderler.filter(
      (g) => g.tarih >= baslangicTarihi && g.tarih <= bitisTarihi
    );

    const kategoriMap = new Map<string, number>();
    filteredGiderler.forEach((g) => {
      kategoriMap.set(g.kategori, (kategoriMap.get(g.kategori) || 0) + g.tutar);
    });

    return Array.from(kategoriMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [appState.giderler, baslangicTarihi, bitisTarihi]);

  // ==================== STOK DURUM RAPORU ====================
  const stokDurumData = useMemo(() => {
    const urunler = appState.urunler;
    const toplamDeger = urunler.reduce(
      (sum, u) => sum + u.stokMiktari * u.alisFiyati,
      0
    );
    const kritikStok = urunler.filter((u) => u.stokMiktari < 10);

    return {
      urunler,
      toplamUrunSayisi: urunler.length,
      toplamStokMiktari: urunler.reduce((sum, u) => sum + u.stokMiktari, 0),
      toplamDeger,
      kritikStok,
    };
  }, [appState.urunler]);

  // ==================== KAR-ZARAR RAPORU (ARAÇ BAZINDA) ====================
  const karZararData = useMemo(() => {
    const satilanAraclar = appState.araclar
      .filter(
        (a) =>
          a.durum === 'Satıldı' &&
          a.satisTarihi &&
          a.satisTarihi >= baslangicTarihi &&
          a.satisTarihi <= bitisTarihi
      )
      .map((a) => ({
        ...a,
        kar: (a.satisFiyati || 0) - a.toplamMaliyet,
        karMarji:
          a.toplamMaliyet > 0
            ? (((a.satisFiyati || 0) - a.toplamMaliyet) / a.toplamMaliyet) *
              100
            : 0,
      }))
      .sort((a, b) => b.kar - a.kar);

    return satilanAraclar;
  }, [appState.araclar, baslangicTarihi, bitisTarihi]);

  // ==================== VADESİ GEÇMİŞ ALACAKLAR/BORÇLAR ====================
  const vadesiGecmisData = useMemo(() => {
    const bugun = new Date().toISOString().split('T')[0];

    const gecikmisTaksitler = appState.taksitOdemeleri.filter(
      (t) => t.durum === 'Beklemede' && t.vadeTarihi < bugun
    );

    const gecikmisAlacaklar = gecikmisTaksitler.filter((t) => t.tip === 'Alacak');
    const gecikmisBorclar = gecikmisTaksitler.filter((t) => t.tip === 'Borç');

    return {
      gecikmisAlacaklar,
      gecikmisBorclar,
      toplamGecikmisAlacak: gecikmisAlacaklar.reduce(
        (sum, t) => sum + t.tutar,
        0
      ),
      toplamGecikmisBorc: gecikmisBorclar.reduce((sum, t) => sum + t.tutar, 0),
    };
  }, [appState.taksitOdemeleri]);

  const renderRapor = () => {
    switch (raporTipi) {
      case 'gelir-gider':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 font-medium">Toplam Gelir</p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {formatCurrency(gelirGiderData.toplamGelir)}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-medium">Toplam Gider</p>
                <p className="text-2xl font-bold text-red-700 mt-1">
                  {formatCurrency(gelirGiderData.toplamGider)}
                </p>
              </div>
              <div
                className={`p-4 rounded-lg border ${
                  gelirGiderData.netKar >= 0
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-orange-50 border-orange-200'
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    gelirGiderData.netKar >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`}
                >
                  Net Kar/Zarar
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    gelirGiderData.netKar >= 0 ? 'text-blue-700' : 'text-orange-700'
                  }`}
                >
                  {formatCurrency(gelirGiderData.netKar)}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Gelir vs Gider</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gelirGiderData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="tutar" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'cari-bakiye':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 font-medium">
                  Toplam Alacak
                </p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {formatCurrency(cariBakiyeOzet.toplamAlacak)}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-medium">Toplam Borç</p>
                <p className="text-2xl font-bold text-red-700 mt-1">
                  {formatCurrency(cariBakiyeOzet.toplamBorc)}
                </p>
              </div>
              <div
                className={`p-4 rounded-lg border ${
                  cariBakiyeOzet.netDurum >= 0
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-orange-50 border-orange-200'
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    cariBakiyeOzet.netDurum >= 0
                      ? 'text-blue-600'
                      : 'text-orange-600'
                  }`}
                >
                  Net Durum
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    cariBakiyeOzet.netDurum >= 0
                      ? 'text-blue-700'
                      : 'text-orange-700'
                  }`}
                >
                  {formatCurrency(Math.abs(cariBakiyeOzet.netDurum))}
                  {cariBakiyeOzet.netDurum >= 0 ? ' Borç' : ' Alacak'}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Cari Detayları</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Cari Adı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tip
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Tutar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cariBakiyeData.map((cari) => (
                      <tr key={cari.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {cari.ad}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              cari.tip === 'Alacak'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {cari.tip}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                          {formatCurrency(cari.mutlakBakiye)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'arac-satis':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">Satılan Araç</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {aracSatisData.adet}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 font-medium">Toplam Satış</p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {formatCurrency(aracSatisData.toplamSatis)}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-600 font-medium">
                  Toplam Maliyet
                </p>
                <p className="text-2xl font-bold text-orange-700 mt-1">
                  {formatCurrency(aracSatisData.toplamMaliyet)}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-600 font-medium">Toplam Kar</p>
                <p className="text-2xl font-bold text-purple-700 mt-1">
                  {formatCurrency(aracSatisData.toplamKar)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Satılan Araçlar</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Araç
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Satış Tarihi
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Satış Fiyatı
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Maliyet
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Kar/Zarar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {aracSatisData.satilanAraclar.map((arac) => {
                      const kar = (arac.satisFiyati || 0) - arac.toplamMaliyet;
                      return (
                        <tr key={arac.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {arac.marka} {arac.model}
                            <br />
                            <span className="text-xs text-gray-500">
                              {arac.plaka}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {arac.satisTarihi ? formatDate(arac.satisTarihi) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                            {formatCurrency(arac.satisFiyati || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {formatCurrency(arac.toplamMaliyet)}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-right font-bold ${
                              kar >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {kar >= 0 ? '+' : ''}
                            {formatCurrency(kar)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'taksit-takvim':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">
                  Bu Ay Ödenecek
                </p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {formatCurrency(taksitTakvimData.toplamBuAy)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {taksitTakvimData.buAyTaksitler.length} taksit
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-medium">Gecikmiş</p>
                <p className="text-2xl font-bold text-red-700 mt-1">
                  {formatCurrency(taksitTakvimData.toplamGecikmis)}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {taksitTakvimData.gecikmisTaksitler.length} taksit
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 font-medium">Toplam Bekleyen</p>
                <p className="text-2xl font-bold text-gray-700 mt-1">
                  {formatCurrency(taksitTakvimData.toplamBekleyen)}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {taksitTakvimData.bekleyenTaksitler.length} taksit
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Taksit Detayları</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tip
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Taksit No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Vade Tarihi
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Tutar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Durum
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {taksitTakvimData.bekleyenTaksitler
                      .sort((a, b) => a.vadeTarihi.localeCompare(b.vadeTarihi))
                      .map((taksit) => {
                        const gecikti =
                          new Date(taksit.vadeTarihi) < new Date();
                        return (
                          <tr
                            key={taksit.id}
                            className={`hover:bg-gray-50 ${
                              gecikti ? 'bg-red-50' : ''
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  taksit.tip === 'Alacak'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {taksit.tip}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {taksit.taksitNo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {formatDate(taksit.vadeTarihi)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                              {formatCurrency(taksit.tutar)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {gecikti ? (
                                <span className="text-red-600 font-semibold">
                                  Gecikmiş
                                </span>
                              ) : (
                                <span className="text-gray-600">Beklemede</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'gider-kategori':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">
                Gider Kategori Dağılımı
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={giderKategoriData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {giderKategoriData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Kategori Detayları</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Kategori
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Tutar
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Oran
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {giderKategoriData.map((kategori, index) => {
                      const toplamGider = giderKategoriData.reduce(
                        (sum, k) => sum + k.value,
                        0
                      );
                      const oran = (kategori.value / toplamGider) * 100;
                      return (
                        <tr key={kategori.name} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded"
                                style={{
                                  backgroundColor: COLORS[index % COLORS.length],
                                }}
                              />
                              {kategori.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                            {formatCurrency(kategori.value)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                            %{oran.toFixed(1)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'stok-durum':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">Toplam Ürün</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {stokDurumData.toplamUrunSayisi}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 font-medium">
                  Toplam Miktar
                </p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {stokDurumData.toplamStokMiktari}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-600 font-medium">
                  Toplam Değer
                </p>
                <p className="text-2xl font-bold text-purple-700 mt-1">
                  {formatCurrency(stokDurumData.toplamDeger)}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-medium">Kritik Stok</p>
                <p className="text-2xl font-bold text-red-700 mt-1">
                  {stokDurumData.kritikStok.length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Ürün Listesi</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ürün Adı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Kategori
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Stok
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Alış Fiyatı
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Toplam Değer
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stokDurumData.urunler.map((urun) => (
                      <tr
                        key={urun.id}
                        className={`hover:bg-gray-50 ${
                          urun.stokMiktari < 10 ? 'bg-red-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {urun.ad}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {urun.kategori}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {urun.stokMiktari}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {formatCurrency(urun.alisFiyati)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                          {formatCurrency(urun.stokMiktari * urun.alisFiyati)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'kar-zarar':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">
                  Araç Bazında Kar/Zarar Analizi
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Araç
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Maliyet
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Satış
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Kar/Zarar
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Kar Marjı
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {karZararData.map((arac) => (
                      <tr key={arac.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {arac.marka} {arac.model}
                          <br />
                          <span className="text-xs text-gray-500">
                            {arac.plaka}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {formatCurrency(arac.toplamMaliyet)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {formatCurrency(arac.satisFiyati || 0)}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-right font-bold ${
                            arac.kar >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {arac.kar >= 0 ? '+' : ''}
                          {formatCurrency(arac.kar)}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-right font-medium ${
                            arac.karMarji >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {arac.karMarji >= 0 ? '+' : ''}
                          {arac.karMarji.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'vadesi-gecmis':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-medium">
                  Gecikmiş Alacaklar
                </p>
                <p className="text-2xl font-bold text-red-700 mt-1">
                  {formatCurrency(vadesiGecmisData.toplamGecikmisAlacak)}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {vadesiGecmisData.gecikmisAlacaklar.length} taksit
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-600 font-medium">
                  Gecikmiş Borçlar
                </p>
                <p className="text-2xl font-bold text-orange-700 mt-1">
                  {formatCurrency(vadesiGecmisData.toplamGecikmisBorc)}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  {vadesiGecmisData.gecikmisBorclar.length} taksit
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="px-6 py-4 border-b bg-red-50">
                  <h3 className="text-lg font-semibold text-red-700">
                    Gecikmiş Alacaklar
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Vade
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Tutar
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vadesiGecmisData.gecikmisAlacaklar.map((taksit) => (
                        <tr key={taksit.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {formatDate(taksit.vadeTarihi)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-red-600">
                            {formatCurrency(taksit.tutar)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="px-6 py-4 border-b bg-orange-50">
                  <h3 className="text-lg font-semibold text-orange-700">
                    Gecikmiş Borçlar
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Vade
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Tutar
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vadesiGecmisData.gecikmisBorclar.map((taksit) => (
                        <tr key={taksit.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {formatDate(taksit.vadeTarihi)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-orange-600">
                            {formatCurrency(taksit.tutar)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Rapor seçiniz</div>;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Raporlar</h1>

      {/* Filtreler */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Rapor Tipi"
            value={raporTipi}
            onChange={(e) => setRaporTipi(e.target.value as RaporTipi)}
            options={raporTipleri}
          />
          <Input
            label="Başlangıç Tarihi"
            type="date"
            value={baslangicTarihi}
            onChange={(e) => setBaslangicTarihi(e.target.value)}
          />
          <Input
            label="Bitiş Tarihi"
            type="date"
            value={bitisTarihi}
            onChange={(e) => setBitisTarihi(e.target.value)}
          />
        </div>
      </div>

      {/* Rapor İçeriği */}
      {renderRapor()}
    </div>
  );
};
