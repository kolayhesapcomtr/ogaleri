import { useParams, useNavigate } from 'react-router-dom';
import type { AppState } from '../../types';
import { Button } from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface KrediKartiDetailPageProps {
  appState: AppState;
}

export const KrediKartiDetailPage = ({ appState }: KrediKartiDetailPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const krediKarti = appState.krediKartlari.find((k) => k.id === id);

  if (!krediKarti) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Kredi Kartı Bulunamadı</h2>
        <Button onClick={() => navigate('/kredi-kartlari')}>Kredi Kartları Listesine Dön</Button>
      </div>
    );
  }

  // Hareketleri getir ve tarihe göre sırala
  const hareketler = appState.krediKartiHareketler
    .filter((h) => h.krediKartiId === id)
    .sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());

  // İstatistikler
  const toplamHarcama = hareketler
    .filter((h) => h.tip === 'Harcama')
    .reduce((sum, h) => sum + h.tutar, 0);

  const toplamOdeme = hareketler
    .filter((h) => h.tip === 'Ödeme')
    .reduce((sum, h) => sum + h.tutar, 0);

  const kullanimOrani = krediKarti.limit > 0 ? (krediKarti.bakiye / krediKarti.limit) * 100 : 0;
  const kullanilabilir = krediKarti.limit - krediKarti.bakiye;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => navigate('/kredi-kartlari')}
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
              <h1 className="text-2xl font-bold text-gray-900">{krediKarti.ad}</h1>
              <p className="text-sm text-gray-600 mt-1">{krediKarti.banka}</p>
            </div>
          </div>

          {/* Limit ve Kullanım */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">Limit</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(krediKarti.limit)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mevcut Borç</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(krediKarti.bakiye)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Kullanılabilir Limit</p>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(kullanilabilir)}</p>
            </div>
            {krediKarti.hesapKesimGunu && (
              <div>
                <p className="text-sm text-gray-600">Hesap Kesim Günü</p>
                <p className="text-lg font-semibold text-gray-900">{krediKarti.hesapKesimGunu}</p>
              </div>
            )}
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 mb-2">Kullanım Oranı</p>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    kullanimOrani > 80 ? 'bg-red-600' : kullanimOrani > 50 ? 'bg-yellow-600' : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(kullanimOrani, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{kullanimOrani.toFixed(1)}% kullanılıyor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Toplam Harcama</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(toplamHarcama)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {hareketler.filter((h) => h.tip === 'Harcama').length} işlem
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Toplam Ödeme</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(toplamOdeme)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {hareketler.filter((h) => h.tip === 'Ödeme').length} işlem
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Bakiye</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(krediKarti.bakiye)}</p>
          <p className="text-xs text-gray-500 mt-1">Mevcut borç</p>
        </div>
      </div>

      {/* Hareketler */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Kredi Kartı Hareketleri ({hareketler.length})
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
                      Açıklama
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hareketler.map((hareket) => {
                    const isHarcama = hareket.tip === 'Harcama';
                    return (
                      <tr key={hareket.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(hareket.tarih)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              isHarcama ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {hareket.tip}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {hareket.aciklama || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                          <span className={isHarcama ? 'text-red-600' : 'text-green-600'}>
                            {isHarcama ? '+' : '-'}
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
                const isHarcama = hareket.tip === 'Harcama';
                return (
                  <div key={hareket.id} className="px-6 py-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isHarcama ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {hareket.tip}
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatDate(hareket.tarih)}
                        </p>
                      </div>
                      <p className={`text-lg font-bold ${isHarcama ? 'text-red-600' : 'text-green-600'}`}>
                        {isHarcama ? '+' : '-'}
                        {formatCurrency(hareket.tutar)}
                      </p>
                    </div>
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
