/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RowSelectionState } from '@tanstack/react-table';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useDataTable } from '../create-data-table';
import { DataTableLiveRegion } from '../live-region';
import type { DataTableBulkJobState } from '../models/types';
import { TableUiProvider } from '../table-ui-store';
import { DataTableBulkJob } from './bulk-job';

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

const rows: Array<TestRow> = [
  { id: 'row-1', name: 'Row 1' },
  { id: 'row-2', name: 'Row 2' },
  { id: 'row-3', name: 'Row 3' },
];

const columns = [{ accessorKey: 'name', header: 'Name' }];

type JobHarnessProps = {
  job: NonNullable<DataTableBulkJobState>;
  onCancel: () => void;
  onRetryFailed: () => void;
  onDismiss: () => void;
  onTable: (table: TestTable) => void;
};

function JobHarness({ job, onCancel, onRetryFailed, onDismiss, onTable }: JobHarnessProps) {
  const table = useDataTable<TestRow, RowSelectionState>(
    {
      data: rows,
      columns,
      getRowId: (row) => row.id,
      enableRowSelection: true,
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
        <DataTableBulkJob
          job={job}
          onCancel={onCancel}
          onRetryFailed={onRetryFailed}
          onDismiss={onDismiss}
        />
      </table.AppTable>
    </TableUiProvider>
  );
}

function renderJobHarness(job: NonNullable<DataTableBulkJobState>): {
  getTable: () => TestTable | undefined;
  onCancel: ReturnType<typeof vi.fn>;
  onRetryFailed: ReturnType<typeof vi.fn>;
  onDismiss: ReturnType<typeof vi.fn>;
} {
  let table: TestTable | undefined;
  const onTable = (instance: TestTable): void => {
    table = instance;
  };
  const onCancel = vi.fn();
  const onRetryFailed = vi.fn();
  const onDismiss = vi.fn();
  render(
    <JobHarness
      job={job}
      onCancel={onCancel}
      onRetryFailed={onRetryFailed}
      onDismiss={onDismiss}
      onTable={onTable}
    />,
  );
  return { getTable: () => table, onCancel, onRetryFailed, onDismiss };
}

describe('DataTableBulkJob', () => {
  it('renders a labelled progressbar with the cancel affordance while running', () => {
    const { onCancel } = renderJobHarness({ label: 'Deleting', done: 2, total: 6, result: null });
    const progressbar = screen.getByRole('progressbar', { name: 'Deleting' });
    expect(progressbar.getAttribute('aria-valuenow')).toBe('2');
    expect(progressbar.getAttribute('aria-valuemax')).toBe('6');
    expect(screen.getByText('2 / 6')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('announces the cancellation on the live region', () => {
    renderJobHarness({ label: 'Deleting', done: 2, total: 6, result: null });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('Job cancelled — completed items are not rolled back')).toBeTruthy();
  });

  it('renders the result with a retry affordance only when rows failed', () => {
    const { onRetryFailed } = renderJobHarness({
      label: 'Deleting',
      done: 3,
      total: 3,
      result: { ok: 2, failed: 1 },
    });
    expect(screen.getByText('✓ 2 succeeded · 1 failed')).toBeTruthy();
    const retry = screen.getByRole('button', { name: 'Retry failed' });
    fireEvent.click(retry);
    expect(onRetryFailed).toHaveBeenCalledTimes(1);
  });

  it('hides the retry affordance when nothing failed', () => {
    renderJobHarness({ label: 'Deleting', done: 3, total: 3, result: { ok: 3, failed: 0 } });
    expect(screen.queryByRole('button', { name: 'Retry failed' })).toBeNull();
  });

  it('dismisses and clears the row selection', async () => {
    const { getTable, onDismiss } = renderJobHarness({
      label: 'Deleting',
      done: 3,
      total: 3,
      result: { ok: 3, failed: 0 },
    });
    await act(async () => {
      getTable()?.getRowModel().rows[0].toggleSelected(true);
    });
    expect(Object.keys(getTable()?.atoms.rowSelection.get() ?? {}).length).toBe(1);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(getTable()?.atoms.rowSelection.get()).toEqual({});
  });
});
