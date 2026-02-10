'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SprintPlanning.module.css';

interface Ticket {
  id: string;
  title: string;
  effort: number;
  category: string;
  categoryClass: string;
  description: string;
  is_mandatory?: boolean;
  isMandatory?: boolean;
  isCEOAligned?: boolean;
  outcomes?: Record<string, string>;
}

interface CommittedTicket {
  id: string;
  title: string;
  effort: number;
  category: string;
  categoryClass: string;
}

interface MetricsState {
  team_sentiment: number;
  ceo_sentiment: number;
  sales_sentiment: number;
  cto_sentiment: number;
  self_serve_growth: number;
  enterprise_growth: number;
  tech_debt: number;
  nps: number;
  velocity: number;
}

interface GameState {
  game: {
    id: string;
    difficulty: string;
    current_quarter: number;
    current_sprint: number;
    metrics_state: MetricsState;
  };
  sprint: {
    id: string;
    effective_capacity: number;
    backlog: Ticket[];
    committed: any[];
  };
  quarter: {
    ceo_focus: string;
  };
  ceo_focus_shift?: {
    narrative?: string | null;
    from?: string | null;
    to?: string | null;
    kind?: string | null;
  } | null;
}

const categoryToClass: Record<string, string> = {
  'self_serve_feature': 'catSelfServe',
  'enterprise_feature': 'catEnterprise',
  'sales_request': 'catSales',
  'tech_debt_reduction': 'catTechDebt',
  'ux_improvement': 'catUx',
  'monetization': 'catMonetization',
  'infrastructure': 'catInfra',
  'moonshot': 'catMoonshot'
};

const ceoFocusToCategory: Record<string, string> = {
  'self_serve': 'self_serve_feature',
  'enterprise': 'enterprise_feature',
  'tech_debt': 'tech_debt_reduction'
};

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
  'Deploying to production on a Friday...',
  'Explaining to sales why we can\'t just "make it faster"...',
  'Waiting for design to finish "one more iteration"...',
  'Reprioritizing the backlog for the 47th time...',
  'Adding "synergy" to the slide deck...',
  'Scheduling a meeting to discuss the meeting...',
  'Rescheduling the 1:1 you forgot about...',
  'Sending a Slack message that could have been an email...',
  'Searching for the GitHub issue you closed by accident...',
  'Convincing engineering this is "technically possible"...',
  'Telling the CEO "we\'re on track" with a straight face...',
  'Googling "how to write user stories"...',
  'Merging 17 calendar invites into one...',
  'Debugging why staging looks different from prod...',
  'Explaining agile to someone who thinks it means "no planning"...',
  'Updating the status in 5 different tools...',
  'Converting coffee into roadmap updates...',
  'Finding a meeting room that actually has a working HDMI cable...',
  'Pretending the demo won\'t break...',
  'Writing release notes nobody will read...',
  'Reconciling "MVP" with what sales already promised...',
  'Changing "urgent" to "high priority" in the backlog...',
  'Estimating in story points to avoid accountability...',
  'Asking "any blockers?" for the third time this week...',
  'Renaming tickets to sound more important...',
  'Hoping nobody asks about the technical debt...',
  'Translating "the customers want this" into "sales wants this"...'
];

const metricLabelMap: Record<keyof MetricsState, string> = {
  team_sentiment: 'Team Sentiment',
  ceo_sentiment: 'CEO Sentiment',
  sales_sentiment: 'Sales Sentiment',
  cto_sentiment: 'CTO Sentiment',
  self_serve_growth: 'Self-Serve Growth',
  enterprise_growth: 'Enterprise Growth',
  tech_debt: 'Tech Debt',
  nps: 'NPS',
  velocity: 'Velocity'
};

