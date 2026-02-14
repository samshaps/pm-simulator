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
}

export default function MetricBarWithPreview({
  name,
  currentValue,
  previewValue,
  previewMin,
  previewMax,
  previewConfidence = 0.7,
  isPositiveImpact = true,
  showDangerZone = true
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

  return (
    <div className={styles.metricBarContainer}>
      <div className={styles.metricHeader}>
        <span className={styles.metricName}>{name}</span>
        <span className={styles.metricValue}>{Math.round(currentValue)}</span>
      </div>

      <div className={styles.barTrack}>
        {/* Danger Zone (0-20) */}
        {showDangerZone && (
          <div className={styles.dangerZone}></div>
        )}

        {/* Current Value Bar */}
        <div
          className={styles.currentBar}
          style={{ width: `${currentValue}%` }}
        ></div>

        {/* Preview Overlay (cross-hatched) */}
        {hasPreview && previewRange && (
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
