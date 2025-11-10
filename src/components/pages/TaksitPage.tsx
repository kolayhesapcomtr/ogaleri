import { useState } from 'react';
import type { AppState, TaksitOdemesi } from '../../types';
import { useAppService } from '../../hooks/useAppService';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface TaksitPageProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

type ActiveTab = 'borclar' | 'alacaklar';
type ModalType = 'none' | 'odeme' | 'tahsilat';

export const TaksitPage = ({ appState, setAppState }: TaksitPageProps) => {
  const { payBorcTaksit, payAlacakTaksit } = useAppService({
    appState,
    setAppState,
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('borclar');
  const [modalType, setModalType] = useState<ModalType>('none');
  const [selectedTaksit, setSelectedTaksit] = useState<TaksitOdemesi | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Ödeme Form
  const [odemeForm, setOdemeForm] = useState({
    odemeTarihi: new Date().toISOString().split('T')[0],
    hesapId: '',
  });

  const handleOpenOdemeModal = (taksit: TaksitOdemesi) => {
    setSelectedTaksit(taksit);
    setOdemeForm({
      odemeTarihi: new Date().toISOString().split('T')[0],
      hesapId: '',
    });
    setModalType('odeme');
  };

  const handleOpenTahsilatModal = (taksit: TaksitOdemesi) => {
    setSelectedTaksit(taksit);
    setOdemeForm({
      odemeTarihi: new Date().toISOString().split('T')[0],
      hesapId: '',
    });
    setModalType('tahsilat');
  };

  const handleCloseModal = () => {
    setModalType('none');
    setSelectedTaksit(null);
  };

  const handleOdemeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTaksit) {
      try {
        payBorcTaksit(
          selectedTaksit.id,
          odemeForm.odemeTarihi,
          odemeForm.hesapId
        );
        handleCloseModal();
      } catch (error) {
        alert((error as Error).message);
      }
    }
  };

  const handleTahsilatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTaksit) {
      try {
        payAlacakTaksit(
          selectedTaksit.id,
          odemeForm.odemeTarihi,
          odemeForm.hesapId
        );
        handleCloseModal();
      } catch (error) {
        alert((error as Error).message);
      }
    }
  };

  const getTaksitler = (taksitliId: string, tip: 'Borç' | 'Alacak') => {
    return appState.taksitOdemeleri
      .filter((t) => t.taksitliId === taksitliId && t.tip === tip)
      .sort((a, b) => a.taksitNo - b.taksitNo);
  };

  const getCariAd = (cariId: string) => {
    const cari = appState.cariler.find((c) => c.id === cariId);
    return cari?.ad || 'Bilinmeyen';
  };

  const getTaksitDurumClass = (durum: string) => {
    switch (durum) {
      case 'Ödendi':
        return 'bg-green-100 text-green-800';
      case 'Gecikmiş':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const isGeciken = (vadeTarihi: string, durum: string) => {
    if (durum === 'Ödendi') return false;
    const vade = new Date(vadeTarihi);
    const today = new Date();
    return vade < today;
  };

  const hesapList = appState.hesaplar;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Taksitli İşlemler
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('borclar')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'borclar'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Taksitli Borçlar
        </button>
        <button
          onClick={() => setActiveTab('alacaklar')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'alacaklar'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Taksitli Alacaklar
        </button>
      </div>

      {/* Taksitli Borçlar */}
      {activeTab === 'borclar' && (
        <div className="space-y-4">
          {appState.taksitliBorclar.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Henüz taksitli borç kaydı yok
            </div>
          ) : (
            appState.taksitliBorclar.map((borc) => {
              const taksitler = getTaksitler(borc.id, 'Borç');
              const odenenSayi = taksitler.filter(
                (t) => t.durum === 'Ödendi'
              ).length;
              const isExpanded = expandedId === borc.id;

              return (
                <div key={borc.id} className="bg-white rounded-lg shadow">
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : borc.id)
                    }
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {borc.baslik}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {getCariAd(borc.cariId)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(borc.kalanTutar)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {odenenSayi}/{borc.taksitSayisi} taksit ödendi
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        Toplam: {formatCurrency(borc.toplamTutar)}
                      </span>
                      <span>
                        Aylık: {formatCurrency(borc.taksitTutari)}
                      </span>
                    </div>

                    {borc.kaynakModul && (
                      <div className="mt-2 text-xs text-gray-500">
                        Kaynak: {borc.kaynakModul}
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="border-t">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                              Taksit
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                              Vade
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                              Tutar
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                              Durum
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                              İşlem
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {taksitler.map((taksit) => {
                            const gecikti = isGeciken(
                              taksit.vadeTarihi,
                              taksit.durum
                            );
                            return (
                              <tr key={taksit.id}>
                                <td className="px-4 py-2 text-sm">
                                  {taksit.taksitNo}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  <div
                                    className={
                                      gecikti ? 'text-red-600' : ''
                                    }
                                  >
                                    {formatDate(taksit.vadeTarihi)}
                                  </div>
                                  {taksit.odemeTarihi && (
                                    <div className="text-xs text-gray-500">
                                      Öd: {formatDate(taksit.odemeTarihi)}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-sm font-medium">
                                  {formatCurrency(taksit.tutar)}
                                </td>
                                <td className="px-4 py-2">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${getTaksitDurumClass(
                                      gecikti && taksit.durum !== 'Ödendi'
                                        ? 'Gecikmiş'
                                        : taksit.durum
                                    )}`}
                                  >
                                    {gecikti && taksit.durum !== 'Ödendi'
                                      ? 'Gecikmiş'
                                      : taksit.durum}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-right">
                                  {taksit.durum !== 'Ödendi' && (
                                    <Button
                                      onClick={() =>
                                        handleOpenOdemeModal(taksit)
                                      }
                                      className="text-xs"
                                    >
                                      Öde
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Taksitli Alacaklar */}
      {activeTab === 'alacaklar' && (
        <div className="space-y-4">
          {appState.taksitliAlacaklar.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Henüz taksitli alacak kaydı yok
            </div>
          ) : (
            appState.taksitliAlacaklar.map((alacak) => {
              const taksitler = getTaksitler(alacak.id, 'Alacak');
              const tahsilEdilenSayi = taksitler.filter(
                (t) => t.durum === 'Ödendi'
              ).length;
              const isExpanded = expandedId === alacak.id;

              return (
                <div key={alacak.id} className="bg-white rounded-lg shadow">
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : alacak.id)
                    }
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {alacak.baslik}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {getCariAd(alacak.cariId)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(alacak.kalanTutar)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tahsilEdilenSayi}/{alacak.taksitSayisi} taksit
                          tahsil edildi
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        Toplam: {formatCurrency(alacak.toplamTutar)}
                      </span>
                      <span>
                        Aylık: {formatCurrency(alacak.taksitTutari)}
                      </span>
                    </div>

                    {alacak.kaynakModul && (
                      <div className="mt-2 text-xs text-gray-500">
                        Kaynak: {alacak.kaynakModul}
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="border-t">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                              Taksit
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                              Vade
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                              Tutar
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                              Durum
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                              İşlem
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {taksitler.map((taksit) => {
                            const gecikti = isGeciken(
                              taksit.vadeTarihi,
                              taksit.durum
                            );
                            return (
                              <tr key={taksit.id}>
                                <td className="px-4 py-2 text-sm">
                                  {taksit.taksitNo}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  <div
                                    className={
                                      gecikti ? 'text-red-600' : ''
                                    }
                                  >
                                    {formatDate(taksit.vadeTarihi)}
                                  </div>
                                  {taksit.odemeTarihi && (
                                    <div className="text-xs text-gray-500">
                                      Tahsil: {formatDate(taksit.odemeTarihi)}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-sm font-medium">
                                  {formatCurrency(taksit.tutar)}
                                </td>
                                <td className="px-4 py-2">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${getTaksitDurumClass(
                                      gecikti && taksit.durum !== 'Ödendi'
                                        ? 'Gecikmiş'
                                        : taksit.durum
                                    )}`}
                                  >
                                    {gecikti && taksit.durum !== 'Ödendi'
                                      ? 'Gecikmiş'
                                      : taksit.durum === 'Ödendi'
                                      ? 'Tahsil Edildi'
                                      : taksit.durum}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-right">
                                  {taksit.durum !== 'Ödendi' && (
                                    <Button
                                      onClick={() =>
                                        handleOpenTahsilatModal(taksit)
                                      }
                                      className="text-xs"
                                    >
                                      Tahsil Et
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Ödeme Modal */}
      <Modal
        isOpen={modalType === 'odeme'}
        onClose={handleCloseModal}
        title="Taksit Ödemesi"
      >
        <form onSubmit={handleOdemeSubmit} className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg mb-4">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between mb-1">
                <span>Taksit No:</span>
                <span className="font-medium">
                  {selectedTaksit?.taksitNo}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Vade Tarihi:</span>
                <span className="font-medium">
                  {selectedTaksit &&
                    formatDate(selectedTaksit.vadeTarihi)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t">
                <span>Tutar:</span>
                <span>
                  {selectedTaksit &&
                    formatCurrency(selectedTaksit.tutar)}
                </span>
              </div>
            </div>
          </div>

          <Input
            label="Ödeme Tarihi *"
            type="date"
            value={odemeForm.odemeTarihi}
            onChange={(e) =>
              setOdemeForm({ ...odemeForm, odemeTarihi: e.target.value })
            }
            required
          />

          <Select
            label="Hesap *"
            value={odemeForm.hesapId}
            onChange={(e) =>
              setOdemeForm({ ...odemeForm, hesapId: e.target.value })
            }
            options={[
              { value: '', label: 'Seçiniz...' },
              ...hesapList.map((h) => ({
                value: h.id,
                label: `${h.ad} (${formatCurrency(h.bakiye)})`,
              })),
            ]}
            required
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Öde
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              className="flex-1"
            >
              İptal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Tahsilat Modal */}
      <Modal
        isOpen={modalType === 'tahsilat'}
        onClose={handleCloseModal}
        title="Taksit Tahsilatı"
      >
        <form onSubmit={handleTahsilatSubmit} className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg mb-4">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between mb-1">
                <span>Taksit No:</span>
                <span className="font-medium">
                  {selectedTaksit?.taksitNo}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Vade Tarihi:</span>
                <span className="font-medium">
                  {selectedTaksit &&
                    formatDate(selectedTaksit.vadeTarihi)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t">
                <span>Tutar:</span>
                <span>
                  {selectedTaksit &&
                    formatCurrency(selectedTaksit.tutar)}
                </span>
              </div>
            </div>
          </div>

          <Input
            label="Tahsilat Tarihi *"
            type="date"
            value={odemeForm.odemeTarihi}
            onChange={(e) =>
              setOdemeForm({ ...odemeForm, odemeTarihi: e.target.value })
            }
            required
          />

          <Select
            label="Hesap *"
            value={odemeForm.hesapId}
            onChange={(e) =>
              setOdemeForm({ ...odemeForm, hesapId: e.target.value })
            }
            options={[
              { value: '', label: 'Seçiniz...' },
              ...hesapList.map((h) => ({
                value: h.id,
                label: `${h.ad} (${formatCurrency(h.bakiye)})`,
              })),
            ]}
            required
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Tahsil Et
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              className="flex-1"
            >
              İptal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
