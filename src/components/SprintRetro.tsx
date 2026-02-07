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

  const metricChanges: MetricChange[] = Object.entries(retroData.retro.metric_deltas).map(([key, value]) => ({
    name: metricNameMap[key] || key,
    change: Math.round(value as number),
    changeType: value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'
  }));

  const ticketOutcomes: TicketOutcome[] = retroData.retro.ticket_outcomes.map(ticket => ({
    title: ticket.title,
    status: outcomeStatusMap[ticket.outcome] || 'partial',
    impact: ticket.outcome_narrative || 'Completed with mixed results.',
    outcome: ticket.outcome
  }));

  const managerFeedback = "Sprint complete. Review the outcomes and prepare for the next one.";

  const handleContinue = () => {
    if (retroData.isQuarterEnd) {
      router.push('/quarterly-review');
    } else {
      router.push('/sprint-planning');
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

          {/* Metric Changes */}
          <div className={styles.sectionLabel}>Metric Changes</div>
          <div className={styles.metricChangesCard}>
            <div className={styles.metricChangesGrid}>
              {metricChanges.map((metric, index) => (
                <div key={index} className={styles.metricChangeItem}>
                  <span className={styles.metricChangeName}>{metric.name}</span>
                  <span className={`${styles.metricChangeValue} ${styles[metric.changeType]}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Manager Feedback */}
          <div className={styles.sectionLabel}>Manager Feedback</div>
          <div className={styles.feedbackCard}>
            <div className={styles.feedbackText}>{managerFeedback}</div>
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

          {/* Key Learnings */}
          <div className={styles.sectionLabel} style={{ marginTop: '24px' }}>Key Learnings</div>
          <div className={styles.learningsCard}>
            <ul className={styles.learningsList}>
              <li>Overcommitting damages team morale, even when you ship</li>
              <li>Enterprise wins boost CEO sentiment but can alienate the team</li>
              <li>Tech debt accumulates faster than you expect</li>
              <li>Sales will love you briefly, then forget immediately</li>
            </ul>
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
