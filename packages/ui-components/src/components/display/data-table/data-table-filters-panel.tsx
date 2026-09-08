/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';

import styles from './data-table.module.css';
import {
  getDateDraftValue,
  getEnumDraftSelection,
  getRangeDraftValue,
  setDateDraftValue,
  setRangeDraftValue,
  toggleEnumDraftValue,
} from './data-table-filter-model';
import type { DataTableFilterDef, DataTableFiltersState } from './types';

type DataTableFiltersPanelProps = {
  filterDefs: Array<DataTableFilterDef>;
  draft: DataTableFiltersState;
  onDraftChange: (draft: DataTableFiltersState) => void;
  onClose: () => void;
  onClearDraft: () => void;
  onApply: () => void;
  filtersLabel: string;
  closeFiltersLabel: string;
  clearDraftLabel: string;
  applyLabel: string;
  filtersHint: string;
};

export const DataTableFiltersPanel = ({
  filterDefs,
  draft,
  onDraftChange,
  onClose,
  onClearDraft,
  onApply,
  filtersLabel,
  closeFiltersLabel,
  clearDraftLabel,
  applyLabel,
  filtersHint,
}: DataTableFiltersPanelProps) => (
  <div
    id="data-table-filters-panel"
    role="dialog"
    aria-label={filtersLabel}
    className={styles.filtersPanel}
  >
    <div className={styles.filtersPanelHeader}>
      <span className={styles.filtersPanelTitle}>{filtersLabel}</span>
      <button
        type="button"
        className={styles.filtersCloseButton}
        aria-label={closeFiltersLabel}
        onClick={onClose}
      >
        ✕
      </button>
    </div>
    {filterDefs.map((def) => (
      <div key={def.id} className={styles.filterField}>
        <div className={styles.filterFieldLabel}>{def.label}</div>
        {def.type === 'enum' && (
          <div className={styles.enumOptions}>
            {def.options.map((option) => {
              const selected = getEnumDraftSelection(draft, def.id).includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  role="checkbox"
                  aria-checked={selected}
                  className={clsx(styles.enumOption, selected && styles.enumOptionSelected)}
                  onClick={() => {
                    onDraftChange(toggleEnumDraftValue(draft, def.id, option.value));
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
        {def.type === 'range' && (
          <div className={styles.rangeInputs}>
            <input
              type="number"
              className={styles.rangeInput}
              placeholder={def.minPlaceholder ?? 'min'}
              aria-label={`${def.label} from`}
              value={getRangeDraftValue(draft, def.id).min ?? ''}
              onChange={(event) => {
                onDraftChange(setRangeDraftValue(draft, def.id, 'min', event.target.value));
              }}
            />
            <span className={styles.rangeSeparator} aria-hidden="true">
              –
            </span>
            <input
              type="number"
              className={styles.rangeInput}
              placeholder={def.maxPlaceholder ?? 'max'}
              aria-label={`${def.label} to`}
              value={getRangeDraftValue(draft, def.id).max ?? ''}
              onChange={(event) => {
                onDraftChange(setRangeDraftValue(draft, def.id, 'max', event.target.value));
              }}
            />
          </div>
        )}
        {def.type === 'date' && (
          <div className={styles.rangeInputs}>
            <input
              type="date"
              className={styles.rangeInput}
              aria-label={`${def.label} from`}
              value={getDateDraftValue(draft, def.id).from ?? ''}
              onChange={(event) => {
                onDraftChange(setDateDraftValue(draft, def.id, 'from', event.target.value));
              }}
            />
            <span className={styles.rangeSeparator} aria-hidden="true">
              –
            </span>
            <input
              type="date"
              className={styles.rangeInput}
              aria-label={`${def.label} to`}
              value={getDateDraftValue(draft, def.id).to ?? ''}
              onChange={(event) => {
                onDraftChange(setDateDraftValue(draft, def.id, 'to', event.target.value));
              }}
            />
          </div>
        )}
      </div>
    ))}
    <div className={styles.filtersPanelActions}>
      <button type="button" className={styles.filtersSecondaryButton} onClick={onClearDraft}>
        {clearDraftLabel}
      </button>
      <button type="button" className={styles.filtersPrimaryButton} onClick={onApply}>
        {applyLabel}
      </button>
    </div>
    <p className={styles.filtersHint}>{filtersHint}</p>
  </div>
);
