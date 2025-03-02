import React from 'react';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'medium', 
  className = ''
}) => {
  const sizeMap = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <div className={`${className}`}>
      <div className={`animate-spin rounded-full border-2 border-t-transparent border-primary ${sizeMap[size]}`}></div>
    </div>
  );
}; 