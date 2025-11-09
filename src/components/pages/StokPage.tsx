import { useState } from 'react';
import type { Urun, AppState, OdemeYontemi } from '../../types';
import { useAppService } from '../../hooks/useAppService';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Icons } from '../../constants/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface StokPageProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

type ModalType = 'none' | 'urun' | 'giris' | 'cikis';

export const StokPage = ({ appState, setAppState }: StokPageProps) => {
  const { addUrun, updateUrun, deleteUrun, addStokGiris, addStokCikis } =
    useAppService({
      appState,
      setAppState,
    });

  const [modalType, setModalType] = useState<ModalType>('none');
  const [editingUrun, setEditingUrun] = useState<Urun | null>(null);
  const [selectedUrun, setSelectedUrun] = useState<Urun | null>(null);

  // Ürün Form
  const [urunForm, setUrunForm] = useState({
    ad: '',
    kategori: '',
    barkod: '',
    birim: 'Adet',
    minStok: 0,
    alisFiyati: 0,
    satisFiyati: 0,
    aciklama: '',
  });

  // Stok Giriş Form
  const [girisForm, setGirisForm] = useState({
    miktar: 0,
    birimFiyat: 0,
    tarih: new Date().toISOString().split('T')[0],
    cariId: '',
    odemeYontemi: 'Nakit' as OdemeYontemi,
    hesapId: '',
    krediKartiId: '',
    aciklama: '',
  });

  // Stok Çıkış Form
  const [cikisForm, setCikisForm] = useState({
    miktar: 0,
    birimFiyat: 0,
    tarih: new Date().toISOString().split('T')[0],
    cariId: '',
    odemeYontemi: 'Nakit' as OdemeYontemi,
    hesapId: '',
    aciklama: '',
  });

  const handleOpenUrunModal = (urun?: Urun) => {
    if (urun) {
      setEditingUrun(urun);
      setUrunForm({
        ad: urun.ad,
        kategori: urun.kategori,
        barkod: urun.barkod || '',
        birim: urun.birim,
        minStok: urun.minStok || 0,
        alisFiyati: urun.alisFiyati,
        satisFiyati: urun.satisFiyati,
        aciklama: urun.aciklama || '',
      });
    } else {
      setEditingUrun(null);
      setUrunForm({
        ad: '',
        kategori: '',
        barkod: '',
        birim: 'Adet',
        minStok: 0,
        alisFiyati: 0,
        satisFiyati: 0,
        aciklama: '',
      });
    }
    setModalType('urun');
  };

  const handleOpenGirisModal = (urun: Urun) => {
    setSelectedUrun(urun);
    setGirisForm({
      miktar: 0,
      birimFiyat: urun.alisFiyati,
      tarih: new Date().toISOString().split('T')[0],
      cariId: '',
      odemeYontemi: 'Nakit',
      hesapId: '',
      krediKartiId: '',
      aciklama: '',
    });
    setModalType('giris');
  };

  const handleOpenCikisModal = (urun: Urun) => {
    setSelectedUrun(urun);
    setCikisForm({
      miktar: 0,
      birimFiyat: urun.satisFiyati,
      tarih: new Date().toISOString().split('T')[0],
      cariId: '',
      odemeYontemi: 'Nakit',
      hesapId: '',
      aciklama: '',
    });
    setModalType('cikis');
  };

  const handleCloseModal = () => {
    setModalType('none');
    setEditingUrun(null);
    setSelectedUrun(null);
  };

  const handleUrunSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUrun) {
      updateUrun(editingUrun.id, urunForm);
    } else {
      addUrun(urunForm);
    }
    handleCloseModal();
  };

  const handleGirisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUrun) {
      try {
        addStokGiris({
          urunId: selectedUrun.id,
          ...girisForm,
        });
        handleCloseModal();
      } catch (error) {
        alert((error as Error).message);
      }
    }
  };

  const handleCikisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUrun) {
      try {
        addStokCikis({
          urunId: selectedUrun.id,
          ...cikisForm,
        });
        handleCloseModal();
      } catch (error) {
        alert((error as Error).message);
      }
    }
  };

  const handleDeleteUrun = (id: string) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      deleteUrun(id);
    }
  };

  const getStokDurumClass = (urun: Urun) => {
    if (urun.minStok && urun.stokMiktari <= urun.minStok) {
      return 'text-red-600 font-semibold';
    }
    if (urun.stokMiktari === 0) {
      return 'text-gray-400';
    }
    return 'text-green-600 font-semibold';
  };

  const tedarikciList = appState.cariler.filter((c) => c.tip === 'Tedarikçi');
  const musteriList = appState.cariler.filter((c) => c.tip === 'Müşteri');
  const hesapList = appState.hesaplar;
  const krediKartiList = appState.krediKartlari;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stok Yönetimi</h1>
        <Button onClick={() => handleOpenUrunModal()}>
          <div className="flex items-center gap-2">
            <Icons.Add />
            <span>Yeni Ürün</span>
          </div>
        </Button>
      </div>

      {/* Desktop Tablo Görünümü */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ürün
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kategori
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stok
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alış Fiyatı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Satış Fiyatı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kar Marjı
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appState.urunler.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Henüz ürün kaydı yok
                </td>
              </tr>
            ) : (
              appState.urunler.map((urun) => {
                const karMarji =
                  ((urun.satisFiyati - urun.alisFiyati) / urun.alisFiyati) *
                  100;
                return (
                  <tr key={urun.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{urun.ad}</div>
                      {urun.barkod && (
                        <div className="text-sm text-gray-500">
                          {urun.barkod}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {urun.kategori}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={getStokDurumClass(urun)}>
                        {urun.stokMiktari} {urun.birim}
                      </div>
                      {urun.minStok && urun.stokMiktari <= urun.minStok && (
                        <div className="text-xs text-red-500">
                          Min: {urun.minStok}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(urun.alisFiyati)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(urun.satisFiyati)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={
                          karMarji >= 0
                            ? 'text-green-600 font-medium'
                            : 'text-red-600 font-medium'
                        }
                      >
                        %{karMarji.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleOpenGirisModal(urun)}
                        className="text-green-600 hover:text-green-900"
                        title="Stok Girişi"
                      >
                        <Icons.ArrowDown />
                      </button>
                      <button
                        onClick={() => handleOpenCikisModal(urun)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Stok Çıkışı"
                        disabled={urun.stokMiktari === 0}
                      >
                        <Icons.ArrowUp />
                      </button>
                      <button
                        onClick={() => handleOpenUrunModal(urun)}
                        className="text-primary hover:text-primary-dark"
                        title="Düzenle"
                      >
                        <Icons.Edit />
                      </button>
                      <button
                        onClick={() => handleDeleteUrun(urun.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Sil"
                      >
                        <Icons.Delete />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobil Kart Görünümü */}
      <div className="md:hidden space-y-4">
        {appState.urunler.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Henüz ürün kaydı yok
          </div>
        ) : (
          appState.urunler.map((urun) => {
            const karMarji =
              ((urun.satisFiyati - urun.alisFiyati) / urun.alisFiyati) * 100;
            return (
              <div key={urun.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{urun.ad}</h3>
                    <p className="text-sm text-gray-500">{urun.kategori}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenUrunModal(urun)}
                      className="text-primary hover:text-primary-dark"
                    >
                      <Icons.Edit />
                    </button>
                    <button
                      onClick={() => handleDeleteUrun(urun.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Icons.Delete />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stok:</span>
                    <span className={getStokDurumClass(urun)}>
                      {urun.stokMiktari} {urun.birim}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alış Fiyatı:</span>
                    <span className="font-medium">
                      {formatCurrency(urun.alisFiyati)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Satış Fiyatı:</span>
                    <span className="font-medium">
                      {formatCurrency(urun.satisFiyati)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kar Marjı:</span>
                    <span
                      className={
                        karMarji >= 0
                          ? 'text-green-600 font-medium'
                          : 'text-red-600 font-medium'
                      }
                    >
                      %{karMarji.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    onClick={() => handleOpenGirisModal(urun)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Giriş
                  </Button>
                  <Button
                    onClick={() => handleOpenCikisModal(urun)}
                    className="flex-1"
                    disabled={urun.stokMiktari === 0}
                  >
                    Çıkış
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ürün Modal */}
      <Modal
        isOpen={modalType === 'urun'}
        onClose={handleCloseModal}
        title={editingUrun ? 'Ürün Düzenle' : 'Yeni Ürün'}
      >
        <form onSubmit={handleUrunSubmit} className="space-y-4">
          <Input
            label="Ürün Adı *"
            value={urunForm.ad}
            onChange={(e) => setUrunForm({ ...urunForm, ad: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Kategori *"
              value={urunForm.kategori}
              onChange={(e) =>
                setUrunForm({ ...urunForm, kategori: e.target.value })
              }
              options={[
                { value: '', label: 'Seçiniz...' },
                ...appState.ayarlar.urunKategorileri.map((k) => ({
                  value: k,
                  label: k,
                })),
              ]}
              required
            />

            <Input
              label="Barkod"
              value={urunForm.barkod}
              onChange={(e) =>
                setUrunForm({ ...urunForm, barkod: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Birim *"
              value={urunForm.birim}
              onChange={(e) =>
                setUrunForm({ ...urunForm, birim: e.target.value })
              }
              placeholder="Adet, Kg, Lt, vb."
              required
            />

            <Input
              label="Minimum Stok"
              type="number"
              step="0.01"
              value={urunForm.minStok}
              onChange={(e) =>
                setUrunForm({
                  ...urunForm,
                  minStok: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Alış Fiyatı *"
              type="number"
              step="0.01"
              value={urunForm.alisFiyati}
              onChange={(e) =>
                setUrunForm({
                  ...urunForm,
                  alisFiyati: parseFloat(e.target.value) || 0,
                })
              }
              required
            />

            <Input
              label="Satış Fiyatı *"
              type="number"
              step="0.01"
              value={urunForm.satisFiyati}
              onChange={(e) =>
                setUrunForm({
                  ...urunForm,
                  satisFiyati: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              value={urunForm.aciklama}
              onChange={(e) =>
                setUrunForm({ ...urunForm, aciklama: e.target.value })
              }
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingUrun ? 'Güncelle' : 'Ekle'}
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

      {/* Stok Giriş Modal */}
      <Modal
        isOpen={modalType === 'giris'}
        onClose={handleCloseModal}
        title={`Stok Girişi - ${selectedUrun?.ad}`}
      >
        <form onSubmit={handleGirisSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Miktar *"
              type="number"
              step="0.01"
              value={girisForm.miktar}
              onChange={(e) =>
                setGirisForm({
                  ...girisForm,
                  miktar: parseFloat(e.target.value) || 0,
                })
              }
              required
            />

            <Input
              label="Birim Fiyat *"
              type="number"
              step="0.01"
              value={girisForm.birimFiyat}
              onChange={(e) =>
                setGirisForm({
                  ...girisForm,
                  birimFiyat: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <Input
            label="Tarih *"
            type="date"
            value={girisForm.tarih}
            onChange={(e) => setGirisForm({ ...girisForm, tarih: e.target.value })}
            required
          />

          <Select
            label="Tedarikçi"
            value={girisForm.cariId}
            onChange={(e) =>
              setGirisForm({ ...girisForm, cariId: e.target.value })
            }
            options={[
              { value: '', label: 'Seçiniz...' },
              ...tedarikciList.map((t) => ({ value: t.id, label: t.ad })),
            ]}
          />

          <Select
            label="Ödeme Yöntemi *"
            value={girisForm.odemeYontemi}
            onChange={(e) =>
              setGirisForm({
                ...girisForm,
                odemeYontemi: e.target.value as OdemeYontemi,
                hesapId: '',
                krediKartiId: '',
              })
            }
            options={[
              { value: 'Nakit', label: 'Nakit' },
              { value: 'Banka', label: 'Banka' },
              { value: 'Kredi Kartı', label: 'Kredi Kartı' },
            ]}
            required
          />

          {(girisForm.odemeYontemi === 'Nakit' ||
            girisForm.odemeYontemi === 'Banka') && (
            <Select
              label="Hesap *"
              value={girisForm.hesapId}
              onChange={(e) =>
                setGirisForm({ ...girisForm, hesapId: e.target.value })
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
          )}

          {girisForm.odemeYontemi === 'Kredi Kartı' && (
            <Select
              label="Kredi Kartı *"
              value={girisForm.krediKartiId}
              onChange={(e) =>
                setGirisForm({
                  ...girisForm,
                  krediKartiId: e.target.value,
                })
              }
              options={[
                { value: '', label: 'Seçiniz...' },
                ...krediKartiList.map((k) => ({
                  value: k.id,
                  label: `${k.ad} (Limit: ${formatCurrency(k.limit - k.bakiye)})`,
                })),
              ]}
              required
            />
          )}

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Toplam Tutar:</span>
                <span>
                  {formatCurrency(girisForm.miktar * girisForm.birimFiyat)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              value={girisForm.aciklama}
              onChange={(e) =>
                setGirisForm({ ...girisForm, aciklama: e.target.value })
              }
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

      {/* Stok Çıkış Modal */}
      <Modal
        isOpen={modalType === 'cikis'}
        onClose={handleCloseModal}
        title={`Stok Çıkışı - ${selectedUrun?.ad}`}
      >
        <form onSubmit={handleCikisSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Miktar *"
              type="number"
              step="0.01"
              value={cikisForm.miktar}
              onChange={(e) =>
                setCikisForm({
                  ...cikisForm,
                  miktar: parseFloat(e.target.value) || 0,
                })
              }
              required
            />

            <Input
              label="Birim Fiyat *"
              type="number"
              step="0.01"
              value={cikisForm.birimFiyat}
              onChange={(e) =>
                setCikisForm({
                  ...cikisForm,
                  birimFiyat: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          {selectedUrun && (
            <div className="p-2 bg-blue-50 rounded text-sm text-blue-700">
              Mevcut Stok: {selectedUrun.stokMiktari} {selectedUrun.birim}
            </div>
          )}

          <Input
            label="Tarih *"
            type="date"
            value={cikisForm.tarih}
            onChange={(e) => setCikisForm({ ...cikisForm, tarih: e.target.value })}
            required
          />

          <Select
            label="Müşteri"
            value={cikisForm.cariId}
            onChange={(e) =>
              setCikisForm({ ...cikisForm, cariId: e.target.value })
            }
            options={[
              { value: '', label: 'Seçiniz...' },
              ...musteriList.map((m) => ({ value: m.id, label: m.ad })),
            ]}
          />

          <Select
            label="Ödeme Yöntemi *"
            value={cikisForm.odemeYontemi}
            onChange={(e) =>
              setCikisForm({
                ...cikisForm,
                odemeYontemi: e.target.value as OdemeYontemi,
                hesapId: '',
              })
            }
            options={[
              { value: 'Nakit', label: 'Nakit' },
              { value: 'Banka', label: 'Banka' },
            ]}
            required
          />

          {(cikisForm.odemeYontemi === 'Nakit' ||
            cikisForm.odemeYontemi === 'Banka') && (
            <Select
              label="Hesap *"
              value={cikisForm.hesapId}
              onChange={(e) =>
                setCikisForm({ ...cikisForm, hesapId: e.target.value })
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
          )}

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Toplam Tutar:</span>
                <span>
                  {formatCurrency(cikisForm.miktar * cikisForm.birimFiyat)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              value={cikisForm.aciklama}
              onChange={(e) =>
                setCikisForm({ ...cikisForm, aciklama: e.target.value })
              }
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
    </div>
  );
};
