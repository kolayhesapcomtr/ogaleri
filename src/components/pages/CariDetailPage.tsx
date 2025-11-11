import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { AppState } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAppService } from '../../hooks/useAppService';

interface CariDetailPageProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const CariDetailPage = ({ appState, setAppState }: CariDetailPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addCariHareket } = useAppService({ appState, setAppState });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'tahsilat' | 'odeme'>('tahsilat');
  const [hareketForm, setHareketForm] = useState({
    tutar: 0,
    tarih: new Date().toISOString().split('T')[0],
    aciklama: '',
  });

  const cari = appState.cariler.find((c) => c.id === id);

  const handleOpenModal = (type: 'tahsilat' | 'odeme') => {
    setModalType(type);
    setHareketForm({
      tutar: 0,
      tarih: new Date().toISOString().split('T')[0],
      aciklama: '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setHareketForm({
      tutar: 0,
      tarih: new Date().toISOString().split('T')[0],
      aciklama: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || hareketForm.tutar <= 0) {
      alert('Lütfen geçerli bir tutar girin');
      return;
    }

    addCariHareket({
      cariId: id,
      tip: modalType === 'tahsilat' ? 'Tahsilat' : 'Ödeme',
      tutar: hareketForm.tutar,
      tarih: hareketForm.tarih,
      aciklama: hareketForm.aciklama || undefined,
    });

    handleCloseModal();
  };

  if (!cari) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cari Bulunamadı</h2>
        <Button onClick={() => navigate('/cari')}>Cari Listesine Dön</Button>
      </div>
    );
  }

  // Cari hareketlerini getir ve tarihe göre sırala (en yeni en üstte)
  const hareketler = appState.cariHareketler
    .filter((h) => h.cariId === id)
    .sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());

  // Bakiye hesaplama için hareketleri kronolojik sırada (en eski en başta) işle
  const hareketlerKronolojik = [...hareketler].sort(
    (a, b) => new Date(a.tarih).getTime() - new Date(b.tarih).getTime()
  );

  // Her hareket için çalışan bakiyeyi hesapla
  const bakiyeMap = new Map<string, number>();
  let calisanBakiye = 0;

  hareketlerKronolojik.forEach((hareket) => {
    // Alacak ve Tahsilat pozitif, Borç ve Ödeme negatif
    if (hareket.tip === 'Alacak' || hareket.tip === 'Tahsilat') {
      calisanBakiye += hareket.tutar;
    } else if (hareket.tip === 'Borç' || hareket.tip === 'Ödeme') {
      calisanBakiye -= hareket.tutar;
    }
    bakiyeMap.set(hareket.id, calisanBakiye);
  });

  // Bakiye hesaplama (toplam tutarlar)
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
            <div className="flex flex-col gap-2">
              <div className="text-right mb-2">
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
              <div className="flex gap-2">
                <Button
                  onClick={() => handleOpenModal('tahsilat')}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm"
                >
                  💰 Tahsilat
                </Button>
                <Button
                  onClick={() => handleOpenModal('odeme')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  💸 Ödeme
                </Button>
              </div>
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {(() => {
                            const bakiye = bakiyeMap.get(hareket.id) || 0;
                            return (
                              <span
                                className={
                                  bakiye >= 0 ? 'text-green-600' : 'text-red-600'
                                }
                              >
                                {formatCurrency(Math.abs(bakiye))}
                              </span>
                            );
                          })()}
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
                const bakiye = bakiyeMap.get(hareket.id) || 0;
                return (
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
                      <div className="text-right">
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
                        <p
                          className={`text-xs mt-1 ${
                            bakiye >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          Bakiye: {formatCurrency(Math.abs(bakiye))}
                        </p>
                      </div>
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

      {/* Manuel Hareket Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalType === 'tahsilat' ? 'Tahsilat Yap' : 'Ödeme Yap'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tutar *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={hareketForm.tutar || ''}
              onChange={(e) =>
                setHareketForm({ ...hareketForm, tutar: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tarih *
            </label>
            <input
              type="date"
              value={hareketForm.tarih}
              onChange={(e) =>
                setHareketForm({ ...hareketForm, tarih: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              value={hareketForm.aciklama}
              onChange={(e) =>
                setHareketForm({ ...hareketForm, aciklama: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              İptal
            </Button>
            <Button
              type="submit"
              className={
                modalType === 'tahsilat'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            >
              {modalType === 'tahsilat' ? 'Tahsilat Yap' : 'Ödeme Yap'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
