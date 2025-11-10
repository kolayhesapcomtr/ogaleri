import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Arac, AppState, OdemeYontemi } from '../../types';
import { useAppService } from '../../hooks/useAppService';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Icons } from '../../constants/icons';
import { formatCurrency } from '../../utils/formatters';

interface OtoGaleriPageProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

type ModalType = 'none' | 'pesin' | 'taksitli' | 'maliyet' | 'satis';

export const OtoGaleriPage = ({ appState, setAppState }: OtoGaleriPageProps) => {
  const navigate = useNavigate();
  const { addAracPesin, addAracTaksitli, addAracMaliyet } = useAppService({
    appState,
    setAppState,
  });

  const [modalType, setModalType] = useState<ModalType>('none');
  const [selectedArac, setSelectedArac] = useState<Arac | null>(null);

  // Peşin Alış Form
  const [pesinForm, setPesinForm] = useState({
    plaka: '',
    marka: '',
    model: '',
    yil: new Date().getFullYear(),
    renk: '',
    satirCekNo: '',
    alisAciklama: '',
    alisFiyati: 0,
    alisTarihi: new Date().toISOString().split('T')[0],
    saticiCariId: '',
    hesapId: '',
  });

  // Taksitli Alış Form
  const [taksitliForm, setTaksitliForm] = useState({
    plaka: '',
    marka: '',
    model: '',
    yil: new Date().getFullYear(),
    renk: '',
    satirCekNo: '',
    alisAciklama: '',
    alisFiyati: 0,
    alisTarihi: new Date().toISOString().split('T')[0],
    saticiCariId: '',
    pesinat: 0,
    pesinatHesapId: '',
    taksitSayisi: 12,
    baslangicTarihi: new Date().toISOString().split('T')[0],
  });

  // Maliyet Ekleme Form
  const [maliyetForm, setMaliyetForm] = useState({
    kategori: '',
    tutar: 0,
    odemeYontemi: 'Nakit' as OdemeYontemi,
    hesapId: '',
    krediKartiId: '',
    aciklama: '',
    tarih: new Date().toISOString().split('T')[0],
  });

  const handleOpenModal = (type: ModalType, arac?: Arac) => {
    setModalType(type);
    if (arac) {
      setSelectedArac(arac);
    }
  };

  const handleCloseModal = () => {
    setModalType('none');
    setSelectedArac(null);
    // Reset forms
    setPesinForm({
      plaka: '',
      marka: '',
      model: '',
      yil: new Date().getFullYear(),
      renk: '',
      satirCekNo: '',
      alisAciklama: '',
      alisFiyati: 0,
      alisTarihi: new Date().toISOString().split('T')[0],
      saticiCariId: '',
      hesapId: '',
    });
    setTaksitliForm({
      plaka: '',
      marka: '',
      model: '',
      yil: new Date().getFullYear(),
      renk: '',
      satirCekNo: '',
      alisAciklama: '',
      alisFiyati: 0,
      alisTarihi: new Date().toISOString().split('T')[0],
      saticiCariId: '',
      pesinat: 0,
      pesinatHesapId: '',
      taksitSayisi: 12,
      baslangicTarihi: new Date().toISOString().split('T')[0],
    });
    setMaliyetForm({
      kategori: '',
      tutar: 0,
      odemeYontemi: 'Nakit',
      hesapId: '',
      krediKartiId: '',
      aciklama: '',
      tarih: new Date().toISOString().split('T')[0],
    });
  };

  const handlePesinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAracPesin(pesinForm);
    handleCloseModal();
  };

  const handleTaksitliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAracTaksitli(taksitliForm);
    handleCloseModal();
  };

  const handleMaliyetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedArac) {
      addAracMaliyet({
        aracId: selectedArac.id,
        ...maliyetForm,
      });
      handleCloseModal();
    }
  };

  const getKar = (arac: Arac) => {
    if (arac.durum === 'Stokta' || !arac.satisFiyati) return 0;
    return arac.satisFiyati - arac.toplamMaliyet;
  };

  const tedarikciList = appState.cariler.filter((c) => c.tip === 'Tedarikçi');
  const hesapList = appState.hesaplar;
  const krediKartiList = appState.krediKartlari;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Oto Galeri</h1>
        <div className="flex gap-2">
          <Button onClick={() => handleOpenModal('pesin')}>
            <div className="flex items-center gap-2">
              <Icons.Add />
              <span className="hidden sm:inline">Peşin Alış</span>
            </div>
          </Button>
          <Button onClick={() => handleOpenModal('taksitli')} variant="secondary">
            <div className="flex items-center gap-2">
              <Icons.Add />
              <span className="hidden sm:inline">Taksitli Alış</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Desktop Tablo Görünümü */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Araç
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plaka
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alış Fiyatı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Toplam Maliyet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Satış Fiyatı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kar/Zarar
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
            {appState.araclar.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Henüz araç kaydı yok
                </td>
              </tr>
            ) : (
              appState.araclar.map((arac) => {
                const kar = getKar(arac);
                return (
                  <tr key={arac.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/oto-galeri/${arac.id}`)}
                        className="font-medium text-primary hover:text-primary-dark text-left"
                      >
                        {arac.marka} {arac.model}
                      </button>
                      <div className="text-sm text-gray-500">{arac.yil}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {arac.plaka}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(arac.alisFiyati)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                      {formatCurrency(arac.toplamMaliyet)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {arac.satisFiyati
                        ? formatCurrency(arac.satisFiyati)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {arac.durum === 'Satıldı' ? (
                        <span
                          className={
                            kar >= 0
                              ? 'text-green-600 font-semibold'
                              : 'text-red-600 font-semibold'
                          }
                        >
                          {kar >= 0 ? '+' : ''}
                          {formatCurrency(kar)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          arac.durum === 'Stokta'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {arac.durum}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {arac.durum === 'Stokta' && (
                        <button
                          onClick={() => handleOpenModal('maliyet', arac)}
                          className="text-primary hover:text-primary-dark"
                          title="Maliyet Ekle"
                        >
                          <Icons.Add />
                        </button>
                      )}
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
        {appState.araclar.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Henüz araç kaydı yok
          </div>
        ) : (
          appState.araclar.map((arac) => {
            const kar = getKar(arac);
            return (
              <div key={arac.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <button
                      onClick={() => navigate(`/oto-galeri/${arac.id}`)}
                      className="font-semibold text-primary hover:text-primary-dark text-left"
                    >
                      {arac.marka} {arac.model}
                    </button>
                    <p className="text-sm text-gray-500">
                      {arac.yil} - {arac.plaka}
                    </p>
                  </div>
                  <span
                    className={`px-2 text-xs leading-5 font-semibold rounded-full ${
                      arac.durum === 'Stokta'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {arac.durum}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alış Fiyatı:</span>
                    <span className="font-medium">
                      {formatCurrency(arac.alisFiyati)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam Maliyet:</span>
                    <span className="font-medium text-orange-600">
                      {formatCurrency(arac.toplamMaliyet)}
                    </span>
                  </div>
                  {arac.satisFiyati && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Satış Fiyatı:</span>
                        <span className="font-medium">
                          {formatCurrency(arac.satisFiyati)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-600">Kar/Zarar:</span>
                        <span
                          className={
                            kar >= 0
                              ? 'text-green-600 font-semibold'
                              : 'text-red-600 font-semibold'
                          }
                        >
                          {kar >= 0 ? '+' : ''}
                          {formatCurrency(kar)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {arac.durum === 'Stokta' && (
                  <div className="mt-4 pt-3 border-t">
                    <Button
                      onClick={() => handleOpenModal('maliyet', arac)}
                      className="w-full"
                      variant="secondary"
                    >
                      Maliyet Ekle
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Peşin Alış Modal */}
      <Modal
        isOpen={modalType === 'pesin'}
        onClose={handleCloseModal}
        title="Peşin Araç Alışı"
      >
        <form onSubmit={handlePesinSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Plaka *"
              value={pesinForm.plaka}
              onChange={(e) =>
                setPesinForm({ ...pesinForm, plaka: e.target.value })
              }
              required
            />
            <Input
              label="Marka *"
              value={pesinForm.marka}
              onChange={(e) =>
                setPesinForm({ ...pesinForm, marka: e.target.value })
              }
              required
            />
            <Input
              label="Model *"
              value={pesinForm.model}
              onChange={(e) =>
                setPesinForm({ ...pesinForm, model: e.target.value })
              }
              required
            />
            <Input
              label="Yıl *"
              type="number"
              value={pesinForm.yil}
              onChange={(e) =>
                setPesinForm({ ...pesinForm, yil: parseInt(e.target.value) })
              }
              required
            />
            <Input
              label="Renk"
              value={pesinForm.renk}
              onChange={(e) =>
                setPesinForm({ ...pesinForm, renk: e.target.value })
              }
            />
            <Input
              label="Satır Çek No"
              value={pesinForm.satirCekNo}
              onChange={(e) =>
                setPesinForm({ ...pesinForm, satirCekNo: e.target.value })
              }
            />
          </div>

          <Input
            label="Alış Fiyatı *"
            type="number"
            step="0.01"
            value={pesinForm.alisFiyati}
            onChange={(e) =>
              setPesinForm({
                ...pesinForm,
                alisFiyati: parseFloat(e.target.value),
              })
            }
            required
          />

          <Input
            label="Alış Tarihi *"
            type="date"
            value={pesinForm.alisTarihi}
            onChange={(e) =>
              setPesinForm({ ...pesinForm, alisTarihi: e.target.value })
            }
            required
          />

          <Select
            label="Satıcı (Tedarikçi) *"
            value={pesinForm.saticiCariId}
            onChange={(e) =>
              setPesinForm({ ...pesinForm, saticiCariId: e.target.value })
            }
            options={[
              { value: '', label: 'Seçiniz...' },
              ...tedarikciList.map((t) => ({ value: t.id, label: t.ad })),
            ]}
            required
          />

          <Select
            label="Ödeme Hesabı *"
            value={pesinForm.hesapId}
            onChange={(e) =>
              setPesinForm({ ...pesinForm, hesapId: e.target.value })
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alış Açıklaması
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              value={pesinForm.alisAciklama}
              onChange={(e) =>
                setPesinForm({ ...pesinForm, alisAciklama: e.target.value })
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

      {/* Taksitli Alış Modal */}
      <Modal
        isOpen={modalType === 'taksitli'}
        onClose={handleCloseModal}
        title="Taksitli Araç Alışı"
      >
        <form onSubmit={handleTaksitliSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Plaka *"
              value={taksitliForm.plaka}
              onChange={(e) =>
                setTaksitliForm({ ...taksitliForm, plaka: e.target.value })
              }
              required
            />
            <Input
              label="Marka *"
              value={taksitliForm.marka}
              onChange={(e) =>
                setTaksitliForm({ ...taksitliForm, marka: e.target.value })
              }
              required
            />
            <Input
              label="Model *"
              value={taksitliForm.model}
              onChange={(e) =>
                setTaksitliForm({ ...taksitliForm, model: e.target.value })
              }
              required
            />
            <Input
              label="Yıl *"
              type="number"
              value={taksitliForm.yil}
              onChange={(e) =>
                setTaksitliForm({
                  ...taksitliForm,
                  yil: parseInt(e.target.value),
                })
              }
              required
            />
            <Input
              label="Renk"
              value={taksitliForm.renk}
              onChange={(e) =>
                setTaksitliForm({ ...taksitliForm, renk: e.target.value })
              }
            />
            <Input
              label="Satır Çek No"
              value={taksitliForm.satirCekNo}
              onChange={(e) =>
                setTaksitliForm({
                  ...taksitliForm,
                  satirCekNo: e.target.value,
                })
              }
            />
          </div>

          <Input
            label="Alış Fiyatı *"
            type="number"
            step="0.01"
            value={taksitliForm.alisFiyati}
            onChange={(e) =>
              setTaksitliForm({
                ...taksitliForm,
                alisFiyati: parseFloat(e.target.value),
              })
            }
            required
          />

          <Input
            label="Alış Tarihi *"
            type="date"
            value={taksitliForm.alisTarihi}
            onChange={(e) =>
              setTaksitliForm({ ...taksitliForm, alisTarihi: e.target.value })
            }
            required
          />

          <Select
            label="Satıcı (Tedarikçi) *"
            value={taksitliForm.saticiCariId}
            onChange={(e) =>
              setTaksitliForm({
                ...taksitliForm,
                saticiCariId: e.target.value,
              })
            }
            options={[
              { value: '', label: 'Seçiniz...' },
              ...tedarikciList.map((t) => ({ value: t.id, label: t.ad })),
            ]}
            required
          />

          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium text-gray-900 mb-3">
              Taksit Bilgileri
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Peşinat Tutarı"
                type="number"
                step="0.01"
                value={taksitliForm.pesinat}
                onChange={(e) =>
                  setTaksitliForm({
                    ...taksitliForm,
                    pesinat: parseFloat(e.target.value) || 0,
                  })
                }
              />

              {taksitliForm.pesinat > 0 && (
                <Select
                  label="Peşinat Hesabı"
                  value={taksitliForm.pesinatHesapId}
                  onChange={(e) =>
                    setTaksitliForm({
                      ...taksitliForm,
                      pesinatHesapId: e.target.value,
                    })
                  }
                  options={[
                    { value: '', label: 'Seçiniz...' },
                    ...hesapList.map((h) => ({
                      value: h.id,
                      label: `${h.ad} (${formatCurrency(h.bakiye)})`,
                    })),
                  ]}
                />
              )}

              <Input
                label="Taksit Sayısı *"
                type="number"
                value={taksitliForm.taksitSayisi}
                onChange={(e) =>
                  setTaksitliForm({
                    ...taksitliForm,
                    taksitSayisi: parseInt(e.target.value),
                  })
                }
                required
              />

              <Input
                label="İlk Taksit Tarihi *"
                type="date"
                value={taksitliForm.baslangicTarihi}
                onChange={(e) =>
                  setTaksitliForm({
                    ...taksitliForm,
                    baslangicTarihi: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between mb-1">
                  <span>Toplam Fiyat:</span>
                  <span className="font-medium">
                    {formatCurrency(taksitliForm.alisFiyati)}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Peşinat:</span>
                  <span className="font-medium">
                    {formatCurrency(taksitliForm.pesinat)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t">
                  <span>Kalan (Taksitli):</span>
                  <span>
                    {formatCurrency(
                      taksitliForm.alisFiyati - taksitliForm.pesinat
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-primary mt-2">
                  <span>Aylık Taksit:</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      (taksitliForm.alisFiyati - taksitliForm.pesinat) /
                        taksitliForm.taksitSayisi
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alış Açıklaması
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              value={taksitliForm.alisAciklama}
              onChange={(e) =>
                setTaksitliForm({
                  ...taksitliForm,
                  alisAciklama: e.target.value,
                })
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

      {/* Maliyet Ekleme Modal */}
      <Modal
        isOpen={modalType === 'maliyet'}
        onClose={handleCloseModal}
        title={`Maliyet Ekle - ${selectedArac?.plaka}`}
      >
        <form onSubmit={handleMaliyetSubmit} className="space-y-4">
          <Select
            label="Kategori *"
            value={maliyetForm.kategori}
            onChange={(e) =>
              setMaliyetForm({ ...maliyetForm, kategori: e.target.value })
            }
            options={[
              { value: '', label: 'Seçiniz...' },
              ...appState.ayarlar.giderKategorileri.map((k) => ({
                value: k,
                label: k,
              })),
            ]}
            required
          />

          <Input
            label="Tutar *"
            type="number"
            step="0.01"
            value={maliyetForm.tutar}
            onChange={(e) =>
              setMaliyetForm({
                ...maliyetForm,
                tutar: parseFloat(e.target.value),
              })
            }
            required
          />

          <Input
            label="Tarih *"
            type="date"
            value={maliyetForm.tarih}
            onChange={(e) =>
              setMaliyetForm({ ...maliyetForm, tarih: e.target.value })
            }
            required
          />

          <Select
            label="Ödeme Yöntemi *"
            value={maliyetForm.odemeYontemi}
            onChange={(e) =>
              setMaliyetForm({
                ...maliyetForm,
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

          {(maliyetForm.odemeYontemi === 'Nakit' ||
            maliyetForm.odemeYontemi === 'Banka') && (
            <Select
              label="Hesap *"
              value={maliyetForm.hesapId}
              onChange={(e) =>
                setMaliyetForm({ ...maliyetForm, hesapId: e.target.value })
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

          {maliyetForm.odemeYontemi === 'Kredi Kartı' && (
            <Select
              label="Kredi Kartı *"
              value={maliyetForm.krediKartiId}
              onChange={(e) =>
                setMaliyetForm({
                  ...maliyetForm,
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              value={maliyetForm.aciklama}
              onChange={(e) =>
                setMaliyetForm({ ...maliyetForm, aciklama: e.target.value })
              }
            />
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
    </div>
  );
};
