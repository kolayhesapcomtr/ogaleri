import { Icons } from '../../constants/icons';

interface HeaderProps {
  onMenuClick: () => void;
  mode: 'demo' | 'firebase';
  onModeChange: (mode: 'demo' | 'firebase') => void;
}

export const Header = ({ onMenuClick, mode, onModeChange }: HeaderProps) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Mobil menu butonu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
      >
        <Icons.Menu />
      </button>

      {/* Boş alan (ortada başlık eklenebilir) */}
      <div className="flex-1" />

      {/* Mod seçici */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 hidden sm:inline">Mod:</span>
        <select
          value={mode}
          onChange={(e) => onModeChange(e.target.value as 'demo' | 'firebase')}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="demo">Demo</option>
          <option value="firebase">Firebase</option>
        </select>
      </div>
    </header>
  );
};
