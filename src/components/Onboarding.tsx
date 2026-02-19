'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Onboarding.module.css';
import MetricBarWithPreview from './MetricBarWithPreview';

interface MetricsState {
  team_sentiment: number;
  ceo_sentiment: number;
  sales_sentiment: number;
  cto_sentiment: number;
  self_serve_growth: number;
  enterprise_growth: number;
  tech_debt: number;
  nps: number;
}

interface MetricTargets {
  team_sentiment: number;
  ceo_sentiment: number;
  sales_sentiment: number;
  cto_sentiment: number;
  self_serve_growth: number;
  enterprise_growth: number;
  tech_debt: number;
  nps: number;
}

interface OnboardingData {
  metrics_state: MetricsState;
  metric_targets: MetricTargets;
  difficulty: 'easy' | 'normal' | 'hard';
  ceo_focus: string;
}

const STRETCH_TARGETS: Record<string, MetricTargets> = {
  easy: {
    team_sentiment: 75, ceo_sentiment: 75, sales_sentiment: 75,
    cto_sentiment: 75, self_serve_growth: 70, enterprise_growth: 70,
    tech_debt: 25, nps: 70
  },
  normal: {
    team_sentiment: 70, ceo_sentiment: 70, sales_sentiment: 70,
    cto_sentiment: 70, self_serve_growth: 65, enterprise_growth: 65,
    tech_debt: 30, nps: 65
  },
  hard: {
    team_sentiment: 65, ceo_sentiment: 65, sales_sentiment: 65,
    cto_sentiment: 65, self_serve_growth: 60, enterprise_growth: 60,
    tech_debt: 35, nps: 60
  }
};

const CEO_FOCUS_LABELS: Record<string, string> = {
  self_serve: 'self-serve growth',
  enterprise: 'enterprise expansion',
  tech_debt: 'technical excellence'
};

const DIFFICULTY_NARRATIVES: Record<string, string> = {
  easy: "The team's in decent shape. Keep morale up, ship features aligned to what the CEO cares about, and you'll do fine. Don't let tech debt creep up.",
  normal: "We're in an okay spot but there's work to do. The CEO has opinions — stay aligned. Sales is going to need attention. Watch your tech debt.",
  hard: "I'll be blunt — you're inheriting a mess. Metrics are below where they need to be, tech debt is high, and the CEO is watching closely. Every sprint counts."
};

const WHAT_THIS_MEANS = "Keep metrics above target lines to earn a strong review. The CEO's focus shifts each quarter — stay aligned for bonus points. Tech Debt is the exception: keep it below its target.";

function getMetricStatus(
  current: number,
  target: number,
  invert = false
): 'green' | 'amber' | 'red' {
  if (invert) {
    // Lower is better (tech debt)
    if (current <= target) return 'green';
    if (current <= target + 15) return 'amber';
    return 'red';
  }
  if (current >= target) return 'green';
  if (current >= target - 15) return 'amber';
  return 'red';
}

const METRIC_ROWS: Array<{
  key: keyof MetricTargets;
  label: string;
  invert?: boolean;
}> = [
  { key: 'team_sentiment', label: 'Team Sentiment' },
  { key: 'ceo_sentiment', label: 'CEO Sentiment' },
  { key: 'sales_sentiment', label: 'Sales Sentiment' },
  { key: 'cto_sentiment', label: 'CTO Sentiment' },
  { key: 'self_serve_growth', label: 'Self-Serve Growth' },
  { key: 'enterprise_growth', label: 'Enterprise Growth' },
  { key: 'tech_debt', label: 'Tech Debt', invert: true },
  { key: 'nps', label: 'NPS' }
];

export default function Onboarding() {
  const router = useRouter();
  const [data, setData] = useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem('pm_sim_onboarding_data');
    if (!raw) {
      router.replace('/');
      return;
    }
    try {
      const parsed = JSON.parse(raw) as OnboardingData;
      if (!parsed.metrics_state || !parsed.metric_targets) {
        router.replace('/');
        return;
      }
      setData(parsed);
    } catch {
      router.replace('/');
    }
    setIsLoading(false);
  }, [router]);

  const handleStart = () => {
    // Clean up onboarding data from sessionStorage
    sessionStorage.removeItem('pm_sim_onboarding_data');
    router.replace('/sprint-planning');
  };

  if (isLoading || !data) {
    return <div className={styles.pageContainer}>Loading...</div>;
  }

  const { metrics_state, metric_targets, difficulty, ceo_focus } = data;
  const stretchTargets = STRETCH_TARGETS[difficulty] ?? STRETCH_TARGETS.normal;
  const narrative = DIFFICULTY_NARRATIVES[difficulty] ?? DIFFICULTY_NARRATIVES.normal;
  const ceoFocusLabel = CEO_FOCUS_LABELS[ceo_focus] ?? ceo_focus;

  return (
    <div className={styles.pageContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>PM</div>
            <span className={styles.logoText}>PM Simulator</span>
          </div>
          <div className={styles.quarterBadge}>Day 1 — Onboarding</div>
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
            <div className={styles.pageTitle}>Welcome to Acme Corp</div>
            <div className={styles.pageSubtitle}>Your manager wants to set expectations.</div>
          </div>

          {/* Manager 1:1 Note */}
          <div className={styles.sectionLabel}>Manager 1:1 Note</div>
          <div className={styles.managerCard}>
            <div className={styles.managerQuote}>&ldquo;</div>
            <div className={styles.managerText}>
              Welcome aboard. Here&rsquo;s the situation:{' '}
              <span className={styles.ceoFocusHighlight}>
                The CEO is focused on {ceoFocusLabel}
              </span>{' '}
              this quarter. Here&rsquo;s where we stand and where we need to be by year-end.
            </div>
            <div className={styles.managerNarrative}>{narrative}</div>
          </div>

          {/* Metrics Section */}
          <div className={styles.sectionLabel}>Current State &amp; Year-End Targets</div>
          <div className={styles.metricsCard}>
            <div className={styles.metricsLegend}>
              <div className={styles.legendItem}>
                <div className={styles.legendLineTarget}></div>
                <span>Year-end target (Meets Expectations)</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendLineStretch}></div>
                <span>Stretch target (Exceeds Expectations)</span>
              </div>
            </div>
            <div className={styles.metricsGrid}>
              {METRIC_ROWS.map(({ key, label, invert }) => {
                const current = Math.round(metrics_state[key] ?? 0);
                const target = metric_targets[key];
                const stretch = stretchTargets[key];
                const status = getMetricStatus(current, target, invert);

                return (
                  <div key={key} className={styles.metricRow}>
                    <div className={styles.metricRowHeader}>
                      <span className={styles.metricRowLabel}>{label}</span>
                      <span className={styles.metricRowValues}>
                        <span className={`${styles.metricCurrent} ${styles[status]}`}>
                          {current}
                        </span>
                        <span className={styles.metricArrow}>→</span>
                        <span className={styles.metricTarget}>
                          target: {target}
                          {invert && <span className={styles.invertHint}> (lower is better)</span>}
                        </span>
                      </span>
                    </div>
                    <MetricBarWithPreview
                      name=""
                      currentValue={current}
                      targetValue={target}
                      stretchTarget={stretch}
                      invertTarget={invert}
                      showDangerZone={!invert}
                      showHeader={false}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* What This Means */}
          <div className={styles.sectionLabel}>What This Means</div>
          <div className={styles.infoCard}>
            <div className={styles.infoText}>{WHAT_THIS_MEANS}</div>
          </div>

          {/* CTA */}
          <div className={styles.actionSection}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleStart}>
              Start Your First Sprint →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
