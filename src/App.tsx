import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/pages/Dashboard';
import { CariPage } from './components/pages/CariPage';
import { KasaPage } from './components/pages/KasaPage';
import { GiderPage } from './components/pages/GiderPage';
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
            path="/kasa"
            element={<KasaPage appState={appState} setAppState={setAppState} />}
          />
          <Route
            path="/gider"
            element={<GiderPage appState={appState} setAppState={setAppState} />}
          />
          <Route path="/ayarlar" element={<AyarlarPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
