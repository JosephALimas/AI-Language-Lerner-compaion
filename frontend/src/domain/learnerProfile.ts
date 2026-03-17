import { LanguageCode, supportedLanguages } from './languages';

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';
export type LearningGoal =
  | 'travel'
  | 'study_abroad'
  | 'living_abroad'
  | 'tourism'
  | 'business'
  | 'other';

export interface LearnerProfile {
  userId: string;
  nativeLanguage: LanguageCode;
  learningLanguage: LanguageCode;
  interfaceLanguage: LanguageCode;
  proficiencyLevel: ProficiencyLevel;
  learningGoal: LearningGoal;
}

export const proficiencyLevelOptions: Array<{ value: ProficiencyLevel; label: string }> = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const learningGoalOptions: Array<{ value: LearningGoal; label: string }> = [
  { value: 'travel', label: 'Travel' },
  { value: 'study_abroad', label: 'Study abroad' },
  { value: 'living_abroad', label: 'Living abroad' },
  { value: 'tourism', label: 'Tourism' },
  { value: 'business', label: 'Business' },
  { value: 'other', label: 'Other' },
];

export const languageOptions = supportedLanguages.map((language) => ({
  value: language.code,
  label: `${language.name} (${language.nativeName})`,
}));

export const defaultLearnerProfile = (userId = ''): LearnerProfile => ({
  userId,
  nativeLanguage: 'es',
  learningLanguage: 'de',
  interfaceLanguage: 'es',
  proficiencyLevel: 'beginner',
  learningGoal: 'travel',
});
