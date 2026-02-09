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
    events?: Array<{ title: string; description: string }>;
  };
  ceo_focus_shift?: {
    narrative?: string | null;
    from?: string | null;
    to?: string | null;
    kind?: string | null;
  } | null;
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('Syncing with stakeholders...');

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

  useEffect(() => {
    // Fetch the current game state which includes the completed sprint's retro
    fetch('/api/sprint/active')
      .then(res => res.json())
      .then(data => {
        // The retro data should be in the previous sprint
        // Read from session storage (don't remove - let sprint planning handle that)
        const storedRetro = sessionStorage.getItem('lastRetro');
        if (storedRetro) {
          const parsed = JSON.parse(storedRetro);
          setRetroData(parsed);
          // Don't remove here - Sprint Planning will read and remove it
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load retro data:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !retroData) {
    return null; // Don't show default loading - SprintPlanning loading overlay handles it
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

    // CEO sentiment insights (now included prominently)
    if (deltas.ceo_sentiment && deltas.ceo_sentiment < -15) {
      insights.push("CEO sentiment dropped sharply. You're on their radar now—and not in a good way.");
    } else if (deltas.ceo_sentiment && deltas.ceo_sentiment < -10) {
      insights.push("CEO sentiment dropped. Priorities may need realignment.");
    } else if (deltas.ceo_sentiment && deltas.ceo_sentiment > 10) {
      insights.push("CEO sentiment improved significantly. You're building credibility.");
    }

    // Team sentiment insights
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

    // Other stakeholder insights
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
      if (isTransitioning) return;
      setTransitionMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
      setIsTransitioning(true);
      window.setTimeout(() => {
        router.replace('/sprint-planning');
      }, 2000);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {isTransitioning && (
        <div className={styles.loadingOverlay} aria-live="polite">
          <div className={styles.loadingCard}>
            <div className={styles.loadingMessage}>{transitionMessage}</div>
            <div className={styles.loadingProgress}>
              <div className={styles.loadingProgressBar}></div>
            </div>
          </div>
        </div>
      )}
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

          {/* After-Action Report */}
          {(insights.length > 0 || (retroData.retro.events && retroData.retro.events.length > 0) || (retroData.ceo_focus_shift?.narrative)) && (
            <>
              <div className={styles.sectionLabel}>After-Action Report</div>
              <div className={styles.feedbackCard}>
                {retroData.ceo_focus_shift?.narrative && (
                  <>
                    <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>CEO Focus Shift</div>
                    <div style={{ marginBottom: insights.length > 0 || (retroData.retro.events && retroData.retro.events.length > 0) ? '16px' : '0', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      "{retroData.ceo_focus_shift.narrative}"
                    </div>
                  </>
                )}
                {insights.length > 0 && (
                  <>
                    <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Key Insights</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'disc', lineHeight: '1.6' }}>
                      {insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </>
                )}
                {retroData.retro.events && retroData.retro.events.length > 0 && (
                  <div style={{ marginTop: (retroData.ceo_focus_shift?.narrative || insights.length > 0) ? '16px' : '0' }}>
                    <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Events This Sprint</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'disc', lineHeight: '1.6' }}>
                      {Array.from(new Map(retroData.retro.events.map((event: any) => [event.title, event])).values()).map((event: any, index: number) => (
                        <li key={`${event.title}-${index}`}>
                          <strong>{event.title}</strong> — {event.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
