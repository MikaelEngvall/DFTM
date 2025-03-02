import React, { PropsWithChildren } from 'react';
import { FiX } from 'react-icons/fi';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  closeOnClickOutside?: boolean;
}

export const Dialog: React.FC<PropsWithChildren<DialogProps>> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
  closeOnClickOutside = true
}) => {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    'full': 'max-w-full'
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnClickOutside) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white dark:bg-card w-full ${maxWidthClasses[maxWidth]} rounded-lg shadow-lg overflow-hidden transform transition-all`}>
        {title && (
          <div className="flex justify-between items-center p-4 border-b dark:border-border">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-foreground/10 focus:outline-none"
              aria-label="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        )}
        
        <div className="p-4">
          {children}
        </div>
        
        {footer && (
          <div className="p-4 flex justify-end gap-2 border-t dark:border-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}; 