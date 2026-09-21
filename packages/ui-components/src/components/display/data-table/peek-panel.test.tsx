/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ColumnPinningState } from '@tanstack/react-table';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useDataTable } from './create-data-table';
import { DataTablePeekPanel, type DataTablePeekPanelProps } from './peek-panel';
import { TableConfigProvider } from './table-config-context';
import { type DataTableUiStore, TableUiProvider, useTableUiStore } from './table-ui-store';
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

type TestRow = { id: string; name: string; email: string };

type TestTable = ReturnType<typeof useDataTable<TestRow, ColumnPinningState>>;

const rows: Array<TestRow> = [
  { id: 'r1', name: 'Carol', email: 'carol@example.com' },
  { id: 'r2', name: 'Alice', email: 'alice@example.com' },
  { id: 'r3', name: 'Bob', email: 'bob@example.com' },
];

const columns: Array<DataTableColumnDef<TestRow>> = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
];

const tableConfig = {
  primaryColumnId: 'name',
  enableRowSelection: false,
  columns,
  getRowLabel: (row: TestRow) => row.name,
};

function StoreProbe({ onStore }: { onStore: (store: DataTableUiStore) => void }) {
  const store = useTableUiStore();
  useEffect(() => {
    onStore(store);
  }, [store, onStore]);
  return null;
}

type PeekHarnessProps = {
  peekProps?: DataTablePeekPanelProps<TestRow>;
  onTable: (table: TestTable) => void;
  onStore: (store: DataTableUiStore) => void;
};

function PeekHarness({ peekProps, onTable, onStore }: PeekHarnessProps) {
  const table = useDataTable<TestRow, ColumnPinningState>(
    {
      data: rows,
      columns,
      getRowId: (row) => row.id,
      manualPagination: false,
      initialState: { pagination: { pageIndex: 0, pageSize: 2 } },
    },
    (state) => state.columnPinning,
  );

  useEffect(() => {
    onTable(table);
  }, [table, onTable]);

  return (
    <TableUiProvider>
      <StoreProbe onStore={onStore} />
      <TableConfigProvider value={tableConfig}>
        <table.AppTable>
          <DataTablePeekPanel<TestRow> {...peekProps} />
        </table.AppTable>
      </TableConfigProvider>
    </TableUiProvider>
  );
}

function renderPeekHarness(peekProps?: DataTablePeekPanelProps<TestRow>): {
  getTable: () => TestTable | undefined;
  getStore: () => DataTableUiStore | undefined;
} {
  let table: TestTable | undefined;
  let store: DataTableUiStore | undefined;
  render(
    <PeekHarness
      peekProps={peekProps}
      onTable={(instance) => {
        table = instance;
      }}
      onStore={(instance) => {
        store = instance;
      }}
    />,
  );
  return {
    getTable: () => table,
    getStore: () => store,
  };
}

function peekRow(store: DataTableUiStore | undefined, rowId: string): void {
  act(() => {
    store?.getState().setPeekRowId(rowId);
  });
}

describe('DataTablePeekPanel', () => {
  it('renders the peeked row with default fields built from the columns', () => {
    const { getStore } = renderPeekHarness();
    peekRow(getStore(), 'r1');
    // Title falls back to the config row label (primary column value).
    expect(screen.getByRole('complementary')).toBeTruthy();
    expect(screen.getByText('Carol')).toBeTruthy();
    // Default fields exclude the primary column and include the others.
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('carol@example.com')).toBeTruthy();
    expect(screen.queryByText('Name')).toBeNull();
    expect(screen.getByRole('button', { name: 'Close details' })).toBeTruthy();
    expect(screen.getByText('↑ / ↓ retarget the panel · Esc closes')).toBeTruthy();
  });

  it('prefers the title, status and custom fields over the defaults', () => {
    const { getStore } = renderPeekHarness({
      title: (row) => `Details of ${row.email}`,
      status: () => 'Active',
      fields: () => [
        { id: 'owner', label: 'Owner', value: 'Carol' },
        { id: 'quota', label: 'Quota', value: '10 GB' },
      ],
    });
    peekRow(getStore(), 'r1');
    expect(screen.getByText('Details of carol@example.com')).toBeTruthy();
    expect(screen.getByText('Active')).toBeTruthy();
    expect(screen.getByText('Owner')).toBeTruthy();
    expect(screen.getByText('Quota')).toBeTruthy();
    expect(screen.queryByText('Email')).toBeNull();
  });

  it('keys custom fields by id so duplicate labels both render', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { getStore } = renderPeekHarness({
      fields: () => [
        { id: 'first', label: 'Same label', value: 'One' },
        { id: 'second', label: 'Same label', value: 'Two' },
      ],
    });
    peekRow(getStore(), 'r1');
    expect(screen.getByText('One')).toBeTruthy();
    expect(screen.getByText('Two')).toBeTruthy();
    const duplicateKeyWarnings = errorSpy.mock.calls.filter((call) =>
      String(call[0]).includes('same key'),
    );
    expect(duplicateKeyWarnings).toHaveLength(0);
    errorSpy.mockRestore();
  });

  it('renders custom content instead of the field list with renderPeek', () => {
    const { getStore } = renderPeekHarness({
      renderPeek: (row) => <p>Custom peek for {row.email}</p>,
    });
    peekRow(getStore(), 'r2');
    expect(screen.getByText('Custom peek for alice@example.com')).toBeTruthy();
    expect(screen.queryByText('Email')).toBeNull();
  });

  it('clears peekRowId when the close button is clicked', () => {
    const { getStore } = renderPeekHarness();
    peekRow(getStore(), 'r1');
    fireEvent.click(screen.getByRole('button', { name: 'Close details' }));
    expect(getStore()?.getState().peekRowId).toBeNull();
    expect(screen.queryByRole('complementary')).toBeNull();
  });

  it('opens full details with the row and clears the peek', () => {
    const onOpenFullDetails = vi.fn();
    const { getStore } = renderPeekHarness({ onOpenFullDetails });
    peekRow(getStore(), 'r2');
    fireEvent.click(screen.getByRole('button', { name: 'Open full details' }));
    expect(onOpenFullDetails).toHaveBeenCalledTimes(1);
    expect(onOpenFullDetails).toHaveBeenCalledWith(rows[1]);
    expect(getStore()?.getState().peekRowId).toBeNull();
    expect(screen.queryByRole('complementary')).toBeNull();
  });

  it('renders nothing when the peeked row is not on the current page', () => {
    const { getStore } = renderPeekHarness();
    peekRow(getStore(), 'r3');
    expect(screen.queryByRole('complementary')).toBeNull();
  });

  it('re-resolves the peeked row when the page changes', async () => {
    const { getStore, getTable } = renderPeekHarness();
    peekRow(getStore(), 'r1');
    expect(screen.getByText('Carol')).toBeTruthy();
    await act(async () => {
      getTable()?.setPageIndex(1);
    });
    // r1 left the page: the panel unmounts without any peekRowId change.
    expect(screen.queryByRole('complementary')).toBeNull();
    peekRow(getStore(), 'r3');
    expect(screen.getByText('Bob')).toBeTruthy();
  });
});
