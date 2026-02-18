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

const loadingMessages = [
  'Syncing with stakeholders...',
  'Updating the JIRA board nobody reads...',
  'Waiting for CI/CD...',
  'Your manager is typing...',
  'Calibrating expectations downward...',
  'Refreshing LinkedIn to see if anyone noticed...',
  'Resolving a merge conflict in the roadmap...',
  'Asking ChatGPT to write your standup notes...',
  'Convincing the designer this is MVP...',
  'Calculating the blast radius...',
  'Checking if anyone read the PRD...',
  'Pretending to understand the architecture diagram...',
  'Running it by legal, just in case...',
  'Sprint planning is easy, they said...',
  'Deploying to production on a Friday...'
];

const pickRandomMessages = (messages: string[], count: number) => {
  const shuffled = [...messages].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export default function Home() {
  const router = useRouter();
  const [hasSaveGame, setHasSaveGame] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pastRuns, setPastRuns] = useState<PastRun[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadingSequence, setLoadingSequence] = useState<string[]>([]);
  const [loadingIndex, setLoadingIndex] = useState(0);

  const formatRunDate = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const mapDifficultyLabel = (difficulty: ApiDifficulty) => {
    const mapping: Record<ApiDifficulty, string> = {
      easy: 'Good Manager',
      normal: 'OK Manager',
      hard: 'Bad Manager'
    };
    return mapping[difficulty] || 'OK Manager';
  };

  const ratingMap: Record<string, { rating: PastRun['rating']; text: string }> = {
    exceeds_expectations: { rating: 'exceeds', text: 'Exceeds Expectations' },
    meets_expectations_strong: { rating: 'meets', text: 'Meets Expectations+' },
    meets_expectations: { rating: 'meets', text: 'Meets Expectations' },
    needs_improvement: { rating: 'needs', text: 'Needs Improvement' },
    does_not_meet_expectations: { rating: 'does-not', text: 'Does Not Meet' }
  };

  const outcomeByRating: Record<PastRun['rating'], string[]> = {
    exceeds: [
      'Got a promotion no one understands',
      'Accidentally became the roadmap',
      'Survived calibration in style'
    ],
    meets: [
      'Survived calibration',
      'Kept the lights on',
      'Stayed off the VP radar'
    ],
    needs: [
      'Sent to the org chart basement',
      'Assigned “stretch” goals',
      'Put on a growth plan'
    ],
    'does-not': [
      'Deactivated on Slack',
      'Reassigned to “special projects”',
      'Exited via calendar invite'
    ]
  };

  const hashString = (value: string) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  };

  const pickOutcome = (rating: PastRun['rating'], seed: string) => {
    const options = outcomeByRating[rating];
    const index = hashString(seed) % options.length;
    return options[index];
  };

  useEffect(() => {
    // Initialize session and check for existing game
    fetch('/api/session/init', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setHasSaveGame(!!data.activeGameId);
        const completedGames = Array.isArray(data.completedGames) ? data.completedGames : [];
        const runs = completedGames
          .filter((game: any) => game && game.completed_at)
          .sort((a: any, b: any) => {
            const aTime = new Date(a.completed_at).getTime();
            const bTime = new Date(b.completed_at).getTime();
            return bTime - aTime;
          })
          .slice(0, 10)
          .map((game: any) => {
            const ratingInfo =
              ratingMap[game.final_rating] ?? ratingMap.meets_expectations;
            const seed = `${game.game_id || ''}-${game.completed_at || ''}`;
            return {
              date: formatRunDate(game.completed_at),
              difficulty: mapDifficultyLabel(game.difficulty as ApiDifficulty),
              rating: ratingInfo.rating,
              ratingText: ratingInfo.text,
              outcome: pickOutcome(ratingInfo.rating, seed)
            };
          });
        setPastRuns(runs);
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
      // Default to normal difficulty (v2: no difficulty selector)
      const response = await fetch('/api/game/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: 'normal' })
      });

      if (response.ok) {
        setIsNavigating(true);
        const sequence = pickRandomMessages(loadingMessages, 4);
        setLoadingSequence(sequence);
        setLoadingIndex(0);

        const interval = window.setInterval(() => {
          setLoadingIndex((index) => (index + 1) % sequence.length);
        }, 1500);

        setTimeout(() => {
          window.clearInterval(interval);
          router.replace('/sprint-planning');
        }, 2000);
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
      setIsNavigating(true);
      const sequence = pickRandomMessages(loadingMessages, 4);
      setLoadingSequence(sequence);
      setLoadingIndex(0);

      const interval = window.setInterval(() => {
        setLoadingIndex((index) => (index + 1) % sequence.length);
      }, 1500);

      setTimeout(() => {
        window.clearInterval(interval);
        router.replace('/sprint-planning');
      }, 2000);
    }
  };

  const activeLoadingMessage =
    loadingSequence[loadingIndex] || loadingMessages[0];

  return (
    <div className={styles.page}>
    <div className={styles.container}>
      {isNavigating && (
        <div className={styles.loadingOverlay} aria-live="polite">
          <div className={styles.loadingCard}>
            <div key={loadingIndex} className={styles.loadingMessage}>
              {activeLoadingMessage}
            </div>
            <div className={styles.loadingProgress}>
              <div className={styles.loadingProgressBar}></div>
            </div>
          </div>
        </div>
      )}
      {/* Title */}
      <div className={styles.titleBlock}>
        <div className={styles.titleSub}>Product Management</div>
        <div className={styles.titleMain}>SIMULATOR</div>
      </div>

      {/* Tagline */}
      <div className={styles.tagline}>
        Every decision shapes your destiny. Build the best product or get deactivated on Slack.
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
            <span>Final Rating</span>
          </div>

          {pastRuns.length > 0 ? (
            pastRuns.map((run, index) => (
              <div
                key={index}
                className={styles.pastRunRow}
                title={run.outcome}
              >
                <span className={styles.runDate}>{run.date}</span>
                <span className={`${styles.runRating} ${styles[`rating${run.rating.charAt(0).toUpperCase() + run.rating.slice(1).replace('-', '')}`]}`}>
                  {run.ratingText}
                </span>
              </div>
            ))
          ) : (
            <div className={styles.pastRunsEmpty}>
              No completed runs yet. Your permanent record is spotless. For now.
            </div>
          )}
        </div>
      </div>

      <div className={styles.versionTag}>v2.0 — now with real-time feedback</div>

      {/* Settings Icon */}
      <div className={styles.settingsIcon}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      </div>
    </div>
    </div>
  );
}
