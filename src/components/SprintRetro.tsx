'use client';

import React from 'react';
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
}

export default function SprintRetro() {
  const narrative = "The sprint wrapped up with mixed results. Your SSO implementation for Acme Corp shipped on time, which made Sales ecstatic for about 48 hours. The custom export for GlobalTech also landed, though the team muttered about technical debt the entire time. On the flip side, you committed to more than the team could deliver, and two tickets got pushed to next sprint. CEO sentiment ticked up slightly thanks to the enterprise wins, but your team's morale took a small hit from the overcommitment.";

  const metricChanges: MetricChange[] = [
    { name: 'Team Sentiment', change: -8, changeType: 'negative' },
    { name: 'CEO Sentiment', change: 12, changeType: 'positive' },
    { name: 'Sales Sentiment', change: 15, changeType: 'positive' },
    { name: 'CTO Sentiment', change: -3, changeType: 'negative' },
    { name: 'Self-Serve Growth', change: 0, changeType: 'neutral' },
    { name: 'Enterprise Growth', change: 8, changeType: 'positive' },
    { name: 'Tech Debt', change: 12, changeType: 'negative' }
  ];

  const ticketOutcomes: TicketOutcome[] = [
    {
      title: 'SSO for Acme Corp',
      status: 'success',
      impact: 'Shipped on time. Sales is thrilled. Enterprise growth improved.'
    },
    {
      title: 'Custom Export for GlobalTech',
      status: 'success',
      impact: 'Delivered. Added tech debt as expected. Sales sentiment boosted.'
    },
    {
      title: 'Dashboard Analytics',
      status: 'partial',
      impact: 'Only 60% complete. Pushed to next sprint. No growth impact yet.'
    }
  ];

  const managerFeedback = "Not bad. You delivered on the enterprise priorities, which is what I care about this quarter. But you overcommitted and the team noticed. Next sprint, be more realistic about capacity. Also, tech debt is creeping up—the CTO mentioned it in our 1:1.";

  const handleContinue = () => {
    console.log('Continuing to next sprint');
    // TODO: Navigate to next sprint or home
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
          <div className={styles.quarterBadge}>Q2 — Sprint 1 Complete</div>
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
          Sprint 1 of 3 complete. Two more sprints until quarterly review.
        </div>
        <div className={styles.bottomBarRight}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleContinue}>
            Continue to Next Sprint
          </button>
        </div>
      </div>
    </div>
  );
}
