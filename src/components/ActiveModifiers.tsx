'use client';

import React from 'react';
import styles from './ActiveModifiers.module.css';

interface Modifier {
  id: string;
  icon: string; // ⚡ or 🐢
  label: string;
  description: string;
}

interface ActiveModifiersProps {
  modifiers: Modifier[];
}

export default function ActiveModifiers({ modifiers }: ActiveModifiersProps) {
  if (modifiers.length === 0) {
    return null; // Don't render if no active modifiers
  }

  return (
    <div className={styles.activeModifiersContainer}>
      <span className={styles.label}>Active Modifiers:</span>
      <div className={styles.modifiersList}>
        {modifiers.map((modifier) => (
          <div key={modifier.id} className={styles.modifierItem}>
            <span className={styles.modifierIcon}>{modifier.icon}</span>
            <span className={styles.modifierLabel}>{modifier.label}</span>
            <span className={styles.modifierDescription}>({modifier.description})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
