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
import { TableUiProvider } from '../table-ui-store';
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
  barProps?: Record<string, unknown>;
};

function BulkBarHarness({ onTable, barProps = {} }: HarnessProps) {
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
        <DataTableBulkBar actions={actions} {...barProps} />
      </table.AppTable>
    </TableUiProvider>
  );
}

function renderHarness(barProps: Record<string, unknown> = {}): {
  getTable: () => TestTable | undefined;
} {
  let table: TestTable | undefined;
  const onTable = (instance: TestTable): void => {
    table = instance;
  };
  render(<BulkBarHarness onTable={onTable} barProps={barProps} />);
  return { getTable: () => table };
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
});
