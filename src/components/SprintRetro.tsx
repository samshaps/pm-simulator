'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SprintRetro.module.css';

interface MetricChange {
  name: string;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
}

interface TicketOutcome {
  title: string;
  status: 'success' | 'partial' | 'failure';
  impact: string;
  outcome: string;
}

interface RetroData {
  game: {
    id: string;
    difficulty: string;
    current_quarter: number;
    current_sprint: number;
  };
  completedSprint: {
    sprint_number: number;
    quarter: number;
  };
  retro: {
    sprint_number: number;
    ticket_outcomes: any[];
    metric_deltas: Record<string, number>;
    narrative: string;
  };
  isQuarterEnd: boolean;
}

const outcomeStatusMap: Record<string, 'success' | 'partial' | 'failure'> = {
  'clear_success': 'success',
  'partial_success': 'partial',
  'unexpected_impact': 'success',
  'soft_failure': 'failure',
  'catastrophe': 'failure'
};

const metricNameMap: Record<string, string> = {
  'team_sentiment': 'Team Sentiment',
  'ceo_sentiment': 'CEO Sentiment',
  'sales_sentiment': 'Sales Sentiment',
  'cto_sentiment': 'CTO Sentiment',
  'self_serve_growth': 'Self-Serve Growth',
  'enterprise_growth': 'Enterprise Growth',
  'tech_debt': 'Tech Debt',
  'nps': 'NPS',
  'velocity': 'Velocity'
};

