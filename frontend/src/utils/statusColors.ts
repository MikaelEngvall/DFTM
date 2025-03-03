import { TaskStatus } from '../types/task';

/**
 * Returnerar CSS-klasser för bakgrundsfärg och textfärg för angiven uppgiftsstatus
 * @param status Uppgiftsstatus
 * @returns CSS-klassnamn för färgsättning
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case TaskStatus.PENDING:
      return 'bg-yellow-500 text-yellow-950';
    case TaskStatus.IN_PROGRESS:
      return 'bg-blue-500 text-blue-950';
    case TaskStatus.NOT_FEASIBLE:
      return 'bg-red-500 text-red-950';
    case TaskStatus.COMPLETED:
      return 'bg-green-500 text-green-950';
    case TaskStatus.APPROVED:
      return 'bg-emerald-500 text-emerald-950';
    case TaskStatus.REJECTED:
      return 'bg-destructive text-destructive-foreground';
    default:
      return 'bg-slate-500 text-slate-950';
  }
};

/**
 * Returnerar CSS-klasser för bakgrundsfärg och textfärg för angiven uppgiftsstatus med varierande opacitet
 * @param status Uppgiftsstatus
 * @param opacity Opacitet för bakgrunden (0-100)
 * @returns CSS-klassnamn för färgsättning
 */
export const getStatusColorWithOpacity = (status: string, opacity: number = 60): string => {
  switch (status) {
    case TaskStatus.PENDING:
      return `bg-yellow-500/${opacity} text-yellow-950`;
    case TaskStatus.IN_PROGRESS:
      return `bg-blue-500/${opacity} text-blue-950`;
    case TaskStatus.NOT_FEASIBLE:
      return `bg-red-500/${opacity} text-red-950`;
    case TaskStatus.COMPLETED:
      return `bg-green-500/${opacity} text-green-950`;
    case TaskStatus.APPROVED:
      return `bg-emerald-500/${opacity} text-emerald-950`;
    case TaskStatus.REJECTED:
      return `bg-destructive/${opacity} text-destructive-foreground`;
    default:
      return `bg-slate-500/${opacity} text-slate-950`;
  }
};

/**
 * Returnerar CSS-klasser för kantefärg baserat på uppgiftsstatus
 * @param status Uppgiftsstatus
 * @returns CSS-klassnamn för färgsättning av kanter
 */
export const getStatusBorderColor = (status: string): string => {
  switch (status) {
    case TaskStatus.PENDING:
      return 'border-yellow-500';
    case TaskStatus.IN_PROGRESS:
      return 'border-blue-500';
    case TaskStatus.NOT_FEASIBLE:
      return 'border-red-500';
    case TaskStatus.COMPLETED:
      return 'border-green-500';
    case TaskStatus.APPROVED:
      return 'border-emerald-500';
    case TaskStatus.REJECTED:
      return 'border-destructive';
    default:
      return 'border-slate-500';
  }
}; 