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
  // Render signal bars for impact level (1–3)
  const renderImpactIndicator = () => (
    <div className={styles.signalBars} title={`Impact: ${['Low', 'Medium', 'High'][impactLevel - 1] ?? 'Unknown'}`}>
      {[1, 2, 3].map(bar => (
        <div
          key={bar}
          className={`${styles.signalBar} ${bar <= impactLevel ? styles.signalBarActive : styles.signalBarDim}`}
          style={{ height: `${6 + bar * 4}px` }}
        />
      ))}
    </div>
  );

  // Render effort as a number badge
  const renderEffortBadge = () => (
    <div className={styles.effortBadge} title={`Effort: ${effort} points`}>
      {effort}
    </div>
  );

  // Render modifier icon
  const renderModifier = () => {
    if (isCEOAligned) {
      return <span className={styles.modifierIcon} title="CEO Focus - 2x impact">⚡</span>;
    }
    if (isHackathonBoosted) {
      return <span className={styles.modifierIcon} title="Hackathon Boost">⚡</span>;
    }
    // Return empty square for no modifier (for consistent spacing)
    return <span className={styles.modifierIconEmpty}>⬜</span>;
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
      'moonshot': 'catMoonshot'
    };
    return categoryToClass[cat] || '';
  };

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
          {isMandatory ? '🔒' : '×'}
        </button>
      )}

      <div className={styles.iconRow}>
        {renderImpactIndicator()}
        {renderEffortBadge()}
        {renderModifier()}
      </div>

      <div className={`${styles.category} ${styles[getCategoryClass(category)]}`}>
        {formatCategory(category)}
      </div>

      <div className={styles.title}>{title}</div>

      {isMandatory && (
        <div className={styles.mandatoryBadge}>MANDATORY</div>
      )}
    </div>
  );
}