export default function SprintRetro() {
  const router = useRouter();
  const [retroData, setRetroData] = useState<RetroData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the current game state which includes the completed sprint's retro
    fetch('/api/sprint/active')
      .then(res => res.json())
      .then(data => {
        // The retro data should be in the previous sprint
        // For now, let's store retro in session storage during commit
        const storedRetro = sessionStorage.getItem('lastRetro');
        if (storedRetro) {
          const parsed = JSON.parse(storedRetro);
          setRetroData(parsed);
          sessionStorage.removeItem('lastRetro');
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load retro data:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !retroData) {
    return <div className={styles.pageContainer}>Loading sprint results...</div>;
  }

  const narrative = retroData.retro.narrative;

  const formatMetricChange = (value: number): string => {
    const absValue = Math.abs(Math.round(value));
    if (value > 15) return `↑↑ Strong Increase`;
    if (value > 5) return `↑ Increased`;
    if (value > 0) return `↗ Slight Increase`;
    if (value === 0) return `→ No Change`;
    if (value > -5) return `↘ Slight Decrease`;
    if (value > -15) return `↓ Decreased`;
    return `↓↓ Strong Decrease`;
  };

  // Ensure all core metrics are shown, even if they have 0 change
  const coreMetrics = ['team_sentiment', 'ceo_sentiment', 'sales_sentiment', 'cto_sentiment',
                       'self_serve_growth', 'enterprise_growth', 'tech_debt'];

  const metricDeltas = retroData.retro.metric_deltas;
  const metricChanges: MetricChange[] = coreMetrics.map(key => ({
    name: metricNameMap[key] || key,
    change: Math.round((metricDeltas[key] as number) || 0),
    changeType: (metricDeltas[key] || 0) > 0 ? 'positive' as const : (metricDeltas[key] || 0) < 0 ? 'negative' as const : 'neutral' as const
  }));

  const ticketOutcomes: TicketOutcome[] = retroData.retro.ticket_outcomes.map(ticket => ({
    title: ticket.title,
    status: outcomeStatusMap[ticket.outcome] || 'partial',
    impact: ticket.outcome_narrative || 'Completed with mixed results.',
    outcome: ticket.outcome
  }));

  // Generate actionable insights based on metric changes
  const generateInsights = () => {
    const insights: string[] = [];
    const deltas = retroData.retro.metric_deltas;

    // Sentiment insights
    if (deltas.team_sentiment && deltas.team_sentiment < -10) {
      insights.push("Team morale took a significant hit. Consider lighter loads next sprint.");
    } else if (deltas.team_sentiment && deltas.team_sentiment > 10) {
      insights.push("Team morale improved. Momentum is building.");
    }

    // Growth insights
    if (deltas.self_serve_growth && deltas.self_serve_growth > 8) {
      insights.push("Self-serve growth is accelerating. Product changes are resonating.");
    }
    if (deltas.enterprise_growth && deltas.enterprise_growth > 8) {
      insights.push("Enterprise momentum building. Sales team is noticing.");
    }

    // Tech debt insights
    if (deltas.tech_debt && deltas.tech_debt > 10) {
      insights.push("Tech debt is mounting. CTO will bring this up soon.");
    } else if (deltas.tech_debt && deltas.tech_debt < -8) {
      insights.push("Tech debt improved. Engineering team appreciates the focus.");
    }

    // Stakeholder insights
    if (deltas.ceo_sentiment && deltas.ceo_sentiment < -10) {
      insights.push("CEO sentiment dropped. Priorities may need realignment.");
    }
    if (deltas.sales_sentiment && deltas.sales_sentiment < -10) {
      insights.push("Sales team is frustrated. Enterprise deals may be at risk.");
    }

    return insights;
  };

  const insights = generateInsights();

  const handleContinue = () => {
    if (retroData.isQuarterEnd) {
      router.replace('/quarterly-review');
    } else {
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
          <div className={styles.quarterBadge}>Q{retroData.completedSprint.quarter} — Sprint {retroData.completedSprint.sprint_number} Complete</div>
        </div>
        <div className={styles.topBarRight}>
          <div className={styles.avatar}>S</div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left Panel */}
        <div className={styles.leftPanel}>
          <div className={styles.retroHeader}>
            <div className={styles.retroTitle}>Sprint Retrospective</div>
            <div className={styles.retroSubtitle}>What happened, and why it matters</div>
          </div>

          {/* Narrative */}
          <div className={styles.sectionLabel}>Sprint Summary</div>
          <div className={styles.narrativeCard}>
            <div className={styles.narrativeText}>{narrative}</div>
          </div>

          {/* Key Insights */}
          {insights.length > 0 && (
            <>
              <div className={styles.sectionLabel}>Key Takeaways</div>
              <div className={styles.feedbackCard}>
                <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'disc', lineHeight: '1.6' }}>
                  {insights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Metric Changes */}
          <div className={styles.sectionLabel}>Metrics Momentum</div>
          <div className={styles.metricChangesCard}>
            <div className={styles.metricChangesGrid}>
              {metricChanges.map((metric, index) => (
                <div key={index} className={styles.metricChangeItem}>
                  <span className={styles.metricChangeName}>{metric.name}</span>
                  <span className={`${styles.metricChangeValue} ${styles[metric.changeType]}`}>
                    {formatMetricChange(metric.change)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className={styles.rightPanel}>
          <div className={styles.sectionLabel}>Ticket Outcomes</div>
          <div className={styles.ticketOutcomes}>
            {ticketOutcomes.map((ticket, index) => (
              <div key={index} className={`${styles.outcomeCard} ${styles[ticket.status]}`}>
                <div className={styles.outcomeHeader}>
                  <span className={styles.outcomeTitle}>{ticket.title}</span>
                  <span className={`${styles.outcomeStatus} ${styles[ticket.status]}`}>
                    {ticket.status === 'success' ? '✓ Success' :
                     ticket.status === 'partial' ? '◐ Partial' :
                     '✗ Failed'}
                  </span>
                </div>
                <div className={styles.outcomeImpact}>{ticket.impact}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomBarLeft}>
          Sprint {retroData.completedSprint.sprint_number} of 3 complete. {retroData.isQuarterEnd ? 'Time for quarterly review.' : `${3 - retroData.completedSprint.sprint_number} more sprint${3 - retroData.completedSprint.sprint_number > 1 ? 's' : ''} until quarterly review.`}
        </div>
        <div className={styles.bottomBarRight}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleContinue}>
            {retroData.isQuarterEnd ? 'View Quarterly Review' : 'Continue to Next Sprint'}
          </button>
        </div>
      </div>
    </div>
  );
}
