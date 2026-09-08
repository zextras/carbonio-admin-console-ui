/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ColumnPinningState } from '@tanstack/react-table';
import { act, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useDataTable } from './create-data-table';
import { DataTableTableBody } from './table-body';
import { TableUiProvider } from './table-ui-store';
import type { DataTableColumnDef } from './types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string, options?: Record<string, string>) => {
      if (defaultValue === undefined) {
        return key;
      }
      if (options === undefined) {
        return defaultValue;
      }
      return defaultValue.replace(
        /\{\{(\w+)\}\}/g,
        (_match: string, name: string) => options[name] ?? '',
      );
    },
  }),
}));

type TestRow = { id: string; name: string };

type TestTable = ReturnType<typeof useDataTable<TestRow, ColumnPinningState>>;

const rows: Array<TestRow> = Array.from({ length: 60 }, (_, index) => ({
  id: `row-${String(index + 1).padStart(3, '0')}`,
  name: `row-${String(index + 1).padStart(3, '0')}`,
}));

const columns: Array<DataTableColumnDef<TestRow>> = [{ accessorKey: 'name', header: 'Name' }];

const bodyProps = {
  status: 'idle' as const,
  columns,
  emptyTitle: 'No results',
  emptyDescription: 'Adjust your filters.',
  errorTitle: 'Something went wrong',
  errorDescription: 'Try again.',
  retryLabel: 'Retry',
  editRequiredMessage: 'Required',
  editSaveLabel: 'Save',
  editCancelLabel: 'Cancel',
  copiedAnnounceLabel: 'Copied to clipboard',
};

function BodyHarness({ onTable }: { onTable: (table: TestTable) => void }) {
  // Narrow root subscription: state changes must reach the body part through
  // its own <table.Subscribe>, not through a parent re-render.
  const table = useDataTable<TestRow, ColumnPinningState>(
    {
      data: rows,
      columns,
      getRowId: (row) => row.id,
      manualPagination: false,
      initialState: { pagination: { pageIndex: 0, pageSize: 25 } },
    },
    (state) => state.columnPinning,
  );

  useEffect(() => {
    onTable(table);
  }, [table, onTable]);

  return (
    <TableUiProvider>
      <table.AppTable>
        <DataTableTableBody {...bodyProps} />
      </table.AppTable>
    </TableUiProvider>
  );
}

function firstRowCellText(): string {
  return screen.getAllByRole('cell')[0]?.textContent ?? '';
}

function renderHarness(): { getTable: () => TestTable | undefined } {
  let table: TestTable | undefined;
  const onTable = (instance: TestTable): void => {
    table = instance;
  };
  render(<BodyHarness onTable={onTable} />);
  return { getTable: () => table };
}

describe('DataTableTableBody subscription wiring', () => {
  it('renders the rows of the current page', () => {
    renderHarness();
    expect(screen.getAllByRole('row')).toHaveLength(25);
    expect(firstRowCellText()).toBe('row-001');
  });

  it('renders the next page rows when the page index changes', async () => {
    const { getTable } = renderHarness();
    await act(async () => {
      getTable()?.setPageIndex(1);
    });
    expect(screen.getAllByRole('row')).toHaveLength(25);
    expect(firstRowCellText()).toBe('row-026');
  });

  it('renders rows in the new order when sorting changes', async () => {
    const { getTable } = renderHarness();
    await act(async () => {
      getTable()?.setSorting([{ id: 'name', desc: true }]);
      getTable()?.setPageIndex(0);
    });
    expect(firstRowCellText()).toBe('row-060');
  });
});
