/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import styles from '../data-table.module.css';
import type { DataTableFilterChip } from '../models/types';

type DataTableFilterChipsProps = {
  /** Chips built by the view (or a hook) via `buildFilterChips`. */
  chips: Array<DataTableFilterChip>;
  onRemoveChip: (chip: DataTableFilterChip) => void;
  onClearAll: () => void;
  clearAllLabel?: string;
};

type ChipBounds = NonNullable<DataTableFilterChip['bounds']>;

type Translate = ReturnType<typeof useTranslation>['t'];

function formatBoundValue(value: number | string, locale: string): string {
  // Locale follows the app language so numbers and t() templates cannot
  // diverge on machines whose browser locale differs from the UI language.
  return typeof value === 'number' ? value.toLocaleString(locale) : String(value);
}

/**
 * Whether every present bound is numeric — only numeric range bounds are
 * re-formatted locale-aware. Date bounds (strings) keep the model formatting.
 */
function isNumericBounds(bounds: ChipBounds): boolean {
  return (
    (bounds.min === undefined || typeof bounds.min === 'number') &&
    (bounds.max === undefined || typeof bounds.max === 'number')
  );
}

/**
 * The def label prefix (`"Size: "`) is not carried in the chip payload, so it
 * is recovered from the model-built English `label` (split on the first
 * `": "`). A def label containing `": "` would break the split — accepted
 * limitation of the chip payload shape.
 */
function labelPrefix(label: string): string {
  const separatorIndex = label.indexOf(': ');
  return separatorIndex === -1 ? '' : label.slice(0, separatorIndex + 2);
}

function numericBoundsLabel(bounds: ChipBounds, t: Translate, locale: string): string | null {
  const min = bounds.min;
  const max = bounds.max;
  if (min === undefined && max === undefined) {
    return null;
  }
  if (min !== undefined && max !== undefined) {
    return t('data_table.filter.range', '{{min}}–{{max}}', {
      min: formatBoundValue(min, locale),
      max: formatBoundValue(max, locale),
    });
  }
  if (max !== undefined) {
    return t('data_table.filter.max', '≤ {{max}}', { max: formatBoundValue(max, locale) });
  }
  return t('data_table.filter.min', '≥ {{min}}', {
    min: formatBoundValue(min as number, locale),
  });
}

function chipDisplayLabel(chip: DataTableFilterChip, t: Translate, locale: string): string {
  if (!chip.bounds || !isNumericBounds(chip.bounds)) {
    return chip.label;
  }
  const boundsLabel = numericBoundsLabel(chip.bounds, t, locale);
  return boundsLabel === null ? chip.label : labelPrefix(chip.label) + boundsLabel;
}

/**
 * Presentational active-filter chips. Chips whose model payload carries
 * numeric `bounds` are re-rendered locale-aware (bounded `10–50`, max-only
 * `≤ 50`, min-only `≥ 10`); everything else — enum chips and date chips —
 * falls back to the model-built `label` (dates keep model formatting: the
 * payload does not carry enough structure to re-format them reliably).
 */
export const DataTableFilterChips = ({
  chips,
  onRemoveChip,
  onClearAll,
  clearAllLabel,
}: DataTableFilterChipsProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;

  if (chips.length === 0) {
    return null;
  }

  return (
    <div
      className={styles.filterChips}
      role="list"
      aria-label={t('data_table.active_filters', 'Active filters')}
    >
      {chips.map((chip) => {
        const displayLabel = chipDisplayLabel(chip, t, locale);
        return (
          <span key={chip.key} className={styles.filterChip} role="listitem">
            {displayLabel}
            <button
              type="button"
              className={styles.filterChipRemove}
              aria-label={t('data_table.remove_filter', 'Remove filter: {{label}}', {
                label: displayLabel,
              })}
              onClick={() => {
                onRemoveChip(chip);
              }}
            >
              ✕
            </button>
          </span>
        );
      })}
      <button type="button" className={styles.clearAllFilters} onClick={onClearAll}>
        {clearAllLabel ?? t('data_table.clear_all_filters', 'Clear all')}
      </button>
    </div>
  );
};
