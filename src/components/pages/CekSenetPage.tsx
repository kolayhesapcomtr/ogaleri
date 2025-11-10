import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CekSenet, AppState, CekSenetTip, CekSenetDurum } from '../../types';
import { useAppService } from '../../hooks/useAppService';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Icons } from '../../constants/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface CekSenetPageProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

type ActiveTab = 'alinan' | 'verilen';
type ModalType = 'none' | 'ekle' | 'tahsilat' | 'odeme' | 'ciro';

export const CekSenetPage = ({ appState, setAppState }: CekSenetPageProps) => {
  const navigate = useNavigate();
  const { addCekSenet, deleteCekSenet, tahsilCekSenet, odemeCekSenet, ciroCekSenet } =
    useAppService({
      appState,
      setAppState,
    });

  const [activeTab, setActiveTab] = useState<ActiveTab>('alinan');
  const [modalType, setModalType] = useState<ModalType>('none');
  const [selectedCekSenet, setSelectedCekSenet] = useState<CekSenet | null>(null);

  // Form
  const [form, setForm] = useState({
    tip: 'Çek' as CekSenetTip,
    yon: 'Alinan' as 'Alinan' | 'Verilen',
    cekSenetNo: '',
    tutar: 0,
    vadeTarihi: new Date().toISOString().split('T')[0],
    cariId: '',
    banka: '',
    sube: '',
    hesapNo: '',
    aciklama: '',
  });

  // Tahsilat/Ödeme Form
  const [islemForm, setIslemForm] = useState({
    tarih: new Date().toISOString().split('T')[0],
    hesapId: '',
  });

  // Ciro Form
  const [ciroForm, setCiroForm] = useState({
    tarih: new Date().toISOString().split('T')[0],
    cariId: '',
  });

  const handleOpenEkleModal = (yon: 'Alinan' | 'Verilen') => {
    setForm({
      tip: 'Çek',
      yon,
      cekSenetNo: '',
      tutar: 0,
      vadeTarihi: new Date().toISOString().split('T')[0],
      cariId: '',
      banka: '',
      sube: '',
      hesapNo: '',
      aciklama: '',
    });
    setModalType('ekle');
  };

  const handleOpenTahsilatModal = (cekSenet: CekSenet) => {
    setSelectedCekSenet(cekSenet);
    setIslemForm({
      tarih: new Date().toISOString().split('T')[0],
      hesapId: '',
    });
    setModalType('tahsilat');
  };

  const handleOpenOdemeModal = (cekSenet: CekSenet) => {
    setSelectedCekSenet(cekSenet);
    setIslemForm({
      tarih: new Date().toISOString().split('T')[0],
      hesapId: '',
    });
    setModalType('odeme');
  };

  const handleOpenCiroModal = (cekSenet: CekSenet) => {
    setSelectedCekSenet(cekSenet);
    setCiroForm({
      tarih: new Date().toISOString().split('T')[0],
      cariId: '',
    });
    setModalType('ciro');
  };

  const handleCloseModal = () => {
    setModalType('none');
    setSelectedCekSenet(null);
  };

  const handleEkleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCekSenet({
      ...form,
      durum: 'Portföyde',
    });
    handleCloseModal();
  };

  const handleTahsilatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCekSenet) {
      try {
        tahsilCekSenet(selectedCekSenet.id, islemForm.hesapId, islemForm.tarih);
        handleCloseModal();
      } catch (error) {
        alert((error as Error).message);
      }
    }
  };

  const handleOdemeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCekSenet) {
      try {
        odemeCekSenet(selectedCekSenet.id, islemForm.hesapId, islemForm.tarih);
        handleCloseModal();
      } catch (error) {
        alert((error as Error).message);
      }
    }
  };

  const handleCiroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCekSenet) {
      try {
        ciroCekSenet(selectedCekSenet.id, ciroForm.cariId, ciroForm.tarih);
        handleCloseModal();
      } catch (error) {
        alert((error as Error).message);
      }
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      deleteCekSenet(id);
    }
  };

  const getCariAd = (cariId: string) => {
    const cari = appState.cariler.find((c) => c.id === cariId);
    return cari?.ad || '-';
  };

  const getDurumClass = (durum: CekSenetDurum) => {
    switch (durum) {
      case 'Portföyde':
        return 'bg-blue-100 text-blue-800';
      case 'Tahsil Edildi':
        return 'bg-green-100 text-green-800';
      case 'Ödendi':
        return 'bg-green-100 text-green-800';
      case 'Ciro Edildi':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const alinanCekSenetler = appState.cekSenetler.filter((cs) => {
    const cari = appState.cariler.find((c) => c.id === cs.cariId);
    return cari?.tip === 'Müşteri';
  });

  const verilenCekSenetler = appState.cekSenetler.filter((cs) => {
    const cari = appState.cariler.find((c) => c.id === cs.cariId);
    return cari?.tip === 'Tedarikçi';
  });

  // Artık tüm cariler hem müşteri hem tedarikçi olabilir - tip filtresi kaldırıldı
  const cariList = appState.cariler;
  const hesapList = appState.hesaplar;

  const renderCekSenetTable = (cekSenetler: CekSenet[], yon: 'Alinan' | 'Verilen') => {
    if (cekSenetler.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          Henüz {yon.toLowerCase()} çek/senet kaydı yok
        </div>
      );
    }

    return (
      <>
        {/* Desktop Tablo */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cari
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cekSenetler.map((cs) => (
                <tr key={cs.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{cs.tip}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/cek-senet/${cs.id}`)}
                      className="text-sm font-medium text-primary hover:text-primary-dark text-left"
                    >
                      {cs.cekSenetNo}
                    </button>
                    {cs.banka && (
                      <div className="text-xs text-gray-500">{cs.banka}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCariAd(cs.cariId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(cs.tutar)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(cs.vadeTarihi)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDurumClass(
                        cs.durum
                      )}`}
                    >
                      {cs.durum}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {cs.durum === 'Portföyde' && (
                      <>
                        {yon === 'Alinan' && (
                          <>
                            <button
                              onClick={() => handleOpenTahsilatModal(cs)}
                              className="text-green-600 hover:text-green-900"
                              title="Tahsil Et"
                            >
                              <Icons.Check />
                            </button>
                            <button
                              onClick={() => handleOpenCiroModal(cs)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Ciro Et"
                            >
                              <Icons.ArrowUp />
                            </button>
                          </>
                        )}
                        {yon === 'Verilen' && (
                          <button
                            onClick={() => handleOpenOdemeModal(cs)}
                            className="text-green-600 hover:text-green-900"
                            title="Öde"
                          >
                            <Icons.Check />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(cs.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Sil"
                        >
                          <Icons.Delete />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobil Kart */}
        <div className="md:hidden space-y-4">
          {cekSenetler.map((cs) => (
            <div key={cs.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <button
                    onClick={() => navigate(`/cek-senet/${cs.id}`)}
                    className="font-semibold text-primary hover:text-primary-dark text-left"
                  >
                    {cs.tip} - {cs.cekSenetNo}
                  </button>
                  <p className="text-sm text-gray-500">{getCariAd(cs.cariId)}</p>
                </div>
                <span
                  className={`px-2 text-xs leading-5 font-semibold rounded-full ${getDurumClass(
                    cs.durum
                  )}`}
                >
                  {cs.durum}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tutar:</span>
                  <span className="font-semibold">{formatCurrency(cs.tutar)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vade:</span>
                  <span className="font-medium">{formatDate(cs.vadeTarihi)}</span>
                </div>
                {cs.banka && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Banka:</span>
                    <span className="font-medium">{cs.banka}</span>
                  </div>
                )}
              </div>

              {cs.durum === 'Portföyde' && (
                <div className="flex gap-2 pt-3 border-t">
                  {yon === 'Alinan' && (
                    <>
                      <Button
                        onClick={() => handleOpenTahsilatModal(cs)}
                        className="flex-1"
                        variant="secondary"
                      >
                        Tahsil Et
                      </Button>
                      <Button
                        onClick={() => handleOpenCiroModal(cs)}
                        className="flex-1"
                        variant="secondary"
                      >
                        Ciro Et
                      </Button>
                    </>
                  )}
                  {yon === 'Verilen' && (
                    <Button
                      onClick={() => handleOpenOdemeModal(cs)}
                      className="flex-1"
                    >
                      Öde
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Çek & Senet</h1>
        <Button onClick={() => handleOpenEkleModal(activeTab === 'alinan' ? 'Alinan' : 'Verilen')}>
          <div className="flex items-center gap-2">
            <Icons.Add />
            <span>Yeni Ekle</span>
          </div>
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('alinan')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alinan'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Alınan Çek/Senetler ({alinanCekSenetler.length})
          </button>
          <button
            onClick={() => setActiveTab('verilen')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'verilen'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Verilen Çek/Senetler ({verilenCekSenetler.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'alinan'
        ? renderCekSenetTable(alinanCekSenetler, 'Alinan')
        : renderCekSenetTable(verilenCekSenetler, 'Verilen')}

      {/* Ekle Modal */}
      <Modal
        isOpen={modalType === 'ekle'}
        onClose={handleCloseModal}
        title={`Yeni ${form.yon} Çek/Senet`}
      >
        <form onSubmit={handleEkleSubmit} className="space-y-4">
          <Select
            label="Tip *"
            value={form.tip}
            onChange={(e) => setForm({ ...form, tip: e.target.value as CekSenetTip })}
            options={[
              { value: 'Çek', label: 'Çek' },
              { value: 'Senet', label: 'Senet' },
            ]}
            required
          />

          <Input
            label="Çek/Senet No *"
            value={form.cekSenetNo}
            onChange={(e) => setForm({ ...form, cekSenetNo: e.target.value })}
            required
          />

          <Input
            label="Tutar *"
            type="number"
            step="0.01"
            value={form.tutar}
            onChange={(e) =>
              setForm({ ...form, tutar: parseFloat(e.target.value) || 0 })
            }
            required
          />

          <Input
            label="Vade Tarihi *"
            type="date"
            value={form.vadeTarihi}
            onChange={(e) => setForm({ ...form, vadeTarihi: e.target.value })}
            required
          />

          <Select
            label="Cari *"
            value={form.cariId}
            onChange={(e) => setForm({ ...form, cariId: e.target.value })}
            options={[
              { value: '', label: 'Cari Seçiniz...' },
              ...cariList.map((c) => ({
                value: c.id,
                label: `${c.ad} (${c.tip})`,
              })),
            ]}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Banka"
              value={form.banka}
              onChange={(e) => setForm({ ...form, banka: e.target.value })}
            />
            <Input
              label="Şube"
              value={form.sube}
              onChange={(e) => setForm({ ...form, sube: e.target.value })}
            />
          </div>

          <Input
            label="Hesap No"
            value={form.hesapNo}
            onChange={(e) => setForm({ ...form, hesapNo: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              value={form.aciklama}
              onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Kaydet
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
        title={`Tahsilat - ${selectedCekSenet?.cekSenetNo}`}
      >
        <form onSubmit={handleTahsilatSubmit} className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg mb-4">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between mb-1">
                <span>Tutar:</span>
                <span className="font-semibold text-green-600">
                  {selectedCekSenet && formatCurrency(selectedCekSenet.tutar)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Vade:</span>
                <span className="font-medium">
                  {selectedCekSenet && formatDate(selectedCekSenet.vadeTarihi)}
                </span>
              </div>
            </div>
          </div>

          <Input
            label="Tahsilat Tarihi *"
            type="date"
            value={islemForm.tarih}
            onChange={(e) => setIslemForm({ ...islemForm, tarih: e.target.value })}
            required
          />

          <Select
            label="Hesap *"
            value={islemForm.hesapId}
            onChange={(e) => setIslemForm({ ...islemForm, hesapId: e.target.value })}
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

      {/* Ödeme Modal */}
      <Modal
        isOpen={modalType === 'odeme'}
        onClose={handleCloseModal}
        title={`Ödeme - ${selectedCekSenet?.cekSenetNo}`}
      >
        <form onSubmit={handleOdemeSubmit} className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg mb-4">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between mb-1">
                <span>Tutar:</span>
                <span className="font-semibold text-red-600">
                  {selectedCekSenet && formatCurrency(selectedCekSenet.tutar)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Vade:</span>
                <span className="font-medium">
                  {selectedCekSenet && formatDate(selectedCekSenet.vadeTarihi)}
                </span>
              </div>
            </div>
          </div>

          <Input
            label="Ödeme Tarihi *"
            type="date"
            value={islemForm.tarih}
            onChange={(e) => setIslemForm({ ...islemForm, tarih: e.target.value })}
            required
          />

          <Select
            label="Hesap *"
            value={islemForm.hesapId}
            onChange={(e) => setIslemForm({ ...islemForm, hesapId: e.target.value })}
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

      {/* Ciro Modal */}
      <Modal
        isOpen={modalType === 'ciro'}
        onClose={handleCloseModal}
        title={`Ciro Et - ${selectedCekSenet?.cekSenetNo}`}
      >
        <form onSubmit={handleCiroSubmit} className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg mb-4">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between mb-1">
                <span>Tutar:</span>
                <span className="font-semibold text-purple-600">
                  {selectedCekSenet && formatCurrency(selectedCekSenet.tutar)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Vade:</span>
                <span className="font-medium">
                  {selectedCekSenet && formatDate(selectedCekSenet.vadeTarihi)}
                </span>
              </div>
            </div>
          </div>

          <Input
            label="Ciro Tarihi *"
            type="date"
            value={ciroForm.tarih}
            onChange={(e) => setCiroForm({ ...ciroForm, tarih: e.target.value })}
            required
          />

          <Select
            label="Ciro Edilecek Cari *"
            value={ciroForm.cariId}
            onChange={(e) => setCiroForm({ ...ciroForm, cariId: e.target.value })}
            options={[
              { value: '', label: 'Cari Seçiniz...' },
              ...cariList.map((c) => ({
                value: c.id,
                label: `${c.ad} (${c.tip})`,
              })),
            ]}
            required
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Ciro Et
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
