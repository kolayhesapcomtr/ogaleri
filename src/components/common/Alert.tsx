import { Icons } from '../../constants/icons';

interface AlertProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const Alert = ({ type, title, message, action }: AlertProps) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };

  const iconStyles = {
    info: 'text-blue-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    success: 'text-green-500',
  };

  return (
    <div className={`${styles[type]} border rounded-lg p-4 flex items-start gap-3`}>
      <div className={iconStyles[type]}>
        {type === 'warning' && <Icons.ArrowDown />}
        {type === 'error' && <Icons.Delete />}
        {type === 'success' && <Icons.Check />}
        {type === 'info' && <Icons.Dashboard />}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm mb-1">{title}</h4>
        <p className="text-sm opacity-90">{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm font-medium underline hover:no-underline"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};
