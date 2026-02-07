'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './QuarterlyReview.module.css';

type Rating = 'exceeds' | 'meets' | 'needs' | 'does-not';
type CalibrationOutcome = 'survived' | 'promoted' | 'pip' | 'terminated';

interface QuarterlyReviewData {
  quarter: number;
  quarterSummary?: {
    quarter: number;
    product_pulse: any;
    quarterly_review: {
      rating: string;
      calibration_outcome: string;
      raw_score: number;
      narrative?: string;
    };
  };
  yearEndReview?: {
    final_rating: string;
    calibration_outcome: string;
    narrative: string;
  };
  game: {
    current_quarter: number;
    metrics_state: Record<string, number>;
  };
}

export default function QuarterlyReview() {
  const router = useRouter();
  const [reviewData, setReviewData] = useState<QuarterlyReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Read quarterly review data from sessionStorage
    const storedRetro = sessionStorage.getItem('lastRetro');
    if (storedRetro) {
      const retro = JSON.parse(storedRetro);
      if (retro.quarterSummary || retro.yearEndReview) {
        setReviewData({
          quarter: retro.completedSprint?.quarter || retro.game?.current_quarter,
          quarterSummary: retro.quarterSummary,
          yearEndReview: retro.yearEndReview,
          game: retro.game
        });
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading || !reviewData) {
    return <div className={styles.pageContainer}>Loading review...</div>;
  }

  const isYearEnd = !!reviewData.yearEndReview;
  const review = isYearEnd ? reviewData.yearEndReview : reviewData.quarterSummary?.quarterly_review;

  if (!review) {
    return <div className={styles.pageContainer}>No review data available.</div>;
  }

  // Year-end review has 'final_rating', quarterly has 'rating'
  const rating = (isYearEnd
    ? (review as { final_rating: string }).final_rating
    : (review as { rating: string }).rating) as Rating;
  const ratingText: Record<Rating, string> = {
    'exceeds': 'Exceeds Expectations',
    'meets': 'Meets Expectations',
    'needs': 'Needs Improvement',
    'does-not': 'Does Not Meet Expectations'
  };

  const calibrationOutcome = review.calibration_outcome as CalibrationOutcome;

  const calibrationText: Record<CalibrationOutcome, string> = {
    survived: 'Survived',
    promoted: 'Promoted',
    pip: 'PIP',
    terminated: 'Terminated'
  };

  const narrative = review.narrative || "Quarter complete. Review your performance and prepare for what's next.";

  const metrics = reviewData.game?.metrics_state || {};
  const finalMetrics = [
    { name: 'Team Sentiment', value: Math.round(metrics.team_sentiment || 50), tier: metrics.team_sentiment >= 60 ? 'positive' : metrics.team_sentiment < 40 ? 'warning' : 'neutral' },
    { name: 'CEO Sentiment', value: Math.round(metrics.ceo_sentiment || 50), tier: metrics.ceo_sentiment >= 60 ? 'positive' : metrics.ceo_sentiment < 40 ? 'warning' : 'neutral' },
    { name: 'Sales Sentiment', value: Math.round(metrics.sales_sentiment || 50), tier: metrics.sales_sentiment >= 60 ? 'positive' : metrics.sales_sentiment < 40 ? 'warning' : 'neutral' },
    { name: 'CTO Sentiment', value: Math.round(metrics.cto_sentiment || 50), tier: metrics.cto_sentiment >= 60 ? 'positive' : metrics.cto_sentiment < 40 ? 'warning' : 'neutral' },
    { name: 'Self-Serve Growth', value: Math.round(metrics.self_serve_growth || 50), tier: metrics.self_serve_growth >= 60 ? 'positive' : metrics.self_serve_growth < 40 ? 'warning' : 'neutral' },
    { name: 'Enterprise Growth', value: Math.round(metrics.enterprise_growth || 50), tier: metrics.enterprise_growth >= 60 ? 'positive' : metrics.enterprise_growth < 40 ? 'warning' : 'neutral' },
    { name: 'Tech Debt', value: Math.round(metrics.tech_debt || 50), tier: metrics.tech_debt >= 60 ? 'warning' : metrics.tech_debt < 40 ? 'positive' : 'neutral' }
  ];

  const calibrationNarrative: Record<CalibrationOutcome, string> = {
    survived: "You survived calibration. Your manager defended your rating, citing your wins this quarter. You're safe for now, but you're not on the 'high performer' list. Next quarter matters.",
    promoted: "Congratulations—you've been promoted! Your consistent delivery on priorities and strong stakeholder relationships put you in the top tier. Next quarter's expectations just went up.",
    pip: "You've been placed on a Performance Improvement Plan. Leadership cited insufficient progress on strategic priorities. You have 90 days to turn this around.",
    terminated: "Your employment has been terminated. Leadership determined that your pattern of performance made you a net negative. Your Slack access has been revoked."
  };

  const handleContinue = () => {
    if (isYearEnd || calibrationOutcome === 'terminated') {
      // Game over - go back to home
      router.replace('/');
    } else {
      // Continue to next quarter
      router.replace('/sprint-planning');
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>PM</div>
            <span className={styles.logoText}>PM Simulator</span>
          </div>
          <div className={styles.quarterBadge}>
            {isYearEnd ? 'Year Complete — Final Review' : `Q${reviewData.quarter} Complete — Review Time`}
          </div>
        </div>
        <div className={styles.topBarRight}>
          <div className={styles.avatar}>S</div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainScroll}>
        <div className={styles.mainInner}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.pageTitle}>
              {isYearEnd ? 'Year-End Performance Review' : 'Quarterly Performance Review'}
            </div>
            <div className={styles.pageSubtitle}>
              {isYearEnd ? '2026 — The final verdict' : `Q${reviewData.quarter} 2026 — The moment of truth`}
            </div>
          </div>

          {/* Rating & Calibration */}
          <div className={styles.twoCol}>
            {/* Performance Rating */}
            <div className={styles.ratingCard}>
              <div className={styles.ratingTierLabel}>Your Rating</div>
              <div className={`${styles.ratingValue} ${styles[`rating${rating.charAt(0).toUpperCase() + rating.slice(1).replace('-', '')}`]}`}>
                {ratingText[rating]}
              </div>
              <div className={styles.ratingBar}>
                <div className={`${styles.ratingBarFill} ${styles[rating]}`} style={{ width: rating === 'meets' ? '60%' : '40%' }}></div>
              </div>
              <div className={styles.ratingSubtext}>Based on quarterly metrics and manager evaluation</div>
            </div>

            {/* Calibration Outcome */}
            <div className={`${styles.calibrationCard} ${styles[calibrationOutcome]}`}>
              <div className={styles.calibrationLabel}>Calibration Outcome</div>
              <div className={styles.calibrationValue}>
                {calibrationText[calibrationOutcome]}
              </div>
              <div className={styles.calibrationDesc}>
                {calibrationNarrative[calibrationOutcome]}
              </div>
            </div>
          </div>

          {/* Quarter Narrative */}
          <div className={styles.sectionLabel}>Quarter Summary</div>
          <div className={styles.narrativeCard}>
            <div className={styles.narrativeText}>{narrative}</div>
          </div>

          {/* Final Metrics */}
          <div className={styles.sectionLabel}>Final Metrics</div>
          <div className={styles.metricsGrid}>
            {finalMetrics.map((metric, index) => (
              <div key={index} className={styles.metricCard}>
                <div className={styles.metricName}>{metric.name}</div>
                <div className={styles.metricValue}>{metric.value}</div>
                <div className={styles.metricBar}>
                  <div className={`${styles.metricBarFill} ${styles[metric.tier]}`} style={{ width: `${metric.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <div className={styles.actionSection}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleContinue}>
              {calibrationOutcome === 'terminated' ? 'Return to Home' :
               isYearEnd ? 'Play Again' : 'Start Next Quarter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
