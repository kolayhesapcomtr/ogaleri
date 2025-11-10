import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Arac, AppState, ImmediateOdemeYontemi } from '../../types';
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

type ModalType = 'none' | 'pesin' | 'taksitli' | 'maliyet' | 'satis' | 'satisTaksitli';

export const OtoGaleriPage = ({ appState, setAppState }: OtoGaleriPageProps) => {
  const navigate = useNavigate();
  const { addAracPesin, addAracTaksitli, addAracMaliyet, sellArac, sellAracTaksitli } = useAppService({
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
    odemeYontemi: 'Nakit' as ImmediateOdemeYontemi,
    hesapId: '',
    krediKartiId: '',
    aciklama: '',
    tarih: new Date().toISOString().split('T')[0],
  });

  // Satış Form
  const [satisForm, setSatisForm] = useState({
    satisFiyati: 0,
    satisTarihi: new Date().toISOString().split('T')[0],
    musteriCariId: '',
    odemeYontemi: 'Nakit' as ImmediateOdemeYontemi,
    hesapId: '',
    krediKartiId: '',
    aciklama: '',
  });

  // Taksitli Satış Form
  const [satisTaksitliForm, setSatisTaksitliForm] = useState({
    satisFiyati: 0,
    satisTarihi: new Date().toISOString().split('T')[0],
    musteriCariId: '',
    taksitSayisi: 12,
    aciklama: '',
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

  const handleSatisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedArac) {
      if (!satisForm.musteriCariId || satisForm.satisFiyati <= 0) {
        alert('Lütfen tüm zorunlu alanları doldurun');
        return;
      }

      sellArac({
        aracId: selectedArac.id,
        ...satisForm,
      });
      handleCloseModal();
    }
  };

  const handleSatisTaksitliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedArac) {
      if (!satisTaksitliForm.musteriCariId || satisTaksitliForm.satisFiyati <= 0 || satisTaksitliForm.taksitSayisi <= 0) {
        alert('Lütfen tüm zorunlu alanları doldurun');
        return;
      }

      sellAracTaksitli({
        aracId: selectedArac.id,
        ...satisTaksitliForm,
      });
      handleCloseModal();
    }
  };

  const getKar = (arac: Arac) => {
    if (arac.durum === 'Stokta' || !arac.satisFiyati) return 0;
    return arac.satisFiyati - arac.toplamMaliyet;
  };

  // Artık tüm cariler hem müşteri hem tedarikçi olabilir - tip filtresi kaldırıldı
  const cariList = appState.cariler;
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
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleOpenModal('maliyet', arac)}
                            className="text-primary hover:text-primary-dark"
                            title="Maliyet Ekle"
                          >
                            <Icons.Add />
                          </button>
                          <button
                            onClick={() => handleOpenModal('satis', arac)}
                            className="text-green-600 hover:text-green-700"
                            title="Peşin Satış"
                          >
                            💰
                          </button>
                          <button
                            onClick={() => handleOpenModal('satisTaksitli', arac)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Taksitli Satış"
                          >
                            📅
                          </button>
                        </div>
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
                  <div className="mt-4 pt-3 border-t space-y-2">
                    <Button
                      onClick={() => handleOpenModal('maliyet', arac)}
                      className="w-full"
                      variant="secondary"
                    >
                      Maliyet Ekle
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleOpenModal('satis', arac)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        💰 Peşin Satış
                      </Button>
                      <Button
                        onClick={() => handleOpenModal('satisTaksitli', arac)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        📅 Taksitli
                      </Button>
                    </div>
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
              ...cariList.map((c) => ({
                value: c.id,
                label: `${c.ad} (${c.tip})`
              })),
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
              ...cariList.map((c) => ({
                value: c.id,
                label: `${c.ad} (${c.tip})`
              })),
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
                odemeYontemi: e.target.value as ImmediateOdemeYontemi,
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

      {/* Satış Modal */}
      <Modal
        isOpen={modalType === 'satis'}
        onClose={handleCloseModal}
        title={`Araç Satışı - ${selectedArac?.marka} ${selectedArac?.model}`}
      >
        <form onSubmit={handleSatisSubmit} className="space-y-4">
          {selectedArac && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600">Toplam Maliyet</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(selectedArac.toplamMaliyet)}
              </p>
            </div>
          )}

          <Input
            label="Satış Fiyatı *"
            type="number"
            step="0.01"
            value={satisForm.satisFiyati}
            onChange={(e) =>
              setSatisForm({
                ...satisForm,
                satisFiyati: parseFloat(e.target.value) || 0,
              })
            }
            required
          />

          {selectedArac && satisForm.satisFiyati > 0 && (
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm font-medium">
                Kar/Zarar:{' '}
                <span
                  className={
                    satisForm.satisFiyati - selectedArac.toplamMaliyet >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {formatCurrency(
                    satisForm.satisFiyati - selectedArac.toplamMaliyet
                  )}
                </span>
              </p>
            </div>
          )}

          <Input
            label="Satış Tarihi *"
            type="date"
            value={satisForm.satisTarihi}
            onChange={(e) =>
              setSatisForm({ ...satisForm, satisTarihi: e.target.value })
            }
            required
          />

          <Select
            label="Müşteri (Alıcı) *"
            value={satisForm.musteriCariId}
            onChange={(e) =>
              setSatisForm({ ...satisForm, musteriCariId: e.target.value })
            }
            options={[
              { value: '', label: 'Cari Seçiniz...' },
              ...cariList.map((c) => ({
                value: c.id,
                label: `${c.ad} (${c.tip})`,
              })),
            ]}
            required
          />

          <Select
            label="Ödeme Yöntemi *"
            value={satisForm.odemeYontemi}
            onChange={(e) =>
              setSatisForm({
                ...satisForm,
                odemeYontemi: e.target.value as ImmediateOdemeYontemi,
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

          {(satisForm.odemeYontemi === 'Nakit' ||
            satisForm.odemeYontemi === 'Banka') && (
            <Select
              label="Hesap *"
              value={satisForm.hesapId}
              onChange={(e) =>
                setSatisForm({ ...satisForm, hesapId: e.target.value })
              }
              options={[
                { value: '', label: 'Hesap Seçiniz...' },
                ...hesapList.map((h) => ({
                  value: h.id,
                  label: `${h.ad} (${formatCurrency(h.bakiye)})`,
                })),
              ]}
              required
            />
          )}

          {satisForm.odemeYontemi === 'Kredi Kartı' && (
            <Select
              label="Kredi Kartı *"
              value={satisForm.krediKartiId}
              onChange={(e) =>
                setSatisForm({
                  ...satisForm,
                  krediKartiId: e.target.value,
                })
              }
              options={[
                { value: '', label: 'Kredi Kartı Seçiniz...' },
                ...krediKartiList.map((k) => ({
                  value: k.id,
                  label: `${k.ad} (Kullanılabilir: ${formatCurrency(k.limit - k.bakiye)})`,
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
              value={satisForm.aciklama}
              onChange={(e) =>
                setSatisForm({ ...satisForm, aciklama: e.target.value })
              }
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Satışı Tamamla
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

      {/* Taksitli Satış Modal */}
      <Modal
        isOpen={modalType === 'satisTaksitli'}
        onClose={handleCloseModal}
        title="Taksitli Araç Satışı"
      >
        <form onSubmit={handleSatisTaksitliSubmit} className="space-y-4">
          {selectedArac && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">
                {selectedArac.marka} {selectedArac.model}
              </h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plaka:</span>
                  <span className="font-medium">{selectedArac.plaka}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Maliyet:</span>
                  <span className="font-medium text-orange-600">
                    {formatCurrency(selectedArac.toplamMaliyet)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Input
            type="number"
            step="0.01"
            label="Satış Fiyatı *"
            value={satisTaksitliForm.satisFiyati || ''}
            onChange={(e) =>
              setSatisTaksitliForm({
                ...satisTaksitliForm,
                satisFiyati: parseFloat(e.target.value) || 0,
              })
            }
            required
          />

          {selectedArac && satisTaksitliForm.satisFiyati > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Kar/Zarar:</span>
                <span
                  className={`font-bold ${
                    satisTaksitliForm.satisFiyati - selectedArac.toplamMaliyet >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {satisTaksitliForm.satisFiyati - selectedArac.toplamMaliyet >= 0
                    ? '+'
                    : ''}
                  {formatCurrency(
                    satisTaksitliForm.satisFiyati - selectedArac.toplamMaliyet
                  )}
                </span>
              </div>
            </div>
          )}

          <Input
            type="date"
            label="Satış Tarihi *"
            value={satisTaksitliForm.satisTarihi}
            onChange={(e) =>
              setSatisTaksitliForm({ ...satisTaksitliForm, satisTarihi: e.target.value })
            }
            required
          />

          <Select
            label="Cari (Alıcı) *"
            value={satisTaksitliForm.musteriCariId}
            onChange={(e) =>
              setSatisTaksitliForm({ ...satisTaksitliForm, musteriCariId: e.target.value })
            }
            options={[
              { value: '', label: 'Cari Seçiniz...' },
              ...cariList.map((c) => ({
                value: c.id,
                label: `${c.ad} (${c.tip})`,
              })),
            ]}
            required
          />

          <Select
            label="Taksit Sayısı *"
            value={satisTaksitliForm.taksitSayisi.toString()}
            onChange={(e) =>
              setSatisTaksitliForm({
                ...satisTaksitliForm,
                taksitSayisi: parseInt(e.target.value),
              })
            }
            options={[
              { value: '3', label: '3 Taksit' },
              { value: '6', label: '6 Taksit' },
              { value: '9', label: '9 Taksit' },
              { value: '12', label: '12 Taksit' },
              { value: '18', label: '18 Taksit' },
              { value: '24', label: '24 Taksit' },
              { value: '36', label: '36 Taksit' },
            ]}
            required
          />

          {satisTaksitliForm.satisFiyati > 0 && satisTaksitliForm.taksitSayisi > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Aylık Taksit:</span>
                  <span className="font-semibold text-primary">
                    {formatCurrency(satisTaksitliForm.satisFiyati / satisTaksitliForm.taksitSayisi)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={2}
              value={satisTaksitliForm.aciklama}
              onChange={(e) =>
                setSatisTaksitliForm({ ...satisTaksitliForm, aciklama: e.target.value })
              }
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Not:</strong> Taksitli satışta cari hesabına alacak kaydedilir ve
              taksit planı oluşturulur. Taksitler Taksitler modülünden tahsil edilebilir.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              Taksitli Satışı Tamamla
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
