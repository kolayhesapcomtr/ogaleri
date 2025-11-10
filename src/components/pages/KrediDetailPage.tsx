import { useParams, useNavigate } from 'react-router-dom';
import type { AppState } from '../../types';
import { Button } from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface KrediDetailPageProps {
  appState: AppState;
}

export const KrediDetailPage = ({ appState }: KrediDetailPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const kredi = appState.krediler.find((k) => k.id === id);

  if (!kredi) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Kredi Bulunamadı
        </h2>
        <Button onClick={() => navigate('/krediler')}>
          Krediler Listesine Dön
        </Button>
      </div>
    );
  }

  // Ödemeleri getir ve tarihe göre sırala
  const odemeler = appState.krediOdemeleri
    .filter((o) => o.krediId === id)
    .sort((a, b) => {
      const dateA = new Date(a.odemeTarihi || a.vadeTarihi);
      const dateB = new Date(b.odemeTarihi || b.vadeTarihi);
      return dateB.getTime() - dateA.getTime();
    });

  // İstatistikler
  const toplamOdenen = kredi.toplamTutar - kredi.kalanTutar;
  const tamamlanmaOrani = (toplamOdenen / kredi.toplamTutar) * 100;
  const kalanAy = Math.ceil(kredi.kalanTutar / kredi.aylikTaksit);

  const odenenTaksitSayisi = odemeler.filter((o) => o.durum === 'Ödendi')
    .length;
  const bekleyenTaksitSayisi = odemeler.filter((o) => o.durum === 'Beklemede')
    .length;
  const gecikmisTaksitSayisi = odemeler.filter((o) => o.durum === 'Gecikmiş')
    .length;

  const getDurumBadge = (durum: string) => {
    switch (durum) {
      case 'Ödendi':
        return 'bg-green-100 text-green-800';
      case 'Beklemede':
        return 'bg-yellow-100 text-yellow-800';
      case 'Gecikmiş':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => navigate('/krediler')}
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
              <h1 className="text-2xl font-bold text-gray-900">{kredi.ad}</h1>
              <p className="text-sm text-gray-600 mt-1">{kredi.banka}</p>
              {kredi.faizOrani && kredi.faizOrani > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Faiz Oranı: %{kredi.faizOrani}
                </p>
              )}
            </div>
          </div>

          {/* Detay Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">Toplam Kredi</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(kredi.toplamTutar)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Kalan Borç</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(kredi.kalanTutar)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ödenen</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(toplamOdenen)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Aylık Taksit</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(kredi.aylikTaksit)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Taksit Sayısı</p>
              <p className="text-lg font-semibold text-gray-900">
                {kredi.taksitSayisi} ay
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Kalan Taksit</p>
              <p className="text-lg font-semibold text-orange-600">
                {kalanAy} ay
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Başlangıç Tarihi</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(kredi.baslangicTarihi)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bitiş Tarihi</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(kredi.bitisTarihi)}
              </p>
            </div>
            {kredi.aciklama && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Açıklama</p>
                <p className="text-sm font-medium text-gray-900">
                  {kredi.aciklama}
                </p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="pt-4 border-t mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>İlerleme</span>
              <span>{tamamlanmaOrani.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-600 h-4 rounded-full transition-all"
                style={{ width: `${tamamlanmaOrani}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Ödenen Taksit</p>
          <p className="text-xl font-bold text-green-600">
            {odenenTaksitSayisi}
          </p>
          <p className="text-xs text-gray-500 mt-1">taksit</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Bekleyen</p>
          <p className="text-xl font-bold text-yellow-600">
            {bekleyenTaksitSayisi}
          </p>
          <p className="text-xs text-gray-500 mt-1">taksit</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Gecikmiş</p>
          <p className="text-xl font-bold text-red-600">
            {gecikmisTaksitSayisi}
          </p>
          <p className="text-xs text-gray-500 mt-1">taksit</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Toplam</p>
          <p className="text-xl font-bold text-gray-900">{odemeler.length}</p>
          <p className="text-xs text-gray-500 mt-1">taksit</p>
        </div>
      </div>

      {/* Ödemeler */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Ödeme Geçmişi ({odemeler.length})
          </h2>
        </div>

        {odemeler.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            Henüz ödeme kaydı yok
          </div>
        ) : (
          <>
            {/* Desktop Tablo */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taksit No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vade Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ödeme Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {odemeler.map((odeme) => (
                    <tr key={odeme.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{odeme.taksitNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(odeme.vadeTarihi)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {odeme.odemeTarihi
                          ? formatDate(odeme.odemeTarihi)
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDurumBadge(
                            odeme.durum
                          )}`}
                        >
                          {odeme.durum}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(odeme.tutar)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobil Kart Görünümü */}
            <div className="md:hidden divide-y divide-gray-200">
              {odemeler.map((odeme) => (
                <div key={odeme.id} className="px-6 py-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        Taksit #{odeme.taksitNo}
                      </p>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDurumBadge(
                          odeme.durum
                        )} mt-1`}
                      >
                        {odeme.durum}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(odeme.tutar)}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Vade: {formatDate(odeme.vadeTarihi)}</p>
                    {odeme.odemeTarihi && (
                      <p>Ödeme: {formatDate(odeme.odemeTarihi)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
