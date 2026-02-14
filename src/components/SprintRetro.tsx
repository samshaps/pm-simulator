'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SprintRetro.module.css';
import MetricBarWithPreview from './MetricBarWithPreview';

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

interface GroupedTicketOutcome extends TicketOutcome {
  category: string;
}

interface AnimationState {
  phase: 'initial' | 'revealing_tickets' | 'revealing_notes' | 'complete';
  revealedTickets: number;
  revealedNotes: number;
}

interface RetroData {
  game: {
    id: string;
    difficulty: string;
    current_quarter: number;
    current_sprint: number;
    metrics_state?: Record<string, number>;
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
    is_overbooked?: boolean;
    failure_rate?: number;
  };
  ceo_focus_shift?: {
    narrative?: string | null;
    from?: string | null;
    to?: string | null;
    kind?: string | null;
  } | null;
  isQuarterEnd: boolean;
  death_spiral?: boolean;
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

const categoryNameMap: Record<string, string> = {
  'self_serve_feature': 'Self-Serve Feature',
  'enterprise_feature': 'Enterprise Feature',
  'sales_request': 'Sales Request',
  'tech_debt_reduction': 'Tech Debt Reduction',
  'infrastructure': 'Infrastructure',
  'ux_improvement': 'UX Improvement',
  'monetization': 'Monetization',
  'moonshot': 'Moonshot'
};

const categoryColorMap: Record<string, string> = {
  'self_serve_feature': 'var(--green)',
  'enterprise_feature': 'var(--amber)',
  'sales_request': 'var(--amber)',
  'tech_debt_reduction': 'var(--purple-light)',
  'infrastructure': 'var(--purple-light)',
  'ux_improvement': 'var(--blue)',
  'monetization': 'var(--green)',
  'moonshot': 'var(--red)'
};

export default function SprintRetro() {
  const router = useRouter();
  const [retroData, setRetroData] = useState<RetroData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('Syncing with stakeholders...');
  const [animState, setAnimState] = useState<AnimationState>({
    phase: 'initial',
    revealedTickets: 0,
    revealedNotes: 0
  });
  const timerRefs = useRef<NodeJS.Timeout[]>([]);

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
          if (parsed.death_spiral) {
            router.replace('/quarterly-review');
            setIsLoading(false);
            return;
          }
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
  const metricChanges: MetricChange[] = coreMetrics.map(key => {
    const delta = (metricDeltas[key] as number) || 0;
    // For tech_debt, invert the changeType (increase is bad, decrease is good)
    const isInverseMetric = key === 'tech_debt';
    let changeType: 'positive' | 'negative' | 'neutral';
    if (delta > 0) {
      changeType = isInverseMetric ? 'negative' : 'positive';
    } else if (delta < 0) {
      changeType = isInverseMetric ? 'positive' : 'negative';
    } else {
      changeType = 'neutral';
    }
    return {
      name: metricNameMap[key] || key,
      change: Math.round(delta),
      changeType
    };
  });

  const ticketOutcomes: GroupedTicketOutcome[] = useMemo(() =>
    retroData.retro.ticket_outcomes.map(ticket => ({
      title: ticket.title,
      status: outcomeStatusMap[ticket.outcome] || 'partial',
      impact: ticket.outcome_narrative || 'Completed with mixed results.',
      outcome: ticket.outcome,
      category: ticket.category
    })),
  [retroData.retro.ticket_outcomes]);

  const ticketsByCategory = useMemo(() =>
    ticketOutcomes.reduce((acc, ticket) => {
      const category = ticket.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(ticket);
      return acc;
    }, {} as Record<string, GroupedTicketOutcome[]>),
  [ticketOutcomes]);

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
      // Different message based on root cause
      if (retroData.retro.is_overbooked) {
        insights.push("Team morale took a significant hit. Consider lighter loads next sprint.");
      } else if (retroData.retro.failure_rate && retroData.retro.failure_rate >= 0.5) {
        insights.push("Team morale took a significant hit from ticket failures. Focus on execution quality and reducing risk.");
      } else {
        insights.push("Team morale took a significant hit. Review what caused the decline.");
      }
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

  const insights = useMemo(() => generateInsights(), [retroData.retro.metric_deltas, retroData.retro.is_overbooked, retroData.retro.failure_rate]);

  // Flatten tickets into ordered array for sequential reveal
  const flattenedTickets = useMemo(() => {
    let index = 0;
    return Object.entries(ticketsByCategory).flatMap(([category, tickets]) =>
      tickets.map(ticket => ({
        ...ticket,
        category,
        flatIndex: index++,
        isRevealed: animState.revealedTickets > index - 1
      }))
    );
  }, [ticketsByCategory, animState.revealedTickets]);

  // Prepare sticky notes as ordered array
  const stickyNotes = useMemo(() => {
    const notes: Array<{ type: string; content: any }> = [];

    if (retroData.ceo_focus_shift?.narrative) {
      notes.push({ type: 'ceo_focus', content: retroData.ceo_focus_shift });
    }

    if (insights.length > 0) {
      notes.push({ type: 'insights', content: insights });
    }

    if (retroData.retro.events && retroData.retro.events.length > 0) {
      notes.push({ type: 'events', content: retroData.retro.events });
    }

    return notes;
  }, [retroData, insights]);

  const totalTickets = flattenedTickets.length;
  const totalNotes = stickyNotes.length;

  // Calculate metric preview ranges with progressive narrowing
  const getMetricPreviewRange = (metricKey: string, currentValue: number, finalDelta: number) => {
    const uncertaintyFactor = totalTickets > 0 ? 1 - (animState.revealedTickets / totalTickets) : 0;
    const maxUncertainty = 15;

    const finalValue = currentValue + finalDelta;
    const uncertainty = uncertaintyFactor * maxUncertainty;

    return {
      min: Math.max(0, Math.min(100, finalValue - uncertainty)),
      max: Math.max(0, Math.min(100, finalValue + uncertainty)),
      isPositive: finalDelta > 0
    };
  };

  // Check if animation already completed (from sessionStorage)
  useEffect(() => {
    const isComplete = sessionStorage.getItem('retroAnimationComplete');
    if (isComplete === 'true') {
      setAnimState({
        phase: 'complete',
        revealedTickets: totalTickets,
        revealedNotes: totalNotes
      });
    }
  }, [totalTickets, totalNotes]);

  // Animation sequence orchestration
  useEffect(() => {
    // Skip if already complete or no data
    if (animState.phase === 'complete' || !retroData) return;

    // Cleanup function to clear all timers
    return () => {
      timerRefs.current.forEach(timer => clearTimeout(timer));
      timerRefs.current = [];
    };
  }, [animState.phase, retroData]);

  // Start animation sequence after initial render
  useEffect(() => {
    if (!retroData || animState.phase !== 'initial') return;

    // Initial delay before starting ticket reveals
    const initialTimer = setTimeout(() => {
      setAnimState(prev => ({ ...prev, phase: 'revealing_tickets' }));
    }, 500);

    timerRefs.current.push(initialTimer);
  }, [retroData, animState.phase]);

  // Ticket reveal loop
  useEffect(() => {
    if (animState.phase !== 'revealing_tickets') return;
    if (animState.revealedTickets >= totalTickets) {
      // All tickets revealed, move to notes phase
      if (totalNotes > 0) {
        setAnimState(prev => ({ ...prev, phase: 'revealing_notes' }));
      } else {
        // No notes, go straight to complete
        setAnimState(prev => ({ ...prev, phase: 'complete' }));
        sessionStorage.setItem('retroAnimationComplete', 'true');
      }
      return;
    }

    // Determine delay based on number of tickets (speed up after 6)
    const delay = animState.revealedTickets >= 6 ? 300 : 500;

    const timer = setTimeout(() => {
      setAnimState(prev => ({
        ...prev,
        revealedTickets: prev.revealedTickets + 1
      }));
    }, delay);

    timerRefs.current.push(timer);
  }, [animState.phase, animState.revealedTickets, totalTickets, totalNotes]);

  // Sticky note reveal loop
  useEffect(() => {
    if (animState.phase !== 'revealing_notes') return;
    if (animState.revealedNotes >= totalNotes) {
      // All notes revealed, animation complete
      setAnimState(prev => ({ ...prev, phase: 'complete' }));
      sessionStorage.setItem('retroAnimationComplete', 'true');
      return;
    }

    const timer = setTimeout(() => {
      setAnimState(prev => ({
        ...prev,
        revealedNotes: prev.revealedNotes + 1
      }));
    }, 200);

    timerRefs.current.push(timer);
  }, [animState.phase, animState.revealedNotes, totalNotes]);

  const handleSkipAnimation = () => {
    timerRefs.current.forEach(timer => clearTimeout(timer));
    timerRefs.current = [];
    setAnimState({
      phase: 'complete',
      revealedTickets: totalTickets,
      revealedNotes: totalNotes
    });
    sessionStorage.setItem('retroAnimationComplete', 'true');
  };

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
      {/* Skip Animation Button */}
      {animState.phase !== 'complete' && (
        <button className={styles.skipButton} onClick={handleSkipAnimation}>
          Skip Animation
        </button>
      )}

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
          {stickyNotes.length > 0 && (
            <>
              <div className={styles.sectionLabel}>After-Action Report</div>
              <div className={styles.feedbackCard}>
                {stickyNotes.map((note, index) => {
                  const isRevealed = index < animState.revealedNotes;
                  const className = isRevealed ? styles.stickyNoteAnimated : styles.stickyNoteHidden;

                  if (note.type === 'ceo_focus' && note.content.narrative) {
                    return (
                      <div key={index} className={className}>
                        <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>CEO Focus Shift</div>
                        <div style={{ marginBottom: index < stickyNotes.length - 1 ? '16px' : '0', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                          "{note.content.narrative}"
                        </div>
                      </div>
                    );
                  }

                  if (note.type === 'insights' && note.content.length > 0) {
                    return (
                      <div key={index} className={className}>
                        <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Key Insights</div>
                        <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'disc', lineHeight: '1.6', marginBottom: index < stickyNotes.length - 1 ? '16px' : '0' }}>
                          {note.content.map((insight: string, i: number) => (
                            <li key={i}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  }

                  if (note.type === 'events' && note.content.length > 0) {
                    return (
                      <div key={index} className={className}>
                        <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Events This Sprint</div>
                        <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'disc', lineHeight: '1.6' }}>
                          {Array.from(new Map(note.content.map((event: any) => [event.title, event])).values()).map((event: any, i: number) => (
                            <li key={`${event.title}-${i}`}>
                              <strong>{event.title}</strong> — {event.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </>
          )}
        </div>

        {/* Right Panel */}
        <div className={styles.rightPanel}>
          <div className={styles.sectionLabel}>Ticket Outcomes</div>
          <div className={styles.ticketOutcomes}>
            {Object.entries(ticketsByCategory).map(([category, tickets]) => (
              <div key={category} className={styles.categoryGroup}>
                <div
                  className={styles.categoryHeader}
                  style={{ color: categoryColorMap[category] || 'var(--text-secondary)' }}
                >
                  {categoryNameMap[category] || category}
                </div>
                {tickets.map((ticket) => {
                  const flatTicket = flattenedTickets.find(ft => ft.title === ticket.title);
                  const isRevealed = flatTicket ? flatTicket.isRevealed : false;

                  // Determine the outcome class based on whether ticket is revealed
                  const outcomeClass = isRevealed ? ticket.outcome : 'neutral';
                  const statusClass = isRevealed ? ticket.status : 'neutral';

                  // Map outcome to CSS class
                  const outcomeColorClass = isRevealed ? (
                    outcomeClass === 'clear_success' ? styles.ticketClearSuccess :
                    outcomeClass === 'partial_success' ? styles.ticketPartialSuccess :
                    outcomeClass === 'soft_failure' ? styles.ticketSoftFailure :
                    outcomeClass === 'catastrophe' ? styles.ticketCatastrophe :
                    styles.ticketNeutral
                  ) : styles.ticketNeutral;

                  return (
                    <div
                      key={ticket.title}
                      className={`${styles.outcomeCard} ${outcomeColorClass} ${flatTicket?.flatIndex === animState.revealedTickets - 1 ? styles.ticketFlipping : ''}`}
                    >
                      <div className={styles.outcomeHeader}>
                        <span className={styles.outcomeTitle}>{ticket.title}</span>
                        {isRevealed && (
                          <span className={`${styles.outcomeStatus} ${styles[statusClass]}`}>
                            {ticket.status === 'success' ? '✓ Success' :
                             ticket.status === 'partial' ? '◐ Partial' :
                             '✗ Failed'}
                          </span>
                        )}
                      </div>
                      {isRevealed && (
                        <div className={styles.outcomeImpact}>{ticket.impact}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Performance Metrics */}
          {retroData.game.metrics_state && (
            <>
              <div className={styles.sectionLabel} style={{ marginTop: '24px' }}>Performance</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {['team_sentiment', 'ceo_sentiment', 'self_serve_growth', 'enterprise_growth'].map(metricKey => {
                  const currentValue = retroData.game.metrics_state?.[metricKey] ?? 50;
                  const delta = retroData.retro.metric_deltas[metricKey] ?? 0;
                  const preview = getMetricPreviewRange(metricKey, currentValue, delta);

                  return (
                    <MetricBarWithPreview
                      key={metricKey}
                      name={metricNameMap[metricKey] || metricKey}
                      currentValue={currentValue}
                      previewMin={preview.min}
                      previewMax={preview.max}
                      isPositiveImpact={preview.isPositive}
                      showDangerZone={metricKey.includes('sentiment')}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomBarLeft}>
          Sprint {retroData.completedSprint.sprint_number} of 3 complete. {retroData.isQuarterEnd ? 'Time for quarterly review.' : `${3 - retroData.completedSprint.sprint_number} more sprint${3 - retroData.completedSprint.sprint_number > 1 ? 's' : ''} until quarterly review.`}
        </div>
        <div className={styles.bottomBarRight}>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleContinue}
            disabled={animState.phase !== 'complete'}
            style={{ opacity: animState.phase !== 'complete' ? 0.5 : 1, cursor: animState.phase !== 'complete' ? 'not-allowed' : 'pointer' }}
          >
            {retroData.isQuarterEnd ? 'View Quarterly Review' : 'Continue to Next Sprint'}
          </button>
        </div>
      </div>
    </div>
  );
}
