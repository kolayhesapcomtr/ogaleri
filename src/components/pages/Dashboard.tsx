import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppState } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Icons } from '../../constants/icons';
import { Alert } from '../common/Alert';

interface DashboardProps {
  appState: AppState;
}

export const Dashboard = ({ appState }: DashboardProps) => {
  const navigate = useNavigate();

  // İstatistikleri hesapla
  const stats = useMemo(() => {
    const toplamKasaBakiye = appState.hesaplar.reduce(
      (sum, hesap) => sum + hesap.bakiye,
      0
    );

    const toplamAlacak = appState.cariler
      .filter((c) => c.bakiye > 0)
      .reduce((sum, c) => sum + c.bakiye, 0);

    const toplamBorc = appState.cariler
      .filter((c) => c.bakiye < 0)
      .reduce((sum, c) => sum + Math.abs(c.bakiye), 0);

    const toplamGider = appState.giderler.reduce((sum, g) => sum + g.tutar, 0);

    // Kredi kartı istatistikleri
    const toplamKKLimit = appState.krediKartlari.reduce((sum, k) => sum + k.limit, 0);
    const toplamKKKullanim = appState.krediKartlari.reduce((sum, k) => sum + k.bakiye, 0);
    const kkKullanimOrani = toplamKKLimit > 0 ? (toplamKKKullanim / toplamKKLimit) * 100 : 0;

    // Stok istatistikleri
    const toplamStok = appState.urunler.reduce((sum, u) => sum + u.stokMiktari, 0);
    const dusukStokUrunler = appState.urunler.filter(
      (u) => u.minStok && u.stokMiktari <= u.minStok
    );

    // Araç istatistikleri
    const stokAraclar = appState.araclar.filter((a) => a.durum === 'Stokta');
    const satilanAraclar = appState.araclar.filter((a) => a.durum === 'Satıldı');
    const toplamAracKari = satilanAraclar.reduce((sum, a) => {
      const kar = (a.satisFiyati || 0) - a.toplamMaliyet;
      return sum + kar;
    }, 0);

    // Taksit istatistikleri
    const today = new Date();
    const gecikmisBorcTaksitleri = appState.taksitOdemeleri.filter(
      (t) =>
        t.tip === 'Borç' &&
        t.durum !== 'Ödendi' &&
        new Date(t.vadeTarihi) < today
    );

    const bekleyenBorcTaksitleri = appState.taksitOdemeleri.filter(
      (t) => t.tip === 'Borç' && t.durum === 'Beklemede'
    );

    const gecikmisBorcTutar = gecikmisBorcTaksitleri.reduce((sum, t) => sum + t.tutar, 0);

    // Kredi istatistikleri
    const toplamKrediBorc = appState.krediler.reduce((sum, k) => sum + k.kalanTutar, 0);
    const gecikmiKrediTaksitleri = appState.krediOdemeleri.filter(
      (k) => k.durum !== 'Ödendi' && new Date(k.vadeTarihi) < today
    );

    return {
      toplamKasaBakiye,
      toplamAlacak,
      toplamBorc,
      toplamGider,
      toplamKKLimit,
      toplamKKKullanim,
      kkKullanimOrani,
      toplamStok,
      dusukStokUrunler,
      stokAraclar,
      satilanAraclar,
      toplamAracKari,
      gecikmisBorcTaksitleri,
      bekleyenBorcTaksitleri,
      gecikmisBorcTutar,
      toplamKrediBorc,
      gecikmiKrediTaksitleri,
    };
  }, [appState]);

  // Bildirimler/Uyarılar
  const alerts = useMemo(() => {
    const result = [];

    // Gecikmiş taksit uyarısı
    if (stats.gecikmisBorcTaksitleri.length > 0) {
      result.push({
        type: 'error' as const,
        title: 'Gecikmiş Taksitler!',
        message: `${stats.gecikmisBorcTaksitleri.length} adet gecikmiş taksit var. Toplam: ${formatCurrency(stats.gecikmisBorcTutar)}`,
        action: { label: 'Taksitleri Görüntüle', onClick: () => navigate('/taksitler') },
      });
    }

    // Düşük stok uyarısı
    if (stats.dusukStokUrunler.length > 0) {
      result.push({
        type: 'warning' as const,
        title: 'Düşük Stok Uyarısı!',
        message: `${stats.dusukStokUrunler.length} ürün kritik stok seviyesinde.`,
        action: { label: 'Stok Yönetimi', onClick: () => navigate('/stok') },
      });
    }

    // Kredi kartı yüksek kullanım uyarısı
    if (stats.kkKullanimOrani > 80) {
      result.push({
        type: 'warning' as const,
        title: 'Yüksek Kredi Kartı Kullanımı!',
        message: `Kredi kartı kullanım oranı %${stats.kkKullanimOrani.toFixed(0)}. Limit: ${formatCurrency(stats.toplamKKLimit - stats.toplamKKKullanim)} kaldı.`,
        action: { label: 'Kredi Kartları', onClick: () => navigate('/kredi-kartlari') },
      });
    }

    // Gecikmiş kredi taksitleri
    if (stats.gecikmiKrediTaksitleri.length > 0) {
      result.push({
        type: 'error' as const,
        title: 'Gecikmiş Kredi Taksitleri!',
        message: `${stats.gecikmiKrediTaksitleri.length} adet kredi taksiti gecikmede.`,
      });
    }

    return result;
  }, [stats, navigate]);

  // Son işlemler
  const sonGiderler = [...appState.giderler]
    .sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600 text-sm">
          {new Date().toLocaleDateString('tr-TR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Bildirimler/Uyarılar */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <Alert key={index} {...alert} />
          ))}
        </div>
      )}

      {/* Üst İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toplam Bakiye */}
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-90">Toplam Bakiye</div>
            <Icons.Kasa />
          </div>
          <div className="text-3xl font-bold">
            {formatCurrency(stats.toplamKasaBakiye)}
          </div>
          <div className="text-xs opacity-75 mt-1">
            {appState.hesaplar.length} Hesap
          </div>
        </div>

        {/* Toplam Alacak */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-90">Toplam Alacak</div>
            <Icons.ArrowUp />
          </div>
          <div className="text-3xl font-bold">
            {formatCurrency(stats.toplamAlacak)}
          </div>
          <div className="text-xs opacity-75 mt-1">
            {appState.cariler.filter((c) => c.bakiye > 0).length} Müşteri
          </div>
        </div>

        {/* Toplam Borç */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-90">Toplam Borç</div>
            <Icons.ArrowDown />
          </div>
          <div className="text-3xl font-bold">
            {formatCurrency(stats.toplamBorc)}
          </div>
          <div className="text-xs opacity-75 mt-1">
            {appState.cariler.filter((c) => c.bakiye < 0).length} Tedarikçi
          </div>
        </div>

        {/* Net Durum */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-90">Net Durum</div>
            <Icons.Dashboard />
          </div>
          <div className="text-3xl font-bold">
            {formatCurrency(
              stats.toplamKasaBakiye + stats.toplamAlacak - stats.toplamBorc
            )}
          </div>
          <div className="text-xs opacity-75 mt-1">Kasa + Alacak - Borç</div>
        </div>
      </div>

      {/* İkinci Seviye İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stok */}
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Toplam Stok</div>
            <Icons.Box />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.toplamStok}</div>
          <div className="text-xs text-gray-500 mt-1">
            {appState.urunler.length} Ürün
          </div>
        </div>

        {/* Araçlar */}
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Stoktaki Araçlar</div>
            <Icons.Car />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.stokAraclar.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.satilanAraclar.length} Satıldı
          </div>
        </div>

        {/* Kredi Kartı */}
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-pink-500">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">KK Kullanımı</div>
            <Icons.CreditCard />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            %{stats.kkKullanimOrani.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {formatCurrency(stats.toplamKKKullanim)} / {formatCurrency(stats.toplamKKLimit)}
          </div>
        </div>

        {/* Taksitler */}
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Bekleyen Taksit</div>
            <Icons.Calendar />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.bekleyenBorcTaksitleri.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.gecikmisBorcTaksitleri.length} Gecikmiş
          </div>
        </div>
      </div>

      {/* Ana İçerik Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hesaplar Özet */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icons.Kasa />
            Hesaplar
          </h2>
          <div className="space-y-3">
            {appState.hesaplar.length === 0 ? (
              <p className="text-gray-500 text-sm">Henüz hesap yok</p>
            ) : (
              appState.hesaplar.map((hesap) => (
                <div
                  key={hesap.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900">{hesap.ad}</div>
                    <div className="text-xs text-gray-500">{hesap.tip}</div>
                  </div>
                  <div
                    className={`font-semibold ${
                      hesap.bakiye >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(hesap.bakiye)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Son Giderler */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icons.Gider />
            Son Giderler
          </h2>
          <div className="space-y-3">
            {sonGiderler.length === 0 ? (
              <p className="text-gray-500 text-sm">Henüz gider kaydı yok</p>
            ) : (
              sonGiderler.map((gider) => (
                <div
                  key={gider.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {gider.kategori}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(gider.tarih).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  <div className="font-semibold text-red-600">
                    {formatCurrency(gider.tutar)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Düşük Stok Ürünleri */}
        {stats.dusukStokUrunler.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Box />
              Düşük Stok Uyarısı
            </h2>
            <div className="space-y-3">
              {stats.dusukStokUrunler.slice(0, 5).map((urun) => (
                <div
                  key={urun.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900">{urun.ad}</div>
                    <div className="text-xs text-gray-500">
                      Min: {urun.minStok} {urun.birim}
                    </div>
                  </div>
                  <div className="font-semibold text-red-600">
                    {urun.stokMiktari} {urun.birim}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Finansal Özet */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Finansal Özet
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Araç Satış Karı
              </span>
              <span className="font-semibold text-green-600">
                {formatCurrency(stats.toplamAracKari)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Toplam Gider
              </span>
              <span className="font-semibold text-orange-600">
                {formatCurrency(stats.toplamGider)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Kredi Borcu
              </span>
              <span className="font-semibold text-red-600">
                {formatCurrency(stats.toplamKrediBorc)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Kredi Kartı Borcu
              </span>
              <span className="font-semibold text-purple-600">
                {formatCurrency(stats.toplamKKKullanim)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cari Özet */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Icons.Cari />
          Cari Hesaplar Özet
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Alacaklı Cariler */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Alacaklı Cariler
            </h3>
            <div className="space-y-2">
              {appState.cariler
                .filter((c) => c.bakiye > 0)
                .sort((a, b) => b.bakiye - a.bakiye)
                .slice(0, 5)
                .map((cari) => (
                  <div
                    key={cari.id}
                    className="flex items-center justify-between p-2 bg-green-50 rounded hover:bg-green-100 transition-colors"
                  >
                    <div className="text-sm text-gray-900">{cari.ad}</div>
                    <div className="text-sm font-semibold text-green-600">
                      {formatCurrency(cari.bakiye)}
                    </div>
                  </div>
                ))}
              {appState.cariler.filter((c) => c.bakiye > 0).length === 0 && (
                <p className="text-gray-500 text-sm">Alacaklı cari yok</p>
              )}
            </div>
          </div>

          {/* Borçlu Cariler */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Borçlu Cariler
            </h3>
            <div className="space-y-2">
              {appState.cariler
                .filter((c) => c.bakiye < 0)
                .sort((a, b) => a.bakiye - b.bakiye)
                .slice(0, 5)
                .map((cari) => (
                  <div
                    key={cari.id}
                    className="flex items-center justify-between p-2 bg-red-50 rounded hover:bg-red-100 transition-colors"
                  >
                    <div className="text-sm text-gray-900">{cari.ad}</div>
                    <div className="text-sm font-semibold text-red-600">
                      {formatCurrency(Math.abs(cari.bakiye))}
                    </div>
                  </div>
                ))}
              {appState.cariler.filter((c) => c.bakiye < 0).length === 0 && (
                <p className="text-gray-500 text-sm">Borçlu cari yok</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
