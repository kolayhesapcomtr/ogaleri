import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { KrediKarti, AppState } from '../../types';
import { useAppService } from '../../hooks/useAppService';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Icons } from '../../constants/icons';
import { formatCurrency } from '../../utils/formatters';

interface KrediKartiPageProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

type ModalType = 'none' | 'kart' | 'odeme';

export const KrediKartiPage = ({ appState, setAppState }: KrediKartiPageProps) => {
  const navigate = useNavigate();
  const { addKrediKarti, updateKrediKarti, deleteKrediKarti, payKrediKartiBorc } =
    useAppService({
      appState,
      setAppState,
    });

  const [modalType, setModalType] = useState<ModalType>('none');
  const [editingKart, setEditingKart] = useState<KrediKarti | null>(null);
  const [selectedKart, setSelectedKart] = useState<KrediKarti | null>(null);

  const [kartForm, setKartForm] = useState({
    ad: '',
    banka: '',
    limit: 0,
    hesapKesimGunu: 1,
  });

  const [odemeForm, setOdemeForm] = useState({
    tutar: 0,
    hesapId: '',
    tarih: new Date().toISOString().split('T')[0],
  });

  const handleOpenKartModal = (kart?: KrediKarti) => {
    if (kart) {
      setEditingKart(kart);
      setKartForm({
        ad: kart.ad,
        banka: kart.banka,
        limit: kart.limit,
        hesapKesimGunu: kart.hesapKesimGunu || 1,
      });
    } else {
      setEditingKart(null);
      setKartForm({
        ad: '',
        banka: '',
        limit: 0,
        hesapKesimGunu: 1,
      });
    }
    setModalType('kart');
  };

  const handleOpenOdemeModal = (kart: KrediKarti) => {
    setSelectedKart(kart);
    setOdemeForm({
      tutar: 0,
      hesapId: '',
      tarih: new Date().toISOString().split('T')[0],
    });
    setModalType('odeme');
  };

  const handleCloseModal = () => {
    setModalType('none');
    setEditingKart(null);
    setSelectedKart(null);
  };

  const handleKartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingKart) {
      updateKrediKarti(editingKart.id, kartForm);
    } else {
      addKrediKarti(kartForm);
    }
    handleCloseModal();
  };

  const handleOdemeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedKart) {
      try {
        payKrediKartiBorc(
          selectedKart.id,
          odemeForm.tutar,
          odemeForm.hesapId,
          odemeForm.tarih
        );
        handleCloseModal();
      } catch (error) {
        alert((error as Error).message);
      }
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu kredi kartını silmek istediğinizden emin misiniz?')) {
      deleteKrediKarti(id);
    }
  };

  const hesapList = appState.hesaplar;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kredi Kartları</h1>
        <Button onClick={() => handleOpenKartModal()}>
          <div className="flex items-center gap-2">
            <Icons.Add />
            <span>Yeni Kart</span>
          </div>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appState.krediKartlari.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Henüz kredi kartı kaydı yok
          </div>
        ) : (
          appState.krediKartlari.map((kart) => {
            const kullanilabilir = kart.limit - kart.bakiye;
            const kullanimOrani = (kart.bakiye / kart.limit) * 100;

            return (
              <div key={kart.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <button
                      onClick={() => navigate(`/kredi-kartlari/${kart.id}`)}
                      className="font-semibold text-primary hover:text-primary-dark text-lg text-left"
                    >
                      {kart.ad}
                    </button>
                    <p className="text-sm text-gray-600">{kart.banka}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenKartModal(kart)}
                      className="text-primary hover:text-primary-dark"
                    >
                      <Icons.Edit />
                    </button>
                    <button
                      onClick={() => handleDelete(kart.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Icons.Delete />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Limit:</span>
                      <span className="font-medium">
                        {formatCurrency(kart.limit)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Kullanılan:</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(kart.bakiye)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kullanılabilir:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(kullanilabilir)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Kullanım</span>
                      <span>%{kullanimOrani.toFixed(0)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          kullanimOrani > 80
                            ? 'bg-red-600'
                            : kullanimOrani > 50
                            ? 'bg-yellow-600'
                            : 'bg-green-600'
                        }`}
                        style={{ width: `${Math.min(kullanimOrani, 100)}%` }}
                      />
                    </div>
                  </div>

                  {kart.hesapKesimGunu && (
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Hesap Kesim: Her ayın {kart.hesapKesimGunu}. günü
                    </div>
                  )}

                  {kart.bakiye > 0 && (
                    <Button
                      onClick={() => handleOpenOdemeModal(kart)}
                      className="w-full mt-3"
                      variant="secondary"
                    >
                      Ödeme Yap
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Kart Modal */}
      <Modal
        isOpen={modalType === 'kart'}
        onClose={handleCloseModal}
        title={editingKart ? 'Kredi Kartı Düzenle' : 'Yeni Kredi Kartı'}
      >
        <form onSubmit={handleKartSubmit} className="space-y-4">
          <Input
            label="Kart Adı *"
            value={kartForm.ad}
            onChange={(e) => setKartForm({ ...kartForm, ad: e.target.value })}
            placeholder="Örn: X Bankası Gold Kart"
            required
          />

          <Input
            label="Banka *"
            value={kartForm.banka}
            onChange={(e) => setKartForm({ ...kartForm, banka: e.target.value })}
            required
          />

          <Input
            label="Limit *"
            type="number"
            step="0.01"
            value={kartForm.limit}
            onChange={(e) =>
              setKartForm({ ...kartForm, limit: parseFloat(e.target.value) || 0 })
            }
            required
          />

          <Input
            label="Hesap Kesim Günü"
            type="number"
            min="1"
            max="31"
            value={kartForm.hesapKesimGunu}
            onChange={(e) =>
              setKartForm({
                ...kartForm,
                hesapKesimGunu: parseInt(e.target.value) || 1,
              })
            }
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingKart ? 'Güncelle' : 'Ekle'}
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
        title={`Ödeme - ${selectedKart?.ad}`}
      >
        <form onSubmit={handleOdemeSubmit} className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg mb-4">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between mb-1">
                <span>Toplam Borç:</span>
                <span className="font-semibold text-red-600">
                  {selectedKart && formatCurrency(selectedKart.bakiye)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Kullanılabilir Limit:</span>
                <span className="font-medium text-green-600">
                  {selectedKart &&
                    formatCurrency(selectedKart.limit - selectedKart.bakiye)}
                </span>
              </div>
            </div>
          </div>

          <Input
            label="Ödeme Tutarı *"
            type="number"
            step="0.01"
            value={odemeForm.tutar}
            onChange={(e) =>
              setOdemeForm({
                ...odemeForm,
                tutar: parseFloat(e.target.value) || 0,
              })
            }
            required
          />

          <Input
            label="Tarih *"
            type="date"
            value={odemeForm.tarih}
            onChange={(e) => setOdemeForm({ ...odemeForm, tarih: e.target.value })}
            required
          />

          <Select
            label="Hesap *"
            value={odemeForm.hesapId}
            onChange={(e) =>
              setOdemeForm({ ...odemeForm, hesapId: e.target.value })
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
    </div>
  );
};
