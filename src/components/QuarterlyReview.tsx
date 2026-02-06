'use client';

import React from 'react';
import styles from './QuarterlyReview.module.css';

type Rating = 'exceeds' | 'meets' | 'needs' | 'does-not';

export default function QuarterlyReview() {
  const rating: Rating = 'meets';
  const ratingText = {
    'exceeds': 'Exceeds Expectations',
    'meets': 'Meets Expectations',
    'needs': 'Needs Improvement',
    'does-not': 'Does Not Meet Expectations'
  };

  const calibrationOutcome = "survived"; // or "promoted" or "pip" or "terminated"

  const narrative = "You navigated Q2 with the pragmatism of someone who's read the employee handbook. Your focus on enterprise priorities aligned with the CEO's goals, boosting revenue metrics and keeping Sales temporarily satisfied. However, your tendency to overcommit left the team feeling stretched, and tech debt accumulated faster than anyone acknowledged in standups. The CTO noticed. Your manager noticed. You survived calibration, but you're not getting promoted this cycle.";

  const finalMetrics = [
    { name: 'Team Sentiment', value: 47, tier: 'neutral' },
    { name: 'CEO Sentiment', value: 60, tier: 'positive' },
    { name: 'Sales Sentiment', value: 53, tier: 'neutral' },
    { name: 'CTO Sentiment', value: 49, tier: 'neutral' },
    { name: 'Self-Serve Growth', value: 45, tier: 'neutral' },
    { name: 'Enterprise Growth', value: 62, tier: 'positive' },
    { name: 'Tech Debt', value: 60, tier: 'warning' }
  ];

  const managerReview = "You delivered on what mattered most this quarter—enterprise growth. That's why you're still here. But let's be real: you overcommitted, the team felt it, and tech debt is becoming a problem. Next quarter, I need you to be more strategic about capacity and start addressing that debt before the CTO escalates it.";

  const calibrationNarrative = {
    survived: "You survived calibration. Your manager defended your rating against some pushback from the CTO, citing your enterprise wins. You're safe for now, but you're not on the 'high performer' list. Next quarter matters.",
    promoted: "Congratulations—you've been promoted! Your consistent delivery on CEO priorities and strong stakeholder relationships put you in the top tier. Enjoy the 3% raise and new title. Next quarter's expectations just went up.",
    pip: "You've been placed on a Performance Improvement Plan. Your manager cited chronic overcommitment, declining team morale, and insufficient progress on strategic priorities. You have 90 days to turn this around.",
    terminated: "Your employment has been terminated. Despite some wins, leadership determined that your pattern of missed commitments and poor stakeholder management made you a net negative. Your Slack access has been revoked."
  };

  const handleContinue = () => {
    console.log('Returning to home screen');
    // TODO: Navigate to home or start new game
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
          <div className={styles.quarterBadge}>Q2 Complete — Review Time</div>
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
            <div className={styles.pageTitle}>Quarterly Performance Review</div>
            <div className={styles.pageSubtitle}>Q2 2026 — The moment of truth</div>
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
                {calibrationOutcome === 'survived' && 'Survived'}
                {calibrationOutcome === 'promoted' && 'Promoted'}
                {calibrationOutcome === 'pip' && 'PIP'}
                {calibrationOutcome === 'terminated' && 'Terminated'}
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

          {/* Manager Review */}
          <div className={styles.sectionLabel}>Manager's Review</div>
          <div className={styles.managerCard}>
            <div className={styles.managerText}>{managerReview}</div>
          </div>

          {/* Continue Button */}
          <div className={styles.actionSection}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleContinue}>
              {calibrationOutcome === 'terminated' ? 'Return to Home' : 'Start Next Quarter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
