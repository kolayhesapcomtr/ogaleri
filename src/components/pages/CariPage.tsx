import { useState } from 'react';
import { Cari, CariTip, AppState } from '../../types';
import { useAppService } from '../../hooks/useAppService';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Icons } from '../../constants/icons';
import { formatCurrency } from '../../utils/formatters';

interface CariPageProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const CariPage = ({ appState, setAppState }: CariPageProps) => {
  const { addCari, updateCari, deleteCari } = useAppService({
    appState,
    setAppState,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCari, setEditingCari] = useState<Cari | null>(null);
  const [formData, setFormData] = useState({
    ad: '',
    tip: 'Müşteri' as CariTip,
    telefon: '',
    adres: '',
    notlar: '',
  });

  const handleOpenModal = (cari?: Cari) => {
    if (cari) {
      setEditingCari(cari);
      setFormData({
        ad: cari.ad,
        tip: cari.tip,
        telefon: cari.telefon || '',
        adres: cari.adres || '',
        notlar: cari.notlar || '',
      });
    } else {
      setEditingCari(null);
      setFormData({
        ad: '',
        tip: 'Müşteri',
        telefon: '',
        adres: '',
        notlar: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCari(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCari) {
      updateCari(editingCari.id, formData);
    } else {
      addCari(formData);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu cariyi silmek istediğinizden emin misiniz?')) {
      deleteCari(id);
    }
  };

  const getBakiyeClass = (bakiye: number) => {
    if (bakiye > 0) return 'text-green-600 font-semibold';
    if (bakiye < 0) return 'text-red-600 font-semibold';
    return 'text-gray-600';
  };

  const getBakiyeText = (bakiye: number, tip: CariTip) => {
    if (bakiye === 0) return 'Bakiye Yok';
    if (bakiye > 0) {
      return tip === 'Müşteri' ? 'Alacak' : 'Borç';
    } else {
      return tip === 'Müşteri' ? 'Borç' : 'Alacak';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cari Hesaplar</h1>
        <Button onClick={() => handleOpenModal()}>
          <div className="flex items-center gap-2">
            <Icons.Add />
            <span>Yeni Cari</span>
          </div>
        </Button>
      </div>

      {/* Desktop Tablo Görünümü */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tip
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bakiye
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
            {appState.cariler.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Henüz cari kaydı yok
                </td>
              </tr>
            ) : (
              appState.cariler.map((cari) => (
                <tr key={cari.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{cari.ad}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        cari.tip === 'Müşteri'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {cari.tip}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cari.telefon || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={getBakiyeClass(cari.bakiye)}>
                      {formatCurrency(Math.abs(cari.bakiye))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getBakiyeText(cari.bakiye, cari.tip)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(cari)}
                      className="text-primary hover:text-primary-dark mr-3"
                    >
                      <Icons.Edit />
                    </button>
                    <button
                      onClick={() => handleDelete(cari.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Icons.Delete />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobil Kart Görünümü */}
      <div className="md:hidden space-y-4">
        {appState.cariler.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Henüz cari kaydı yok
          </div>
        ) : (
          appState.cariler.map((cari) => (
            <div key={cari.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{cari.ad}</h3>
                  <span
                    className={`inline-block mt-1 px-2 text-xs leading-5 font-semibold rounded-full ${
                      cari.tip === 'Müşteri'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {cari.tip}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(cari)}
                    className="text-primary hover:text-primary-dark"
                  >
                    <Icons.Edit />
                  </button>
                  <button
                    onClick={() => handleDelete(cari.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Icons.Delete />
                  </button>
                </div>
              </div>
              {cari.telefon && (
                <p className="text-sm text-gray-600 mb-2">{cari.telefon}</p>
              )}
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-sm text-gray-500">
                  {getBakiyeText(cari.bakiye, cari.tip)}
                </span>
                <span className={getBakiyeClass(cari.bakiye)}>
                  {formatCurrency(Math.abs(cari.bakiye))}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCari ? 'Cari Düzenle' : 'Yeni Cari'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Cari Adı *"
            value={formData.ad}
            onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
            required
          />

          <Select
            label="Tip *"
            value={formData.tip}
            onChange={(e) =>
              setFormData({ ...formData, tip: e.target.value as CariTip })
            }
            options={[
              { value: 'Müşteri', label: 'Müşteri' },
              { value: 'Tedarikçi', label: 'Tedarikçi' },
            ]}
            required
          />

          <Input
            label="Telefon"
            type="tel"
            value={formData.telefon}
            onChange={(e) =>
              setFormData({ ...formData, telefon: e.target.value })
            }
          />

          <Input
            label="Adres"
            value={formData.adres}
            onChange={(e) =>
              setFormData({ ...formData, adres: e.target.value })
            }
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notlar
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              value={formData.notlar}
              onChange={(e) =>
                setFormData({ ...formData, notlar: e.target.value })
              }
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingCari ? 'Güncelle' : 'Ekle'}
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
