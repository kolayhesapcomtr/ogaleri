import { useParams, useNavigate } from 'react-router-dom';
import type { AppState } from '../../types';
import { Button } from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface HesapDetailPageProps {
  appState: AppState;
}

export const HesapDetailPage = ({ appState }: HesapDetailPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const hesap = appState.hesaplar.find((h) => h.id === id);

  if (!hesap) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Hesap Bulunamadı</h2>
        <Button onClick={() => navigate('/kasa')}>Hesap Listesine Dön</Button>
      </div>
    );
  }

  // Hesap hareketlerini getir ve tarihe göre sırala
  const hareketler = appState.hesapHareketler
    .filter((h) => h.hesapId === id)
    .sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());

  // İstatistikler
  const toplamGiris = hareketler
    .filter((h) => h.tip === 'ParaGirişi' || h.tip === 'VirmanGelen')
    .reduce((sum, h) => sum + h.tutar, 0);

  const toplamCikis = hareketler
    .filter((h) => h.tip === 'ParaÇıkışı' || h.tip === 'VirmanGiden')
    .reduce((sum, h) => sum + h.tutar, 0);

  const getTipBadge = (tip: string) => {
    switch (tip) {
      case 'ParaGirişi':
        return 'bg-green-100 text-green-800';
      case 'ParaÇıkışı':
        return 'bg-red-100 text-red-800';
      case 'VirmanGelen':
        return 'bg-blue-100 text-blue-800';
      case 'VirmanGiden':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipIcon = (tip: string) => {
    switch (tip) {
      case 'ParaGirişi':
      case 'VirmanGelen':
        return <span className="inline">↓</span>;
      case 'ParaÇıkışı':
      case 'VirmanGiden':
        return <span className="inline">↑</span>;
      default:
        return null;
    }
  };

  const getTipAdi = (tip: string) => {
    switch (tip) {
      case 'ParaGirişi':
        return 'Para Girişi';
      case 'ParaÇıkışı':
        return 'Para Çıkışı';
      case 'VirmanGelen':
        return 'Virman (Gelen)';
      case 'VirmanGiden':
        return 'Virman (Giden)';
      default:
        return tip;
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
      case 'KrediKartları':
        return 'Kredi Kartları';
      case 'ÇekSenet':
        return 'Çek & Senet';
      default:
        return 'Manuel İşlem';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => navigate('/kasa')}
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
              <h1 className="text-2xl font-bold text-gray-900">{hesap.ad}</h1>
              <p className="text-sm text-gray-600 mt-1">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    hesap.tip === 'Kasa'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {hesap.tip}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Bakiye</p>
              <p
                className={`text-2xl font-bold ${
                  hesap.bakiye >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(hesap.bakiye)}
              </p>
            </div>
          </div>

          {hesap.aciklama && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">Açıklama</p>
              <p className="text-sm font-medium text-gray-900">{hesap.aciklama}</p>
            </div>
          )}
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Toplam Giriş</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(toplamGiris)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {hareketler.filter((h) => h.tip === 'ParaGirişi' || h.tip === 'VirmanGelen').length} işlem
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Toplam Çıkış</p>
          <p className="text-xl font-bold text-red-600">
            {formatCurrency(toplamCikis)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {hareketler.filter((h) => h.tip === 'ParaÇıkışı' || h.tip === 'VirmanGiden').length} işlem
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Net Değişim</p>
          <p
            className={`text-xl font-bold ${
              toplamGiris - toplamCikis >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(toplamGiris - toplamCikis)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {hareketler.length} toplam işlem
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hareketler.map((hareket) => {
                    const isGiris = hareket.tip === 'ParaGirişi' || hareket.tip === 'VirmanGelen';
                    return (
                      <tr key={hareket.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(hareket.tarih)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${getTipBadge(
                              hareket.tip
                            )}`}
                          >
                            {getTipIcon(hareket.tip)}
                            {getTipAdi(hareket.tip)}
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
                          <span className={isGiris ? 'text-green-600' : 'text-red-600'}>
                            {isGiris ? '+' : '-'}
                            {formatCurrency(hareket.tutar)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobil Kart Görünümü */}
            <div className="md:hidden divide-y divide-gray-200">
              {hareketler.map((hareket) => {
                const isGiris = hareket.tip === 'ParaGirişi' || hareket.tip === 'VirmanGelen';
                return (
                  <div key={hareket.id} className="px-6 py-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${getTipBadge(
                            hareket.tip
                          )}`}
                        >
                          {getTipIcon(hareket.tip)}
                          {getTipAdi(hareket.tip)}
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatDate(hareket.tarih)}
                        </p>
                      </div>
                      <p
                        className={`text-lg font-bold ${
                          isGiris ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isGiris ? '+' : '-'}
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
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
