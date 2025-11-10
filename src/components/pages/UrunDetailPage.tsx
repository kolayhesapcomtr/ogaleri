import { useParams, useNavigate } from 'react-router-dom';
import type { AppState } from '../../types';
import { Button } from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface UrunDetailPageProps {
  appState: AppState;
}

export const UrunDetailPage = ({ appState }: UrunDetailPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const urun = appState.urunler.find((u) => u.id === id);

  if (!urun) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ürün Bulunamadı</h2>
        <Button onClick={() => navigate('/stok')}>Stok Listesine Dön</Button>
      </div>
    );
  }

  const hareketler = appState.stokHareketler.filter((h) => h.urunId === id).sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());
  const toplamGiris = hareketler.filter((h) => h.tip === 'Giriş').reduce((sum, h) => sum + h.miktar, 0);
  const toplamCikis = hareketler.filter((h) => h.tip === 'Çıkış').reduce((sum, h) => sum + h.miktar, 0);

  return (
    <div>
      <Button onClick={() => navigate('/stok')} variant="secondary" className="mb-4">
        <div className="flex items-center gap-2">
          <span>← Geri Dön</span>
        </div>
      </Button>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold">{urun.ad}</h1>
        <p className="text-gray-600 mt-1">{urun.kategori} • {urun.barkod || 'Barkod yok'}</p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div><p className="text-sm text-gray-600">Stok</p><p className="text-xl font-bold text-green-600">{urun.stokMiktari} {urun.birim}</p></div>
          <div><p className="text-sm text-gray-600">Alış Fiyatı</p><p className="text-lg font-semibold">{formatCurrency(urun.alisFiyati)}</p></div>
          <div><p className="text-sm text-gray-600">Satış Fiyatı</p><p className="text-lg font-semibold">{formatCurrency(urun.satisFiyati)}</p></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4"><p className="text-sm text-gray-600">Toplam Giriş</p><p className="text-xl font-bold text-green-600">{toplamGiris} {urun.birim}</p></div>
        <div className="bg-white rounded-lg shadow p-4"><p className="text-sm text-gray-600">Toplam Çıkış</p><p className="text-xl font-bold text-red-600">{toplamCikis} {urun.birim}</p></div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b"><h2 className="text-lg font-semibold">Stok Hareketleri ({hareketler.length})</h2></div>
        {hareketler.length === 0 ? <div className="p-12 text-center text-gray-500">Henüz hareket yok</div> : (
          <div className="divide-y">{hareketler.map((h) => (
            <div key={h.id} className="px-6 py-4 flex justify-between hover:bg-gray-50">
              <div>
                <p className="font-medium"><span className={h.tip === 'Giriş' ? 'text-green-600' : 'text-red-600'}>{h.tip}</span> • {formatDate(h.tarih)}</p>
                <p className="text-sm text-gray-600">{h.aciklama || '-'}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{h.miktar} {urun.birim}</p>
                <p className="text-sm text-gray-600">{formatCurrency(h.toplamTutar)}</p>
              </div>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
};
