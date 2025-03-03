import { TaskStatus } from '../types/task';

/**
 * Returnerar CSS-klasser för bakgrundsfärg och textfärg för angiven uppgiftsstatus
 * @param status Uppgiftsstatus
 * @returns CSS-klassnamn för färgsättning
 */
export const getStatusColor = (status: string): string => {
  // Kontrollera att statusen är en sträng
  if (!status || typeof status !== 'string') {
    console.warn('Status är inte en giltig sträng:', status);
    return 'bg-slate-500 text-white';
  }
  
  // Hantera strängar från backend som kan vara lite annorlunda formaterade
  const normalizedStatus = status.toUpperCase().replace(/\s+/g, '_');
  
  switch (normalizedStatus) {
    case TaskStatus.PENDING:
      return 'bg-yellow-500 text-yellow-950';
    case TaskStatus.IN_PROGRESS:
      return 'bg-blue-500 text-white';
    case TaskStatus.NOT_FEASIBLE:
      return 'bg-red-500 text-white';
    case TaskStatus.COMPLETED:
      return 'bg-green-500 text-white';
    case TaskStatus.APPROVED:
      return 'bg-emerald-500 text-white';
    case TaskStatus.REJECTED:
      return 'bg-destructive text-white';
    default:
      console.warn(`Okänd status: '${status}', normaliserad: '${normalizedStatus}'`);
      return 'bg-slate-500 text-white';
  }
};

/**
 * Returnerar CSS-klasser för bakgrundsfärg och textfärg för angiven uppgiftsstatus med varierande opacitet
 * @param status Uppgiftsstatus
 * @returns CSS-klassnamn för färgsättning
 */
export const getStatusColorWithOpacity = (status: string): string => {
  // Logga för att debugga statusvärdet
  console.log(`getStatusColorWithOpacity anropad med status: '${status}', typeof: ${typeof status}`);
  
  // Kontrollera att statusen är en sträng
  if (!status || typeof status !== 'string') {
    console.warn('Status är inte en giltig sträng:', status);
    return `bg-slate-500 text-white`;
  }
  
  // Hantera strängar från backend som kan vara lite annorlunda formaterade
  const normalizedStatus = status.toUpperCase().replace(/\s+/g, '_');
  console.log('Normaliserad status:', normalizedStatus);
  
  switch (normalizedStatus) {
    case TaskStatus.PENDING:
      return `bg-yellow-500 text-yellow-950`;
    case TaskStatus.IN_PROGRESS:
      return `bg-blue-500 text-white`;
    case TaskStatus.NOT_FEASIBLE:
      return `bg-red-500 text-white`;
    case TaskStatus.COMPLETED:
      return `bg-green-500 text-white`;
    case TaskStatus.APPROVED:
      return `bg-emerald-500 text-white`;
    case TaskStatus.REJECTED:
      return `bg-destructive text-white`;
    default:
      console.warn(`Okänd status: '${status}', normaliserad: '${normalizedStatus}'`);
      return `bg-slate-500 text-white`;
  }
};

/**
 * Returnerar CSS-klasser för kantefärg baserat på uppgiftsstatus
 * @param status Uppgiftsstatus
 * @returns CSS-klassnamn för färgsättning av kanter
 */
export const getStatusBorderColor = (status: string): string => {
  // Kontrollera att statusen är en sträng
  if (!status || typeof status !== 'string') {
    return 'border-slate-500';
  }
  
  // Hantera strängar från backend som kan vara lite annorlunda formaterade
  const normalizedStatus = status.toUpperCase().replace(/\s+/g, '_');
  
  switch (normalizedStatus) {
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