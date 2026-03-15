import React, { useEffect, useState } from 'react';
import { DashboardOverview } from '../domain/learning';
import { supportedLanguages } from '../domain/languages';
import { learningContentService } from '../services/learningContent';

const getLanguageLabel = (code: string) =>
  supportedLanguages.find((language) => language.code === code)?.nativeName ?? code;

const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadOverview = async () => {
      try {
        const data = await learningContentService.getDashboardOverview();
        if (active) {
          setOverview(data);
        }
      } catch {
        if (active) {
          setError('We could not load the learning workspace.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadOverview();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="loading">Loading your learning workspace...</div>;
  }

  if (error || !overview) {
    return <div className="error-message">{error ?? 'Learning workspace unavailable.'}</div>;
  }

  const pairLabel = `${getLanguageLabel(overview.learnerPair.sourceLanguage)} to ${getLanguageLabel(overview.learnerPair.targetLanguage)}`;

  return (
    <div className="dashboard">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">AI Language Companion</p>
          <h2>Learn the language you need for real life.</h2>
          <p className="hero-copy">
            The current MVP foundation is optimized for Spanish-speaking learners building practical German skills for travel, study, and settling in.
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-label">Primary pair</span>
            <strong>{pairLabel}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Platform direction</span>
            <strong>Web-first, modular, AI-ready</strong>
          </div>
        </div>
      </section>

      <section className="module-grid">
        {overview.modules.map((module) => (
          <article key={module.key} className="module-card">
            <div className="module-card-header">
              <h3>{module.title}</h3>
              <span className={`status-pill ${module.status}`}>{module.status === 'ready-now' ? 'MVP' : 'Next'}</span>
            </div>
            <p>{module.description}</p>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="content-panel">
          <div className="panel-header">
            <h3>Translator flow</h3>
            <span>{overview.translatorSession.title}</span>
          </div>
          <p className="panel-intro">{overview.translatorSession.situation}</p>
          <div className="conversation-list">
            {overview.translatorSession.turns.map((turn) => (
              <div key={turn.id} className={`conversation-turn ${turn.speaker}`}>
                <span className="turn-role">{turn.speaker === 'learner' ? 'Learner' : 'Local speaker'}</span>
                <p>{turn.sourceText}</p>
                <strong>{turn.translatedText}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="content-panel">
          <div className="panel-header">
            <h3>Phrase cards</h3>
            <span>Practical situations</span>
          </div>
          <div className="stack-list">
            {overview.phraseCards.map((card) => (
              <div key={card.id} className="stack-card">
                <span className="stack-meta">{card.category} | {card.situation}</span>
                <p>{card.sourceText}</p>
                <strong>{card.targetText}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="content-panel">
          <div className="panel-header">
            <h3>Scenario lessons</h3>
            <span>Guided progression</span>
          </div>
          <div className="stack-list">
            {overview.lessons.map((lesson) => (
              <div key={lesson.id} className="stack-card">
                <span className="stack-meta">{lesson.durationMinutes} min | {lesson.level}</span>
                <p>{lesson.title}</p>
                <strong>{lesson.scenario}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="content-panel">
          <div className="panel-header">
            <h3>Grammar guidance</h3>
            <span>Plain language support</span>
          </div>
          <div className="stack-list">
            {overview.grammarTopics.map((topic) => (
              <div key={topic.id} className="stack-card">
                <span className="stack-meta">{topic.useCase}</span>
                <p>{topic.title}</p>
                <strong>{topic.summary}</strong>
                <small>{topic.example}</small>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};

export default Dashboard;
