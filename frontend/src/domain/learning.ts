import { LanguageCode } from './languages';
import { PhraseCard } from './phraseCard';

export type LearningModuleKey = 'translator' | 'phrasebook' | 'lessons' | 'grammar';

export interface LearnerLanguagePair {
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
}

export interface TranslatorTurn {
  id: string;
  speaker: 'learner' | 'local';
  sourceText: string;
  translatedText: string;
  createdAt: string;
}

export interface TranslatorSessionSummary {
  id: string;
  title: string;
  situation: string;
  pair: LearnerLanguagePair;
  turns: TranslatorTurn[];
}

export interface LessonSummary {
  id: string;
  title: string;
  scenario: string;
  level: 'beginner';
  durationMinutes: number;
  outcomes: string[];
}

export interface GrammarTopic {
  id: string;
  title: string;
  summary: string;
  example: string;
  useCase: string;
}

export interface ModulePreview {
  key: LearningModuleKey;
  title: string;
  description: string;
  status: 'ready-now' | 'next-up';
}

export interface DashboardOverview {
  learnerPair: LearnerLanguagePair;
  modules: ModulePreview[];
  translatorSession: TranslatorSessionSummary;
  phraseCards: PhraseCard[];
  lessons: LessonSummary[];
  grammarTopics: GrammarTopic[];
}
