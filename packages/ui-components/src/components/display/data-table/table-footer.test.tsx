/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ColumnPinningState } from '@tanstack/react-table';
import { act, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, it } from 'vitest';

import { useDataTable } from './create-data-table';
import { DataTableTableFooter } from './table-footer';
import type { DataTableColumnDef } from './types';

type TestRow = { id: string; name: string };

type TestTable = ReturnType<typeof useDataTable<TestRow, ColumnPinningState>>;

const rows: Array<TestRow> = Array.from({ length: 60 }, (_, index) => ({
  id: `row-${String(index + 1).padStart(3, '0')}`,
  name: `row-${String(index + 1).padStart(3, '0')}`,
}));

const columns: Array<DataTableColumnDef<TestRow>> = [
  { accessorKey: 'name', header: 'Name', filterFn: 'includesString' },
];

function FooterHarness({
  onTable,
  options,
}: {
  onTable: (table: TestTable) => void;
  options: Parameters<typeof useDataTable<TestRow>>[0];
}) {
  // Narrow root subscription: footer updates must come from its own Subscribe.
  const table = useDataTable<TestRow, ColumnPinningState>(options, (state) => state.columnPinning);

  useEffect(() => {
    onTable(table);
  }, [table, onTable]);

  return (
    <table.AppTable>
      <DataTableTableFooter />
    </table.AppTable>
  );
}

function renderFooter(options: Parameters<typeof useDataTable<TestRow>>[0]): {
  getTable: () => TestTable | undefined;
} {
  let table: TestTable | undefined;
  const onTable = (instance: TestTable): void => {
    table = instance;
  };
  render(<FooterHarness onTable={onTable} options={options} />);
  return { getTable: () => table };
}

describe('DataTableTableFooter row count', () => {
  it('uses the filtered row count in client-side filtering mode', () => {
    renderFooter({
      data: rows,
      columns,
      getRowId: (row) => row.id,
      manualFiltering: false,
      initialState: {
        pagination: { pageIndex: 0, pageSize: 5 },
        columnFilters: [{ id: 'name', value: 'row-00' }],
      },
    });
    // 9 rows match the filter; the current page only holds 5.
    expect(screen.getByText('9 results')).toBeDefined();
  });

  it('updates the count when filters change', async () => {
    const { getTable } = renderFooter({
      data: rows,
      columns,
      getRowId: (row) => row.id,
      manualFiltering: false,
      initialState: {
        pagination: { pageIndex: 0, pageSize: 5 },
        columnFilters: [{ id: 'name', value: 'row-00' }],
      },
    });
    await act(async () => {
      getTable()?.setColumnFilters([{ id: 'name', value: 'row-003' }]);
    });
    expect(screen.getByText('1 result')).toBeDefined();
  });

  it('uses the rowCount option with the from/to window in manual mode', () => {
    renderFooter({
      data: rows,
      columns,
      getRowId: (row) => row.id,
      manualFiltering: true,
      rowCount: 60,
      initialState: { pagination: { pageIndex: 0, pageSize: 25 } },
    });
    expect(screen.getByText('1–25 of 60')).toBeDefined();
  });
});
