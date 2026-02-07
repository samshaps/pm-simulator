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

export default function SprintPlanning() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommitting, setIsCommitting] = useState(false);
  const [committedTickets, setCommittedTickets] = useState<CommittedTicket[]>([]);
  const [previousDeltas, setPreviousDeltas] = useState<Record<string, number> | null>(null);

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

  if (isLoading || !gameState) {
    return <div className={styles.pageContainer}>Loading sprint data...</div>;
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
          yearEndReview: data.year_end_review
        }));
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

  const formatCeoFocus = (focus: string) => {
    const labels: Record<string, string> = {
      'self_serve': 'Self-Serve Growth',
      'enterprise': 'Enterprise Growth',
      'tech_debt': 'Tech Debt Reduction'
    };
    return labels[focus] || focus;
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
          <div className={styles.quarterBadge}>Q{gameState.game.current_quarter} — Sprint {gameState.game.current_sprint} of 3</div>
        </div>

        {/* Metrics Bar */}
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
            <span className={`${styles.metricTrend} ${getGrowthClass(metrics.self_serve_growth)}`}>{getGrowthLabel(metrics.self_serve_growth, 'self_serve_growth')}</span>
          </div>
          <div className={styles.metricItem} title={`Enterprise Growth: ${Math.round(metrics.enterprise_growth)}/100`}>
            <span className={styles.metricLabel}>Enterprise</span>
            <span className={`${styles.metricTrend} ${getGrowthClass(metrics.enterprise_growth)}`}>{getGrowthLabel(metrics.enterprise_growth, 'enterprise_growth')}</span>
          </div>

          <div className={styles.metricDivider}></div>

          <div className={styles.metricItem} title={`Tech Debt: ${getTechDebtLabel(metrics.tech_debt)} (${Math.round(metrics.tech_debt)}/100)`}>
            <span className={styles.metricLabel}>Tech Debt</span>
            <span className={`${styles.metricTrend} ${styles.trendMounting}`}>{getTechDebtLabel(metrics.tech_debt)}</span>
          </div>
        </div>

        <div className={styles.topBarRight}>
          <div className={styles.avatar}>S</div>
        </div>
      </div>

      {/* CEO Focus Banner */}
      <div className={styles.ceoFocusBanner}>
        <span className={styles.ceoFocusLabel}>CEO Focus this Quarter:</span>
        <span className={styles.ceoFocusValue}>{formatCeoFocus(gameState.quarter.ceo_focus)}</span>
        <span className={styles.ceoFocusHint}>— aligned tickets get +12% success chance</span>
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
                ⚠️ Team morale is low — capacity reduced to {sprintCapacity} pts
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
                ✨ Team morale is high — capacity at {sprintCapacity} pts
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
                {committedTickets.map(ticket => (
                  <div key={ticket.id} className={styles.committedTicket}>
                    <div className={styles.committedTicketLeft}>
                      <span className={`${styles.ticketCategory} ${styles[ticket.categoryClass]}`} style={{ fontSize: '9px' }}>
                        {ticket.category}
                      </span>
                      <span className={styles.committedTicketTitle}>{ticket.title}</span>
                      <span className={styles.committedTicketEffort}>{ticket.effort} pts</span>
                    </div>
                    <span className={styles.committedTicketRemove} onClick={() => handleRemoveTicket(ticket.id)}>
                      ×
                    </span>
                  </div>
                ))}
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
