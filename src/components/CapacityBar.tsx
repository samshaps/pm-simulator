'use client';

import React from 'react';
import styles from './CapacityBar.module.css';

interface CapacityBarProps {
  usedCapacity: number;
  normalCapacity: number; // 0-100%
  stretchCapacity: number; // 100-130%
  showStretchBadge?: boolean;
  showOvercapacityWarning?: boolean;
}

export default function CapacityBar({
  usedCapacity,
  normalCapacity,
  stretchCapacity,
  showStretchBadge = false,
  showOvercapacityWarning = false
}: CapacityBarProps) {
  const usedPercent = (usedCapacity / stretchCapacity) * 100;
  const normalPercent = (normalCapacity / stretchCapacity) * 100;

  // Determine state
  const isNormal = usedCapacity <= normalCapacity;
  const isStretch = usedCapacity > normalCapacity && usedCapacity <= stretchCapacity;
  const isOvercapacity = usedCapacity > stretchCapacity;

  return (
    <div className={styles.capacityBarContainer}>
      <div className={styles.capacityHeader}>
        <span className={styles.capacityLabel}>Sprint Capacity</span>
        <span className={styles.capacityNumbers}>
          <span className={styles.used}>{usedCapacity}</span> / {normalCapacity}
        </span>
      </div>

      {/* Stretch Badge */}
      {isStretch && showStretchBadge && (
        <div className={styles.stretchBadge}>
          STRETCH!
        </div>
      )}

      {/* Overcapacity Warning */}
      {isOvercapacity && showOvercapacityWarning && (
        <div className={styles.overcapacityWarning}>
          ⚠️ Your EM looks at you menacingly. We suggest you pull things back a bit.
        </div>
      )}

      {/* Capacity Bar */}
      <div className={styles.capacityBarTrack}>
        {/* Stretch zone background (cross-hatched) */}
        <div
          className={styles.stretchZone}
          style={{
            left: `${normalPercent}%`,
            width: `${100 - normalPercent}%`
          }}
        ></div>

        {/* Normal capacity marker */}
        <div
          className={styles.capacityMarker}
          style={{ left: `${normalPercent}%` }}
        ></div>

        {/* Used capacity fill */}
        <div
          className={`${styles.capacityFill} ${
            isOvercapacity ? styles.overcapacity : isStretch ? styles.stretch : styles.normal
          }`}
          style={{ width: `${Math.min(usedPercent, 100)}%` }}
        ></div>
      </div>

      <div className={styles.capacityLabels}>
        <span className={styles.label}>0 pts</span>
        <span className={styles.label}>{normalCapacity} pts</span>
        <span className={`${styles.label} ${styles.warn}`}>{stretchCapacity} pts (max)</span>
      </div>
    </div>
  );
}
