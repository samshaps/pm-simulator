'use client';

import React from 'react';
import styles from './TicketTile.module.css';

interface TicketTileProps {
  id: string;
  title: string;
  effort: number;
  category: string;
  impactLevel: number; // 1-3 (1 = low, 2 = medium, 3 = high)
  isCEOAligned?: boolean;
  isMandatory?: boolean;
  isHackathonBoosted?: boolean;
  isCommitted?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  onHover?: () => void;
  onHoverEnd?: () => void;
}

export default function TicketTile({
  id,
  title,
  effort,
  category,
  impactLevel,
  isCEOAligned = false,
  isMandatory = false,
  isHackathonBoosted = false,
  isCommitted = false,
  onClick,
  onRemove,
  showRemoveButton = false,
  onHover,
  onHoverEnd
}: TicketTileProps) {

  // Signal bars — impact indicator, large, right column bottom
  const renderImpactIndicator = () => (
    <div className={styles.signalBars} title={`Impact: ${['Low', 'Medium', 'High'][impactLevel - 1] ?? 'Unknown'}`}>
      {[1, 2, 3].map(bar => (
        <div
          key={bar}
          className={`${styles.signalBar} ${bar <= impactLevel ? styles.signalBarActive : styles.signalBarDim}`}
          style={{ height: `${10 + bar * 6}px` }}
        />
      ))}
    </div>
  );

  // Effort number — large, right column top
  const renderEffortBadge = () => (
    <div className={styles.effortBadge} title={`Effort: ${effort} points`}>
      {effort}
    </div>
  );

  // Powerup message — bottom of left column, centered, only if applicable
  const renderPowerupMessage = () => {
    if (isMandatory) {
      return <span className={`${styles.powerupPill} ${styles.powerupMandatory}`}>🔒 Mandatory</span>;
    }
    if (isCEOAligned) {
      return <span className={`${styles.powerupPill} ${styles.powerupCeo}`}>⚡ CEO Focus</span>;
    }
    if (isHackathonBoosted) {
      return <span className={`${styles.powerupPill} ${styles.powerupHackathon}`}>⚡ Hackathon</span>;
    }
    return null;
  };

  // Format category for display
  const formatCategory = (cat: string) => {
    return cat.replace(/_/g, ' ').toUpperCase();
  };

  // Map category to CSS class
  const getCategoryClass = (cat: string): string => {
    const categoryToClass: Record<string, string> = {
      'self_serve': 'catSelfServe',
      'enterprise': 'catEnterprise',
      'tech_debt': 'catTechDebt',
      'ux_improvement': 'catUx',
      'sales_request': 'catSales',
      'monetization': 'catMonetization',
      'infrastructure': 'catInfra',
      'moonshot': 'catMoonshot'
    };
    return categoryToClass[cat] || '';
  };

  const powerup = renderPowerupMessage();

  return (
    <div
      className={`${styles.ticketTile} ${isCommitted ? styles.committed : ''} ${isMandatory ? styles.mandatory : ''}`}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
    >
      {showRemoveButton && onRemove && (
        <button
          className={styles.removeButton}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title={isMandatory ? "Mandatory - cannot remove" : "Remove from sprint"}
          disabled={isMandatory}
        >
          ×
        </button>
      )}

      {/* Left: copy column */}
      <div className={styles.copy}>
        <div className={`${styles.category} ${styles[getCategoryClass(category)]}`}>
          {formatCategory(category)}
        </div>
        <div className={styles.title}>{title}</div>
        {powerup && <div className={styles.powerupRow}>{powerup}</div>}
      </div>

      {/* Right: indicators column */}
      <div className={styles.indicators}>
        {renderEffortBadge()}
        {renderImpactIndicator()}
      </div>
    </div>
  );
}
