import React from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  actionText?: string;
  onAction?: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, type, onClose, actionText, onAction }) => {
  let bgColor = '';
  let textColor = 'text-theme-text'; // Default text color
  let borderColor = 'border-theme-secondary-1'; // Default border color
  let buttonHoverBg = 'hover:bg-white/30'; // Default button hover

  switch (type) {
    case 'success':
      bgColor = 'bg-theme-success-bg';
      textColor = 'text-theme-success-text';
      borderColor = 'border-theme-success-text';
      buttonHoverBg = 'hover:bg-theme-success-text/30';
      break;
    case 'error':
      bgColor = 'bg-theme-danger-bg';
      textColor = 'text-theme-danger-text';
      borderColor = 'border-theme-danger-text';
      buttonHoverBg = 'hover:bg-theme-danger-text/30';
      break;
    case 'info':
      bgColor = 'bg-theme-info-bg';
      textColor = 'text-theme-info-text';
      borderColor = 'border-theme-info-text';
      buttonHoverBg = 'hover:bg-theme-info-text/30';
      break;
    case 'warning':
      bgColor = 'bg-theme-warning-bg';
      textColor = 'text-theme-warning-text';
      borderColor = 'border-theme-warning-text';
      buttonHoverBg = 'hover:bg-theme-warning-text/30';
      break;
    default:
      bgColor = 'bg-theme-secondary-2'; // A neutral background
      textColor = 'text-theme-text';
  }

  return (
    <div className={`fixed top-4 right-4 ${bgColor} ${textColor} p-4 rounded-md shadow-cyber-shadow max-w-md`}>
      <div className="flex flex-col">
        <div className="flex justify-between items-start">
          <p className={`flex-grow mr-2 ${textColor}`}>{message}</p>
          <button onMouseDown={onClose} className={`ml-2 ${textColor} hover:opacity-75 text-2xl leading-none font-semibold outline-none focus:outline-none`}>
            &times;
          </button>
        </div>
        {actionText && onAction && (
          <div className={`mt-2 pt-2 border-t ${borderColor}/50 flex justify-end`}>
            <button
              onMouseDown={onAction}
              className={`px-3 py-1 bg-transparent border ${borderColor} ${textColor} ${buttonHoverBg} text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                type === 'success' ? 'focus:ring-theme-success-text' :
                type === 'error' ? 'focus:ring-theme-danger-text' :
                type === 'info' ? 'focus:ring-theme-info-text' :
                type === 'warning' ? 'focus:ring-theme-warning-text' :
                'focus:ring-theme-primary-accent1' // Default focus ring
              }`}
            >
              {actionText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};