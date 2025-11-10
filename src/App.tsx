import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/pages/Dashboard';
import { CariPage } from './components/pages/CariPage';
import { CariDetailPage } from './components/pages/CariDetailPage';
import { KasaPage } from './components/pages/KasaPage';
import { HesapDetailPage } from './components/pages/HesapDetailPage';
import { GiderPage } from './components/pages/GiderPage';
import { OtoGaleriPage } from './components/pages/OtoGaleriPage';
import { AracDetailPage } from './components/pages/AracDetailPage';
import { StokPage } from './components/pages/StokPage';
import { UrunDetailPage } from './components/pages/UrunDetailPage';
import { TaksitPage } from './components/pages/TaksitPage';
import { KrediKartiPage } from './components/pages/KrediKartiPage';
import { KrediKartiDetailPage } from './components/pages/KrediKartiDetailPage';
import { KrediPage } from './components/pages/KrediPage';
import { KrediDetailPage } from './components/pages/KrediDetailPage';
import { CekSenetPage } from './components/pages/CekSenetPage';
import { CekSenetDetailPage } from './components/pages/CekSenetDetailPage';
import { IslemKayitlariPage } from './components/pages/IslemKayitlariPage';
import { AyarlarPage } from './components/pages/AyarlarPage';
import type { AppState, AppMode } from './types';
import { getMockData } from './services/mockData';

function App() {
  const [mode, setMode] = useState<AppMode>('demo');
  const [appState, setAppState] = useState<AppState>(getMockData());

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    if (newMode === 'demo') {
      // Demo moduna geçildiğinde mock veri yükle
      setAppState(getMockData());
    } else {
      // Firebase moduna geçildiğinde gerçek veriyi yükle
      // TODO: Firebase'den veri çekme implementasyonu
      console.log('Firebase moduna geçildi');
    }
  };

  return (
    <BrowserRouter basename="/ogaleri">
      <Routes>
        <Route
          element={<Layout mode={mode} onModeChange={handleModeChange} />}
        >
          <Route index element={<Dashboard appState={appState} />} />
          <Route
            path="/cari"
            element={<CariPage appState={appState} setAppState={setAppState} />}
          />
          <Route
            path="/cari/:id"
            element={<CariDetailPage appState={appState} setAppState={setAppState} />}
          />
          <Route
            path="/kasa"
            element={<KasaPage appState={appState} setAppState={setAppState} />}
          />
          <Route
            path="/kasa/:id"
            element={<HesapDetailPage appState={appState} setAppState={setAppState} />}
          />
          <Route
            path="/gider"
            element={<GiderPage appState={appState} setAppState={setAppState} />}
          />
          <Route
            path="/oto-galeri"
            element={<OtoGaleriPage appState={appState} setAppState={setAppState} />}
          />
          <Route
            path="/oto-galeri/:id"
            element={<AracDetailPage appState={appState} setAppState={setAppState} />}
          />
          <Route
            path="/stok"
            element={<StokPage appState={appState} setAppState={setAppState} />}
          />
          <Route
            path="/stok/:id"
            element={<UrunDetailPage appState={appState} />}
          />
          <Route
            path="/taksitler"
            element={<TaksitPage appState={appState} setAppState={setAppState} />}
          />
          <Route
            path="/kredi-kartlari"
            element={<KrediKartiPage appState={appState} setAppState={setAppState} />}
          />
          <Route
            path="/kredi-kartlari/:id"
            element={<KrediKartiDetailPage appState={appState} />}
          />
          <Route
            path="/krediler"
            element={<KrediPage appState={appState} setAppState={setAppState} />}
          />
          <Route
            path="/krediler/:id"
            element={<KrediDetailPage appState={appState} />}
          />
          <Route
            path="/cek-senet"
            element={<CekSenetPage appState={appState} setAppState={setAppState} />}
          />
          <Route
            path="/cek-senet/:id"
            element={<CekSenetDetailPage appState={appState} />}
          />
          <Route
            path="/islem-kayitlari"
            element={<IslemKayitlariPage appState={appState} />}
          />
          <Route
            path="/ayarlar"
            element={<AyarlarPage appState={appState} setAppState={setAppState} />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
