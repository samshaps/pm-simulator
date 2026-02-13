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
  // Render fire icons based on impact level
  const renderImpactIndicator = () => {
    const fires = [];
    for (let i = 0; i < 3; i++) {
      fires.push(
        <span key={i} className={i < impactLevel ? styles.fireFilled : styles.fireEmpty}>
          🔥
        </span>
      );
    }
    return <div className={styles.impactRow}>{fires}</div>;
  };

  // Render effort oval (size based on points)
  const renderEffortOval = () => {
    let sizeClass = styles.ovalSmall;
    if (effort >= 7) {
      sizeClass = styles.ovalLarge;
    } else if (effort >= 4) {
      sizeClass = styles.ovalMedium;
    }
    return <div className={`${styles.effortOval} ${sizeClass}`}></div>;
  };

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
        {renderEffortOval()}
        {renderModifier()}
      </div>

      <div className={styles.category}>{formatCategory(category)}</div>

      <div className={styles.title}>{title}</div>

      {isMandatory && (
        <div className={styles.mandatoryBadge}>MANDATORY</div>
      )}
    </div>
  );
}
