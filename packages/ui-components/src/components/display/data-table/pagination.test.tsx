/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { DataTableRoot } from './data-table-root';
import { DataTablePagination } from './pagination';
import type { DataTableColumnDef } from './types';

type TestRow = { id: string; name: string };

const rows: Array<TestRow> = Array.from({ length: 60 }, (_, index) => ({
  id: `row-${String(index + 1).padStart(3, '0')}`,
  name: `row-${String(index + 1).padStart(3, '0')}`,
}));

const columns: Array<DataTableColumnDef<TestRow>> = [{ accessorKey: 'name', header: 'Name' }];

/**
 * Real-parent harness: the pagination part is the ONLY child of Root (no
 * sibling churn to force re-renders), so the React Compiler memoizes the
 * AppTable element and the prop-less part element. This is exactly the
 * composition under which render-time `table.options` reads go stale —
 * these tests prove the store-published count keeps the part live.
 */
function ManualTableHost({ rowCount }: { rowCount: number }): React.ReactElement {
  return (
    <DataTableRoot
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      manualFiltering
      manualPagination
      rowCount={rowCount}
      initialState={{ pagination: { pageIndex: 0, pageSize: 25 } }}
    >
      <DataTablePagination />
    </DataTableRoot>
  );
}

function ShrinkingHost({ shrinkTo }: { shrinkTo: number }): React.ReactElement {
  const [rowCount, setRowCount] = useState(60);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setRowCount(shrinkTo);
        }}
      >
        shrink
      </button>
      <ManualTableHost rowCount={rowCount} />
    </>
  );
}

describe('DataTablePagination', () => {
  it('renders the controls connected to the table state in manual mode', () => {
    render(<ManualTableHost rowCount={60} />);

    expect(screen.getByText('1–25 of 60')).toBeDefined();
    expect(screen.getByLabelText('Rows per page')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Page 1' }).hasAttribute('disabled')).toBe(false);
    expect(screen.getByRole('button', { name: 'Previous page' }).hasAttribute('disabled')).toBe(
      true,
    );
    expect(screen.getByRole('button', { name: 'Next page' }).hasAttribute('disabled')).toBe(false);
  });

  it('moves to the next page when the next-page button is clicked', () => {
    render(<ManualTableHost rowCount={60} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

    expect(screen.getByText('26–50 of 60')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Previous page' }).hasAttribute('disabled')).toBe(
      false,
    );
  });

  it('resets to the first page when the page size changes', () => {
    render(<ManualTableHost rowCount={60} />);
    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(screen.getByText('26–50 of 60')).toBeDefined();

    fireEvent.change(screen.getByLabelText('Rows per page'), { target: { value: '50' } });

    expect(screen.getByText('1–50 of 60')).toBeDefined();
  });

  it('tracks rowCount prop changes through the store when it is the only child', () => {
    render(<ShrinkingHost shrinkTo={40} />);
    expect(screen.getByText('1–25 of 60')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Page 3' })).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'shrink' }));

    expect(screen.getByText('1–25 of 40')).toBeDefined();
    // Page buttons shrink with the count: ceil(40 / 25) = 2 pages.
    expect(screen.queryByRole('button', { name: 'Page 3' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Page 2' })).toBeDefined();
  });

  it('hides the from/to range on a stale page', () => {
    render(<ShrinkingHost shrinkTo={10} />);
    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(screen.getByText('51–60 of 60')).toBeDefined();

    // Shrink the server total while pageIndex stays on the last page.
    fireEvent.click(screen.getByRole('button', { name: 'shrink' }));

    expect(screen.getByText('10 results')).toBeDefined();
    expect(screen.queryByText(/–/)).toBeNull();
  });
});
