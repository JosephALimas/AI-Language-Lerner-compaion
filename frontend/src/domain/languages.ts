export type LanguageCode = 'es' | 'de' | 'en' | 'it';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  locale: string;
}

export const supportedLanguages: LanguageOption[] = [
  { code: 'es', name: 'Spanish', nativeName: 'Espanol', locale: 'es-ES' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', locale: 'de-DE' },
  { code: 'en', name: 'English', nativeName: 'English', locale: 'en-US' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', locale: 'it-IT' },
];

export const defaultLanguagePair = {
  source: 'es' as LanguageCode,
  target: 'de' as LanguageCode,
};
