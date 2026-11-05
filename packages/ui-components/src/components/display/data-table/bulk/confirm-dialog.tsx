/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useId, useRef } from 'react';

import styles from '../data-table.module.css';
import { useTableUi } from '../table-ui-store';

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
 * Modal confirmation dialog for destructive bulk actions. Uses a native
 * `<dialog>` with `showModal()` so Escape and backdrop dimming come from
 * the platform; cancel is preventDefault'd so React owns unmount. While
 * open, the modal flag in the UI store makes sibling document-level
 * handlers (peek navigation, row action menus) bail out so Escape acts
 * only here. Focus starts on the safe action (cancel) and is restored to
 * the previously focused element on close.
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<Element | null>(null);
  const onCancelRef = useRef(onCancel);
  const onConfirmRef = useRef(onConfirm);
  const setModalOpen = useTableUi((s) => s.setModalOpen);

  // Latest-callback refs: the document listeners below read through them,
  // so their setup runs once and never re-binds on parent re-renders.
  useEffect(() => {
    onCancelRef.current = onCancel;
    onConfirmRef.current = onConfirm;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    previouslyFocused.current = document.activeElement;
    // jsdom does not implement showModal/close; fall back to the open attribute.
    const hasShowModal = typeof dialog.showModal === 'function';
    if (hasShowModal) {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    cancelRef.current?.focus();
    setModalOpen(true);

    function handleCancel(event: Event): void {
      event.preventDefault();
      onCancelRef.current();
    }

    function handleClick(event: MouseEvent): void {
      if (event.target === dialog) {
        onCancelRef.current();
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      // Real browsers fire `cancel` on Escape for modal dialogs. jsdom does not,
      // so document Escape is only the fallback when showModal is unavailable.
      if (event.key === 'Escape' && !hasShowModal) {
        event.stopPropagation();
        onCancelRef.current();
        return;
      }
      if (event.key === 'Tab') {
        cycleTabFocus(event, cancelRef.current, confirmRef.current);
      }
    }

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
      if (hasShowModal && dialog.open) {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
      setModalOpen(false);
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus();
      }
    };
  }, [setModalOpen]);

  return (
    <dialog ref={dialogRef} aria-labelledby={titleId} className={styles.confirmDialog}>
      <h2 id={titleId} className={styles.confirmTitle}>
        {title}
      </h2>
      <p className={styles.confirmMessage}>{message}</p>
      <div className={styles.confirmActions}>
        <button
          type="button"
          ref={cancelRef}
          className={styles.confirmCancel}
          onClick={() => {
            onCancelRef.current();
          }}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          ref={confirmRef}
          className={styles.confirmPrimary}
          onClick={() => {
            onConfirmRef.current();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
};
