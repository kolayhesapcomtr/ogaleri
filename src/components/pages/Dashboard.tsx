import type { AppState } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Icons } from '../../constants/icons';

interface DashboardProps {
  appState: AppState;
}

export const Dashboard = ({ appState }: DashboardProps) => {
  // İstatistikleri hesapla
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

  const toplamGider = appState.giderler.reduce(
    (sum, g) => sum + g.tutar,
    0
  );

  const musteriSayisi = appState.cariler.filter(
    (c) => c.tip === 'Müşteri'
  ).length;

  const tedarikciSayisi = appState.cariler.filter(
    (c) => c.tip === 'Tedarikçi'
  ).length;

  // Son işlemler
  const sonGiderler = [...appState.giderler]
    .sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime())
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Toplam Bakiye */}
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-90">Toplam Bakiye</div>
            <Icons.Kasa />
          </div>
          <div className="text-3xl font-bold">
            {formatCurrency(toplamKasaBakiye)}
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
            {formatCurrency(toplamAlacak)}
          </div>
          <div className="text-xs opacity-75 mt-1">
            {musteriSayisi} Müşteri
          </div>
        </div>

        {/* Toplam Borç */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-90">Toplam Borç</div>
            <Icons.ArrowDown />
          </div>
          <div className="text-3xl font-bold">
            {formatCurrency(toplamBorc)}
          </div>
          <div className="text-xs opacity-75 mt-1">
            {tedarikciSayisi} Tedarikçi
          </div>
        </div>

        {/* Toplam Gider */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-90">Toplam Gider</div>
            <Icons.Gider />
          </div>
          <div className="text-3xl font-bold">
            {formatCurrency(toplamGider)}
          </div>
          <div className="text-xs opacity-75 mt-1">
            {appState.giderler.length} İşlem
          </div>
        </div>
      </div>

      {/* Alt Bölüm */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hesaplar Özet */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Hesaplar
          </h2>
          <div className="space-y-3">
            {appState.hesaplar.length === 0 ? (
              <p className="text-gray-500 text-sm">Henüz hesap yok</p>
            ) : (
              appState.hesaplar.map((hesap) => (
                <div
                  key={hesap.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Son Giderler
          </h2>
          <div className="space-y-3">
            {sonGiderler.length === 0 ? (
              <p className="text-gray-500 text-sm">Henüz gider kaydı yok</p>
            ) : (
              sonGiderler.map((gider) => (
                <div
                  key={gider.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
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
      </div>

      {/* Cari Özet */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
                .slice(0, 5)
                .map((cari) => (
                  <div
                    key={cari.id}
                    className="flex items-center justify-between p-2 bg-green-50 rounded"
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
                .slice(0, 5)
                .map((cari) => (
                  <div
                    key={cari.id}
                    className="flex items-center justify-between p-2 bg-red-50 rounded"
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
