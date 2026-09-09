/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RowSelectionState } from '@tanstack/react-table';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDataTable } from '../create-data-table';
import { DataTableLiveRegion } from '../live-region';
import type { DataTableBulkAction } from '../models/types';
import { DataTableTableBody } from '../table-body';
import { type DataTableUiStore, TableUiProvider, useTableUiStore } from '../table-ui-store';
import { DataTableBulkBar } from './bulk-bar';

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
    i18n: { resolvedLanguage: 'en-US', language: 'en-US' },
  }),
}));

type TestRow = { id: string; name: string };

type TestTable = ReturnType<typeof useDataTable<TestRow, RowSelectionState>>;

const rows: Array<TestRow> = Array.from({ length: 12 }, (_, index) => ({
  id: `row-${index + 1}`,
  name: `Row ${index + 1}`,
}));

const columns = [{ accessorKey: 'name', header: 'Name' }];

const actions: Array<DataTableBulkAction> = [
  { id: 'archive', label: 'Archive' },
  { id: 'delete', label: 'Delete', danger: true },
  { id: 'tag', label: 'Tag', requireConfirm: true },
];

type HarnessProps = {
  onTable: (table: TestTable) => void;
  onStore?: (store: DataTableUiStore) => void;
  withPeekBody?: boolean;
  barProps?: Record<string, unknown>;
};

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

function BulkBarHarness({ onTable, onStore, withPeekBody = false, barProps = {} }: HarnessProps) {
  const table = useDataTable<TestRow, RowSelectionState>(
    {
      data: rows,
      columns,
      getRowId: (row) => row.id,
      enableRowSelection: true,
      manualPagination: false,
      initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
    },
    (state) => state.rowSelection,
  );

  useEffect(() => {
    onTable(table);
  }, [table, onTable]);

  return (
    <TableUiProvider>
      <table.AppTable>
        <DataTableLiveRegion />
        {withPeekBody && <DataTableTableBody {...bodyProps} enablePeek />}
        <DataTableBulkBar actions={actions} {...barProps} />
        {onStore && <StoreProbe onStore={onStore} />}
      </table.AppTable>
    </TableUiProvider>
  );
}

function renderHarness(
  barProps: Record<string, unknown> = {},
  options: { withPeekBody?: boolean } = {},
): {
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
    <BulkBarHarness
      onTable={onTable}
      onStore={onStore}
      withPeekBody={options.withPeekBody}
      barProps={barProps}
    />,
  );
  return { getTable: () => table, getStore: () => store };
}

async function selectRows(getTable: () => TestTable | undefined, count: number): Promise<void> {
  await act(async () => {
    getTable()
      ?.getRowModel()
      .rows.slice(0, count)
      .forEach((row) => {
        row.toggleSelected(true);
      });
  });
}

