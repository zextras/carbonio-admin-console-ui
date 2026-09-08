/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useRef, useState } from 'react';

import styles from '../data-table.module.css';
import { validateEditValue } from '../data-table-row-chrome';

type DataTableInlineEditProps = {
  initialValue: string;
  columnLabel: string;
  requiredMessage: string;
  saveLabel: string;
  cancelLabel: string;
  onSave: (value: string) => void;
  onCancel: () => void;
};

export const DataTableInlineEdit = ({
  initialValue,
  columnLabel,
  requiredMessage,
  saveLabel,
  cancelLabel,
  onSave,
  onCancel,
}: DataTableInlineEditProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(String(initialValue ?? ''));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function commit(): void {
    const err = validateEditValue(value, requiredMessage);
    if (err) {
      setError(err);
      return;
    }
    onSave(value);
  }

  return (
    <span className={styles.inlineEdit}>
      <input
        ref={inputRef}
        className={styles.inlineEditInput}
        aria-label={columnLabel}
        aria-invalid={error !== null}
        value={value}
        onClick={(event) => {
          event.stopPropagation();
        }}
        onChange={(event) => {
          setValue(event.target.value);
        }}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === 'Enter') {
            event.preventDefault();
            commit();
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
          commit();
        }}
        onKeyDown={(event) => {
          event.stopPropagation();
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
        onKeyDown={(event) => {
          event.stopPropagation();
        }}
      >
        ✕
      </button>
      {error && <span className={styles.inlineEditError}>{error}</span>}
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
    onKeyDown={(event) => {
      event.stopPropagation();
    }}
  >
    ✎
  </button>
);
