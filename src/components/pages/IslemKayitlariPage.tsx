import { useState, useMemo } from 'react';
import type { AppState } from '../../types';
import { Icons } from '../../constants/icons';
import { formatDate } from '../../utils/formatters';

interface IslemKayitlariPageProps {
  appState: AppState;
}

type FilterModul = 'Tümü' | 'CariHesaplar' | 'Kasa' | 'Giderler' | 'OtoGaleri' | 'Stok' | 'Taksitler' | 'KrediKartları' | 'Krediler' | 'ÇekSenet';
type FilterTip = 'Tümü' | 'OLUŞTURMA' | 'GÜNCELLEME' | 'SİLME';

export const IslemKayitlariPage = ({ appState }: IslemKayitlariPageProps) => {
  const [filterModul, setFilterModul] = useState<FilterModul>('Tümü');
  const [filterTip, setFilterTip] = useState<FilterTip>('Tümü');
  const [searchText, setSearchText] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Filtrelenmiş kayıtlar
  const filteredRecords = useMemo(() => {
    let records = [...appState.islemKayitlari];

    // Modül filtresi
    if (filterModul !== 'Tümü') {
      records = records.filter((r) => r.modul === filterModul);
    }

    // Tip filtresi
    if (filterTip !== 'Tümü') {
      records = records.filter((r) => r.tip === filterTip);
    }

    // Arama
    if (searchText) {
      records = records.filter((r) =>
        r.aciklama.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Tarih filtresi
    if (dateFrom) {
      records = records.filter(
        (r) => new Date(r.tarih) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      records = records.filter((r) => new Date(r.tarih) <= endDate);
    }

    // Tarihe göre sırala (en yeni önce)
    return records.sort(
      (a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime()
    );
  }, [appState.islemKayitlari, filterModul, filterTip, searchText, dateFrom, dateTo]);

  // Excel export
  const handleExportExcel = () => {
    const headers = ['Tarih', 'Modül', 'Tip', 'Açıklama'];
    const rows = filteredRecords.map((r) => [
      new Date(r.tarih).toLocaleString('tr-TR'),
      r.modul,
      r.tip,
      r.aciklama,
    ]);

    // CSV formatında oluştur
    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Download
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `islem-kayitlari-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // İstatistikler
  const stats = useMemo(() => {
    const modulCounts: Record<string, number> = {};
    const tipCounts: Record<string, number> = {};

    filteredRecords.forEach((r) => {
      modulCounts[r.modul] = (modulCounts[r.modul] || 0) + 1;
      tipCounts[r.tip] = (tipCounts[r.tip] || 0) + 1;
    });

    return { modulCounts, tipCounts };
  }, [filteredRecords]);

  const getTipBadgeClass = (tip: string) => {
    switch (tip) {
      case 'OLUŞTURMA':
        return 'bg-green-100 text-green-800';
      case 'GÜNCELLEME':
        return 'bg-blue-100 text-blue-800';
      case 'SİLME':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getModulColor = (modul: string) => {
    const colors: Record<string, string> = {
      CariHesaplar: 'text-purple-600',
      Kasa: 'text-blue-600',
      Giderler: 'text-orange-600',
      OtoGaleri: 'text-indigo-600',
      Stok: 'text-teal-600',
      Taksitler: 'text-yellow-600',
      KrediKartları: 'text-pink-600',
      Krediler: 'text-red-600',
      ÇekSenet: 'text-cyan-600',
    };
    return colors[modul] || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">İşlem Kayıtları</h1>
          <p className="text-sm text-gray-600 mt-1">
            Toplam {filteredRecords.length} kayıt
          </p>
        </div>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Icons.ArrowDown />
          <span>Excel İndir</span>
        </button>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Filtreler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Modül */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modül
            </label>
            <select
              value={filterModul}
              onChange={(e) => setFilterModul(e.target.value as FilterModul)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Tümü">Tümü</option>
              <option value="CariHesaplar">Cari Hesaplar</option>
              <option value="Kasa">Kasa & Banka</option>
              <option value="Giderler">Giderler</option>
              <option value="OtoGaleri">Oto Galeri</option>
              <option value="Stok">Stok</option>
              <option value="Taksitler">Taksitler</option>
              <option value="KrediKartları">Kredi Kartları</option>
              <option value="Krediler">Krediler</option>
              <option value="ÇekSenet">Çek & Senet</option>
            </select>
          </div>

          {/* İşlem Tipi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              İşlem Tipi
            </label>
            <select
              value={filterTip}
              onChange={(e) => setFilterTip(e.target.value as FilterTip)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Tümü">Tümü</option>
              <option value="OLUŞTURMA">Oluşturma</option>
              <option value="GÜNCELLEME">Güncelleme</option>
              <option value="SİLME">Silme</option>
            </select>
          </div>

          {/* Başlangıç Tarihi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Bitiş Tarihi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bitiş Tarihi
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Arama */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Açıklamada Ara
          </label>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Arama yapın..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filtre Temizle */}
        {(filterModul !== 'Tümü' ||
          filterTip !== 'Tümü' ||
          searchText ||
          dateFrom ||
          dateTo) && (
          <button
            onClick={() => {
              setFilterModul('Tümü');
              setFilterTip('Tümü');
              setSearchText('');
              setDateFrom('');
              setDateTo('');
            }}
            className="mt-4 text-sm text-primary hover:text-primary-dark underline"
          >
            Filtreleri Temizle
          </button>
        )}
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Modül Dağılımı */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Modül Dağılımı</h3>
          <div className="space-y-2">
            {Object.entries(stats.modulCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([modul, count]) => (
                <div
                  key={modul}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className={`text-sm font-medium ${getModulColor(modul)}`}>
                    {modul}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* İşlem Tipi Dağılımı */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">İşlem Tipi Dağılımı</h3>
          <div className="space-y-2">
            {Object.entries(stats.tipCounts).map(([tip, count]) => (
              <div
                key={tip}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span className={`text-sm px-2 py-1 rounded ${getTipBadgeClass(tip)}`}>
                  {tip}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kayıtlar Listesi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modül
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Açıklama
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Kayıt bulunamadı
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.tarih)}
                      <div className="text-xs text-gray-500">
                        {new Date(record.tarih).toLocaleTimeString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getModulColor(record.modul)}`}>
                        {record.modul}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded ${getTipBadgeClass(
                          record.tip
                        )}`}
                      >
                        {record.tip}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.aciklama}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
