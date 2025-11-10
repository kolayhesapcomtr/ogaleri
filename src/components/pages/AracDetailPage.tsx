import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { AppState, AracMaliyet } from '../../types';
import { useAppService } from '../../hooks/useAppService';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Icons } from '../../constants/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface AracDetailPageProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const AracDetailPage = ({ appState, setAppState }: AracDetailPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateAracMaliyet, deleteAracMaliyet } = useAppService({ appState, setAppState });

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMaliyet, setSelectedMaliyet] = useState<AracMaliyet | null>(null);
  const [editForm, setEditForm] = useState({
    kategori: '',
    tutar: 0,
    aciklama: '',
  });

  const arac = appState.araclar.find((a) => a.id === id);

  if (!arac) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Araç Bulunamadı</h2>
        <Button onClick={() => navigate('/oto-galeri')}>Oto Galeri'ye Dön</Button>
      </div>
    );
  }

  const maliyetler = appState.aracMaliyetler.filter((m) => m.aracId === id);
  const toplamMaliyetler = maliyetler.reduce((sum, m) => sum + m.tutar, 0);
  const kar = arac.satisFiyati ? arac.satisFiyati - arac.toplamMaliyet : 0;

  const getCariAd = (cariId: string) => {
    const cari = appState.cariler.find((c) => c.id === cariId);
    return cari?.ad || '-';
  };

  const handleOpenEditModal = (maliyet: AracMaliyet) => {
    setSelectedMaliyet(maliyet);
    setEditForm({
      kategori: maliyet.kategori,
      tutar: maliyet.tutar,
      aciklama: maliyet.aciklama || '',
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedMaliyet(null);
    setEditForm({ kategori: '', tutar: 0, aciklama: '' });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMaliyet) {
      updateAracMaliyet(selectedMaliyet.id, editForm);
      handleCloseEditModal();
    }
  };

  const handleDeleteMaliyet = (maliyetId: string, kategori: string) => {
    if (window.confirm(`"${kategori}" maliyetini silmek istediğinizden emin misiniz?`)) {
      try {
        deleteAracMaliyet(maliyetId);
      } catch (error) {
        alert((error as Error).message);
      }
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Button onClick={() => navigate('/oto-galeri')} variant="secondary" className="mb-4">
          <div className="flex items-center gap-2">
            <span>← Geri Dön</span>
          </div>
        </Button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{arac.marka} {arac.model}</h1>
              <p className="text-sm text-gray-600 mt-1">{arac.plaka} • {arac.yil}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${arac.durum === 'Stokta' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
              {arac.durum}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {arac.renk && (
              <div>
                <p className="text-sm text-gray-600">Renk</p>
                <p className="text-sm font-medium">{arac.renk}</p>
              </div>
            )}
            {arac.satirCekNo && (
              <div>
                <p className="text-sm text-gray-600">Satır Çek No</p>
                <p className="text-sm font-medium">{arac.satirCekNo}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Satıcı</p>
              <p className="text-sm font-medium">{getCariAd(arac.saticiCariId)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Alış Fiyatı</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(arac.alisFiyati)}</p>
          <p className="text-xs text-gray-500 mt-1">{formatDate(arac.alisTarihi)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Ek Maliyetler</p>
          <p className="text-xl font-bold text-orange-600">{formatCurrency(toplamMaliyetler)}</p>
          <p className="text-xs text-gray-500 mt-1">{maliyetler.length} işlem</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Toplam Maliyet</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(arac.toplamMaliyet)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">{arac.durum === 'Satıldı' ? 'Kar/Zarar' : 'Satış Fiyatı'}</p>
          {arac.durum === 'Satıldı' ? (
            <p className={`text-xl font-bold ${kar >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kar >= 0 ? '+' : ''}{formatCurrency(kar)}
            </p>
          ) : (
            <p className="text-xl font-bold text-gray-400">-</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Maliyet Kayıtları ({maliyetler.length})</h2>
        </div>
        {maliyetler.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">Henüz maliyet kaydı yok</div>
        ) : (
          <div className="divide-y">
            {maliyetler.map((maliyet) => (
              <div key={maliyet.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{maliyet.kategori}</p>
                    <p className="text-sm text-gray-600 mt-1">{maliyet.aciklama || '-'}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(maliyet.tarih)} • {maliyet.odemeYontemi}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-orange-600">{formatCurrency(maliyet.tutar)}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditModal(maliyet)}
                        className="text-gray-400 hover:text-primary"
                        title="Düzenle"
                      >
                        <Icons.Edit />
                      </button>
                      <button
                        onClick={() => handleDeleteMaliyet(maliyet.id, maliyet.kategori)}
                        className="text-gray-400 hover:text-red-600"
                        title="Sil"
                      >
                        <Icons.Delete />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maliyet Düzenleme Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        title="Maliyet Düzenle"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Kategori *"
            value={editForm.kategori}
            onChange={(e) => setEditForm({ ...editForm, kategori: e.target.value })}
            required
          />
          <Input
            label="Tutar *"
            type="number"
            step="0.01"
            value={editForm.tutar}
            onChange={(e) => setEditForm({ ...editForm, tutar: Number(e.target.value) })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              value={editForm.aciklama}
              onChange={(e) => setEditForm({ ...editForm, aciklama: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Güncelle
            </Button>
            <Button type="button" variant="secondary" onClick={handleCloseEditModal} className="flex-1">
              İptal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