const pickRandomMessages = (messages: string[], count: number) => {
  const pool = [...messages];
  const picked: string[] = [];
  while (pool.length > 0 && picked.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
};

export default function SprintPlanning() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommitting, setIsCommitting] = useState(false);
  const [committedTickets, setCommittedTickets] = useState<CommittedTicket[]>([]);
  const [previousDeltas, setPreviousDeltas] = useState<Record<string, number> | null>(null);
  const [loadingSequence, setLoadingSequence] = useState<string[]>([]);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [showCeoShift, setShowCeoShift] = useState(true);
  const [ceoShiftOverride, setCeoShiftOverride] = useState<GameState['ceo_focus_shift']>(null);
  const [eventPopupEvents, setEventPopupEvents] = useState<Array<{ title: string; description: string }>>([]);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false);

  useEffect(() => {
    // Fetch active sprint data
    fetch('/api/sprint/active')
      .then(res => res.json())
      .then(data => {
        setGameState(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load sprint data:', err);
        setIsLoading(false);
      });

    // Check for metric deltas from previous sprint's retro
    const storedRetro = sessionStorage.getItem('lastRetro');
    if (storedRetro) {
      const retro = JSON.parse(storedRetro);
      if (retro.retro?.metric_deltas) {
        setPreviousDeltas(retro.retro.metric_deltas);
        // Clear it so it doesn't show on subsequent sprints
        sessionStorage.removeItem('lastRetro');
      }
      if (Array.isArray(retro.retro?.events) && retro.retro.events.length > 0) {
        setEventPopupEvents(
          retro.retro.events.map((event: any) => ({
            title: event.title,
            description: event.description
          }))
        );
        setShowEventPopup(true);
      }
      if (retro.ceo_focus_shift) {
        setCeoShiftOverride(retro.ceo_focus_shift);
      }
    }

    // Handle browser back button - prevent it and redirect to home
    const handlePopState = () => {
      // Push state again to prevent actual back navigation
      window.history.pushState(null, '', window.location.pathname);
      // Then navigate to home
      window.location.href = '/';
    };

    // Push initial state to trap back button
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);


  useEffect(() => {
    if (!isCommitting) return;
    const sequence = pickRandomMessages(loadingMessages, 4);
    setLoadingSequence(sequence);
    setLoadingIndex(0);
    const interval = window.setInterval(() => {
      setLoadingIndex((index) => (index + 1) % sequence.length);
    }, 1500);
    return () => window.clearInterval(interval);
  }, [isCommitting]);

  useEffect(() => {
    if (!gameState) return;
    if (gameState.game.current_sprint === 1) {
      setShowCeoShift(true);
      setIsMetricsExpanded(false); // Closed for Sprint 1
    } else {
      setIsMetricsExpanded(true); // Auto-open for Sprint 2+
    }

    // Auto-add mandatory tickets to sprint
    const mandatoryTickets = gameState.sprint.backlog.filter(t => t.is_mandatory);
    if (mandatoryTickets.length > 0) {
      const mandatoryCommitted = mandatoryTickets.map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        effort: ticket.effort,
        category: ticket.category,
        categoryClass: categoryToClass[ticket.category] || 'catDefault'
      }));
      setCommittedTickets(mandatoryCommitted);
    }
  }, [gameState]);

  if (isLoading || !gameState) {
    return null; // Don't show default loading - home page loading overlay handles it
  }

  const metrics = gameState.game.metrics_state;

  const sprintCapacity = Math.floor(gameState.sprint.effective_capacity);
  const stretchCapacity = Math.floor(sprintCapacity * 1.25);

  // Estimate "lost" capacity due to low morale
  // Base capacity assumes ~50 team sentiment as baseline
  const baseSentiment = 50;
  const sentimentDiff = Math.max(0, baseSentiment - metrics.team_sentiment);
  const lostCapacityEstimate = Math.floor((sentimentDiff / 50) * sprintCapacity * 0.3); // Up to 30% capacity loss
  const displayCapacity = sprintCapacity + lostCapacityEstimate;

  const usedCapacity = committedTickets.reduce((sum, t) => sum + t.effort, 0);
  const capacityPercent = (usedCapacity / stretchCapacity) * 100;
  const capacityLimitPercent = (sprintCapacity / stretchCapacity) * 100;
  const lostCapacityPercent = (lostCapacityEstimate / stretchCapacity) * 100;
  const ceoFocusCategory = ceoFocusToCategory[gameState.quarter.ceo_focus] || '';

  // Check if ticket is CEO-aligned
  const isTicketCEOAligned = (ticketCategory: string) => {
    // Sales requests align with enterprise focus
    if (gameState.quarter.ceo_focus === 'enterprise' && ticketCategory === 'sales_request') {
      return true;
    }
    if (gameState.quarter.ceo_focus === 'tech_debt' && ticketCategory === 'infrastructure') {
      return true;
    }
    return ticketCategory === ceoFocusCategory;
  };

  const backlogTickets: Ticket[] = gameState.sprint.backlog.map(ticket => ({
    ...ticket,
    categoryClass: categoryToClass[ticket.category] || 'catDefault',
    isMandatory: ticket.is_mandatory,
    isCEOAligned: isTicketCEOAligned(ticket.category)
  }));

  const mockBacklogTickets: Ticket[] = [
    {
      id: '1',
      title: 'Revamp Dashboard Analytics',
      effort: 6,
      category: 'Self-Serve Feature',
      categoryClass: 'catSelfServe',
      description: 'Rebuild the analytics dashboard with better funnels and cohort views. Should boost self-serve signups. Will increase tech debt — quick-and-dirty is the only way to hit the timeline.'
    },
    {
      id: '2',
      title: 'SSO for Acme Corp',
      effort: 7,
      category: 'Enterprise',
      categoryClass: 'catEnterprise',
      description: 'Implement SAML-based SSO for Acme Corp\'s 2,000-seat deployment. Sales has been promising this for six weeks. Platform team can\'t touch self-serve while this ships.',
      isCEOAligned: true
    },
    {
      id: '3',
      title: 'Fix Auth Service Memory Leak',
      effort: 4,
      category: 'Tech Debt',
      categoryClass: 'catTechDebt',
      description: 'Auth service memory usage doubles every 48 hours. Currently mitigated by restarting it nightly. No direct growth impact. CTO will notice if you don\'t.'
    },
    {
      id: '4',
      title: 'Redesign Settings Page',
      effort: 4,
      category: 'UX Improvement',
      categoryClass: 'catUx',
      description: 'The settings page has 47 options on a single scroll. Users can\'t find anything. Restructure into logical sections. Low risk, minimal tradeoff. Nobody will thank you.'
    },
    {
      id: '5',
      title: 'Custom Export for GlobalTech',
      effort: 6,
      category: 'Sales Request',
      categoryClass: 'catSales',
      description: 'GlobalTech needs a custom CSV export with 14 specific columns by end of month. Will add tech debt and make the team question your priorities. Sales will love you briefly.',
      isCEOAligned: true
    },
    {
      id: '6',
      title: 'Add Usage-Based Billing',
      effort: 5,
      category: 'Monetization',
      categoryClass: 'catMonetization',
      description: 'Introduce metered billing for API usage. Could unlock new revenue. Users will not be delighted. NPS will feel it.'
    },
    {
      id: '7',
      title: 'Migrate to New CDN',
      effort: 5,
      category: 'Infrastructure',
      categoryClass: 'catInfra',
      description: 'Current CDN contract expires next quarter. Migration reduces latency and costs. Invisible to users. Invisible to leadership. The team finds it boring.'
    },
    {
      id: '8',
      title: 'AI-Powered Search',
      effort: 9,
      category: 'Moonshot',
      categoryClass: 'catMoonshot',
      description: 'Replace keyword search with semantic AI search across all content. Could be transformative. Could also be a hallucination factory. Massive effort, high failure risk, potential tech debt bomb. But imagine the demo.'
    }
  ];

  const handleCommitTicket = (ticket: Ticket) => {
    if (committedTickets.find(t => t.id === ticket.id)) return;
    setCommittedTickets([...committedTickets, {
      id: ticket.id,
      title: ticket.title,
      effort: ticket.effort,
      category: ticket.category,
      categoryClass: ticket.categoryClass
    }]);
  };

  const handleRemoveTicket = (ticketId: string) => {
    // Check if ticket is mandatory
    const ticket = backlogTickets.find(t => t.id === ticketId);
    if (ticket?.isMandatory) {
      alert('This ticket is MANDATORY and cannot be removed from the sprint. Stakeholder demand is non-negotiable.');
      return;
    }
    setCommittedTickets(committedTickets.filter(t => t.id !== ticketId));
  };

  const handleStartSprint = async () => {
    if (committedTickets.length === 0) {
      alert('Please commit at least one ticket to start the sprint.');
      return;
    }

    if (usedCapacity > stretchCapacity) {
      alert(`${usedCapacity} points? Really? That's ${usedCapacity - stretchCapacity} points over max capacity. Even your over-optimistic estimates have limits. The API will reject this, but nice try.`);
      return;
    }

    const commitStartedAt = Date.now();
    setIsCommitting(true);
    try {
      const response = await fetch('/api/sprint/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketIds: committedTickets.map(t => t.id)
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Store retro data for the retro page
        const isQuarterEnd = gameState.game.current_sprint === 3;
        sessionStorage.setItem('lastRetro', JSON.stringify({
          game: data.game,
          completedSprint: {
            sprint_number: gameState.game.current_sprint,
            quarter: gameState.game.current_quarter
          },
          retro: data.retro,
          isQuarterEnd,
          quarterSummary: data.quarter_summary,
          yearEndReview: data.year_end_review,
          ceo_focus_shift: data.ceo_focus_shift ?? null
        }));
        const elapsed = Date.now() - commitStartedAt;
        if (elapsed < 2000) {
          await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
        }
        // Navigate to sprint retro
        router.replace('/sprint-retro');
      } else {
        const error = await response.json();
        alert(`Failed to commit sprint: ${error.error || 'Unknown error'}`);
        setIsCommitting(false);
      }
    } catch (error) {
      console.error('Error committing sprint:', error);
      alert('Failed to commit sprint. Please try again.');
      setIsCommitting(false);
    }
  };

  const getCapacityClass = () => {
    if (usedCapacity > stretchCapacity) return styles.danger;
    if (usedCapacity > sprintCapacity) return styles.overbooked;
    return '';
  };

  const getSentimentFace = (value: number) => {
    if (value >= 70) return '😊';
    if (value >= 50) return '😐';
    if (value >= 30) return '😟';
    return '😠';
  };

  const getSentimentLabel = (value: number) => {
    if (value >= 70) return 'Happy';
    if (value >= 50) return 'Neutral';
    if (value >= 30) return 'Unhappy';
    return 'Angry';
  };

  const getGrowthLabel = (value: number, metricKey: string) => {
    const delta = previousDeltas?.[metricKey] || 0;
    if (delta > 5) return '↗↗';
    if (delta > 0) return '↗';
    if (delta < -5) return '↘↘';
    if (delta < 0) return '↘';
    return '→';
  };

  const getArrowColor = (metricKey: string) => {
    const delta = previousDeltas?.[metricKey] || 0;
    if (delta > 0) return '#4ade80'; // green
    if (delta < 0) return '#f87171'; // red
    return '#fbbf24'; // yellow
  };

  const getGrowthClass = (value: number) => {
    if (value >= 60) return styles.trendUp;
    if (value >= 40) return styles.trendFlat;
    return styles.trendDown;
  };

  const getTechDebtLabel = (value: number) => {
    const delta = previousDeltas?.['tech_debt'] || 0;
    if (delta > 5) return '↗↗';
    if (delta > 0) return '↗';
    if (delta < -5) return '↘↘';
    if (delta < 0) return '↘';
    return '→';
  };

  const getTechDebtArrowColor = () => {
    const delta = previousDeltas?.['tech_debt'] || 0;
    // For tech debt, increasing is bad (red) and decreasing is good (green)
    if (delta > 0) return '#f87171'; // red
    if (delta < 0) return '#4ade80'; // green
    return '#fbbf24'; // yellow
  };

  const formatCeoFocus = (focus: string) => {
    const labels: Record<string, string> = {
      'self_serve': 'Self-Serve Growth',
      'enterprise': 'Enterprise Growth',
      'tech_debt': 'Tech Debt Reduction'
    };
    return labels[focus] || focus;
  };

  const ceoFocusShift = ceoShiftOverride ?? gameState.ceo_focus_shift ?? null;
  const ceoFocusShiftNarrative = ceoFocusShift?.narrative ?? null;
  const ceoFocusShiftFrom = ceoFocusShift?.from ?? null;
  const ceoFocusShiftTo = ceoFocusShift?.to ?? gameState.quarter.ceo_focus;
  const activeLoadingMessage =
    loadingSequence[loadingIndex] || loadingMessages[0];

  return (
    <div className={styles.pageContainer}>
      {isCommitting && (
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
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>PM</div>
            <span className={styles.logoText}>PM Simulator</span>
          </div>
          <div className={styles.quarterBadge}>Q{gameState.game.current_quarter} — Sprint {gameState.game.current_sprint} of 3</div>
        </div>

        {/* Metrics Bar */}
        <div className={styles.metricsBarWrapper}>
          <div className={styles.metricsBar}>
            <div className={styles.metricItem} title={`Team Sentiment: ${getSentimentLabel(metrics.team_sentiment)} (${Math.round(metrics.team_sentiment)}/100)`}>
              <span className={styles.metricLabel}>Team</span>
              <span className={styles.metricFace}>{getSentimentFace(metrics.team_sentiment)}</span>
            </div>
            <div className={styles.metricItem} title={`CEO Sentiment: ${getSentimentLabel(metrics.ceo_sentiment)} (${Math.round(metrics.ceo_sentiment)}/100)`}>
              <span className={styles.metricLabel}>CEO</span>
              <span className={styles.metricFace}>{getSentimentFace(metrics.ceo_sentiment)}</span>
            </div>
            <div className={styles.metricItem} title={`Sales Sentiment: ${getSentimentLabel(metrics.sales_sentiment)} (${Math.round(metrics.sales_sentiment)}/100)`}>
              <span className={styles.metricLabel}>Sales</span>
              <span className={styles.metricFace}>{getSentimentFace(metrics.sales_sentiment)}</span>
            </div>
            <div className={styles.metricItem} title={`CTO Sentiment: ${getSentimentLabel(metrics.cto_sentiment)} (${Math.round(metrics.cto_sentiment)}/100)`}>
              <span className={styles.metricLabel}>CTO</span>
              <span className={styles.metricFace}>{getSentimentFace(metrics.cto_sentiment)}</span>
            </div>

            <div className={styles.metricDivider}></div>

            <div className={styles.metricItem} title={`Self-Serve Growth: ${Math.round(metrics.self_serve_growth)}/100`}>
              <span className={styles.metricLabel}>Self-Serve</span>
              <span className={`${styles.metricTrend} ${getGrowthClass(metrics.self_serve_growth)}`} style={{ color: getArrowColor('self_serve_growth') }}>
                {getGrowthLabel(metrics.self_serve_growth, 'self_serve_growth')}
              </span>
            </div>
            <div className={styles.metricItem} title={`Enterprise Growth: ${Math.round(metrics.enterprise_growth)}/100`}>
              <span className={styles.metricLabel}>Enterprise</span>
              <span className={`${styles.metricTrend} ${getGrowthClass(metrics.enterprise_growth)}`} style={{ color: getArrowColor('enterprise_growth') }}>
                {getGrowthLabel(metrics.enterprise_growth, 'enterprise_growth')}
              </span>
            </div>

            <div className={styles.metricDivider}></div>

            <div className={styles.metricItem} title={`Tech Debt: ${getTechDebtLabel(metrics.tech_debt)} (${Math.round(metrics.tech_debt)}/100)`}>
              <span className={styles.metricLabel}>Tech Debt</span>
              <span className={`${styles.metricTrend} ${styles.trendMounting}`} style={{ color: getTechDebtArrowColor() }}>
                {getTechDebtLabel(metrics.tech_debt)}
              </span>
            </div>

            <button
              className={styles.metricsExpandBtn}
              onClick={() => setIsMetricsExpanded(!isMetricsExpanded)}
              title={isMetricsExpanded ? 'Collapse detailed metrics' : 'Expand detailed metrics'}
            >
              {isMetricsExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {/* Detailed Metrics Dropdown */}
          {isMetricsExpanded && (
            <div className={styles.metricsDropdown}>
              <div className={styles.metricsDropdownGrid}>
                <div className={styles.metricsDropdownItem}>
                  <div className={styles.metricsDropdownName}>Team Sentiment</div>
                  <div className={styles.metricsDropdownValueRow}>
                    <div className={styles.metricsDropdownValue}>{Math.round(metrics.team_sentiment)}</div>
                    {previousDeltas && previousDeltas.team_sentiment !== undefined && previousDeltas.team_sentiment !== 0 && (
                      <div className={`${styles.metricsDropdownDelta} ${previousDeltas.team_sentiment > 0 ? styles.deltaPositive : styles.deltaNegative}`}>
                        {previousDeltas.team_sentiment > 0 ? '+' : ''}{Math.round(previousDeltas.team_sentiment)}
                      </div>
                    )}
                  </div>
                  <div className={styles.metricsDropdownBar}>
                    <div
                      className={`${styles.metricsDropdownBarFill} ${
                        metrics.team_sentiment >= 70 ? styles.positive : metrics.team_sentiment < 50 ? styles.warning : styles.neutral
                      }`}
                      style={{ width: `${metrics.team_sentiment}%` }}
                    ></div>
                  </div>
                </div>
                <div className={styles.metricsDropdownItem}>
                  <div className={styles.metricsDropdownName}>CEO Sentiment</div>
                  <div className={styles.metricsDropdownValueRow}>
                    <div className={styles.metricsDropdownValue}>{Math.round(metrics.ceo_sentiment)}</div>
                    {previousDeltas && previousDeltas.ceo_sentiment !== undefined && previousDeltas.ceo_sentiment !== 0 && (
                      <div className={`${styles.metricsDropdownDelta} ${previousDeltas.ceo_sentiment > 0 ? styles.deltaPositive : styles.deltaNegative}`}>
                        {previousDeltas.ceo_sentiment > 0 ? '+' : ''}{Math.round(previousDeltas.ceo_sentiment)}
                      </div>
                    )}
                  </div>
                  <div className={styles.metricsDropdownBar}>
                    <div
                      className={`${styles.metricsDropdownBarFill} ${
                        metrics.ceo_sentiment >= 70 ? styles.positive : metrics.ceo_sentiment < 50 ? styles.warning : styles.neutral
                      }`}
                      style={{ width: `${metrics.ceo_sentiment}%` }}
                    ></div>
                  </div>
                </div>
                <div className={styles.metricsDropdownItem}>
                  <div className={styles.metricsDropdownName}>Sales Sentiment</div>
                  <div className={styles.metricsDropdownValueRow}>
                    <div className={styles.metricsDropdownValue}>{Math.round(metrics.sales_sentiment)}</div>
                    {previousDeltas && previousDeltas.sales_sentiment !== undefined && previousDeltas.sales_sentiment !== 0 && (
                      <div className={`${styles.metricsDropdownDelta} ${previousDeltas.sales_sentiment > 0 ? styles.deltaPositive : styles.deltaNegative}`}>
                        {previousDeltas.sales_sentiment > 0 ? '+' : ''}{Math.round(previousDeltas.sales_sentiment)}
                      </div>
                    )}
                  </div>
                  <div className={styles.metricsDropdownBar}>
                    <div
                      className={`${styles.metricsDropdownBarFill} ${
                        metrics.sales_sentiment >= 70 ? styles.positive : metrics.sales_sentiment < 50 ? styles.warning : styles.neutral
                      }`}
                      style={{ width: `${metrics.sales_sentiment}%` }}
                    ></div>
                  </div>
                </div>
                <div className={styles.metricsDropdownItem}>
                  <div className={styles.metricsDropdownName}>CTO Sentiment</div>
                  <div className={styles.metricsDropdownValueRow}>
                    <div className={styles.metricsDropdownValue}>{Math.round(metrics.cto_sentiment)}</div>
                    {previousDeltas && previousDeltas.cto_sentiment !== undefined && previousDeltas.cto_sentiment !== 0 && (
                      <div className={`${styles.metricsDropdownDelta} ${previousDeltas.cto_sentiment > 0 ? styles.deltaPositive : styles.deltaNegative}`}>
                        {previousDeltas.cto_sentiment > 0 ? '+' : ''}{Math.round(previousDeltas.cto_sentiment)}
                      </div>
                    )}
                  </div>
                  <div className={styles.metricsDropdownBar}>
                    <div
                      className={`${styles.metricsDropdownBarFill} ${
                        metrics.cto_sentiment >= 70 ? styles.positive : metrics.cto_sentiment < 50 ? styles.warning : styles.neutral
                      }`}
                      style={{ width: `${metrics.cto_sentiment}%` }}
                    ></div>
                  </div>
                </div>
                <div className={styles.metricsDropdownItem}>
                  <div className={styles.metricsDropdownName}>Self-Serve Growth</div>
                  <div className={styles.metricsDropdownValueRow}>
                    <div className={styles.metricsDropdownValue}>{Math.round(metrics.self_serve_growth)}</div>
                    {previousDeltas && previousDeltas.self_serve_growth !== undefined && previousDeltas.self_serve_growth !== 0 && (
                      <div className={`${styles.metricsDropdownDelta} ${previousDeltas.self_serve_growth > 0 ? styles.deltaPositive : styles.deltaNegative}`}>
                        {previousDeltas.self_serve_growth > 0 ? '+' : ''}{Math.round(previousDeltas.self_serve_growth)}
                      </div>
                    )}
                  </div>
                  <div className={styles.metricsDropdownBar}>
                    <div
                      className={`${styles.metricsDropdownBarFill} ${
                        metrics.self_serve_growth >= 70 ? styles.positive : metrics.self_serve_growth < 50 ? styles.warning : styles.neutral
                      }`}
                      style={{ width: `${metrics.self_serve_growth}%` }}
                    ></div>
                  </div>
                </div>
                <div className={styles.metricsDropdownItem}>
                  <div className={styles.metricsDropdownName}>Enterprise Growth</div>
                  <div className={styles.metricsDropdownValueRow}>
                    <div className={styles.metricsDropdownValue}>{Math.round(metrics.enterprise_growth)}</div>
                    {previousDeltas && previousDeltas.enterprise_growth !== undefined && previousDeltas.enterprise_growth !== 0 && (
                      <div className={`${styles.metricsDropdownDelta} ${previousDeltas.enterprise_growth > 0 ? styles.deltaPositive : styles.deltaNegative}`}>
                        {previousDeltas.enterprise_growth > 0 ? '+' : ''}{Math.round(previousDeltas.enterprise_growth)}
                      </div>
                    )}
                  </div>
                  <div className={styles.metricsDropdownBar}>
                    <div
                      className={`${styles.metricsDropdownBarFill} ${
                        metrics.enterprise_growth >= 70 ? styles.positive : metrics.enterprise_growth < 50 ? styles.warning : styles.neutral
                      }`}
                      style={{ width: `${metrics.enterprise_growth}%` }}
                    ></div>
                  </div>
                </div>
                <div className={styles.metricsDropdownItem}>
                  <div className={styles.metricsDropdownName}>Tech Debt</div>
                  <div className={styles.metricsDropdownValueRow}>
                    <div className={styles.metricsDropdownValue}>{Math.round(metrics.tech_debt)}</div>
                    {previousDeltas && previousDeltas.tech_debt !== undefined && previousDeltas.tech_debt !== 0 && (
                      <div className={`${styles.metricsDropdownDelta} ${previousDeltas.tech_debt > 0 ? styles.deltaNegative : styles.deltaPositive}`}>
                        {previousDeltas.tech_debt > 0 ? '+' : ''}{Math.round(previousDeltas.tech_debt)}
                      </div>
                    )}
                  </div>
                  <div className={styles.metricsDropdownBar}>
                    <div
                      className={`${styles.metricsDropdownBarFill} ${
                        metrics.tech_debt >= 70 ? styles.warning : metrics.tech_debt < 50 ? styles.positive : styles.neutral
                      }`}
                      style={{ width: `${metrics.tech_debt}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.topBarRight}>
          <div className={styles.avatar}>S</div>
        </div>
      </div>


      {/* CEO Focus Banner */}
      <div className={styles.ceoFocusBanner}>
        <div className={styles.ceoFocusRow}>
          <span className={styles.ceoFocusLabel}>CEO Focus this Quarter:</span>
          <span className={styles.ceoFocusValue}>{formatCeoFocus(ceoFocusShiftTo)}</span>
          <span className={styles.ceoFocusHint}>— aligned tickets get +12% success chance</span>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left Panel: Backlog */}
        <div className={styles.backlogPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Backlog</span>
            <span className={styles.panelCount}>{backlogTickets.length} tickets</span>
          </div>
          <div className={styles.panelSubtitle}>Available work. Choose wisely. Or don't.</div>

          {backlogTickets.map(ticket => {
            const isCommitted = committedTickets.some(t => t.id === ticket.id);
            return (
              <div
                key={ticket.id}
                className={`${styles.ticketCard} ${ticket.isCEOAligned ? styles.ceoAligned : ''} ${ticket.isMandatory ? styles.mandatory : ''} ${isCommitted ? styles.committed : ''}`}
                onClick={() => !isCommitted && handleCommitTicket(ticket)}
              >
                <div className={styles.ticketTopRow}>
                  <span className={styles.ticketTitle}>{ticket.title}</span>
                  <span className={styles.ticketEffort}>{ticket.effort} pts</span>
                </div>
                <div className={styles.ticketTags}>
                  <span className={`${styles.ticketCategory} ${styles[ticket.categoryClass]}`}>
                    {ticket.category}
                  </span>
                  {ticket.isCEOAligned && <span className={styles.ticketCeoTag}>★ CEO Aligned</span>}
                  {ticket.isMandatory && <span className={styles.ticketMandatoryTag}>MANDATORY</span>}
                </div>
                <div className={styles.ticketDesc}>
                  {ticket.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Panel: Sprint */}
        <div className={styles.sprintPanel}>
          {/* Capacity Section */}
          <div className={styles.capacitySection}>
            <div className={styles.capacityHeader}>
              <span className={styles.capacityLabel}>Sprint Capacity</span>
              <span className={styles.capacityNumbers}>
                <span className={styles.used}>{usedCapacity}</span> / {sprintCapacity} pts used
              </span>
            </div>

            {/* Team Morale Alert */}
            {metrics.team_sentiment < 40 && (
              <div style={{
                background: 'rgba(255, 100, 100, 0.1)',
                border: '1px solid rgba(255, 100, 100, 0.3)',
                borderRadius: '6px',
                padding: '8px 12px',
                marginBottom: '12px',
                fontSize: '13px',
                color: '#ff6b6b'
              }}>
                Your team is updating their LinkedIn profiles. Capacity reduced to {sprintCapacity} pts
              </div>
            )}
            {metrics.team_sentiment >= 70 && (
              <div style={{
                background: 'rgba(100, 255, 150, 0.1)',
                border: '1px solid rgba(100, 255, 150, 0.3)',
                borderRadius: '6px',
                padding: '8px 12px',
                marginBottom: '12px',
                fontSize: '13px',
                color: '#6bffb0'
              }}>
                Your team is vibing. Capacity up to {sprintCapacity} pts
              </div>
            )}
            <div className={styles.capacityBarTrack}>
              <div className={styles.capacityBarStretch} style={{ left: `${capacityLimitPercent}%`, right: 0 }}></div>
              <div className={styles.capacityBarLimit} style={{ left: `${capacityLimitPercent}%` }}></div>
              <div className={`${styles.capacityBarFill} ${getCapacityClass()}`} style={{ width: `${capacityPercent}%` }}></div>

              {/* Show lost capacity due to low morale */}
              {lostCapacityEstimate > 0 && (
                <div style={{
                  position: 'absolute',
                  left: `${capacityLimitPercent}%`,
                  width: `${lostCapacityPercent}%`,
                  height: '100%',
                  backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,100,100,0.2) 0px, rgba(255,100,100,0.2) 2px, transparent 2px, transparent 6px)',
                  border: '1px dashed rgba(255,100,100,0.4)',
                  borderRadius: '0 4px 4px 0',
                  pointerEvents: 'none'
                }} title={`${lostCapacityEstimate} pts lost to low morale`}></div>
              )}
            </div>
            <div className={styles.capacityLabelsRow}>
              <span className={styles.capacitySublabel}>0 pts</span>
              <span className={styles.capacitySublabel} style={{ position: 'relative', left: '-10%' }}>
                {sprintCapacity} pts capacity{lostCapacityEstimate > 0 && ` (${lostCapacityEstimate} pts lost)`}
              </span>
              <span className={`${styles.capacitySublabel} ${styles.warn}`}>{stretchCapacity} pts max (stretch)</span>
            </div>
          </div>

          {/* Committed Section */}
          <div className={styles.committedSection}>
            <div className={styles.committedHeader}>
              <span className={styles.committedTitle}>Committed</span>
              <span className={styles.committedCount}>
                {committedTickets.length} tickets — {Math.max(0, sprintCapacity - usedCapacity)} pts remaining
              </span>
            </div>

            {committedTickets.length > 0 ? (
              <div className={styles.committedTickets}>
                {committedTickets.map(ticket => {
                  const isMandatory = backlogTickets.find(t => t.id === ticket.id)?.isMandatory;
                  return (
                    <div key={ticket.id} className={styles.committedTicket}>
                      <div className={styles.committedTicketLeft}>
                        <span className={`${styles.ticketCategory} ${styles[ticket.categoryClass]}`} style={{ fontSize: '9px' }}>
                          {ticket.category}
                        </span>
                        <span className={styles.committedTicketTitle}>{ticket.title}</span>
                        <span className={styles.committedTicketEffort}>{ticket.effort} pts</span>
                      </div>
                      {isMandatory ? (
                        <span className={styles.committedTicketRemove} style={{ cursor: 'not-allowed', opacity: 0.5 }} title="Mandatory - cannot remove">
                          🔒
                        </span>
                      ) : (
                        <span className={styles.committedTicketRemove} onClick={() => handleRemoveTicket(ticket.id)}>
                          ×
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* Drop Zone */}
            <div className={styles.dropZone}>
              <div className={styles.dropZoneIcon}>↴</div>
              <div className={styles.dropZoneText}>Click tickets on the left to commit them</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomBarLeft}>
          {metrics.sales_sentiment < 40 && 'Sales is unhappy. '}
          {metrics.ceo_sentiment < 50 && 'CEO is watching. '}
          {metrics.tech_debt > 60 && 'Tech debt is mounting. '}
          {metrics.team_sentiment < 40 && 'Team morale is low. '}
          Only {sprintCapacity} points. Choose wisely.
        </div>
        <div className={styles.bottomBarRight}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setCommittedTickets([])}>Reset Sprint</button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleStartSprint}
            disabled={isCommitting || committedTickets.length === 0}
            style={{
              opacity: (isCommitting || committedTickets.length === 0) ? 0.4 : 1,
              cursor: (isCommitting || committedTickets.length === 0) ? 'not-allowed' : 'pointer'
            }}
          >
            {isCommitting ? 'Committing...' : committedTickets.length === 0 ? 'Add Tickets to Start' : 'Start Sprint'}
          </button>
        </div>
      </div>
    </div>
  );
}
