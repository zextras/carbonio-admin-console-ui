/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../web-components/ds-icon';

import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Tooltip } from '../../display/Tooltip';
import styles from './copy-to-clipboard-button.module.css';

type CopyToClipboardButtonProps = {
  value: string;
  autoHideMs?: number;
};

const DEFAULT_AUTO_HIDE_MS = 3000;

export const CopyToClipboardButton = ({
  value,
  autoHideMs = DEFAULT_AUTO_HIDE_MS,
}: CopyToClipboardButtonProps) => {
  const { t } = useTranslation();
  const buttonRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floatingCleanupRef = useRef<(() => void) | null>(null);

  const tooltipLabel = t('label.copy_to_clipboard', 'Copy to clipboard');
  const copiedText = t('label.copied_to_clipboard', 'Copied to clipboard');
  const ariaLabelText = t('label.copy', 'Copy');

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
      floatingCleanupRef.current = null;
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
          className={styles.copyButton}
          onClick={handleClick}
          aria-label={ariaLabelText}
        >
          <ds-icon icon="Copy" size="medium" color="primary" />
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
