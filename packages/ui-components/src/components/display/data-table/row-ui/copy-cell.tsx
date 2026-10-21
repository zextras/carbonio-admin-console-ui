/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Portal } from '../../../utilities/Portal';
import styles from '../data-table.module.css';
import { stopEventPropagation } from './stop-propagation';

const COPIED_TOOLTIP_MS = 2000;

type DataTableCopyCellProps = {
  value: string;
  onCopy: () => void;
  children: ReactNode;
};

export const DataTableCopyCell = ({ value, onCopy, children }: DataTableCopyCellProps) => {
  const { t } = useTranslation();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floatingCleanupRef = useRef<(() => void) | null>(null);
  const [showCopied, setShowCopied] = useState(false);

  const copiedLabel = t('data_table.copied', 'Copied');

  useEffect(() => {
    if (!showCopied) {
      floatingCleanupRef.current?.();
      floatingCleanupRef.current = null;
      return undefined;
    }

    const button = buttonRef.current;
    const tooltip = tooltipRef.current;
    if (!button || !tooltip) {
      return undefined;
    }

    floatingCleanupRef.current = autoUpdate(button, tooltip, () => {
      void computePosition(button, tooltip, {
        placement: 'top',
        strategy: 'fixed',
        middleware: [offset(8), flip(), shift({ padding: 8 })],
      }).then(({ x, y }) => {
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
      });
    });

    return () => {
      floatingCleanupRef.current?.();
      floatingCleanupRef.current = null;
    };
  }, [showCopied]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      floatingCleanupRef.current?.();
    };
  }, []);

  function handleCopyClick(event: React.MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    onCopy();
    setShowCopied(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      setShowCopied(false);
      hideTimerRef.current = null;
    }, COPIED_TOOLTIP_MS);
  }

  return (
    <span className={styles.copyCell}>
      <span className={styles.copyCellValue} title={value || undefined}>
        {children}
      </span>
      {value !== '' && (
        <>
          <button
            ref={buttonRef}
            type="button"
            className={styles.hoverAction}
            aria-label={t('data_table.copy', 'Copy {{value}}', { value })}
            onClick={handleCopyClick}
            onKeyDown={stopEventPropagation}
          >
            ⧉
          </button>
          <Portal show={showCopied}>
            <output ref={tooltipRef} className={styles.copyFeedbackTooltip}>
              {copiedLabel}
            </output>
          </Portal>
        </>
      )}
    </span>
  );
};
