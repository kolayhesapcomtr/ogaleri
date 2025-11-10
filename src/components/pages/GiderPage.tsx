import { useState } from 'react';
import type { OdemeYontemi, AppState } from '../../types';
import { useAppService } from '../../hooks/useAppService';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Icons } from '../../constants/icons';
import { formatCurrency, formatDate, getTodayDate } from '../../utils/formatters';

interface GiderPageProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const GiderPage = ({ appState, setAppState }: GiderPageProps) => {
  const { addGider, updateGider, deleteGider } = useAppService({
    appState,
    setAppState,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGiderId, setEditingGiderId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tarih: getTodayDate(),
    kategori: '',
    tutar: '',
    odemeYontemi: 'Nakit' as OdemeYontemi,
    hesapId: '',
    krediKartiId: '',
    aciklama: '',
  });
  const [editForm, setEditForm] = useState({
    kategori: '',
    aciklama: '',
  });

  const handleOpenModal = () => {
    setFormData({
      tarih: getTodayDate(),
      kategori: appState.ayarlar.giderKategorileri[0] || '',
      tutar: '',
      odemeYontemi: 'Nakit',
      hesapId: appState.hesaplar.find((h) => h.tip === 'Kasa')?.id || '',
      krediKartiId: '',
      aciklama: '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const giderData = {
      tarih: formData.tarih,
      kategori: formData.kategori,
      tutar: parseFloat(formData.tutar),
      odemeYontemi: formData.odemeYontemi,
      hesapId:
        formData.odemeYontemi === 'Nakit' || formData.odemeYontemi === 'Banka'
          ? formData.hesapId
          : undefined,
      krediKartiId:
        formData.odemeYontemi === 'Kredi Kartı'
          ? formData.krediKartiId
          : undefined,
      aciklama: formData.aciklama,
    };

    addGider(giderData);
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu gideri silmek istediğinizden emin misiniz?')) {
      deleteGider(id);
    }
  };

