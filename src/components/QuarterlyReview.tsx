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
    difficulty?: string;
    metric_targets?: Record<string, number> | null;
  };
}

const REVIEW_TARGETS: Record<string, Record<string, number>> = {
  easy: { team_sentiment: 65, ceo_sentiment: 65, sales_sentiment: 60, cto_sentiment: 60, self_serve_growth: 60, enterprise_growth: 60, tech_debt: 35, nps: 60 },
  normal: { team_sentiment: 60, ceo_sentiment: 60, sales_sentiment: 55, cto_sentiment: 55, self_serve_growth: 55, enterprise_growth: 55, tech_debt: 40, nps: 55 },
  hard: { team_sentiment: 55, ceo_sentiment: 55, sales_sentiment: 50, cto_sentiment: 50, self_serve_growth: 50, enterprise_growth: 50, tech_debt: 45, nps: 50 }
};

export default function QuarterlyReview() {
  const router = useRouter();
  const [reviewData, setReviewData] = useState<QuarterlyReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Read quarterly review data from sessionStorage
    console.log('=== QUARTERLY REVIEW DEBUG START ===');
    const storedRetro = sessionStorage.getItem('lastRetro');
    console.log('1. Raw sessionStorage data:', storedRetro);

    if (storedRetro) {
      const retro = JSON.parse(storedRetro);
      console.log('2. Parsed retro object:', retro);
      console.log('3. Has quarterSummary?', !!retro.quarterSummary);
      console.log('4. Has yearEndReview?', !!retro.yearEndReview);
      console.log('5. quarterSummary content:', retro.quarterSummary);
      console.log('6. yearEndReview content:', retro.yearEndReview);

      if (retro.quarterSummary || retro.yearEndReview) {
        const reviewDataObj = {
          quarter: retro.completedSprint?.quarter || retro.game?.current_quarter,
          quarterSummary: retro.quarterSummary,
          yearEndReview: retro.yearEndReview,
          game: retro.game
        };
        console.log('7. Setting reviewData to:', reviewDataObj);
        setReviewData(reviewDataObj);
      } else {
        console.log('8. No quarterSummary or yearEndReview found!');
      }
    } else {
      console.log('9. No sessionStorage data found!');
    }
    console.log('=== QUARTERLY REVIEW DEBUG END ===');
    setIsLoading(false);
  }, []);

  if (isLoading || !reviewData) {
    return <div className={styles.pageContainer}>Loading review...</div>;
  }

  const isYearEnd = !!reviewData.yearEndReview;
  const review = isYearEnd ? reviewData.yearEndReview : reviewData.quarterSummary?.quarterly_review;

  console.log('=== REVIEW EXTRACTION ===');
  console.log('10. isYearEnd:', isYearEnd);
  console.log('11. review object:', review);
  console.log('12. reviewData.yearEndReview:', reviewData.yearEndReview);
  console.log('13. reviewData.quarterSummary:', reviewData.quarterSummary);

  if (!review) {
    console.log('14. No review object - returning early!');
    return <div className={styles.pageContainer}>No review data available.</div>;
  }

  // Year-end review has 'final_rating', quarterly has 'rating'
  const ratingValue = isYearEnd
    ? (review as any).final_rating
    : (review as any).rating;

  console.log('15. Rating value extracted:', ratingValue);

  // Map backend ratings to frontend Rating type
  const mapRating = (backendRating: string): Rating => {
    // Quarterly ratings: "strong" | "solid" | "mixed" | "below_expectations"
    if (backendRating === 'strong') return 'exceeds';
    if (backendRating === 'solid') return 'meets';
    if (backendRating === 'mixed') return 'meets';
    if (backendRating === 'below_expectations') return 'needs';

    // Year-end ratings: "exceeds_expectations" | "meets_expectations_strong" | "meets_expectations" | "needs_improvement" | "does_not_meet_expectations"
    if (backendRating === 'exceeds_expectations') return 'exceeds';
    if (backendRating === 'meets_expectations_strong') return 'meets';
    if (backendRating === 'meets_expectations') return 'meets';
    if (backendRating === 'needs_improvement') return 'needs';
    if (backendRating === 'does_not_meet_expectations') return 'does-not';

    // Fallback
    return 'meets';
  };

  const rating = mapRating(ratingValue || '');
  console.log('16. Final rating (after mapping):', rating);

  const ratingText: Record<Rating, string> = {
    'exceeds': 'Exceeds Expectations',
    'meets': 'Meets Expectations',
    'needs': 'Needs Improvement',
    'does-not': 'Does Not Meet Expectations'
  };

  // TODO: Backend doesn't calculate calibration_outcome yet - needs to be added to computeQuarterlyReview/computeYearEndReview
  const calibrationValue = (review as any).calibration_outcome;
  console.log('17. Calibration value extracted:', calibrationValue);

  // Default to 'survived' until backend implements calibration logic
  const calibrationOutcome = (calibrationValue || 'survived') as CalibrationOutcome;
  console.log('18. Final calibration outcome (with fallback):', calibrationOutcome);
  console.log('=== REVIEW EXTRACTION END ===');

  const calibrationText: Record<CalibrationOutcome, string> = {
    survived: 'Survived',
    promoted: 'Promoted',
    pip: 'PIP',
    terminated: 'Terminated'
  };

  const narrative = review.narrative || "Quarter complete. Review your performance and prepare for what's next.";

  const metrics = reviewData.game?.metrics_state || {};
  // Resolve targets: prefer stored metric_targets, fall back to difficulty table
  const gameTargets: Record<string, number> =
    (reviewData.game?.metric_targets as Record<string, number> | null) ??
    REVIEW_TARGETS[reviewData.game?.difficulty ?? 'normal'] ??
    REVIEW_TARGETS.normal;

  const finalMetrics = [
    { name: 'Team Sentiment', key: 'team_sentiment', value: Math.round(metrics.team_sentiment || 50), tier: metrics.team_sentiment >= 60 ? 'positive' : metrics.team_sentiment < 40 ? 'warning' : 'neutral', targetValue: gameTargets.team_sentiment },
    { name: 'CEO Sentiment', key: 'ceo_sentiment', value: Math.round(metrics.ceo_sentiment || 50), tier: metrics.ceo_sentiment >= 60 ? 'positive' : metrics.ceo_sentiment < 40 ? 'warning' : 'neutral', targetValue: gameTargets.ceo_sentiment },
    { name: 'Sales Sentiment', key: 'sales_sentiment', value: Math.round(metrics.sales_sentiment || 50), tier: metrics.sales_sentiment >= 60 ? 'positive' : metrics.sales_sentiment < 40 ? 'warning' : 'neutral', targetValue: gameTargets.sales_sentiment },
    { name: 'CTO Sentiment', key: 'cto_sentiment', value: Math.round(metrics.cto_sentiment || 50), tier: metrics.cto_sentiment >= 60 ? 'positive' : metrics.cto_sentiment < 40 ? 'warning' : 'neutral', targetValue: gameTargets.cto_sentiment },
    { name: 'Self-Serve Growth', key: 'self_serve_growth', value: Math.round(metrics.self_serve_growth || 50), tier: metrics.self_serve_growth >= 60 ? 'positive' : metrics.self_serve_growth < 40 ? 'warning' : 'neutral', targetValue: gameTargets.self_serve_growth },
    { name: 'Enterprise Growth', key: 'enterprise_growth', value: Math.round(metrics.enterprise_growth || 50), tier: metrics.enterprise_growth >= 60 ? 'positive' : metrics.enterprise_growth < 40 ? 'warning' : 'neutral', targetValue: gameTargets.enterprise_growth },
    { name: 'Tech Debt', key: 'tech_debt', value: Math.round(metrics.tech_debt || 50), tier: metrics.tech_debt >= 60 ? 'warning' : metrics.tech_debt < 40 ? 'positive' : 'neutral', targetValue: gameTargets.tech_debt }
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
                  {metric.targetValue !== undefined && (
                    <div
                      title={`Target: ${metric.targetValue}`}
                      style={{
                        position: 'absolute',
                        top: '-2px',
                        bottom: '-2px',
                        left: `${metric.targetValue}%`,
                        width: '2px',
                        background: 'rgba(234, 179, 8, 0.9)',
                        transform: 'translateX(-50%)',
                        zIndex: 4,
                        pointerEvents: 'none',
                        borderRadius: '1px'
                      }}
                    />
                  )}
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
