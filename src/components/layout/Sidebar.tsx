import { NavLink } from 'react-router-dom';
import { Icons } from '../../constants/icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Icons.Dashboard },
    { path: '/cari', label: 'Cari Hesaplar', icon: Icons.Cari },
    { path: '/kasa', label: 'Kasa & Banka', icon: Icons.Kasa },
    { path: '/gider', label: 'Giderler', icon: Icons.Gider },
    { path: '/oto-galeri', label: 'Oto Galeri', icon: Icons.Car },
    { path: '/stok', label: 'Stok Yönetimi', icon: Icons.Box },
    { path: '/taksitler', label: 'Taksitler', icon: Icons.Calendar },
    { path: '/kredi-kartlari', label: 'Kredi Kartları', icon: Icons.CreditCard },
    { path: '/cek-senet', label: 'Çek & Senet', icon: Icons.Document },
    { path: '/islem-kayitlari', label: 'İşlem Kayıtları', icon: Icons.Document },
    { path: '/ayarlar', label: 'Ayarlar', icon: Icons.Settings },
  ];

  return (
    <>
      {/* Mobil overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-gray-900 text-white w-64 z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-0
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-primary">oGaleri</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-gray-800 rounded"
          >
            <Icons.Close />
          </button>
        </div>

        {/* Menu */}
        <nav className="py-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors ${
                  isActive ? 'bg-gray-800 border-l-4 border-primary' : ''
                }`
              }
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};
