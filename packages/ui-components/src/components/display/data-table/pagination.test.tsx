/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ColumnPinningState } from '@tanstack/react-table';
import { fireEvent, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, it } from 'vitest';

import { useDataTable } from './create-data-table';
import { DataTablePagination } from './pagination';
import type { DataTableColumnDef } from './types';

type TestRow = { id: string; name: string };

type TestTable = ReturnType<typeof useDataTable<TestRow, ColumnPinningState>>;

const rows: Array<TestRow> = Array.from({ length: 60 }, (_, index) => ({
  id: `row-${String(index + 1).padStart(3, '0')}`,
  name: `row-${String(index + 1).padStart(3, '0')}`,
}));

const columns: Array<DataTableColumnDef<TestRow>> = [{ accessorKey: 'name', header: 'Name' }];

function PaginationHarness({
  onTable,
  options,
  children,
}: {
  onTable: (table: TestTable) => void;
  options: Parameters<typeof useDataTable<TestRow>>[0];
  children: React.ReactNode;
}) {
  // Narrow root subscription: pagination updates must come from the part's
  // own Subscribe, not from the harness re-rendering.
  const table = useDataTable<TestRow, ColumnPinningState>(options, (state) => state.columnPinning);

  useEffect(() => {
    onTable(table);
  }, [table, onTable]);

  return <table.AppTable>{children}</table.AppTable>;
}

function renderPagination(options: Parameters<typeof useDataTable<TestRow>>[0]): {
  getTable: () => TestTable | undefined;
  rerender: (options: Parameters<typeof useDataTable<TestRow>>[0]) => void;
} {
  let table: TestTable | undefined;
  const onTable = (instance: TestTable): void => {
    table = instance;
  };
  // Children are built per call so an options-only rerender (e.g. a new
  // server rowCount) flows through AppTable's provider like it does in the
  // views, where part elements are recreated by the consumer on each render.
  const build = (opts: Parameters<typeof useDataTable<TestRow>>[0]): React.ReactElement => (
    <PaginationHarness onTable={onTable} options={opts}>
      <DataTablePagination />
    </PaginationHarness>
  );
  const { rerender } = render(build(options));
  return {
    getTable: () => table,
    rerender: (next) => {
      rerender(build(next));
    },
  };
}

function manualOptions(rowCount: number): Parameters<typeof useDataTable<TestRow>>[0] {
  return {
    data: rows,
    columns,
    getRowId: (row) => row.id,
    manualFiltering: true,
    rowCount,
    initialState: { pagination: { pageIndex: 0, pageSize: 25 } },
  };
}

describe('DataTablePagination', () => {
  it('renders the controls connected to the table state in manual mode', () => {
    renderPagination(manualOptions(60));

    expect(screen.getByText('1–25 of 60')).toBeDefined();
    expect(screen.getByLabelText('Rows per page')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveProperty('disabled', false);
    expect(
      screen.getByRole('button', { name: 'Previous page' }).getAttribute('disabled'),
    ).toBeDefined();
    expect(screen.getByRole('button', { name: 'Next page' }).getAttribute('disabled')).toBeNull();
  });

  it('moves to the next page when the next-page button is clicked', () => {
    renderPagination(manualOptions(60));

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

    expect(screen.getByText('26–50 of 60')).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'Previous page' }).getAttribute('disabled'),
    ).toBeNull();
  });

  it('resets to the first page when the page size changes', () => {
    renderPagination(manualOptions(60));
    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(screen.getByText('26–50 of 60')).toBeDefined();

    fireEvent.change(screen.getByLabelText('Rows per page'), { target: { value: '50' } });

    expect(screen.getByText('1–50 of 60')).toBeDefined();
  });

  it('hides the from/to range on a stale page', () => {
    const { rerender } = renderPagination(manualOptions(60));
    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(screen.getByText('51–60 of 60')).toBeDefined();

    // Shrink the server total while pageIndex stays on the last page.
    rerender(manualOptions(10));

    expect(screen.getByText('10 results')).toBeDefined();
    expect(screen.queryByText(/–/)).toBeNull();
  });
});
