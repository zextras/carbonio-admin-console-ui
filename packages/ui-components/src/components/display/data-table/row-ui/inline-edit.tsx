/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useId, useRef, useState } from 'react';

import styles from '../data-table.module.css';
import { validateEditValue } from '../models/row-ui';
import { stopEventPropagation } from './stop-propagation';

type DataTableInlineEditProps = {
  /**
   * Initial draft value. The component owns its draft state after mount, so
   * later changes to this prop are ignored. Remount it (e.g. via a `key`
   * change) to start a new edit session or to pick up a refreshed external
   * value.
   */
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
  const errorId = useId();
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
        aria-describedby={error !== null ? errorId : undefined}
        value={value}
        onClick={stopEventPropagation}
        onChange={(event) => {
          setValue(event.target.value);
          setError(null);
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
        onKeyDown={stopEventPropagation}
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
        onKeyDown={stopEventPropagation}
      >
        ✕
      </button>
      {error && (
        <span className={styles.inlineEditError} id={errorId}>
          {error}
        </span>
      )}
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
    onKeyDown={stopEventPropagation}
  >
    ✎
  </button>
);
