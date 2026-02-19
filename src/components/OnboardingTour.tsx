'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './OnboardingTour.module.css';
import type { TourStep } from '@/lib/tourSteps';

interface Props {
  steps: TourStep[];
  startAtStep?: number;
  /** Offset added to local step index for the "Step X of Y" counter display */
  stepOffset?: number;
  /** Total steps across all pages, for the counter display */
  totalSteps?: number;
  /** Called when the user naturally completes all steps in this page's set */
  onComplete: () => void;
  /** Called when the user explicitly dismisses the tour (skip / X) */
  onDismiss: () => void;
}

const TOOLTIP_WIDTH = 300;
const TOOLTIP_ESTIMATED_HEIGHT = 180;
const PADDING = 16;

function getTooltipStyle(
  rect: DOMRect,
  placement: TourStep['placement']
): React.CSSProperties {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  let top = 0;
  let left = 0;

  switch (placement) {
    case 'bottom':
      top = rect.bottom + PADDING;
      left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
      break;
    case 'top':
      top = rect.top - TOOLTIP_ESTIMATED_HEIGHT - PADDING;
      left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
      break;
    case 'right':
      top = rect.top + rect.height / 2 - TOOLTIP_ESTIMATED_HEIGHT / 2;
      left = rect.right + PADDING;
      break;
    case 'left':
    default:
      top = rect.top + rect.height / 2 - TOOLTIP_ESTIMATED_HEIGHT / 2;
      left = rect.left - TOOLTIP_WIDTH - PADDING;
      break;
  }

  // Flip horizontal if it would go off screen
  if (left + TOOLTIP_WIDTH + PADDING > vw) {
    left = rect.left - TOOLTIP_WIDTH - PADDING;
  }
  if (left < PADDING) {
    left = rect.right + PADDING;
  }

  // Clamp vertical
  top = Math.max(PADDING, Math.min(vh - TOOLTIP_ESTIMATED_HEIGHT - PADDING, top));
  // Clamp horizontal
  left = Math.max(PADDING, Math.min(vw - TOOLTIP_WIDTH - PADDING, left));

  return { top, left };
}

export default function OnboardingTour({
  steps,
  startAtStep = 0,
  stepOffset = 0,
  totalSteps,
  onComplete,
  onDismiss
}: Props) {
  const [currentStep, setCurrentStep] = useState(startAtStep);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = steps[currentStep];
  const displayTotal = totalSteps ?? steps.length;
  const displayStep = stepOffset + currentStep + 1;

  const updateRect = useCallback(() => {
    if (!step) return;
    const el = document.querySelector<HTMLElement>(`[data-tour-id="${step.id}"]`);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    }
  }, [step]);

  // Locate and spotlight the target element whenever the step changes
  useEffect(() => {
    if (!step) {
      onComplete();
      return;
    }

    const el = document.querySelector<HTMLElement>(`[data-tour-id="${step.id}"]`);
    if (!el) {
      // Element not on this page – complete this page's portion of the tour
      onComplete();
      return;
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Wait for scroll to settle before measuring
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      const rect = document.querySelector<HTMLElement>(`[data-tour-id="${step.id}"]`)?.getBoundingClientRect();
      if (rect) setTargetRect(rect);
    }, 120);

    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [currentStep, step, onComplete]);

  // Re-measure on resize
  useEffect(() => {
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [updateRect]);

  const handleNext = () => {
    const next = currentStep + 1;
    if (next < steps.length) {
      setCurrentStep(next);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!step || !targetRect) return null;

  const rect = targetRect;
  const tooltipStyle = getTooltipStyle(rect, step.placement);
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  return (
    <>
      {/* Spotlight panels — four divs creating a "hole" around the target */}
      <div
        className={styles.panel}
        style={{ top: 0, left: 0, right: 0, height: Math.max(0, rect.top - 4) }}
      />
      <div
        className={styles.panel}
        style={{
          top: Math.max(0, rect.top - 4),
          left: 0,
          width: Math.max(0, rect.left - 4),
          height: rect.height + 8
        }}
      />
      <div
        className={styles.panel}
        style={{
          top: Math.max(0, rect.top - 4),
          left: rect.right + 4,
          right: 0,
          height: rect.height + 8
        }}
      />
      <div
        className={styles.panel}
        style={{ top: rect.bottom + 4, left: 0, right: 0, bottom: 0 }}
      />

      {/* Purple glow outline on the spotlit element */}
      <div
        className={styles.highlight}
        style={{
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8
        }}
      />

      {/* Tooltip bubble */}
      <div className={styles.tooltip} style={tooltipStyle}>
        <div className={styles.header}>
          <span className={styles.title}>{step.title}</span>
          <button className={styles.skipBtn} onClick={onDismiss} aria-label="Skip tour">
            Skip tour
          </button>
        </div>

        <p className={styles.body}>{step.body}</p>

        <div className={styles.footer}>
          {/* Step dots */}
          <div className={styles.dots}>
            {steps.map((_, i) => {
              let dotClass = styles.dot;
              if (i === currentStep) dotClass += ` ${styles.dotActive}`;
              else if (i < currentStep) dotClass += ` ${styles.dotComplete}`;
              return <span key={i} className={dotClass} />;
            })}
          </div>

          <div className={styles.buttons}>
            <button
              className={styles.btnBack}
              onClick={handleBack}
              disabled={isFirst}
            >
              ← Back
            </button>
            <button className={styles.btnNext} onClick={handleNext}>
              {isLast ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
