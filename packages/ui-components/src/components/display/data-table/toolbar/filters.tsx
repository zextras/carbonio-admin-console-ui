/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../../web-components/ds-icon';

import clsx from 'clsx';
import {
  type CSSProperties,
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../basic/button/Button';
import { Checkbox } from '../../../inputs/Checkbox';
import { Select, type SelectItem } from '../../../inputs/select';
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
import { getFiltersPanelPosition, useAnchoredPanelPosition } from './panel-position';

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
  /** @deprecated Hint is no longer rendered; kept for call-site compatibility. */
  filtersHint?: string;
  /** @deprecated Close control removed from the panel; outside-click / Escape still close. */
  closeFiltersLabel?: string;
};

type FiltersPanelProps = {
  ref?: Ref<HTMLDialogElement>;
  id: string;
  style?: CSSProperties;
  filterDefs: Array<DataTableFilterDef>;
  draft: DataTableFiltersState;
  onDraftChange: (draft: DataTableFiltersState) => void;
  onClearDraft: () => void;
  onApply: () => void;
  filtersLabel: string;
  clearDraftLabel: string;
  applyLabel: string;
};

function setEnumDraftSingleValue(
  draft: DataTableFiltersState,
  filterId: string,
  value: string,
): DataTableFiltersState {
  if (!value) {
    const next = { ...draft };
    delete next[filterId];
    return next;
  }
  return { ...draft, [filterId]: [value] };
}

type EnumFilterFieldProps = {
  def: Extract<DataTableFilterDef, { type: 'enum' }>;
  draft: DataTableFiltersState;
  onDraftChange: (draft: DataTableFiltersState) => void;
  allLabel: string;
};

const EnumFilterField = ({ def, draft, onDraftChange, allLabel }: EnumFilterFieldProps) => {
  if (def.variant === 'select') {
    const selectedValue = getEnumDraftSelection(draft, def.id)[0] ?? '';
    const items: Array<SelectItem<string>> = [
      { label: allLabel, value: '' },
      ...def.options.map((option) => ({ label: option.label, value: option.value })),
    ];
    const selection = items.find((item) => item.value === selectedValue) ?? items[0];
    return (
      <Select
        label={def.label}
        items={items}
        selection={selection}
        onChange={(value) => {
          onDraftChange(setEnumDraftSingleValue(draft, def.id, value));
        }}
      />
    );
  }

  return (
    <>
      <div className={styles.filterFieldLabel}>{def.label}</div>
      <div className={styles.enumOptions}>
        {def.options.map((option) => {
          const selected = getEnumDraftSelection(draft, def.id).includes(option.value);
          return (
            <Checkbox
              key={option.value}
              value={selected}
              label={option.label}
              size="small"
              padding={{ all: 'extrasmall' }}
              onClick={() => {
                onDraftChange(toggleEnumDraftValue(draft, def.id, option.value));
              }}
            />
          );
        })}
      </div>
    </>
  );
};

type PairedBoundFieldProps = {
  fromLabel: string;
  toLabel: string;
  fromInput: ReactNode;
  toInput: ReactNode;
};

const PairedBoundField = ({ fromLabel, toLabel, fromInput, toInput }: PairedBoundFieldProps) => (
  <div className={styles.pairedBounds}>
    <div className={styles.pairedBound}>
      <div className={styles.filterFieldLabel}>{fromLabel}</div>
      {fromInput}
    </div>
    <div className={styles.pairedBound}>
      <div className={styles.filterFieldLabel}>{toLabel}</div>
      {toInput}
    </div>
  </div>
);

/** Panel body carried from the legacy filters panel, draft-driven. */
const FiltersPanel = ({
  ref,
  id,
  style,
  filterDefs,
  draft,
  onDraftChange,
  onClearDraft,
  onApply,
  filtersLabel,
  clearDraftLabel,
  applyLabel,
}: FiltersPanelProps) => {
  const { t } = useTranslation();
  const toShortLabel = t('data_table.filter_to_short', 'To');

  return (
    <dialog
      id={id}
      ref={ref}
      open
      aria-label={filtersLabel}
      className={styles.filtersPanel}
      style={style}
    >
      <div className={styles.filtersPanelHeader}>
        <span className={styles.filtersPanelTitle}>{filtersLabel}</span>
      </div>
      {filterDefs.map((def) => (
        <div key={def.id} className={styles.filterField}>
          {def.type === 'enum' && (
            <EnumFilterField
              def={def}
              draft={draft}
              onDraftChange={onDraftChange}
              allLabel={t('data_table.filter_all', 'All')}
            />
          )}
          {def.type === 'range' && (
            <PairedBoundField
              fromLabel={t('data_table.filter_from_label', '{{label}} from', { label: def.label })}
              toLabel={toShortLabel}
              fromInput={
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
              }
              toInput={
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
              }
            />
          )}
          {def.type === 'date' && (
            <PairedBoundField
              fromLabel={t('data_table.filter_from_label', '{{label}} from', { label: def.label })}
              toLabel={toShortLabel}
              fromInput={
                <input
                  type="date"
                  className={styles.rangeInput}
                  aria-label={t('data_table.filter_from', '{{label}} from', { label: def.label })}
                  value={getDateDraftValue(draft, def.id).from ?? ''}
                  onChange={(event) => {
                    onDraftChange(setDateDraftValue(draft, def.id, 'from', event.target.value));
                  }}
                />
              }
              toInput={
                <input
                  type="date"
                  className={styles.rangeInput}
                  aria-label={t('data_table.filter_to', '{{label}} to', { label: def.label })}
                  value={getDateDraftValue(draft, def.id).to ?? ''}
                  onChange={(event) => {
                    onDraftChange(setDateDraftValue(draft, def.id, 'to', event.target.value));
                  }}
                />
              }
            />
          )}
        </div>
      ))}
      <div className={styles.filtersPanelActions}>
        <Button
          type="outlined"
          color="primary"
          width="fill"
          label={clearDraftLabel}
          onClick={onClearDraft}
        />
        <Button
          type="default"
          color="primary"
          width="fill"
          label={applyLabel}
          onClick={onApply}
        />
      </div>
    </dialog>
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
}: DataTableFiltersProps) => {
  const { t } = useTranslation();
  const open = useTableUi((s) => s.openPanel) === 'filters';
  const setOpenPanel = useTableUi((s) => s.setOpenPanel);
  const [draft, setDraft] = useState<DataTableFiltersState>(() => cloneFiltersState(filters));
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDialogElement>(null);
  const panelId = useId();
  const activeFilterCount = countActiveFilters(filters);
  const { position: panelPosition, capturePosition } = useAnchoredPanelPosition(
    open,
    triggerRef,
    getFiltersPanelPosition,
  );

  const labels = {
    filtersLabel: filtersLabel ?? t('data_table.filters', 'Filters'),
    applyLabel: applyLabel ?? t('data_table.apply', 'APPLY'),
    clearDraftLabel: clearDraftLabel ?? t('data_table.clear_all', 'CLEAR ALL'),
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
    capturePosition();
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
      {panelPosition &&
        createPortal(
          <FiltersPanel
            ref={panelRef}
            id={panelId}
            style={{ top: panelPosition.top, left: panelPosition.left }}
            filterDefs={filterDefs}
            draft={draft}
            onDraftChange={setDraft}
            onClearDraft={() => {
              setDraft({});
            }}
            onApply={applyDraft}
            filtersLabel={labels.filtersLabel}
            clearDraftLabel={labels.clearDraftLabel}
            applyLabel={labels.applyLabel}
          />,
          document.body,
        )}
    </>
  );
};
