import { Language } from './language';

export interface PendingTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  sender: string;
  recipient: string;
  messageId: string;
  reporter: string;
  createdAt: string;
  updatedAt: string;
  assigned: boolean;
  approved: boolean;
  originalLanguage: Language;
  titleTranslations: Record<Language, string>;
  descriptionTranslations: Record<Language, string>;
} 