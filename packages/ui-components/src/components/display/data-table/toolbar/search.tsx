/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../data-table.module.css';

type DataTableSearchProps = {
  /** Search value owned by the composing view. */
  value: string;
  /** Pushed on every keystroke; the view decides debounce/refetch. */
  onSearchChange: (value: string) => void;
  placeholder?: string;
  /** Accessible name; defaults to the i18n `data_table.search` string. */
  label?: string;
};

/**
 * The toolbar search input. Typing only re-renders this part: the input is
 * backed by LOCAL state and each keystroke is pushed to `onSearchChange`,
 * so the view stays free to echo the value back, debounce it or ignore it.
 * An external `value` change is adopted only when it differs from the last
 * value emitted locally (a stale echo would otherwise clobber the caret);
 * the last-seen prop and last-emitted value are tracked in state so the
 * sync happens during render (documented derived-state pattern, no effects).
 */
export const DataTableSearch = ({
  value,
  onSearchChange,
  placeholder,
  label,
}: DataTableSearchProps) => {
  const { t } = useTranslation();
  const [localValue, setLocalValue] = useState(value);
  const [sync, setSync] = useState({ prop: value, emitted: value });

  if (value !== sync.prop) {
    if (value !== sync.emitted) {
      setSync({ prop: value, emitted: value });
      setLocalValue(value);
    } else {
      setSync({ ...sync, prop: value });
    }
  }

  const resolvedLabel = label ?? t('data_table.search', 'Search');

  return (
    <label className={styles.searchField}>
      <span className={styles.visuallyHidden}>{resolvedLabel}</span>
      <input
        type="search"
        className={styles.searchInput}
        value={localValue}
        placeholder={placeholder}
        aria-label={resolvedLabel}
        onChange={(event) => {
          const next = event.target.value;
          setLocalValue(next);
          setSync((current) => ({ ...current, emitted: next }));
          onSearchChange(next);
        }}
      />
    </label>
  );
};
