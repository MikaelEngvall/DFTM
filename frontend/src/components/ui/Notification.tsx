import { useEffect, useState } from 'react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  type: NotificationType;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoHideDuration?: number;
}

export const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  isVisible,
  onClose,
  autoHideDuration = 1500
}) => {
  const [isShowing, setIsShowing] = useState(isVisible);

  useEffect(() => {
    setIsShowing(isVisible);

    if (isVisible && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setIsShowing(false);
        onClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHideDuration, onClose]);

  if (!isShowing) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div 
      className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg text-white ${getBackgroundColor()} z-50 transition-opacity duration-300 ${isShowing ? 'opacity-100' : 'opacity-0'}`} 
      role="alert"
    >
      {message}
    </div>
  );
}; 