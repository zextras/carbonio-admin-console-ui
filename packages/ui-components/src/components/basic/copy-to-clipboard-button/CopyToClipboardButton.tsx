/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import clsx from 'clsx';
import { type FC, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Tooltip } from '../../display/Tooltip';
import styles from './CopyToClipboardButton.module.css';

type CopyToClipboardButtonProps = {
  value: string;
  iconSize?: string;
  autoHideMs?: number;
  copyTooltipLabel?: string;
  copiedLabel?: string;
  ariaLabel?: string;
  className?: string;
};

const DEFAULT_AUTO_HIDE_MS = 3000;

const CopyToClipboardButton: FC<CopyToClipboardButtonProps> = ({
  value,
  iconSize = '1.5rem',
  autoHideMs = DEFAULT_AUTO_HIDE_MS,
  copyTooltipLabel,
  copiedLabel,
  ariaLabel,
  className,
}) => {
  const { t } = useTranslation();
  const buttonRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floatingCleanupRef = useRef<(() => void) | null>(null);

  const tooltipLabel = copyTooltipLabel ?? t('label.copy_to_clipboard', 'Copy to clipboard');
  const copiedText = copiedLabel ?? t('label.copied_to_clipboard', 'Copied to clipboard');
  const ariaLabelText = ariaLabel ?? t('label.copy', 'Copy');

  const handleClick = async (): Promise<void> => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      const button = buttonRef.current;
      const pill = pillRef.current;
      if (!button || !pill) return;
      pill.showPopover();
      floatingCleanupRef.current?.();
      floatingCleanupRef.current = autoUpdate(button, pill, () => {
        computePosition(button, pill, {
          placement: 'right',
          strategy: 'fixed',
          middleware: [offset(8), flip(), shift({ padding: 8 })],
        }).then(({ x, y }) => {
          pill.style.left = `${x}px`;
          pill.style.top = `${y}px`;
        });
      });
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        pill.hidePopover();
        floatingCleanupRef.current?.();
        floatingCleanupRef.current = null;
      }, autoHideMs);
    } catch {
      /* copy failed — no confirmation shown */
    }
  };

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      floatingCleanupRef.current?.();
    };
  }, []);

  return (
    <>
      <Tooltip label={tooltipLabel} triggerRef={buttonRef}>
        <button
          type="button"
          className={clsx(styles.copyButton, className)}
          onClick={handleClick}
          aria-label={ariaLabelText}
        >
          <ds-icon icon="Copy" size={iconSize} color="primary" />
        </button>
      </Tooltip>
      <div
        popover="manual"
        ref={pillRef}
        className={styles.copyPill}
        role="status"
        aria-live="polite"
      >
        <span className={styles.copyPillInner}>
          <ds-icon icon="CheckmarkOutline" size="small" color="success" />
          <ds-text size="small">{copiedText}</ds-text>
        </span>
      </div>
    </>
  );
};

export type { CopyToClipboardButtonProps };
export { CopyToClipboardButton };
