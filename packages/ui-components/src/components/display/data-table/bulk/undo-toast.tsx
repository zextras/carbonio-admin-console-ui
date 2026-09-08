/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../data-table.module.css';
import { isEditableTarget } from '../models/event-target';

export type DataTableUndoToastProps = {
  message: string;
  /** i18n default: `Undo` */
  undoLabel?: string;
  /** Seconds before the toast expires on its own. Default: 5 */
  durationSeconds?: number;
  onUndo: () => void;
  onExpire: () => void;
};

/**
 * Post-bulk-action undo toast with a visible countdown. The parent must key
 * the toast per action id (`<DataTableUndoToast key={toast.id} …/>`) so a
 * second undoable action remounts the component and starts a fresh timer —
 * one interval per mount is what keeps repeated actions honest.
 *
 * The countdown clamps at zero, clears its interval and expires exactly
 * once. Hovering or focusing the toast pauses the countdown. Cmd/Ctrl+Z
 * triggers the undo from anywhere in the document EXCEPT editable targets
 * (inputs, textareas, contenteditable hosts).
 */
export const DataTableUndoToast = ({
  message,
  undoLabel,
  durationSeconds = 5,
  onUndo,
  onExpire,
}: DataTableUndoToastProps) => {
  const { t } = useTranslation();
  const [left, setLeft] = useState(durationSeconds);
  const pausedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onUndoRef = useRef(onUndo);
  const onExpireRef = useRef(onExpire);
  onUndoRef.current = onUndo;
  onExpireRef.current = onExpire;

  useEffect(() => {
    intervalRef.current = globalThis.setInterval(() => {
      if (pausedRef.current) {
        return;
      }
      setLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => {
      if (intervalRef.current !== null) {
        globalThis.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (left > 0) {
      return;
    }
    if (intervalRef.current !== null) {
      globalThis.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onExpireRef.current();
  }, [left]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if ((event.key === 'z' || event.key === 'Z') && (event.metaKey || event.ctrlKey)) {
        if (isEditableTarget(event.target)) {
          return;
        }
        event.preventDefault();
        onUndoRef.current();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      role="status"
      className={styles.undoToast}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      onFocus={() => {
        pausedRef.current = true;
      }}
      onBlur={() => {
        pausedRef.current = false;
      }}
    >
      <span className={styles.undoToastCheck} aria-hidden="true">
        ✓
      </span>
      <span>{message}</span>
      <button
        type="button"
        className={styles.undoToastButton}
        onClick={() => {
          onUndoRef.current();
        }}
      >
        {undoLabel ?? t('data_table.undo', 'Undo')}
      </button>
      <span className={styles.undoToastShortcut}>
        {t('data_table.undo_hint', '{{seconds}}s to undo (⌘Z)', { seconds: left })}
      </span>
    </div>
  );
};
