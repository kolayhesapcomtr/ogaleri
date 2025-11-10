import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Kredi, AppState } from '../../types';
import { useAppService } from '../../hooks/useAppService';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Icons } from '../../constants/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface KrediPageProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

type ModalType = 'none' | 'kredi' | 'odeme';

export const KrediPage = ({ appState, setAppState }: KrediPageProps) => {
  const navigate = useNavigate();
  const { addKredi, updateKredi, deleteKredi, payKrediSimple } = useAppService({
    appState,
    setAppState,
  });

  const [modalType, setModalType] = useState<ModalType>('none');
  const [editingKredi, setEditingKredi] = useState<Kredi | null>(null);
  const [selectedKredi, setSelectedKredi] = useState<Kredi | null>(null);

  const [krediForm, setKrediForm] = useState({
    ad: '',
    banka: '',
    toplamTutar: 0,
    faizOrani: 0,
    taksitSayisi: 12,
    baslangicTarihi: new Date().toISOString().split('T')[0],
    hesapId: '',
    aciklama: '',
  });

  const [odemeForm, setOdemeForm] = useState({
    tutar: 0,
    hesapId: '',
    tarih: new Date().toISOString().split('T')[0],
  });

  const handleOpenKrediModal = (kredi?: Kredi) => {
    if (kredi) {
      setEditingKredi(kredi);
      setKrediForm({
        ad: kredi.ad,
        banka: kredi.banka,
        toplamTutar: kredi.toplamTutar,
        faizOrani: kredi.faizOrani || 0,
        taksitSayisi: kredi.taksitSayisi,
        baslangicTarihi: kredi.baslangicTarihi,
        hesapId: appState.hesaplar[0]?.id || '',
        aciklama: kredi.aciklama || '',
      });
    } else {
      setEditingKredi(null);
      setKrediForm({
        ad: '',
        banka: '',
        toplamTutar: 0,
        faizOrani: 0,
        taksitSayisi: 12,
        baslangicTarihi: new Date().toISOString().split('T')[0],
        hesapId: appState.hesaplar[0]?.id || '',
        aciklama: '',
      });
    }
    setModalType('kredi');
  };

  const handleSaveKredi = () => {
    if (!krediForm.ad || !krediForm.banka || krediForm.toplamTutar <= 0 || !krediForm.hesapId) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    const aylikTaksit = krediForm.toplamTutar / krediForm.taksitSayisi;
    const baslangic = new Date(krediForm.baslangicTarihi);
    const bitis = new Date(baslangic);
    bitis.setMonth(bitis.getMonth() + krediForm.taksitSayisi);

    if (editingKredi) {
      updateKredi(editingKredi.id, {
        ad: krediForm.ad,
        banka: krediForm.banka,
        faizOrani: krediForm.faizOrani,
        aciklama: krediForm.aciklama,
      });
    } else {
      addKredi({
        ...krediForm,
        aylikTaksit,
        bitisTarihi: bitis.toISOString().split('T')[0],
      });
    }

    setModalType('none');
    setEditingKredi(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu krediyi silmek istediğinizden emin misiniz?')) {
      deleteKredi(id);
    }
  };

  const handleOpenOdemeModal = (kredi: Kredi) => {
    setSelectedKredi(kredi);
    setOdemeForm({
      tutar: kredi.aylikTaksit,
      hesapId: appState.hesaplar[0]?.id || '',
      tarih: new Date().toISOString().split('T')[0],
    });
    setModalType('odeme');
  };

  const handleOdeme = () => {
    if (!selectedKredi || !odemeForm.hesapId || odemeForm.tutar <= 0) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    payKrediSimple(
      selectedKredi.id,
      odemeForm.tutar,
      odemeForm.hesapId,
      odemeForm.tarih
    );

    setModalType('none');
    setSelectedKredi(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Krediler</h1>
        <Button onClick={() => handleOpenKrediModal()}>
          <div className="flex items-center gap-2">
            <Icons.Add />
            <span>Yeni Kredi</span>
          </div>
        </Button>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Toplam Kredi</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(
              appState.krediler.reduce((sum, k) => sum + k.toplamTutar, 0)
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {appState.krediler.length} kredi
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Kalan Borç</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(
              appState.krediler.reduce((sum, k) => sum + k.kalanTutar, 0)
            )}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Aylık Toplam Taksit</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(
              appState.krediler.reduce((sum, k) => sum + k.aylikTaksit, 0)
            )}
          </p>
        </div>
      </div>

      {/* Kredi Kartları */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {appState.krediler.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">Henüz kredi kaydı yok</p>
            <Button onClick={() => handleOpenKrediModal()}>
              İlk Krediyi Ekle
            </Button>
          </div>
        ) : (
          appState.krediler.map((kredi) => {
            const odenenTutar = kredi.toplamTutar - kredi.kalanTutar;
            const tamamlanmaOrani = (odenenTutar / kredi.toplamTutar) * 100;
            const kalanAy = Math.ceil(kredi.kalanTutar / kredi.aylikTaksit);

            return (
              <div key={kredi.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <button
                      onClick={() => navigate(`/krediler/${kredi.id}`)}
                      className="text-lg font-semibold text-primary hover:text-primary-dark text-left"
                    >
                      {kredi.ad}
                    </button>
                    <p className="text-sm text-gray-600">{kredi.banka}</p>
                    {kredi.faizOrani && kredi.faizOrani > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Faiz: %{kredi.faizOrani}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenKrediModal(kredi)}
                      className="text-primary hover:text-primary-dark"
                    >
                      <Icons.Edit />
                    </button>
                    <button
                      onClick={() => handleDelete(kredi.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Icons.Delete />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Toplam Kredi</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(kredi.toplamTutar)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ödenen</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(odenenTutar)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kalan</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(kredi.kalanTutar)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Aylık Taksit</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(kredi.aylikTaksit)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>İlerleme</span>
                    <span>{tamamlanmaOrani.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${tamamlanmaOrani}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {kalanAy} ay kaldı
                  </p>
                </div>

                <div className="flex justify-between text-xs text-gray-500 mb-4">
                  <span>Başlangıç: {formatDate(kredi.baslangicTarihi)}</span>
                  <span>Bitiş: {formatDate(kredi.bitisTarihi)}</span>
                </div>

                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleOpenOdemeModal(kredi)}
                >
                  Ödeme Yap
                </Button>
              </div>
            );
          })
        )}
      </div>

      {/* Kredi Modal */}
      <Modal
        isOpen={modalType === 'kredi'}
        onClose={() => setModalType('none')}
        title={editingKredi ? 'Kredi Düzenle' : 'Yeni Kredi'}
      >
        <div className="space-y-4">
          <Input
            label="Kredi Adı"
            value={krediForm.ad}
            onChange={(e) => setKrediForm({ ...krediForm, ad: e.target.value })}
            placeholder="Örn: İşletme Kredisi"
            required
          />
          <Input
            label="Banka"
            value={krediForm.banka}
            onChange={(e) =>
              setKrediForm({ ...krediForm, banka: e.target.value })
            }
            placeholder="Örn: Ziraat Bankası"
            required
          />
          <Input
            label="Toplam Tutar"
            type="number"
            value={krediForm.toplamTutar}
            onChange={(e) =>
              setKrediForm({
                ...krediForm,
                toplamTutar: parseFloat(e.target.value) || 0,
              })
            }
            required
          />
          <Input
            label="Faiz Oranı (%)"
            type="number"
            value={krediForm.faizOrani}
            onChange={(e) =>
              setKrediForm({
                ...krediForm,
                faizOrani: parseFloat(e.target.value) || 0,
              })
            }
            step="0.1"
          />
          <Input
            label="Taksit Sayısı"
            type="number"
            value={krediForm.taksitSayisi}
            onChange={(e) =>
              setKrediForm({
                ...krediForm,
                taksitSayisi: parseInt(e.target.value) || 12,
              })
            }
            required
          />
          <Input
            label="Başlangıç Tarihi"
            type="date"
            value={krediForm.baslangicTarihi}
            onChange={(e) =>
              setKrediForm({ ...krediForm, baslangicTarihi: e.target.value })
            }
            required
          />

          {!editingKredi && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kredi Giriş Hesabı *
              </label>
              <select
                value={krediForm.hesapId}
                onChange={(e) =>
                  setKrediForm({ ...krediForm, hesapId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Hesap Seçin</option>
                {appState.hesaplar.map((hesap) => (
                  <option key={hesap.id} value={hesap.id}>
                    {hesap.ad} - {formatCurrency(hesap.bakiye)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Kredi tutarı bu hesaba girecektir
              </p>
            </div>
          )}

          <Input
            label="Açıklama"
            value={krediForm.aciklama}
            onChange={(e) =>
              setKrediForm({ ...krediForm, aciklama: e.target.value })
            }
            placeholder="Opsiyonel"
          />

          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">
              Aylık Taksit:{' '}
              <span className="font-semibold text-gray-900">
                {formatCurrency(
                  krediForm.toplamTutar / krediForm.taksitSayisi
                )}
              </span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveKredi} className="flex-1">
              {editingKredi ? 'Güncelle' : 'Kaydet'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setModalType('none')}
              className="flex-1"
            >
              İptal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Ödeme Modal */}
      <Modal
        isOpen={modalType === 'odeme'}
        onClose={() => setModalType('none')}
        title="Kredi Ödemesi"
      >
        <div className="space-y-4">
          {selectedKredi && (
            <div className="bg-gray-50 p-4 rounded mb-4">
              <p className="font-semibold text-gray-900">{selectedKredi.ad}</p>
              <p className="text-sm text-gray-600">
                Kalan Borç: {formatCurrency(selectedKredi.kalanTutar)}
              </p>
            </div>
          )}

          <Input
            label="Ödeme Tutarı"
            type="number"
            value={odemeForm.tutar}
            onChange={(e) =>
              setOdemeForm({
                ...odemeForm,
                tutar: parseFloat(e.target.value) || 0,
              })
            }
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ödeme Hesabı *
            </label>
            <select
              value={odemeForm.hesapId}
              onChange={(e) =>
                setOdemeForm({ ...odemeForm, hesapId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Hesap Seçin</option>
              {appState.hesaplar.map((hesap) => (
                <option key={hesap.id} value={hesap.id}>
                  {hesap.ad} - {formatCurrency(hesap.bakiye)}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Ödeme Tarihi"
            type="date"
            value={odemeForm.tarih}
            onChange={(e) =>
              setOdemeForm({ ...odemeForm, tarih: e.target.value })
            }
            required
          />

          <div className="flex gap-2">
            <Button onClick={handleOdeme} className="flex-1">
              Ödeme Yap
            </Button>
            <Button
              variant="secondary"
              onClick={() => setModalType('none')}
              className="flex-1"
            >
              İptal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
