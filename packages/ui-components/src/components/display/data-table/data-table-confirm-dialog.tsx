/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styles from './data-table.module.css';

type DataTableConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const DataTableConfirmDialog = ({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: DataTableConfirmDialogProps) => (
  <div
    className={styles.confirmOverlay}
    role="presentation"
    onClick={onCancel}
    onKeyDown={(event) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    }}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-table-confirm-title"
      className={styles.confirmDialog}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <h2 id="data-table-confirm-title" className={styles.confirmTitle}>
        {title}
      </h2>
      <p className={styles.confirmMessage}>{message}</p>
      <div className={styles.confirmActions}>
        <button type="button" className={styles.confirmCancel} onClick={onCancel}>
          {cancelLabel}
        </button>
        <button type="button" className={styles.confirmPrimary} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);
