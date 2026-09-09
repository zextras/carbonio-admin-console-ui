/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ColumnPinningState } from '@tanstack/react-table';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useDataTable } from './create-data-table';
import { ACTIONS_COLUMN_ID } from './models/customize-model';
import { DataTableRowActions } from './row-ui/row-actions';
import { DataTableTableBody } from './table-body';
import { type DataTableUiStore, TableUiProvider, useTableUiStore } from './table-ui-store';
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

type TestRow = { id: string; name: string };

type TestTable = ReturnType<typeof useDataTable<TestRow, ColumnPinningState>>;

const rows: Array<TestRow> = Array.from({ length: 60 }, (_, index) => ({
  id: `row-${String(index + 1).padStart(3, '0')}`,
  name: `row-${String(index + 1).padStart(3, '0')}`,
}));

const columns: Array<DataTableColumnDef<TestRow>> = [{ accessorKey: 'name', header: 'Name' }];

const rowActions: Array<DataTableRowAction> = [
  { id: 'open', label: 'Open' },
  { id: 'delete', label: 'Delete', danger: true },
];

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

function StoreProbe({ onStore }: { onStore: (store: DataTableUiStore) => void }) {
  const store = useTableUiStore();
  useEffect(() => {
    onStore(store);
  }, [store, onStore]);
  return null;
}

/** Mirrors Root's RowActionsCell: local menu-open state per rendered cell. */
function TestActionsCell({ rowId }: { rowId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <DataTableRowActions
      rowLabel={rowId}
      actions={rowActions}
      open={open}
      onToggle={() => {
        setOpen((value) => !value);
      }}
      onClose={() => {
        setOpen(false);
      }}
      onSelect={() => {
        setOpen(false);
      }}
    />
  );
}

const actionsColumn: DataTableColumnDef<TestRow> = {
  id: ACTIONS_COLUMN_ID,
  enableSorting: false,
  cell: ({ row }) => <TestActionsCell rowId={row.id} />,
};

const editableRows: Array<TestRow> = Array.from({ length: 10 }, (_, index) => ({
  id: `row-${String(index + 1).padStart(3, '0')}`,
  name: `row-${String(index + 1).padStart(3, '0')}`,
}));

const editableColumns: Array<DataTableColumnDef<TestRow>> = [
  { accessorKey: 'name', header: 'Name', meta: { editable: true } },
];

function BodyHarness({
  onTable,
  onStore,
  withPeek = false,
  withRowActions = false,
}: {
  onTable: (table: TestTable) => void;
  onStore?: (store: DataTableUiStore) => void;
  withPeek?: boolean;
  withRowActions?: boolean;
}) {
  // Narrow root subscription: state changes must reach the body part through
  // its own <table.Subscribe>, not through a parent re-render.
  const table = useDataTable<TestRow, ColumnPinningState>(
    {
      data: rows,
      columns: withRowActions ? [...columns, actionsColumn] : columns,
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
        <DataTableTableBody {...bodyProps} enablePeek={withPeek} />
        {onStore && <StoreProbe onStore={onStore} />}
      </table.AppTable>
    </TableUiProvider>
  );
}

function firstRowCellText(): string {
  return screen.getAllByRole('cell')[0]?.textContent ?? '';
}

function renderHarness(options: { withPeek?: boolean; withRowActions?: boolean } = {}): {
  getTable: () => TestTable | undefined;
  getStore: () => DataTableUiStore | undefined;
} {
  let table: TestTable | undefined;
  let store: DataTableUiStore | undefined;
  const onTable = (instance: TestTable): void => {
    table = instance;
  };
  const onStore = (instance: DataTableUiStore): void => {
    store = instance;
  };
  render(
    <BodyHarness
      onTable={onTable}
      onStore={onStore}
      withPeek={options.withPeek}
      withRowActions={options.withRowActions}
    />,
  );
  return { getTable: () => table, getStore: () => store };
}

function EditableBodyHarness({
  onTable,
  onStore,
}: {
  onTable: (table: TestTable) => void;
  onStore: (store: DataTableUiStore) => void;
}) {
  // Same narrow root subscription as BodyHarness: the page change must reach
  // the body part through its own <table.Subscribe>, not a parent re-render.
  const table = useDataTable<TestRow, ColumnPinningState>(
    {
      data: editableRows,
      columns: editableColumns,
      getRowId: (row) => row.id,
      manualPagination: false,
      initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
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
        <StoreProbe onStore={onStore} />
      </table.AppTable>
    </TableUiProvider>
  );
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

describe('DataTableTableBody peek layering', () => {
  it('Escape closes only the open row menu, then the peek on a second press', async () => {
    const { getStore } = renderHarness({ withPeek: true, withRowActions: true });
    fireEvent.click(screen.getAllByRole('row')[0]);
    expect(getStore()?.getState().peekRowId).toBe('row-001');
    fireEvent.click(screen.getByRole('button', { name: 'Actions for row-001' }));
    expect(await screen.findByRole('menu')).toBeTruthy();
    expect(getStore()?.getState().rowMenuOpen).toBe(true);
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
    expect(getStore()?.getState().rowMenuOpen).toBe(false);
    expect(getStore()?.getState().peekRowId).toBe('row-001');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(getStore()?.getState().peekRowId).toBeNull();
  });
});

describe('DataTableTableBody editing target reconciliation', () => {
  it('clears the editing target when its row leaves the row model', async () => {
    let table: TestTable | undefined;
    let store: DataTableUiStore | undefined;
    render(
      <EditableBodyHarness
        onTable={(instance) => {
          table = instance;
        }}
        onStore={(instance) => {
          store = instance;
        }}
      />,
    );

    expect(screen.getAllByRole('row')).toHaveLength(5);
    expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull();

    await act(async () => {
      store?.getState().setEditing({ rowId: 'row-001', columnId: 'name' });
    });
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeTruthy();

    await act(async () => {
      table?.setPageIndex(1);
    });
    expect(store?.getState().editing).toBeNull();

    await act(async () => {
      table?.setPageIndex(0);
    });
    expect(store?.getState().editing).toBeNull();
    expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull();
  });
});
