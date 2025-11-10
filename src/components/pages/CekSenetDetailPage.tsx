import { useParams, useNavigate } from 'react-router-dom';
import type { AppState } from '../../types';
import { Button } from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface CekSenetDetailPageProps {
  appState: AppState;
}

export const CekSenetDetailPage = ({ appState }: CekSenetDetailPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const cekSenet = appState.cekSenetler.find((c) => c.id === id);

  if (!cekSenet) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Çek/Senet Bulunamadı</h2>
        <Button onClick={() => navigate('/cek-senet')}>Çek & Senet Listesine Dön</Button>
      </div>
    );
  }

  // Cari bilgisini getir
  const cari = appState.cariler.find((c) => c.id === cekSenet.cariId);

  const getDurumBadge = (durum: string) => {
    switch (durum) {
      case 'Portföyde':
        return 'bg-blue-100 text-blue-800';
      case 'Tahsil Edildi':
      case 'Ödendi':
        return 'bg-green-100 text-green-800';
      case 'Ciro Edildi':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipBadge = (tip: string) => {
    return tip === 'Çek'
      ? 'bg-indigo-100 text-indigo-800'
      : 'bg-orange-100 text-orange-800';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => navigate('/cek-senet')}
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
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getTipBadge(cekSenet.tip)}`}>
                  {cekSenet.tip}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {cekSenet.tip} No: {cekSenet.cekSenetNo}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {cari?.ad || 'Cari Bulunamadı'}
              </p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDurumBadge(cekSenet.durum)}`}>
                {cekSenet.durum}
              </span>
            </div>
          </div>

          {/* Detay Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">Tutar</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(cekSenet.tutar)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vade Tarihi</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(cekSenet.vadeTarihi)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Oluşturma Tarihi</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(cekSenet.olusturmaTarihi)}</p>
            </div>
            {cekSenet.banka && (
              <div>
                <p className="text-sm text-gray-600">Banka</p>
                <p className="text-sm font-medium text-gray-900">{cekSenet.banka}</p>
              </div>
            )}
            {cekSenet.sube && (
              <div>
                <p className="text-sm text-gray-600">Şube</p>
                <p className="text-sm font-medium text-gray-900">{cekSenet.sube}</p>
              </div>
            )}
            {cekSenet.hesapNo && (
              <div>
                <p className="text-sm text-gray-600">Hesap No</p>
                <p className="text-sm font-medium text-gray-900">{cekSenet.hesapNo}</p>
              </div>
            )}
            {cekSenet.aciklama && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Açıklama</p>
                <p className="text-sm font-medium text-gray-900">{cekSenet.aciklama}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Durum Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Tutar</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(cekSenet.tutar)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{cekSenet.tip}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Vade</p>
          <p className="text-lg font-semibold text-gray-900">{formatDate(cekSenet.vadeTarihi)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(cekSenet.vadeTarihi) > new Date() ? 'Vadesi gelmedi' : 'Vade geçti'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Durum</p>
          <p className="text-lg font-semibold text-gray-900">{cekSenet.durum}</p>
          <p className="text-xs text-gray-500 mt-1">{cekSenet.banka || '-'}</p>
        </div>
      </div>

      {/* İşlem Geçmişi */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">İşlem Geçmişi</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {/* Oluşturulma */}
          <div className="px-6 py-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">1</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Oluşturuldu</p>
                <p className="text-sm text-gray-600 mt-1">
                  {cekSenet.tip} kaydedildi
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(cekSenet.olusturmaTarihi)}
                </p>
              </div>
            </div>
          </div>

          {/* Tahsilat */}
          {cekSenet.tahsilTarihi && (
            <div className="px-6 py-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">2</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Tahsil Edildi</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {cekSenet.tip} tahsil edildi
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(cekSenet.tahsilTarihi)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ödeme */}
          {cekSenet.odemeTarihi && (
            <div className="px-6 py-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">2</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Ödendi</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {cekSenet.tip} ödendi
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(cekSenet.odemeTarihi)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ciro */}
          {cekSenet.ciroTarihi && (
            <div className="px-6 py-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm font-bold">2</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Ciro Edildi</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {cekSenet.tip} ciro edildi
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(cekSenet.ciroTarihi)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
