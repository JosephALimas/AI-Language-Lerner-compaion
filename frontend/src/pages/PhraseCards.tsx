import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { learnerProfileApi, phraseCardsApi } from '../services/api';
import { defaultLearnerProfile } from '../domain/learnerProfile';
import { phraseCardCategories, phraseCardLevels, PhraseCard, PhraseCardLevel } from '../domain/phraseCard';
import { supportedLanguages } from '../domain/languages';

const getLanguageLabel = (code: string) =>
  supportedLanguages.find((language) => language.code === code)?.nativeName ?? code;

const formatCategoryLabel = (value: string) => value.replace(/_/g, ' ');

const PhraseCardsPage: React.FC = () => {
  const { token } = useAuth();
  const [cards, setCards] = useState<PhraseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<(typeof phraseCardCategories)[number]>('all');
  const [level, setLevel] = useState<PhraseCardLevel | 'all'>('all');
  const [pairLabel, setPairLabel] = useState('');

  useEffect(() => {
    let active = true;

    const loadCards = async () => {
      if (!token) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const learnerProfile = (await learnerProfileApi.getLearnerProfile(token)).learnerProfile;
        const response = await phraseCardsApi.getPhraseCards(token, {
          category,
          level: level === 'all' ? undefined : level,
        });

        if (!active) {
          return;
        }

        setCards(response.phraseCards);
        setPairLabel(
          `${getLanguageLabel(learnerProfile.nativeLanguage)} to ${getLanguageLabel(learnerProfile.learningLanguage)}`,
        );
      } catch (loadError) {
        if (active) {
          setError('We could not load phrase cards right now.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCards();

    return () => {
      active = false;
    };
  }, [category, level, token]);

  if (loading) {
    return <div className="loading">Loading phrase cards...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="phrasebook-page">
      <section className="content-panel">
        <div className="panel-header">
          <h2>Phrase cards</h2>
          <span>{pairLabel || `${getLanguageLabel(defaultLearnerProfile().nativeLanguage)} to ${getLanguageLabel(defaultLearnerProfile().learningLanguage)}`}</span>
        </div>
        <p className="panel-intro">
          Practical survival phrases for travel, daily errands, lodging, study, and urgent situations.
        </p>

        <div className="phrasebook-filters">
          <div className="form-group">
            <label htmlFor="phrase-category">Category</label>
            <select
              id="phrase-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as (typeof phraseCardCategories)[number])}
            >
              {phraseCardCategories.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All categories' : formatCategoryLabel(option)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="phrase-level">Level</label>
            <select
              id="phrase-level"
              value={level}
              onChange={(event) => setLevel(event.target.value as PhraseCardLevel | 'all')}
            >
              <option value="all">All levels</option>
              {phraseCardLevels.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="phrase-card-grid">
        {cards.map((card) => (
          <article key={card.id} className="content-panel">
            <div className="panel-header">
              <h3>{formatCategoryLabel(card.category)}</h3>
              <span>{card.level}</span>
            </div>
            <p>{card.phraseText}</p>
            <strong>{card.translatedText}</strong>
            {card.pronunciationGuide && <small>Pronunciation: {card.pronunciationGuide}</small>}
            {card.usageNotes && <small>Usage: {card.usageNotes}</small>}
          </article>
        ))}
      </section>
    </div>
  );
};

export default PhraseCardsPage;
