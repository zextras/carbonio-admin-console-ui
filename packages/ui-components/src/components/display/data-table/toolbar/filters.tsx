/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../../web-components/ds-icon';

import clsx from 'clsx';
import { type Ref, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../data-table.module.css';
import {
  cloneFiltersState,
  countActiveFilters,
  getDateDraftValue,
  getEnumDraftSelection,
  getRangeDraftValue,
  sanitizeFilters,
  setDateDraftValue,
  setRangeDraftValue,
  toggleEnumDraftValue,
} from '../models/filter-model';
import type { DataTableFilterDef, DataTableFiltersState } from '../models/types';
import { useTableUi } from '../table-ui-store';

export type DataTableFiltersProps = {
  filterDefs: Array<DataTableFilterDef>;
  /** Applied filters owned by the composing view. */
  filters: DataTableFiltersState;
  onFiltersChange: (next: DataTableFiltersState) => void;
  /**
   * Called after Apply (and by the view after chip remove/clear-all): the
   * view resets pagination and selection — filters invalidate both.
   */
  onApplyResetSelection: () => void;
  filtersLabel?: string;
  applyLabel?: string;
  clearDraftLabel?: string;
  filtersHint?: string;
  closeFiltersLabel?: string;
};

type FiltersPanelProps = {
  ref?: Ref<HTMLDivElement>;
  id: string;
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

/** Panel body carried from the legacy filters panel, draft-driven. */
const FiltersPanel = ({
  ref,
  id,
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
}: FiltersPanelProps) => {
  const { t } = useTranslation();
  return (
    <div id={id} ref={ref} role="dialog" aria-label={filtersLabel} className={styles.filtersPanel}>
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
                placeholder={def.minPlaceholder ?? t('data_table.filter_min_placeholder', 'min')}
                aria-label={t('data_table.filter_from', '{{label}} from', { label: def.label })}
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
                placeholder={def.maxPlaceholder ?? t('data_table.filter_max_placeholder', 'max')}
                aria-label={t('data_table.filter_to', '{{label}} to', { label: def.label })}
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
                aria-label={t('data_table.filter_from', '{{label}} from', { label: def.label })}
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
                aria-label={t('data_table.filter_to', '{{label}} to', { label: def.label })}
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
};

/**
 * The toolbar filters trigger + panel. Opening clones the applied filters
 * into a LOCAL draft (typing re-renders only this part and emits nothing);
 * Apply sanitizes the draft, hands it to the view, closes the panel and asks
 * the view to reset pagination/selection. The open state lives in the UI
 * store `openPanel` slice, so mutual exclusion with the customize panel is
 * implicit. Panel and trigger ids come from `useId` (instance-scoped, fix
 * #11) and outside clicks close via element refs.
 */
export const DataTableFilters = ({
  filterDefs,
  filters,
  onFiltersChange,
  onApplyResetSelection,
  filtersLabel,
  applyLabel,
  clearDraftLabel,
  filtersHint,
  closeFiltersLabel,
}: DataTableFiltersProps) => {
  const { t } = useTranslation();
  const open = useTableUi((s) => s.openPanel) === 'filters';
  const setOpenPanel = useTableUi((s) => s.setOpenPanel);
  const [draft, setDraft] = useState<DataTableFiltersState>(() => cloneFiltersState(filters));
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const activeFilterCount = countActiveFilters(filters);

  const labels = {
    filtersLabel: filtersLabel ?? t('data_table.filters', 'Filters'),
    applyLabel: applyLabel ?? t('data_table.apply', 'Apply'),
    clearDraftLabel: clearDraftLabel ?? t('data_table.clear', 'Clear'),
    filtersHint:
      filtersHint ??
      t(
        'data_table.filters_hint',
        'AND across fields · OR within a field. Applying resets to page 1 and clears the selection.',
      ),
    closeFiltersLabel: closeFiltersLabel ?? t('data_table.close_filters', 'Close filters'),
  };

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    function handleDocumentMouseDown(event: MouseEvent): void {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      setOpenPanel(null);
    }
    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, [open, setOpenPanel]);

  function openFilters(): void {
    setDraft(cloneFiltersState(filters));
    setOpenPanel('filters');
  }

  function closeFilters(): void {
    setOpenPanel(null);
  }

  function applyDraft(): void {
    onFiltersChange(sanitizeFilters(draft, filterDefs));
    setOpenPanel(null);
    onApplyResetSelection();
  }

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className={clsx(
          styles.filtersTrigger,
          activeFilterCount > 0 && styles.filtersTriggerActive,
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-label={
          activeFilterCount > 0
            ? t('data_table.filters_active', 'Filters, {{count}} active', {
                count: activeFilterCount,
              })
            : undefined
        }
        onClick={() => {
          if (open) {
            closeFilters();
          } else {
            openFilters();
          }
        }}
      >
        <ds-icon icon="FunnelOutline" size="small"></ds-icon>
        <span>{labels.filtersLabel}</span>
        {activeFilterCount > 0 && (
          <span className={styles.filtersBadge} aria-hidden="true">
            {activeFilterCount}
          </span>
        )}
      </button>
      {open && (
        <FiltersPanel
          ref={panelRef}
          id={panelId}
          filterDefs={filterDefs}
          draft={draft}
          onDraftChange={setDraft}
          onClose={closeFilters}
          onClearDraft={() => {
            setDraft({});
          }}
          onApply={applyDraft}
          filtersLabel={labels.filtersLabel}
          closeFiltersLabel={labels.closeFiltersLabel}
          clearDraftLabel={labels.clearDraftLabel}
          applyLabel={labels.applyLabel}
          filtersHint={labels.filtersHint}
        />
      )}
    </>
  );
};
