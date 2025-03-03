import React from 'react';
import { getStatusColor } from '../../utils/statusColors';
import { TaskStatus } from '../../types/task';
import { useTranslation } from 'react-i18next';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * En komponent som visar en färgkodad badge för uppgiftsstatus
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status,
  size = 'md',
  className = ''
}) => {
  const { t } = useTranslation();
  
  // Bestäm padding baserat på storlek
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };
  
  // Hämta uppgiftsstatusens översättningsnyckel
  const getStatusKey = (status: string): string => {
    switch (status) {
      case TaskStatus.PENDING:
        return 'task.status.pending';
      case TaskStatus.IN_PROGRESS:
        return 'task.status.inProgress';
      case TaskStatus.NOT_FEASIBLE:
        return 'task.status.notFeasible';
      case TaskStatus.COMPLETED:
        return 'task.status.completed';
      case TaskStatus.APPROVED:
        return 'task.status.approved';
      case TaskStatus.REJECTED:
        return 'task.status.rejected';
      default:
        return 'task.status.unknown';
    }
  };
  
  return (
    <span className={`rounded font-medium ${getStatusColor(status)} ${sizeClasses[size]} ${className}`}>
      {t(getStatusKey(status))}
    </span>
  );
}; 