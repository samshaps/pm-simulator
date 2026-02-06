'use client';

import React, { useState } from 'react';
import styles from './SprintPlanning.module.css';

interface Ticket {
  id: string;
  title: string;
  effort: number;
  category: string;
  categoryClass: string;
  description: string;
  isMandatory?: boolean;
  isCEOAligned?: boolean;
}

interface CommittedTicket {
  id: string;
  title: string;
  effort: number;
  category: string;
  categoryClass: string;
}

export default function SprintPlanning() {
  const [committedTickets, setCommittedTickets] = useState<CommittedTicket[]>([
    { id: '2', title: 'SSO for Acme Corp', effort: 7, category: 'Enterprise', categoryClass: 'catEnterprise' },
    { id: '5', title: 'Custom Export for GlobalTech', effort: 6, category: 'Sales', categoryClass: 'catSales' }
  ]);

  const sprintCapacity = 21;
  const stretchCapacity = 26;
  const usedCapacity = committedTickets.reduce((sum, t) => sum + t.effort, 0);
  const capacityPercent = (usedCapacity / stretchCapacity) * 100;
  const capacityLimitPercent = (sprintCapacity / stretchCapacity) * 100;

  const backlogTickets: Ticket[] = [
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

  const handleStartSprint = () => {
    console.log('Starting sprint with tickets:', committedTickets);
    // TODO: Navigate to sprint execution or call API
  };

  const getCapacityClass = () => {
    if (usedCapacity > stretchCapacity) return styles.danger;
    if (usedCapacity > sprintCapacity) return styles.overbooked;
    return '';
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
          <div className={styles.quarterBadge}>Q2 — Sprint 1 of 3</div>
        </div>

        {/* Metrics Bar */}
        <div className={styles.metricsBar}>
          <div className={styles.metricItem} title="Team Sentiment: Neutral (55/100)">
            <span className={styles.metricLabel}>Team</span>
            <span className={styles.metricFace}>😐</span>
          </div>
          <div className={styles.metricItem} title="CEO Sentiment: Neutral (48/100)">
            <span className={styles.metricLabel}>CEO</span>
            <span className={styles.metricFace}>😐</span>
          </div>
          <div className={styles.metricItem} title="Sales Sentiment: Unhappy (38/100)">
            <span className={styles.metricLabel}>Sales</span>
            <span className={styles.metricFace}>😟</span>
          </div>
          <div className={styles.metricItem} title="CTO Sentiment: Neutral (52/100)">
            <span className={styles.metricLabel}>CTO</span>
            <span className={styles.metricFace}>😐</span>
          </div>

          <div className={styles.metricDivider}></div>

          <div className={styles.metricItem} title="Self-Serve Growth: Flat (45/100)">
            <span className={styles.metricLabel}>Self-Serve</span>
            <span className={`${styles.metricTrend} ${styles.trendFlat}`}>Flat →</span>
          </div>
          <div className={styles.metricItem} title="Enterprise Growth: Declining (38/100)">
            <span className={styles.metricLabel}>Enterprise</span>
            <span className={`${styles.metricTrend} ${styles.trendDown}`}>Declining ↓</span>
          </div>

          <div className={styles.metricDivider}></div>

          <div className={styles.metricItem} title="Tech Debt: Mounting (48/100)">
            <span className={styles.metricLabel}>Tech Debt</span>
            <span className={`${styles.metricTrend} ${styles.trendMounting}`}>Mounting →</span>
          </div>
        </div>

        <div className={styles.topBarRight}>
          <div className={styles.avatar}>S</div>
        </div>
      </div>

      {/* CEO Focus Banner */}
      <div className={styles.ceoFocusBanner}>
        <span className={styles.ceoFocusLabel}>CEO Focus this Quarter:</span>
        <span className={styles.ceoFocusValue}>Enterprise Growth</span>
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
            <div className={styles.capacityBarTrack}>
              <div className={styles.capacityBarStretch} style={{ left: `${capacityLimitPercent}%`, right: 0 }}></div>
              <div className={styles.capacityBarLimit} style={{ left: `${capacityLimitPercent}%` }}></div>
              <div className={`${styles.capacityBarFill} ${getCapacityClass()}`} style={{ width: `${capacityPercent}%` }}></div>
            </div>
            <div className={styles.capacityLabelsRow}>
              <span className={styles.capacitySublabel}>0 pts</span>
              <span className={styles.capacitySublabel} style={{ position: 'relative', left: '-10%' }}>{sprintCapacity} pts capacity</span>
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
          Sales is at 38 and dropping. CEO wants enterprise. Tech debt is creeping up. Only {sprintCapacity} points. Classic PM trap.
        </div>
        <div className={styles.bottomBarRight}>
          <button className={`${styles.btn} ${styles.btnGhost}`}>Reset Sprint</button>
          <button className={`${styles.btn} ${styles.btnGhost}`}>Reconsider Scope</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleStartSprint}>
            Start Sprint
          </button>
        </div>
      </div>
    </div>
  );
}
