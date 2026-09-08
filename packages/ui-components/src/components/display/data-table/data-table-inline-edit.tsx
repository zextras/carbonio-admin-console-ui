/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useRef } from 'react';

import styles from './data-table.module.css';
import type { DataTableEditingState } from './types';

type DataTableInlineEditProps = {
  editing: NonNullable<DataTableEditingState>;
  columnLabel: string;
  saveLabel: string;
  cancelLabel: string;
  onValueChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export const DataTableInlineEdit = ({
  editing,
  columnLabel,
  saveLabel,
  cancelLabel,
  onValueChange,
  onSave,
  onCancel,
}: DataTableInlineEditProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <span className={styles.inlineEdit}>
      <input
        ref={inputRef}
        className={styles.inlineEditInput}
        aria-label={columnLabel}
        aria-invalid={editing.error !== null}
        value={editing.value}
        onClick={(event) => {
          event.stopPropagation();
        }}
        onChange={(event) => {
          onValueChange(event.target.value);
        }}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === 'Enter') {
            event.preventDefault();
            onSave();
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            onCancel();
          }
        }}
      />
      <button
        type="button"
        className={styles.inlineEditSave}
        aria-label={saveLabel}
        onClick={(event) => {
          event.stopPropagation();
          onSave();
        }}
      >
        ✓
      </button>
      <button
        type="button"
        className={styles.inlineEditCancel}
        aria-label={cancelLabel}
        onClick={(event) => {
          event.stopPropagation();
          onCancel();
        }}
      >
        ✕
      </button>
      {editing.error && <span className={styles.inlineEditError}>{editing.error}</span>}
    </span>
  );
};

type DataTableEditTriggerProps = {
  ariaLabel: string;
  onClick: () => void;
};

export const DataTableEditTrigger = ({ ariaLabel, onClick }: DataTableEditTriggerProps) => (
  <button
    type="button"
    className={styles.hoverAction}
    aria-label={ariaLabel}
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
  >
    ✎
  </button>
);