  const handleOpenEditModal = (giderId: string) => {
    const gider = appState.giderler.find((g) => g.id === giderId);
    if (gider) {
      setEditingGiderId(giderId);
      setEditForm({
        kategori: gider.kategori,
        aciklama: gider.aciklama || '',
      });
      setIsEditModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingGiderId(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGiderId) {
      updateGider(editingGiderId, editForm);
      handleCloseEditModal();
    }
  };

  const toplamGider = appState.giderler.reduce(
    (sum, gider) => sum + gider.tutar,
    0
  );

  // Kategoriye göre gruplama
  const giderlerByKategori = appState.giderler.reduce((acc, gider) => {
    if (!acc[gider.kategori]) {
      acc[gider.kategori] = 0;
    }
    acc[gider.kategori] += gider.tutar;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Giderler</h1>
        <Button onClick={handleOpenModal}>
          <div className="flex items-center gap-2">
            <Icons.Add />
            <span>Yeni Gider</span>
          </div>
        </Button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600 mb-1">Toplam Gider</div>
          <div className="text-2xl font-bold text-red-700">
            {formatCurrency(toplamGider)}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 mb-1">Gider Sayısı</div>
          <div className="text-2xl font-bold text-blue-700">
            {appState.giderler.length}
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-600 mb-1">Kategori Sayısı</div>
          <div className="text-2xl font-bold text-purple-700">
            {Object.keys(giderlerByKategori).length}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 mb-1">Ortalama Gider</div>
          <div className="text-2xl font-bold text-green-700">
            {appState.giderler.length > 0
              ? formatCurrency(toplamGider / appState.giderler.length)
              : formatCurrency(0)}
          </div>
        </div>
      </div>

      {/* Desktop Tablo Görünümü */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarih
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kategori
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tutar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ödeme Yöntemi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Açıklama
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appState.giderler.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Henüz gider kaydı yok
                </td>
              </tr>
            ) : (
              appState.giderler.map((gider) => (
                <tr key={gider.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(gider.tarih)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                      {gider.kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                    {formatCurrency(gider.tutar)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {gider.odemeYontemi}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {gider.aciklama || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleOpenEditModal(gider.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Düzenle"
                      >
                        <Icons.Edit />
                      </button>
                      <button
                        onClick={() => handleDelete(gider.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Sil"
                      >
                        <Icons.Delete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobil Kart Görünümü */}
      <div className="md:hidden space-y-4">
        {appState.giderler.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Henüz gider kaydı yok
          </div>
        ) : (
          appState.giderler.map((gider) => (
            <div key={gider.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                    {gider.kategori}
                  </span>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatDate(gider.tarih)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(gider.id)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Düzenle"
                  >
                    <Icons.Edit />
                  </button>
                  <button
                    onClick={() => handleDelete(gider.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Sil"
                  >
                    <Icons.Delete />
                  </button>
                </div>
              </div>

              <div className="text-lg font-semibold text-red-600 mb-2">
                {formatCurrency(gider.tutar)}
              </div>

              <div className="text-sm text-gray-600 mb-1">
                {gider.odemeYontemi}
              </div>

              {gider.aciklama && (
                <div className="text-sm text-gray-500 mt-2">{gider.aciklama}</div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Yeni Gider"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tarih *"
            type="date"
            value={formData.tarih}
            onChange={(e) =>
              setFormData({ ...formData, tarih: e.target.value })
            }
            required
          />

          <Select
            label="Kategori *"
            value={formData.kategori}
            onChange={(e) =>
              setFormData({ ...formData, kategori: e.target.value })
            }
            options={appState.ayarlar.giderKategorileri.map((k) => ({
              value: k,
              label: k,
            }))}
            required
          />

          <Input
            label="Tutar *"
            type="number"
            step="0.01"
            min="0"
            value={formData.tutar}
            onChange={(e) =>
              setFormData({ ...formData, tutar: e.target.value })
            }
            required
            placeholder="0.00"
          />

          <Select
            label="Ödeme Yöntemi *"
            value={formData.odemeYontemi}
            onChange={(e) =>
              setFormData({
                ...formData,
                odemeYontemi: e.target.value as OdemeYontemi,
              })
            }
            options={[
              { value: 'Nakit', label: 'Nakit' },
              { value: 'Banka', label: 'Banka' },
              { value: 'Kredi Kartı', label: 'Kredi Kartı' },
            ]}
            required
          />

          {(formData.odemeYontemi === 'Nakit' ||
            formData.odemeYontemi === 'Banka') && (
            <Select
              label="Hesap *"
              value={formData.hesapId}
              onChange={(e) =>
                setFormData({ ...formData, hesapId: e.target.value })
              }
              options={appState.hesaplar.map((h) => ({
                value: h.id,
                label: `${h.ad} (${formatCurrency(h.bakiye)})`,
              }))}
              required
            />
          )}

          {formData.odemeYontemi === 'Kredi Kartı' && (
            <Select
              label="Kredi Kartı *"
              value={formData.krediKartiId}
              onChange={(e) =>
                setFormData({ ...formData, krediKartiId: e.target.value })
              }
              options={appState.krediKartlari.map((k) => ({
                value: k.id,
                label: `${k.ad} (${formatCurrency(k.bakiye)})`,
              }))}
              required
            />
          )}

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
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <strong>Not:</strong> Gider eklendiğinde, seçilen ödeme yöntemine
            göre otomatik olarak ilgili hesaptan para çıkışı yapılacaktır.
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Ekle
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

      {/* Düzenleme Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Gider Düzenle"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Select
            label="Kategori *"
            value={editForm.kategori}
            onChange={(e) =>
              setEditForm({ ...editForm, kategori: e.target.value })
            }
            options={appState.ayarlar.giderKategorileri.map((k) => ({
              value: k,
              label: k,
            }))}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              value={editForm.aciklama}
              onChange={(e) =>
                setEditForm({ ...editForm, aciklama: e.target.value })
              }
              placeholder="Gider açıklaması..."
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Not:</strong> Tutar ve ödeme yöntemi değiştirilemez (hesap hareketleri oluşturulmuş).
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Güncelle
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseEditModal}
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
