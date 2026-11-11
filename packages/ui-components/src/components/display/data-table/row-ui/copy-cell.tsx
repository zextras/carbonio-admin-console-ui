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
  const tooltipRef = useRef<HTMLOutputElement>(null);
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
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <g clipPath="url(#clip0_963_3452)">
                <path d="M9 4.5H7.5V2.835C7.49868 2.48134 7.35761 2.14254 7.10753 1.89247C6.85746 1.64239 6.51866 1.50132 6.165 1.5H2.835C2.48134 1.50132 2.14254 1.64239 1.89247 1.89247C1.64239 2.14254 1.50132 2.48134 1.5 2.835V6.165C1.50132 6.51866 1.64239 6.85746 1.89247 7.10753C2.14254 7.35761 2.48134 7.49868 2.835 7.5H4.5V9C4.5 9.39782 4.65804 9.77936 4.93934 10.0607C5.22064 10.342 5.60218 10.5 6 10.5H9C9.39782 10.5 9.77936 10.342 10.0607 10.0607C10.342 9.77936 10.5 9.39782 10.5 9V6C10.5 5.60218 10.342 5.22064 10.0607 4.93934C9.77936 4.65804 9.39782 4.5 9 4.5ZM4.5 6V6.5H2.835C2.74615 6.5 2.66094 6.46471 2.59812 6.40188C2.53529 6.33906 2.5 6.25385 2.5 6.165V2.835C2.5 2.74615 2.53529 2.66094 2.59812 2.59812C2.66094 2.53529 2.74615 2.5 2.835 2.5H6.165C6.25385 2.5 6.33906 2.53529 6.40188 2.59812C6.46471 2.66094 6.5 2.74615 6.5 2.835V4.5H6C5.60218 4.5 5.22064 4.65804 4.93934 4.93934C4.65804 5.22064 4.5 5.60218 4.5 6Z" fill="#414141"/>
              </g>
              <defs>
                <clipPath id="clip0_963_3452">
                  <rect width="12" height="12" fill="white"/>
                </clipPath>
              </defs>
            </svg>
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
