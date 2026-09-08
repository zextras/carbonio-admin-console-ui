/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';

import styles from './data-table.module.css';
import { useDataTableContext } from './data-table-contexts';
import { ACTIONS_COLUMN_ID, SELECT_COLUMN_ID } from './data-table-customize-model';
import { SortableHeaderCell } from './sortable-header-cell';
import { useTableUi } from './table-ui-store';
import type { DataTableColumnMeta } from './types';

type DataTableTableHeaderProps = {
  /** Column id pinned sticky on the left (identity / primary column). */
  primaryColumnId?: string;
  /** Whether the leading selection column shifts the primary column offset. */
  enableRowSelection?: boolean;
};

type SortDirection = false | 'asc' | 'desc';

function resolveAriaSort(
  canSort: boolean,
  sorted: SortDirection,
): 'ascending' | 'descending' | 'none' | undefined {
  if (!canSort) {
    return undefined;
  }
  if (sorted === 'asc') {
    return 'ascending';
  }
  if (sorted === 'desc') {
    return 'descending';
  }
  return 'none';
}

export const DataTableTableHeader = ({
  primaryColumnId,
  enableRowSelection = false,
}: DataTableTableHeaderProps) => {
  const table = useDataTableContext();
  const scrollEdge = useTableUi((s) => s.scrollEdge);

  return (
    <table.Subscribe
      selector={(state) => [state.columnOrder, state.columnVisibility, state.sorting] as const}
    >
      {() => (
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta as DataTableColumnMeta | undefined;
                const pinnedStart = header.column.getIsPinned() === 'start';
                const pinnedEnd = header.column.getIsPinned() === 'end';
                const isSelect = header.column.id === SELECT_COLUMN_ID;
                const isActions = header.column.id === ACTIONS_COLUMN_ID;
                const isPrimary = header.column.id === primaryColumnId;
                return (
                  <th
                    key={header.id}
                    className={clsx(
                      styles.th,
                      isSelect && styles.thSelect,
                      isActions && styles.thActions,
                      pinnedStart && styles.pinnedLeft,
                      pinnedEnd && styles.pinnedRight,
                      pinnedStart && isPrimary && !scrollEdge.start && styles.pinnedShadow,
                      pinnedEnd && !scrollEdge.end && styles.pinnedRightShadow,
                    )}
                    style={{
                      width: meta?.width,
                      textAlign: meta?.align,
                      left:
                        isPrimary && enableRowSelection ? '3.25rem' : pinnedStart ? 0 : undefined,
                    }}
                    aria-sort={resolveAriaSort(
                      header.column.getCanSort(),
                      header.column.getIsSorted(),
                    )}
                  >
                    {header.isPlaceholder ? null : isSelect || isActions ? (
                      <table.FlexRender header={header} />
                    ) : (
                      <SortableHeaderCell
                        label={<table.FlexRender header={header} />}
                        canSort={header.column.getCanSort()}
                        sorted={header.column.getIsSorted()}
                        onToggleSort={header.column.getToggleSortingHandler()}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
      )}
    </table.Subscribe>
  );
};
