import { Language } from './language';

export interface PendingTask {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  apartment?: string;
  title?: string;
  description: string;
  descriptionLanguage?: Language;
  descriptionTranslations?: Record<Language, string>;
  status: string;
  priority?: string;
  sender?: string;
  recipient?: string;
  messageId?: string;
  reporter?: string;
  createdAt?: string;
  updatedAt?: string;
  assigned?: boolean;
  approved?: boolean;
  received?: string;
} 