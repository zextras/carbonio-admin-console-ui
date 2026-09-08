/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useRef, useState } from 'react';

import styles from './data-table.module.css';

type DataTableUndoToastProps = {
  message: string;
  undoLabel: string;
  durationSeconds?: number;
  onUndo: () => void;
  onExpire: () => void;
};

export const DataTableUndoToast = ({
  message,
  undoLabel,
  durationSeconds = 5,
  onUndo,
  onExpire,
}: DataTableUndoToastProps) => {
  const [left, setLeft] = useState(durationSeconds);
  const paused = useRef(false);
  const onExpireRef = useRef(onExpire);
  const onUndoRef = useRef(onUndo);
  onExpireRef.current = onExpire;
  onUndoRef.current = onUndo;

  useEffect(() => {
    setLeft(durationSeconds);
  }, [message, durationSeconds]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!paused.current) {
        setLeft((value) => value - 1);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [message, durationSeconds]);

  useEffect(() => {
    if (left <= 0) {
      onExpireRef.current();
    }
  }, [left]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        onUndoRef.current();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      role="status"
      className={styles.undoToast}
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
      onFocus={() => {
        paused.current = true;
      }}
      onBlur={() => {
        paused.current = false;
      }}
    >
      <span className={styles.undoToastCheck} aria-hidden="true">
        ✓
      </span>
      <span>{message}</span>
      <button type="button" className={styles.undoToastButton} onClick={() => onUndoRef.current()}>
        {undoLabel}
      </button>
      <span className={styles.undoToastTimer}>{left}</span>
      <span className={styles.undoToastShortcut} aria-hidden="true">
        ⌘Z
      </span>
    </div>
  );
};
