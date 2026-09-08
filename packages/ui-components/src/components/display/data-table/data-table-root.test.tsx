/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DataTableRoot } from './data-table-root';
import { DataTableTable } from './table';
import type { DataTableColumnDef, DataTableRowAction } from './types';

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

type TestRow = { id: string; name: string; email: string };

const rows: Array<TestRow> = [
  { id: 'r1', name: 'Carol', email: 'carol@example.com' },
  { id: 'r2', name: 'Alice', email: 'alice@example.com' },
  { id: 'r3', name: 'Bob', email: 'bob@example.com' },
];

const columns: Array<DataTableColumnDef<TestRow>> = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email', meta: { editable: true, copyable: true } },
];

const rowActions: Array<DataTableRowAction> = [{ id: 'open', label: 'Open' }];

type RootHarnessProps = {
  enableRowSelection?: boolean;
  rowActions?: Array<DataTableRowAction>;
  getRowLabel?: (row: TestRow) => string;
  manualSorting?: boolean;
};

function RootHarness({
  enableRowSelection,
  rowActions: rowActionsProp,
  getRowLabel,
  manualSorting = true,
}: RootHarnessProps) {
  return (
    <DataTableRoot<TestRow>
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      enableRowSelection={enableRowSelection}
      rowActions={rowActionsProp}
      getRowLabel={getRowLabel}
      manualSorting={manualSorting}
    >
      <DataTableTable<TestRow>
        aria-label="People"
        columns={columns}
        enableRowSelection={enableRowSelection}
      />
    </DataTableRoot>
  );
}

function firstBodyCell(): string {
  return screen.getAllByRole('cell')[0]?.textContent ?? '';
}

describe('DataTableRoot + DataTableTable shell', () => {
  it('renders the labelled table with one row per datum', () => {
    render(<RootHarness />);
    const table = screen.getByRole('table');
    expect(table.getAttribute('aria-label')).toBe('People');
    expect(within(table).getAllByRole('row')).toHaveLength(4);
    expect(screen.getByText('Carol')).toBeTruthy();
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  it('renders the selection column when enableRowSelection is set', () => {
    render(<RootHarness enableRowSelection />);
    expect(screen.getByLabelText('Select all rows on this page')).toBeTruthy();
    expect(screen.getAllByLabelText('Select row')).toHaveLength(3);
  });

  it('omits the selection column by default', () => {
    render(<RootHarness />);
    expect(screen.queryByLabelText('Select all rows on this page')).toBeNull();
    expect(screen.queryByLabelText('Select row')).toBeNull();
  });

  it('renders the actions column with kebab buttons labelled by row label', () => {
    render(<RootHarness rowActions={rowActions} />);
    expect(screen.getByRole('button', { name: 'Actions for Carol' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Actions for Alice' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Actions for Bob' })).toBeTruthy();
  });

  it('omits the actions column when no row actions are provided', () => {
    render(<RootHarness />);
    expect(screen.queryByRole('button', { name: /^Actions for/ })).toBeNull();
  });

  it('labels the kebab buttons with getRowLabel when provided', () => {
    render(<RootHarness rowActions={rowActions} getRowLabel={(row) => row.email} />);
    expect(screen.getByRole('button', { name: 'Actions for alice@example.com' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^Actions for (Carol|Alice|Bob)$/ })).toBeNull();
  });

  it('reorders rows when a sortable header is clicked in client mode', () => {
    render(<RootHarness manualSorting={false} />);
    expect(firstBodyCell()).toBe('Carol');
    fireEvent.click(screen.getByRole('button', { name: 'Name' }));
    expect(firstBodyCell()).toBe('Alice');
  });
});