describe('DataTableBulkBar', () => {
  it('renders nothing until rows are selected', () => {
    renderHarness();
    expect(screen.queryByRole('toolbar')).toBeNull();
  });

  it('shows the banner with the selected count, actions and clear affordance', async () => {
    const { getTable } = renderHarness();
    await selectRows(getTable, 2);
    const toolbar = screen.getByRole('toolbar', { name: 'Bulk actions, 2 selected' });
    expect(toolbar.textContent).toContain('selected');
    expect(screen.getByRole('button', { name: 'Archive' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '× Clear' })).toBeTruthy();
  });

  it('clearing resets the selection and announces it', async () => {
    const { getTable } = renderHarness();
    await selectRows(getTable, 1);
    fireEvent.click(screen.getByRole('button', { name: '× Clear' }));
    expect(screen.queryByRole('toolbar')).toBeNull();
    expect(getTable()?.atoms.rowSelection.get()).toEqual({});
    expect(screen.getByText('Selection cleared')).toBeTruthy();
  });

  it('invokes onBulkAction immediately with the selected ids for plain actions', async () => {
    const onBulkAction = vi.fn();
    const { getTable } = renderHarness({ onBulkAction });
    await selectRows(getTable, 2);
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
    await act(async () => {});
    expect(onBulkAction).toHaveBeenCalledTimes(1);
    expect(onBulkAction).toHaveBeenCalledWith({
      action: actions[0],
      selectedRowIds: ['row-1', 'row-2'],
      selectAllMatching: false,
      selectedCount: 2,
    });
    // No bulk job and no undo payload: the selection clears after the action.
    expect(screen.queryByRole('toolbar')).toBeNull();
  });

  it('routes danger actions through the confirm dialog', async () => {
    const onBulkAction = vi.fn();
    const { getTable } = renderHarness({ onBulkAction });
    await selectRows(getTable, 3);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onBulkAction).not.toHaveBeenCalled();
    const dialog = screen.getByRole('dialog', { name: 'Are you sure?' });
    expect(dialog.textContent).toContain('Delete 3 items? This cannot be undone.');
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await act(async () => {});
    expect(onBulkAction).toHaveBeenCalledWith({
      action: actions[1],
      selectedRowIds: ['row-1', 'row-2', 'row-3'],
      selectAllMatching: false,
      selectedCount: 3,
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('toolbar')).toBeNull();
  });

  it('cancelling the confirm dialog keeps the selection', async () => {
    const onBulkAction = vi.fn();
    const { getTable } = renderHarness({ onBulkAction });
    await selectRows(getTable, 1);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onBulkAction).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('toolbar', { name: 'Bulk actions, 1 selected' })).toBeTruthy();
  });

  it('routes requireConfirm actions through the confirm dialog too', async () => {
    const onBulkAction = vi.fn();
    const { getTable } = renderHarness({ onBulkAction });
    await selectRows(getTable, 1);
    fireEvent.click(screen.getByRole('button', { name: 'Tag' }));
    expect(screen.getByRole('dialog', { name: 'Are you sure?' })).toBeTruthy();
  });

  it('shows an undo toast for undoable results and clears the banner', async () => {
    const onUndo = vi.fn();
    const onBulkAction = vi.fn().mockResolvedValue({
      undo: { message: 'Archived 2 items', onUndo },
    });
    const { getTable } = renderHarness({ onBulkAction });
    await selectRows(getTable, 2);
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
    const toast = await screen.findByRole('status');
    expect(toast.textContent).toContain('Archived 2 items');
    // The banner is a sibling of the toast, so it clears while the toast lives on.
    expect(screen.queryByRole('toolbar')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByText('Undone')).toBeTruthy();
  });

  describe('with fake timers', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('expires the undo toast after the countdown', async () => {
      const onBulkAction = vi.fn().mockResolvedValue({
        undo: { message: 'Archived 2 items', onUndo: vi.fn() },
      });
      const { getTable } = renderHarness({ onBulkAction });
      await selectRows(getTable, 2);
      fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
      // Flush the onBulkAction microtask (fake timers only freeze timers).
      await act(async () => {});
      expect(screen.getByRole('status')).toBeTruthy();
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.queryByRole('status')).toBeNull();
    });
  });

  it('offers select-all-matching when the whole page is selected', async () => {
    const { getTable } = renderHarness({ enableSelectAllMatching: true, totalMatchingCount: 1234 });
    await selectRows(getTable, 5);
    expect(screen.getByText('All 5 rows on this page are selected.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Select all 1,234 matching' }));
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('toolbar', { name: 'Bulk actions, 1,234 selected' })).toBeTruthy();
  });

  it('passes the select-all-matching contract to onBulkAction (empty ids)', async () => {
    const onBulkAction = vi.fn();
    const { getTable } = renderHarness({
      onBulkAction,
      enableSelectAllMatching: true,
      totalMatchingCount: 1234,
    });
    await selectRows(getTable, 5);
    fireEvent.click(screen.getByRole('button', { name: 'Select all 1,234 matching' }));
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
    await act(async () => {});
    expect(onBulkAction).toHaveBeenCalledWith({
      action: actions[0],
      selectedRowIds: [],
      selectAllMatching: true,
      selectedCount: 1234,
    });
  });

  it('drops a stale select-all-matching flag when the selection empties underneath it', async () => {
    const { getTable, getStore } = renderHarness({
      enableSelectAllMatching: true,
      totalMatchingCount: 1234,
    });
    await selectRows(getTable, 5);
    fireEvent.click(screen.getByRole('button', { name: 'Select all 1,234 matching' }));
    expect(screen.getByRole('toolbar', { name: 'Bulk actions, 1,234 selected' })).toBeTruthy();
    // The owning view resets the selection (query-shape change) without
    // being able to reach the part-local UI store.
    await act(async () => {
      getTable()?.resetRowSelection();
    });
    expect(screen.queryByRole('toolbar')).toBeNull();
    expect(getStore()?.getState().selectAllMatching).toBe(false);
  });

  it('tracks Root republishes of resolvedRowCount without table interaction', async () => {
    // No totalMatchingCount prop: the count must come from the store slice
    // DataTableRoot publishes, and keep tracking its republishes.
    const { getTable, getStore } = renderHarness({ enableSelectAllMatching: true });
    await selectRows(getTable, 2);
    expect(screen.getByRole('toolbar', { name: 'Bulk actions, 2 selected' })).toBeTruthy();
    await act(async () => {
      getStore()?.getState().setResolvedRowCount(50);
      getStore()?.getState().setSelectAllMatching(true);
    });
    expect(screen.getByRole('toolbar', { name: 'Bulk actions, 50 selected' })).toBeTruthy();
    // A Root republish after a total change must reach the banner with no
    // table state change alongside it.
    await act(async () => {
      getStore()?.getState().setResolvedRowCount(60);
    });
    expect(screen.getByRole('toolbar', { name: 'Bulk actions, 60 selected' })).toBeTruthy();
  });

  it('falls back to the filtered row model count in client mode', async () => {
    // No totalMatchingCount prop and the store's resolvedRowCount left
    // untouched (undefined): the banner must count the filtered row model.
    const { getTable, getStore } = renderHarness({ enableSelectAllMatching: true });
    await selectRows(getTable, 2);
    await act(async () => {
      getStore()?.getState().setSelectAllMatching(true);
    });
    expect(screen.getByRole('toolbar', { name: 'Bulk actions, 12 selected' })).toBeTruthy();
  });

  it('keeps the selection while a bulk job is active', async () => {
    const onBulkAction = vi.fn();
    const { getTable } = renderHarness({
      onBulkAction,
      bulkJob: { label: 'Archiving', done: 0, total: 2, result: null },
    });
    await selectRows(getTable, 2);
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
    await act(async () => {});
    expect(onBulkAction).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('toolbar', { name: 'Bulk actions, 2 selected' })).toBeTruthy();
  });

  it('announces failures and keeps the selection when onBulkAction rejects', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onBulkAction = vi.fn().mockRejectedValue(new Error('boom'));
    const { getTable } = renderHarness({ onBulkAction });
    await selectRows(getTable, 2);
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
    await act(async () => {});
    expect(onBulkAction).toHaveBeenCalledTimes(1);
    expect(screen.getByText('The action failed. Please try again.')).toBeTruthy();
    expect(screen.getByRole('toolbar', { name: 'Bulk actions, 2 selected' })).toBeTruthy();
    expect(getTable()?.atoms.rowSelection.get()).toEqual({
      'row-1': true,
      'row-2': true,
    });
    consoleSpy.mockRestore();
  });

  it('ignores further action clicks while one is in flight', async () => {
    let resolveAction: (value: unknown) => void = () => {};
    const onBulkAction = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAction = resolve;
        }),
    );
    const { getTable } = renderHarness({ onBulkAction });
    await selectRows(getTable, 1);
    const button = screen.getByRole('button', { name: 'Archive' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(onBulkAction).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveAction(undefined);
    });
    expect(onBulkAction).toHaveBeenCalledTimes(1);
  });

  it('Escape closes only the confirm dialog, not the open peek', async () => {
    const onBulkAction = vi.fn();
    const { getTable, getStore } = renderHarness({ onBulkAction }, { withPeekBody: true });
    // Open the peek on the first row (row click with enablePeek).
    fireEvent.click(screen.getAllByRole('row')[0]);
    expect(getStore()?.getState().peekRowId).toBe('row-1');
    await selectRows(getTable, 1);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByRole('dialog', { name: 'Are you sure?' })).toBeTruthy();
    expect(getStore()?.getState().modalOpen).toBe(true);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(getStore()?.getState().modalOpen).toBe(false);
    expect(getStore()?.getState().peekRowId).toBe('row-1');
    expect(onBulkAction).not.toHaveBeenCalled();
  });

  it('Cmd+Z is suppressed while the confirm dialog is open and undoes after cancel', async () => {
    const onUndo = vi.fn();
    const onBulkAction = vi.fn().mockResolvedValue({
      undo: { message: 'Archived 2 items', onUndo },
    });
    const { getTable, getStore } = renderHarness({ onBulkAction });
    // First action leaves an undoable toast alive.
    await selectRows(getTable, 2);
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
    await act(async () => {});
    expect(await screen.findByRole('status')).toBeTruthy();
    // Re-select and open the danger confirm dialog above the live toast.
    await selectRows(getTable, 1);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByRole('dialog', { name: 'Are you sure?' })).toBeTruthy();
    expect(getStore()?.getState().modalOpen).toBe(true);
    fireEvent.keyDown(document, { key: 'z', metaKey: true });
    expect(onUndo).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.keyDown(document, { key: 'z', metaKey: true });
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('status')).toBeNull();
  });
});
