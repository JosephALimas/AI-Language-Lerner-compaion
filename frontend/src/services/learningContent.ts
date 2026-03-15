import { DashboardOverview } from '../domain/learning';
import { defaultLanguagePair } from '../domain/languages';

const overview: DashboardOverview = {
  learnerPair: {
    sourceLanguage: defaultLanguagePair.source,
    targetLanguage: defaultLanguagePair.target,
  },
  modules: [
    {
      key: 'translator',
      title: 'Real-time translator',
      description: 'Conversation-first translation for travel, housing, study, and urgent situations.',
      status: 'ready-now',
    },
    {
      key: 'phrasebook',
      title: 'Phrase cards',
      description: 'Quick practical phrases that can later feed directly into translator sessions.',
      status: 'ready-now',
    },
    {
      key: 'lessons',
      title: 'Scenario lessons',
      description: 'Short guided practice built around real situations instead of abstract drills.',
      status: 'ready-now',
    },
    {
      key: 'grammar',
      title: 'Useful grammar',
      description: 'Beginner-friendly sentence structure help connected to everyday communication.',
      status: 'next-up',
    },
  ],
  translatorSession: {
    id: 'arrival-checkin',
    title: 'Airport check-in support',
    situation: 'Traveler needs to confirm documents, baggage, and boarding details.',
    pair: {
      sourceLanguage: defaultLanguagePair.source,
      targetLanguage: defaultLanguagePair.target,
    },
    turns: [
      {
        id: 'turn-1',
        speaker: 'learner',
        sourceText: 'Necesito ayuda para encontrar mi puerta de embarque.',
        translatedText: 'Ich brauche Hilfe, um mein Abfluggate zu finden.',
        createdAt: '2026-03-14T18:00:00.000Z',
      },
      {
        id: 'turn-2',
        speaker: 'local',
        sourceText: 'Gehen Sie geradeaus und dann nach links.',
        translatedText: 'Siga recto y luego a la izquierda.',
        createdAt: '2026-03-14T18:01:00.000Z',
      },
    ],
  },
  phraseCards: [
    {
      id: 'housing-1',
      category: 'Housing',
      situation: 'Apartment viewing',
      sourceText: 'El alquiler incluye agua y electricidad?',
      targetText: 'Sind Wasser und Strom in der Miete enthalten?',
    },
    {
      id: 'emergency-1',
      category: 'Emergency',
      situation: 'Medical help',
      sourceText: 'Necesito un medico lo antes posible.',
      targetText: 'Ich brauche so schnell wie moglich einen Arzt.',
    },
    {
      id: 'study-1',
      category: 'Study',
      situation: 'University office',
      sourceText: 'Donde puedo entregar estos documentos?',
      targetText: 'Wo kann ich diese Unterlagen abgeben?',
    },
  ],
  lessons: [
    {
      id: 'lesson-arrival',
      title: 'Your first 24 hours',
      scenario: 'Airport, transport, and finding your accommodation',
      level: 'beginner',
      durationMinutes: 12,
      outcomes: ['Ask for directions', 'Confirm bookings', 'Handle basic transport questions'],
    },
    {
      id: 'lesson-shopping',
      title: 'Buy essentials',
      scenario: 'Pharmacy, supermarket, and payment basics',
      level: 'beginner',
      durationMinutes: 10,
      outcomes: ['Ask for products', 'Understand quantities', 'Pay with confidence'],
    },
  ],
  grammarTopics: [
    {
      id: 'grammar-word-order',
      title: 'Simple statement word order',
      summary: 'Start with short subject + verb + detail patterns to communicate clearly.',
      example: 'Ich brauche ein Ticket. / Necesito un boleto.',
      useCase: 'Useful for purchases, requests, and transport.',
    },
    {
      id: 'grammar-questions',
      title: 'Survival questions',
      summary: 'Learn a few question starters and reuse them across many real situations.',
      example: 'Wo ist...? / Donde esta...?',
      useCase: 'Useful for navigation, help, and check-ins.',
    },
  ],
};

export const learningContentService = {
  async getDashboardOverview(): Promise<DashboardOverview> {
    return overview;
  },
};
