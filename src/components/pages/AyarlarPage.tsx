import { useState } from 'react';
import type { AppState } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Icons } from '../../constants/icons';

interface AyarlarPageProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

type ModalType = 'none' | 'gider' | 'urun';

export const AyarlarPage = ({ appState, setAppState }: AyarlarPageProps) => {
  const [modalType, setModalType] = useState<ModalType>('none');
  const [newKategori, setNewKategori] = useState('');

  const handleAddGiderKategori = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKategori.trim()) return;

    if (appState.ayarlar.giderKategorileri.includes(newKategori.trim())) {
      alert('Bu kategori zaten mevcut');
      return;
    }

    setAppState((prev) => ({
      ...prev,
      ayarlar: {
        ...prev.ayarlar,
        giderKategorileri: [...prev.ayarlar.giderKategorileri, newKategori.trim()],
      },
    }));

    setNewKategori('');
    setModalType('none');
  };

  const handleAddUrunKategori = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKategori.trim()) return;

    if (appState.ayarlar.urunKategorileri.includes(newKategori.trim())) {
      alert('Bu kategori zaten mevcut');
      return;
    }

    setAppState((prev) => ({
      ...prev,
      ayarlar: {
        ...prev.ayarlar,
        urunKategorileri: [...prev.ayarlar.urunKategorileri, newKategori.trim()],
      },
    }));

    setNewKategori('');
    setModalType('none');
  };

  const handleDeleteGiderKategori = (kategori: string) => {
    // Kullanımda olan kategorileri silme
    const kullaniliyor = appState.giderler.some((g) => g.kategori === kategori);
    if (kullaniliyor) {
      alert('Bu kategori kullanımda olduğu için silinemez');
      return;
    }

    if (window.confirm(`"${kategori}" kategorisini silmek istediğinizden emin misiniz?`)) {
      setAppState((prev) => ({
        ...prev,
        ayarlar: {
          ...prev.ayarlar,
          giderKategorileri: prev.ayarlar.giderKategorileri.filter((k) => k !== kategori),
        },
      }));
    }
  };

  const handleDeleteUrunKategori = (kategori: string) => {
    // Kullanımda olan kategorileri silme
    const kullaniliyor = appState.urunler.some((u) => u.kategori === kategori);
    if (kullaniliyor) {
      alert('Bu kategori kullanımda olduğu için silinemez');
      return;
    }

    if (window.confirm(`"${kategori}" kategorisini silmek istediğinizden emin misiniz?`)) {
      setAppState((prev) => ({
        ...prev,
        ayarlar: {
          ...prev.ayarlar,
          urunKategorileri: prev.ayarlar.urunKategorileri.filter((k) => k !== kategori),
        },
      }));
    }
  };

  const handleCloseModal = () => {
    setModalType('none');
    setNewKategori('');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ayarlar</h1>

      <div className="space-y-6">
        {/* Gider Kategorileri */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Gider Kategorileri</h2>
            <Button onClick={() => setModalType('gider')} variant="secondary">
              <div className="flex items-center gap-2">
                <Icons.Add />
                <span>Yeni Kategori</span>
              </div>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {appState.ayarlar.giderKategorileri.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center py-4">
                Henüz gider kategorisi yok
              </p>
            ) : (
              appState.ayarlar.giderKategorileri.map((kategori) => (
                <div
                  key={kategori}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <span className="text-gray-900">{kategori}</span>
                  <button
                    onClick={() => handleDeleteGiderKategori(kategori)}
                    className="text-red-600 hover:text-red-900"
                    title="Sil"
                  >
                    <Icons.Delete />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ürün Kategorileri */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Ürün Kategorileri</h2>
            <Button onClick={() => setModalType('urun')} variant="secondary">
              <div className="flex items-center gap-2">
                <Icons.Add />
                <span>Yeni Kategori</span>
              </div>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {appState.ayarlar.urunKategorileri.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center py-4">
                Henüz ürün kategorisi yok
              </p>
            ) : (
              appState.ayarlar.urunKategorileri.map((kategori) => (
                <div
                  key={kategori}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <span className="text-gray-900">{kategori}</span>
                  <button
                    onClick={() => handleDeleteUrunKategori(kategori)}
                    className="text-red-600 hover:text-red-900"
                    title="Sil"
                  >
                    <Icons.Delete />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Uygulama Bilgileri */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Uygulama Bilgileri</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Versiyon:</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Mod:</span>
              <span className="capitalize">{appState.mode}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Toplam Cari:</span>
              <span>{appState.cariler.length}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Toplam Hesap:</span>
              <span>{appState.hesaplar.length}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Toplam İşlem Kaydı:</span>
              <span>{appState.islemKayitlari.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gider Kategori Modal */}
      <Modal
        isOpen={modalType === 'gider'}
        onClose={handleCloseModal}
        title="Yeni Gider Kategorisi"
      >
        <form onSubmit={handleAddGiderKategori} className="space-y-4">
          <Input
            label="Kategori Adı *"
            value={newKategori}
            onChange={(e) => setNewKategori(e.target.value)}
            placeholder="Örn: Kira, Elektrik, Maaş"
            required
          />

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

      {/* Ürün Kategori Modal */}
      <Modal
        isOpen={modalType === 'urun'}
        onClose={handleCloseModal}
        title="Yeni Ürün Kategorisi"
      >
        <form onSubmit={handleAddUrunKategori} className="space-y-4">
          <Input
            label="Kategori Adı *"
            value={newKategori}
            onChange={(e) => setNewKategori(e.target.value)}
            placeholder="Örn: Elektronik, Gıda, Tekstil"
            required
          />

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
    </div>
  );
};
