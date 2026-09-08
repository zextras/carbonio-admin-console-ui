/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../web-components/ds-icon';

import clsx from 'clsx';

import styles from './data-table.module.css';

type DataTableToolbarProps = {
  enableSearch: boolean;
  searchValue: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder: string;
  searchLabel: string;
  showFilters: boolean;
  filtersOpen: boolean;
  filtersLabel: string;
  activeFilterCount: number;
  onToggleFilters: () => void;
  enableCustomize: boolean;
  customizeOpen: boolean;
  customizeLabel: string;
  onToggleCustomize: () => void;
};

export const DataTableToolbar = ({
  enableSearch,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  showFilters,
  filtersOpen,
  filtersLabel,
  activeFilterCount,
  onToggleFilters,
  enableCustomize,
  customizeOpen,
  customizeLabel,
  onToggleCustomize,
}: DataTableToolbarProps) => {
  if (!enableSearch && !showFilters && !enableCustomize) {
    return null;
  }

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Table actions">
      {enableSearch && (
        <label className={styles.searchField}>
          <span className={styles.visuallyHidden}>{searchLabel}</span>
          <input
            type="search"
            className={styles.searchInput}
            value={searchValue}
            placeholder={searchPlaceholder}
            aria-label={searchLabel}
            onChange={(event) => {
              onSearchChange?.(event.target.value);
            }}
          />
        </label>
      )}
      <span className={styles.toolbarSpacer} />
      {showFilters && (
        <button
          type="button"
          className={clsx(styles.filtersTrigger, activeFilterCount > 0 && styles.filtersTriggerActive)}
          aria-expanded={filtersOpen}
          aria-controls="data-table-filters-panel"
          onClick={onToggleFilters}
        >
          <ds-icon icon="FunnelOutline" size="small"></ds-icon>
          <span>{filtersLabel}</span>
          {activeFilterCount > 0 && (
            <span className={styles.filtersBadge} aria-hidden="true">
              {activeFilterCount}
            </span>
          )}
        </button>
      )}
      {enableCustomize && (
        <button
          type="button"
          className={clsx(styles.customizeTrigger, customizeOpen && styles.customizeTriggerActive)}
          aria-expanded={customizeOpen}
          aria-haspopup="dialog"
          aria-controls="data-table-customize-panel"
          onClick={(event) => {
            event.stopPropagation();
            onToggleCustomize();
          }}
        >
          <ds-icon icon="Settings" size="small"></ds-icon>
          <span>{customizeLabel}</span>
        </button>
      )}
    </div>
  );
};
