'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Home.module.css';

interface PastRun {
  date: string;
  difficulty: string;
  rating: 'exceeds' | 'meets' | 'needs' | 'does-not';
  ratingText: string;
  outcome: string;
}

type Difficulty = 'good' | 'ok' | 'bad';
type ApiDifficulty = 'easy' | 'normal' | 'hard';

export default function Home() {
  const router = useRouter();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('ok');
  const [hasSaveGame, setHasSaveGame] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pastRuns: PastRun[] = [
    {
      date: 'Jan 28, 2026',
      difficulty: 'OK Manager',
      rating: 'meets',
      ratingText: 'Meets Expectations',
      outcome: 'Survived calibration'
    },
    {
      date: 'Jan 15, 2026',
      difficulty: 'Bad Manager',
      rating: 'does-not',
      ratingText: 'Does Not Meet',
      outcome: 'Deactivated on Slack'
    },
    {
      date: 'Jan 3, 2026',
      difficulty: 'Good Manager',
      rating: 'exceeds',
      ratingText: 'Exceeds Expectations',
      outcome: 'Got lucky in calibration'
    }
  ];

  useEffect(() => {
    // Initialize session and check for existing game
    fetch('/api/session/init', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setHasSaveGame(!!data.activeGameId);
      })
      .catch(console.error);
  }, []);

  const mapDifficultyToApi = (uiDifficulty: Difficulty): ApiDifficulty => {
    const mapping: Record<Difficulty, ApiDifficulty> = {
      'good': 'easy',
      'ok': 'normal',
      'bad': 'hard'
    };
    return mapping[uiDifficulty];
  };

  const handleNewGame = async () => {
    setIsLoading(true);
    try {
      const apiDifficulty = mapDifficultyToApi(selectedDifficulty);
      const response = await fetch('/api/game/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: apiDifficulty })
      });

      if (response.ok) {
        router.push('/sprint-planning');
      } else {
        console.error('Failed to create game');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error creating game:', error);
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (hasSaveGame) {
      router.push('/sprint-planning');
    }
  };

  return (
    <div className={styles.container}>
      {/* Title */}
      <div className={styles.titleBlock}>
        <div className={styles.titleSub}>Product Management</div>
        <div className={styles.titleMain}>SIMULATOR</div>
      </div>

      {/* Tagline */}
      <div className={styles.tagline}>
        The game where your performance review has a <em>casual relationship</em>
        {' '}with your actual performance. Make decisions, manage stakeholders, and discover
        that doing everything right is no guarantee of anything.
        Will you cement your legacy or get deactivated on Slack?
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleNewGame}
          disabled={isLoading}
        >
          {isLoading ? 'Starting...' : 'New Game'}
        </button>
        {hasSaveGame ? (
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleContinue}>
            Continue
          </button>
        ) : (
          <button className={`${styles.btn} ${styles.btnDisabled}`} disabled>
            Continue
          </button>
        )}
      </div>

      {/* Difficulty Selection */}
      <div className={styles.difficultySection}>
        <div className={styles.sectionLabel}>Choose your manager</div>

        <div className={styles.difficultyCards}>
          {/* Easy */}
          <div
            className={`${styles.diffCard} ${selectedDifficulty === 'good' ? styles.selected : ''}`}
            onClick={() => setSelectedDifficulty('good')}
          >
            <div className={styles.diffCardTitle}>Good Manager</div>
            <div className={styles.diffCardDifficulty}>Easy</div>
            <div className={styles.diffCardDesc}>
              A gentle introduction. Your manager actively sets you up for success,
              shields you from politics, and only changes priorities when absolutely necessary.
              You'll still lose. It'll just feel less personal.
            </div>
          </div>

          {/* Normal */}
          <div
            className={`${styles.diffCard} ${selectedDifficulty === 'ok' ? styles.selected : ''}`}
            onClick={() => setSelectedDifficulty('ok')}
          >
            <div className={styles.diffCardTitle}>OK Manager</div>
            <div className={styles.diffCardDifficulty}>Normal</div>
            <div className={styles.diffCardTag}>Recommended</div>
            <div className={styles.diffCardDesc}>
              The standard PM experience. Your manager keeps things steady,
              mostly remembers your name, and forwards you calendar invites
              without context. Priorities shift. Nobody explains why.
            </div>
          </div>

          {/* Hard */}
          <div
            className={`${styles.diffCard} ${selectedDifficulty === 'bad' ? styles.selected : ''}`}
            onClick={() => setSelectedDifficulty('bad')}
          >
            <div className={styles.diffCardTitle}>Bad Manager</div>
            <div className={styles.diffCardDifficulty}>Hard</div>
            <div className={styles.diffCardDesc}>
              For seasoned PMs. Your manager is literally and figuratively out to lunch.
              Priorities change based on LinkedIn posts. Tech debt starts high.
              Your team is already tired. Good luck.
            </div>
          </div>
        </div>
      </div>

      {/* Past Runs */}
      <div className={styles.pastRunsSection}>
        <div className={styles.pastRunsHeader}>
          <div className={styles.pastRunsLine}></div>
          <div className={styles.pastRunsTitle}>Past Runs</div>
          <div className={styles.pastRunsLine}></div>
        </div>

        <div className={styles.pastRunsTable}>
          <div className={`${styles.pastRunRow} ${styles.header}`}>
            <span>Date</span>
            <span>Difficulty</span>
            <span>Final Rating</span>
            <span></span>
          </div>

          {pastRuns.length > 0 ? (
            pastRuns.map((run, index) => (
              <div key={index} className={styles.pastRunRow}>
                <span className={styles.runDate}>{run.date}</span>
                <span className={styles.runDifficulty}>{run.difficulty}</span>
                <span className={`${styles.runRating} ${styles[`rating${run.rating.charAt(0).toUpperCase() + run.rating.slice(1).replace('-', '')}`]}`}>
                  {run.ratingText}
                </span>
                <span className={styles.runOutcome}>{run.outcome}</span>
              </div>
            ))
          ) : (
            <div className={styles.pastRunsEmpty}>
              No completed runs yet. Your permanent record is spotless. For now.
            </div>
          )}
        </div>
      </div>

      <div className={styles.versionTag}>v1.0 — your decisions matter (loosely)</div>

      {/* Settings Icon */}
      <div className={styles.settingsIcon}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      </div>
    </div>
  );
}
