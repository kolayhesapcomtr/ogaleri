import { useParams, useNavigate } from 'react-router-dom';
import type { AppState } from '../../types';
import { Button } from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface CariDetailPageProps {
  appState: AppState;
}

export const CariDetailPage = ({ appState }: CariDetailPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const cari = appState.cariler.find((c) => c.id === id);

  if (!cari) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cari Bulunamadı</h2>
        <Button onClick={() => navigate('/cari')}>Cari Listesine Dön</Button>
      </div>
    );
  }

  // Cari hareketlerini getir ve tarihe göre sırala
  const hareketler = appState.cariHareketler
    .filter((h) => h.cariId === id)
    .sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());

  // Bakiye hesaplama
  const toplamBorc = hareketler
    .filter((h) => h.tip === 'Borç')
    .reduce((sum, h) => sum + h.tutar, 0);

  const toplamAlacak = hareketler
    .filter((h) => h.tip === 'Alacak')
    .reduce((sum, h) => sum + h.tutar, 0);

  const toplamTahsilat = hareketler
    .filter((h) => h.tip === 'Tahsilat')
    .reduce((sum, h) => sum + h.tutar, 0);

  const toplamOdeme = hareketler
    .filter((h) => h.tip === 'Ödeme')
    .reduce((sum, h) => sum + h.tutar, 0);

  const getTipBadge = (tip: string) => {
    switch (tip) {
      case 'Borç':
        return 'bg-red-100 text-red-800';
      case 'Alacak':
        return 'bg-green-100 text-green-800';
      case 'Ödeme':
        return 'bg-blue-100 text-blue-800';
      case 'Tahsilat':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getKaynakModulAdi = (kaynakModul?: string) => {
    switch (kaynakModul) {
      case 'OtoGaleri':
        return 'Oto Galeri';
      case 'Stok':
        return 'Stok';
      case 'Gider':
        return 'Gider';
      case 'Taksitler':
        return 'Taksitler';
      default:
        return 'Manuel İşlem';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => navigate('/cari')}
          variant="secondary"
          className="mb-4"
        >
          <div className="flex items-center gap-2">
            <span>← Geri Dön</span>
          </div>
        </Button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{cari.ad}</h1>
              <p className="text-sm text-gray-600 mt-1">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    cari.tip === 'Müşteri'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {cari.tip}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Bakiye</p>
              <p
                className={`text-2xl font-bold ${
                  cari.bakiye >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(Math.abs(cari.bakiye))}
              </p>
              <p className="text-xs text-gray-500">
                {cari.bakiye >= 0 ? 'Alacak' : 'Borç'}
              </p>
            </div>
          </div>

          {/* İletişim Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            {cari.telefon && (
              <div>
                <p className="text-sm text-gray-600">Telefon</p>
                <p className="text-sm font-medium text-gray-900">{cari.telefon}</p>
              </div>
            )}
            {cari.adres && (
              <div>
                <p className="text-sm text-gray-600">Adres</p>
                <p className="text-sm font-medium text-gray-900">{cari.adres}</p>
              </div>
            )}
            {cari.notlar && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Notlar</p>
                <p className="text-sm font-medium text-gray-900">{cari.notlar}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Toplam Borç</p>
          <p className="text-xl font-bold text-red-600">
            {formatCurrency(toplamBorc)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Toplam Alacak</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(toplamAlacak)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Toplam Ödeme</p>
          <p className="text-xl font-bold text-blue-600">
            {formatCurrency(toplamOdeme)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Toplam Tahsilat</p>
          <p className="text-xl font-bold text-purple-600">
            {formatCurrency(toplamTahsilat)}
          </p>
        </div>
      </div>

      {/* Hareketler */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Hesap Hareketleri ({hareketler.length})
          </h2>
        </div>

        {hareketler.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            Henüz hareket kaydı yok
          </div>
        ) : (
          <>
            {/* Desktop Tablo */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlem Tipi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kaynak
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Açıklama
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bakiye
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hareketler.map((hareket) => {
                    return (
                      <tr key={hareket.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(hareket.tarih)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTipBadge(
                              hareket.tip
                            )}`}
                          >
                            {hareket.tip}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {getKaynakModulAdi(hareket.kaynakModul)}
                          {hareket.kilitli && (
                            <span className="ml-1 text-xs">🔒</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {hareket.aciklama || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                          <span
                            className={
                              hareket.tip === 'Borç' || hareket.tip === 'Ödeme'
                                ? 'text-red-600'
                                : 'text-green-600'
                            }
                          >
                            {hareket.tip === 'Borç' || hareket.tip === 'Ödeme'
                              ? '-'
                              : '+'}
                            {formatCurrency(hareket.tutar)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                          {/* Bakiye hesaplaması burada yapılabilir */}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobil Kart Görünümü */}
            <div className="md:hidden divide-y divide-gray-200">
              {hareketler.map((hareket) => (
                <div key={hareket.id} className="px-6 py-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTipBadge(
                          hareket.tip
                        )}`}
                      >
                        {hareket.tip}
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatDate(hareket.tarih)}
                      </p>
                    </div>
                    <p
                      className={`text-lg font-bold ${
                        hareket.tip === 'Borç' || hareket.tip === 'Ödeme'
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {hareket.tip === 'Borç' || hareket.tip === 'Ödeme'
                        ? '-'
                        : '+'}
                      {formatCurrency(hareket.tutar)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {getKaynakModulAdi(hareket.kaynakModul)}
                    {hareket.kilitli && <span className="ml-1 text-xs">🔒</span>}
                  </p>
                  {hareket.aciklama && (
                    <p className="text-sm text-gray-900">{hareket.aciklama}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
