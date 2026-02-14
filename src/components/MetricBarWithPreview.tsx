'use client';

import React from 'react';
import styles from './MetricBarWithPreview.module.css';

interface MetricBarWithPreviewProps {
  name: string;
  currentValue: number; // 0-100
  previewValue?: number; // Expected value after ticket completion (for backward compatibility)
  previewMin?: number; // Minimum possible value (worst case)
  previewMax?: number; // Maximum possible value (best case)
  previewConfidence?: number; // 0-1, affects width of cross-hatch
  isPositiveImpact?: boolean; // true = green tint, false = red tint
  showDangerZone?: boolean; // Show red region at 0-20
  delta?: number; // The change value to display next to the metric (e.g., +5 or -3)
}

export default function MetricBarWithPreview({
  name,
  currentValue,
  previewValue,
  previewMin,
  previewMax,
  previewConfidence = 0.7,
  isPositiveImpact = true,
  showDangerZone = true,
  delta
}: MetricBarWithPreviewProps) {
  // Determine if we have a preview range
  const hasPreview = (previewMin !== undefined && previewMax !== undefined) ||
                     (previewValue !== undefined && previewValue !== currentValue);

  // Calculate preview range based on min/max or confidence
  const getPreviewRange = () => {
    if (!hasPreview) return null;

    let minValue: number;
    let maxValue: number;

    // If explicit min/max provided, use those
    if (previewMin !== undefined && previewMax !== undefined) {
      minValue = Math.max(0, Math.min(100, previewMin));
      maxValue = Math.max(0, Math.min(100, previewMax));
    }
    // Otherwise, calculate from previewValue and confidence
    else if (previewValue !== undefined) {
      const uncertainty = (1 - previewConfidence) * 15; // Max 15 point uncertainty
      minValue = Math.max(0, Math.min(previewValue - uncertainty, currentValue));
      maxValue = Math.min(100, Math.max(previewValue + uncertainty, currentValue));
    }
    else {
      return null;
    }

    return {
      start: minValue,
      end: maxValue,
      width: maxValue - minValue
    };
  };

  const previewRange = getPreviewRange();

  // Calculate previous value if we have a delta (for visual change indication)
  const previousValue = delta !== undefined ? currentValue - delta : currentValue;
  const showDeltaBar = delta !== undefined && delta !== 0;

  return (
    <div className={styles.metricBarContainer}>
      <div className={styles.metricHeader}>
        <span className={styles.metricName}>{name}</span>
        <span className={styles.metricValue}>
          {Math.round(currentValue)}
          {delta !== undefined && delta !== 0 && (
            <span
              className={styles.metricDelta}
              style={{
                color: delta > 0 ? 'var(--success)' : 'var(--error)',
                marginLeft: '8px',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              {delta > 0 ? '+' : ''}{Math.round(delta)}
            </span>
          )}
        </span>
      </div>

      <div className={styles.barTrack}>
        {/* Danger Zone (0-20) */}
        {showDangerZone && (
          <div className={styles.dangerZone}></div>
        )}

        {/* Base Bar - always show the max of current vs previous */}
        {showDeltaBar && (
          <div
            className={styles.currentBar}
            style={{
              width: `${Math.max(0, Math.min(100, Math.max(currentValue, previousValue)))}%`
            }}
          ></div>
        )}

        {/* Delta Overlay - Green for increase */}
        {showDeltaBar && delta > 0 && (
          <div
            className={styles.deltaBar}
            style={{
              position: 'absolute',
              left: `${Math.max(0, Math.min(100, previousValue))}%`,
              width: `${Math.min(delta, 100 - previousValue)}%`,
              height: '100%',
              background: 'rgba(74, 222, 128, 0.9)',
              borderRight: '2px solid rgb(74, 222, 128)',
              zIndex: 2
            }}
          ></div>
        )}

        {/* Delta Overlay - Red for decrease */}
        {showDeltaBar && delta < 0 && (
          <div
            className={styles.deltaBar}
            style={{
              position: 'absolute',
              left: `${Math.max(0, Math.min(100, currentValue))}%`,
              width: `${Math.min(Math.abs(delta), previousValue)}%`,
              height: '100%',
              background: 'rgba(248, 113, 113, 0.9)',
              borderRight: '2px solid rgb(248, 113, 113)',
              zIndex: 2
            }}
          ></div>
        )}

        {/* Current Value Bar (only shown when no delta) */}
        {!showDeltaBar && (
          <div
            className={styles.currentBar}
            style={{ width: `${currentValue}%` }}
          ></div>
        )}

        {/* Preview Overlay (cross-hatched) - only show during animation, not when delta is final */}
        {hasPreview && previewRange && !showDeltaBar && (
          <div
            className={`${styles.previewOverlay} ${
              isPositiveImpact ? styles.previewPositive : styles.previewNegative
            }`}
            style={{
              left: `${previewRange.start}%`,
              width: `${previewRange.width}%`
            }}
          ></div>
        )}
      </div>
    </div>
  );
}
