/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useId, useRef } from 'react';

import styles from '../data-table.module.css';

export type DataTableConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Wraps Tab focus between the two dialog actions so it cannot escape to
 * the page behind the overlay. Only the two wrap-around cases need manual
 * handling: plain Tab cancel→confirm follows DOM order.
 */
function cycleTabFocus(
  event: KeyboardEvent,
  cancelElement: HTMLButtonElement | null,
  confirmElement: HTMLButtonElement | null,
): void {
  const active = document.activeElement;
  if (!event.shiftKey && active === confirmElement && cancelElement) {
    event.preventDefault();
    cancelElement.focus();
  } else if (event.shiftKey && active === cancelElement && confirmElement) {
    event.preventDefault();
    confirmElement.focus();
  }
}

/**
 * Modal confirmation dialog for destructive bulk actions. Escape is
 * handled at the DOCUMENT level so it works no matter where focus sits
 * (the legacy overlay-only handler missed keys outside the overlay);
 * backdrop dismissal is a document-level press whose target is the overlay
 * itself, so the non-interactive elements carry no handlers. Focus starts
 * on the safe action (cancel) and is restored to the previously focused
 * element on close.
 */
export const DataTableConfirmDialog = ({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: DataTableConfirmDialogProps) => {
  const titleId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<Element | null>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    previouslyFocused.current = document.activeElement;
    cancelRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCancel();
        return;
      }
      if (event.key === 'Tab') {
        cycleTabFocus(event, cancelRef.current, confirmRef.current);
      }
    }
    function handlePointerDown(event: PointerEvent): void {
      if (event.target === overlay) {
        onCancel();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus();
      }
    };
  }, [onCancel]);

  return (
    <div ref={overlayRef} className={styles.confirmOverlay} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={styles.confirmDialog}
      >
        <h2 id={titleId} className={styles.confirmTitle}>
          {title}
        </h2>
        <p className={styles.confirmMessage}>{message}</p>
        <div className={styles.confirmActions}>
          <button type="button" ref={cancelRef} className={styles.confirmCancel} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={confirmRef}
            className={styles.confirmPrimary}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
