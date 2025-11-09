import { useState } from 'react';
import type { Hesap, HesapTip, AppState } from '../../types';
import { useAppService } from '../../hooks/useAppService';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Icons } from '../../constants/icons';
import { formatCurrency } from '../../utils/formatters';

interface KasaPageProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const KasaPage = ({ appState, setAppState }: KasaPageProps) => {
  const { addHesap, updateHesap, deleteHesap } = useAppService({
    appState,
    setAppState,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHesap, setEditingHesap] = useState<Hesap | null>(null);
  const [formData, setFormData] = useState({
    ad: '',
    tip: 'Kasa' as HesapTip,
    aciklama: '',
  });

  const handleOpenModal = (hesap?: Hesap) => {
    if (hesap) {
      setEditingHesap(hesap);
      setFormData({
        ad: hesap.ad,
        tip: hesap.tip,
        aciklama: hesap.aciklama || '',
      });
    } else {
      setEditingHesap(null);
      setFormData({
        ad: '',
        tip: 'Kasa',
        aciklama: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingHesap(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingHesap) {
      updateHesap(editingHesap.id, formData);
    } else {
      addHesap(formData);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu hesabı silmek istediğinizden emin misiniz?')) {
      deleteHesap(id);
    }
  };

  const toplamBakiye = appState.hesaplar.reduce(
    (sum, hesap) => sum + hesap.bakiye,
    0
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kasa & Banka</h1>
        <Button onClick={() => handleOpenModal()}>
          <div className="flex items-center gap-2">
            <Icons.Add />
            <span>Yeni Hesap</span>
          </div>
        </Button>
      </div>

      {/* Toplam Bakiye Kartı */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg shadow-lg p-6 mb-6">
        <div className="text-sm opacity-90">Toplam Bakiye</div>
        <div className="text-3xl font-bold mt-1">
          {formatCurrency(toplamBakiye)}
        </div>
      </div>

      {/* Hesaplar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appState.hesaplar.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Henüz hesap kaydı yok
          </div>
        ) : (
          appState.hesaplar.map((hesap) => (
            <div
              key={hesap.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {hesap.ad}
                  </h3>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                      hesap.tip === 'Kasa'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {hesap.tip}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(hesap)}
                    className="text-primary hover:text-primary-dark"
                  >
                    <Icons.Edit />
                  </button>
                  <button
                    onClick={() => handleDelete(hesap.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Icons.Delete />
                  </button>
                </div>
              </div>

              {hesap.aciklama && (
                <p className="text-sm text-gray-600 mb-3">{hesap.aciklama}</p>
              )}

              <div className="pt-3 border-t">
                <div className="text-sm text-gray-500 mb-1">Bakiye</div>
                <div
                  className={`text-2xl font-bold ${
                    hesap.bakiye >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(hesap.bakiye)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingHesap ? 'Hesap Düzenle' : 'Yeni Hesap'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Hesap Adı *"
            value={formData.ad}
            onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
            required
            placeholder="örn: Merkez Kasa, Ziraat Bankası"
          />

          <Select
            label="Tip *"
            value={formData.tip}
            onChange={(e) =>
              setFormData({ ...formData, tip: e.target.value as HesapTip })
            }
            options={[
              { value: 'Kasa', label: 'Kasa' },
              { value: 'Banka', label: 'Banka' },
            ]}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={2}
              value={formData.aciklama}
              onChange={(e) =>
                setFormData({ ...formData, aciklama: e.target.value })
              }
              placeholder="IBAN, şube bilgisi vb."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingHesap ? 'Güncelle' : 'Ekle'}
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
