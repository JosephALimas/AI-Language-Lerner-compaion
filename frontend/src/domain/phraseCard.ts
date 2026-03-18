import { LanguageCode } from './languages';

export type PhraseCardLevel = 'beginner' | 'intermediate' | 'advanced';

export interface PhraseCard {
  id: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  category: string;
  phraseText: string;
  translatedText: string;
  pronunciationGuide?: string;
  usageNotes?: string;
  level: PhraseCardLevel;
  isSystemProvided: boolean;
}

export const phraseCardCategories = [
  'all',
  'greetings',
  'directions',
  'restaurant',
  'transport',
  'emergencies',
  'shopping',
  'lodging',
  'study_daily_life',
] as const;

export const phraseCardLevels: Array<{ value: PhraseCardLevel; label: string }> = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];
