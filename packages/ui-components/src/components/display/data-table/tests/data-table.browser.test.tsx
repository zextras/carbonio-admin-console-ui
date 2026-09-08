/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { DataTable } from '../data-table';
import type {
  DataTableColumnDef,
  DataTableFilterDef,
  DataTableFiltersState,
  DataTableRowAction,
} from '../types';

type Account = {
  id: string;
  account: string;
  displayName: string;
  status: string;
};

const ALL_ROWS: Array<Account> = Array.from({ length: 25 }, (_, i) => ({
  id: `a${i}`,
  account: `user${i}@demo.zextras.io`,
  displayName: `User ${i}`,
  status: i % 2 === 0 ? 'Active' : 'Pending',
}));

const columns: Array<DataTableColumnDef<Account>> = [
  {
    accessorKey: 'account',
    header: 'Account',
    id: 'account',
    enableSorting: true,
    meta: { primary: true, copyable: true },
  },
  {
    accessorKey: 'displayName',
    header: 'Display name',
    id: 'displayName',
    enableSorting: true,
    meta: { editable: true },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    id: 'status',
    enableSorting: true,
  },
];

const STATUS_FILTER_DEFS: Array<DataTableFilterDef> = [
  {
    id: 'status',
    label: 'Status',
    type: 'enum',
    options: [
      { label: 'Active', value: 'Active' },
      { label: 'Pending', value: 'Pending' },
    ],
  },
];

function ClientDataTable({
  status = 'idle' as const,
  onRetry,
  paginationThreshold = 10,
}: {
  status?: 'idle' | 'loading' | 'empty' | 'error';
  onRetry?: () => void;
  paginationThreshold?: number;
}) {
  const [selectAllMatching, setSelectAllMatching] = useState(false);

  return (
    <DataTable
      aria-label="Manage Accounts"
      data={ALL_ROWS}
      columns={columns}
      getRowId={(row) => row.id}
      status={status}
      onRetry={onRetry}
      manualSorting={false}
      manualPagination={false}
      enableRowSelection
      enableSelectAllMatching
      totalMatchingCount={ALL_ROWS.length}
      selectAllMatching={selectAllMatching}
      onSelectAllMatchingChange={setSelectAllMatching}
      paginationThreshold={paginationThreshold}
      primaryColumnId="account"
      emptyTitle="No accounts yet"
      emptyDescription="Create the first one, or adjust your filters to see results."
      errorTitle="Failed to load accounts"
      errorDescription="Please try again."
      retryLabel="Retry"
    />
  );
}

function FilteringDataTable() {
  const [filters, setFilters] = useState<DataTableFiltersState>({});
  const [selectAllMatching, setSelectAllMatching] = useState(false);

  return (
    <DataTable
      aria-label="Manage Accounts"
      data={ALL_ROWS}
      columns={columns}
      getRowId={(row) => row.id}
      manualSorting={false}
      manualPagination={false}
      manualFiltering={false}
      enableRowSelection
      enableSelectAllMatching
      totalMatchingCount={ALL_ROWS.length}
      selectAllMatching={selectAllMatching}
      onSelectAllMatchingChange={setSelectAllMatching}
      paginationThreshold={100}
      primaryColumnId="account"
      filterDefs={STATUS_FILTER_DEFS}
      filters={filters}
      onFiltersChange={setFilters}
      enableSearch
      searchPlaceholder="Search accounts"
      searchLabel="Search accounts"
      searchColumnIds={['account', 'displayName']}
    />
  );
}

function CustomizeDataTable() {
  return (
    <DataTable
      aria-label="Manage Accounts"
      data={ALL_ROWS}
      columns={columns}
      getRowId={(row) => row.id}
      manualSorting={false}
      manualPagination={false}
      paginationThreshold={100}
      primaryColumnId="account"
      enableCustomize
    />
  );
}

function ChromeDataTable({
  onCellEditCommit,
  onRowAction,
  onCopyCell,
}: {
  onCellEditCommit?: (commit: {
    rowId: string;
    columnId: string;
    value: string;
  }) => void;
  onRowAction?: (payload: { action: DataTableRowAction; row: Account }) => void;
  onCopyCell?: (value: string) => void;
}) {
  const actions: Array<DataTableRowAction> = [
    { id: 'edit', label: 'Edit account' },
    { id: 'delete', label: 'Delete account', danger: true },
  ];

  return (
    <DataTable
      aria-label="Manage Accounts"
      data={ALL_ROWS.slice(0, 5)}
      columns={columns}
      getRowId={(row) => row.id}
      manualSorting={false}
      manualPagination={false}
      paginationThreshold={100}
      primaryColumnId="account"
      enablePeek
      peekTitle={(row) => row.account}
      onCellEditCommit={onCellEditCommit}
      onRowAction={onRowAction}
      onCopyCell={(value, _row, _columnId) => {
        onCopyCell?.(value);
      }}
      rowActions={actions}
    />
  );
}

describe('DataTable (browser)', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders headers and rows', async () => {
    await render(<ClientDataTable />);

    await expect.element(page.getByRole('table', { name: 'Manage Accounts' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: /Account/ })).toBeVisible();
    await expect.element(page.getByText('user0@demo.zextras.io')).toBeVisible();
  });

  it('cycles column sorting', async () => {
    await render(<ClientDataTable />);

    const sortButton = page.getByRole('button', { name: /Account/ });
    await expect.element(sortButton).toHaveAttribute('data-sorted', 'none');

    await userEvent.click(sortButton);
    await expect.element(sortButton).toHaveAttribute('data-sorted', 'asc');

    await userEvent.click(sortButton);
    await expect.element(sortButton).toHaveAttribute('data-sorted', 'desc');
  });

  it('shows selection banner after selecting a row and clears it', async () => {
    await render(<ClientDataTable />);

    await userEvent.click(page.getByRole('checkbox', { name: 'Select row' }).first());

    await expect.element(page.getByRole('toolbar', { name: /1 selected/ })).toBeVisible();
    await expect.element(page.getByText('selected')).toBeVisible();

    await userEvent.click(page.getByRole('button', { name: /Clear/ }));
    await expect.element(page.getByRole('toolbar', { name: /selected/ })).not.toBeInTheDocument();
  });

  it('offers select-all-matching when the page is fully selected', async () => {
    await render(<ClientDataTable />);

    await userEvent.click(page.getByRole('checkbox', { name: 'Select all rows on this page' }));

    await expect
      .element(page.getByRole('button', { name: /Select all 25 matching/ }))
      .toBeVisible();

    await userEvent.click(page.getByRole('button', { name: /Select all 25 matching/ }));

    await expect.element(page.getByRole('toolbar', { name: /25 selected/ })).toBeVisible();
  });

  it('hides pagination below the threshold and shows a result count', async () => {
    await render(<ClientDataTable paginationThreshold={100} />);

    await expect.element(page.getByText('25 results')).toBeVisible();
    await expect.element(page.getByRole('navigation', { name: 'Table pagination' })).not.toBeInTheDocument();
  });

  it('shows pagination when row count exceeds the threshold', async () => {
    await render(<ClientDataTable paginationThreshold={10} />);

    await expect.element(page.getByRole('navigation', { name: 'Table pagination' })).toBeVisible();
    await expect.element(page.getByLabelText('Rows per page')).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Next page' })).toBeVisible();
  });

  it('renders loading skeleton rows', async () => {
    await render(<ClientDataTable status="loading" />);

    await expect.element(page.getByRole('table', { name: 'Manage Accounts' })).toBeVisible();
    await expect.element(page.getByText('user0@demo.zextras.io')).not.toBeInTheDocument();
  });

  it('renders empty state', async () => {
    await render(<ClientDataTable status="empty" />);

    await expect.element(page.getByText('No accounts yet')).toBeVisible();
    await expect
      .element(page.getByText('Create the first one, or adjust your filters to see results.'))
      .toBeVisible();
  });

  it('renders error state with a working retry action', async () => {
    const onRetry = vi.fn();
    await render(<ClientDataTable status="error" onRetry={onRetry} />);

    await expect.element(page.getByText('Failed to load accounts')).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('opens the filters panel and applies an enum filter with a badge and chip', async () => {
    await render(<FilteringDataTable />);

    await userEvent.click(page.getByRole('button', { name: 'Filters' }));
    await expect.element(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();

    await userEvent.click(page.getByRole('checkbox', { name: 'Active' }));
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));

    await expect.element(page.getByRole('dialog', { name: 'Filters' })).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Filters' })).toBeVisible();
    await expect.element(page.getByText('Status: Active')).toBeVisible();
    await expect.element(page.getByText('13 results')).toBeVisible();
    await expect.element(page.getByText('user1@demo.zextras.io')).not.toBeInTheDocument();
  });

  it('clears draft filters without applying them', async () => {
    await render(<FilteringDataTable />);

    await userEvent.click(page.getByRole('button', { name: 'Filters' }));
    await userEvent.click(page.getByRole('checkbox', { name: 'Pending' }));
    await userEvent.click(page.getByRole('button', { name: 'Clear' }));
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));

    await expect.element(page.getByText('Status: Pending')).not.toBeInTheDocument();
    await expect.element(page.getByText('25 results')).toBeVisible();
  });

  it('removes a filter chip and supports Clear all', async () => {
    await render(<FilteringDataTable />);

    await userEvent.click(page.getByRole('button', { name: 'Filters' }));
    await userEvent.click(page.getByRole('checkbox', { name: 'Active' }));
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));

    await expect.element(page.getByText('Status: Active')).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'Remove filter: Status: Active' }));
    await expect.element(page.getByText('Status: Active')).not.toBeInTheDocument();
    await expect.element(page.getByText('25 results')).toBeVisible();

    await userEvent.click(page.getByRole('button', { name: 'Filters' }));
    await userEvent.click(page.getByRole('checkbox', { name: 'Pending' }));
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect.element(page.getByText('Status: Pending')).toBeVisible();

    await userEvent.click(page.getByRole('button', { name: 'Clear all' }));
    await expect.element(page.getByText('Status: Pending')).not.toBeInTheDocument();
    await expect.element(page.getByText('25 results')).toBeVisible();
  });

  it('switches density via Customize', async () => {
    await render(<CustomizeDataTable />);

    await userEvent.click(page.getByRole('button', { name: 'Customize' }));
    await expect.element(page.getByRole('dialog', { name: 'Customize table' })).toBeVisible();
    await expect.element(page.getByRole('radio', { name: 'Comfortable' })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    await userEvent.click(page.getByRole('radio', { name: 'Compact' }));
    await expect.element(page.getByRole('radio', { name: 'Compact' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect
      .poll(() => document.querySelector('[data-density]')?.getAttribute('data-density'))
      .toBe('compact');
  });

  it('hides a non-locked column and keeps the primary locked', async () => {
    await render(<CustomizeDataTable />);

    await userEvent.click(page.getByRole('button', { name: 'Customize' }));
    await expect.element(page.getByRole('menuitemcheckbox', { name: /Account/ })).toBeDisabled();

    await userEvent.click(page.getByRole('menuitemcheckbox', { name: /Display name/ }));
    await userEvent.click(page.getByRole('button', { name: 'Customize' }));

    await expect.element(page.getByRole('button', { name: /Display name/ })).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: /Account/ })).toBeVisible();
  });

  it('reorders columns with move buttons and Reset restores defaults', async () => {
    await render(<CustomizeDataTable />);

    await userEvent.click(page.getByRole('button', { name: 'Customize' }));
    await userEvent.click(page.getByRole('button', { name: 'Move Display name down' }));

    await expect.element(page.getByRole('button', { name: 'Reset' })).toBeVisible();

    const headerButtons = document.querySelectorAll('thead button');
    const headerLabels = Array.from(headerButtons).map((button) => button.textContent ?? '');
    expect(headerLabels.join('|')).toContain('Account');
    expect(headerLabels.indexOf('Status')).toBeLessThan(headerLabels.indexOf('Display name'));

    await userEvent.click(page.getByRole('button', { name: 'Reset' }));
    await expect.element(page.getByRole('button', { name: 'Reset' })).not.toBeInTheDocument();

    const resetHeaders = Array.from(document.querySelectorAll('thead button')).map(
      (button) => button.textContent ?? '',
    );
    expect(resetHeaders.indexOf('Display name')).toBeLessThan(resetHeaders.indexOf('Status'));
  });

  it('edits a cell with Enter and cancels with Escape', async () => {
    const onCellEditCommit = vi.fn();
    await render(<ChromeDataTable onCellEditCommit={onCellEditCommit} />);

    await userEvent.hover(page.getByText('User 0'));
    await userEvent.click(page.getByRole('button', { name: /Edit display name for user0/ }).first());
    const input = page.getByRole('textbox', { name: 'Display name' });
    await expect.element(input).toBeVisible();

    await userEvent.clear(input);
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByText('Required')).toBeVisible();
    expect(onCellEditCommit).not.toHaveBeenCalled();

    await userEvent.fill(input, 'Renamed User');
    await userEvent.keyboard('{Enter}');
    expect(onCellEditCommit).toHaveBeenCalledWith(
      expect.objectContaining({
        rowId: 'a0',
        columnId: 'displayName',
        value: 'Renamed User',
      }),
    );

    await userEvent.hover(page.getByText('User 1'));
    await userEvent.click(page.getByRole('button', { name: /Edit display name for user1/ }).first());
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('textbox', { name: 'Display name' })).not.toBeInTheDocument();
  });

  it('copies an identity cell value', async () => {
    const onCopyCell = vi.fn();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    await render(<ChromeDataTable onCopyCell={onCopyCell} />);

    await userEvent.hover(page.getByText('user0@demo.zextras.io'));
    await userEvent.click(
      page.getByRole('button', { name: 'Copy user0@demo.zextras.io' }).first(),
    );
    expect(writeText).toHaveBeenCalledWith('user0@demo.zextras.io');
    expect(onCopyCell).toHaveBeenCalledWith('user0@demo.zextras.io');
    await expect.element(page.getByText('Copied to clipboard')).toBeVisible();
  });

  it('opens row actions and fires onRowAction', async () => {
    const onRowAction = vi.fn();
    await render(<ChromeDataTable onRowAction={onRowAction} />);

    await userEvent.click(page.getByRole('button', { name: /Actions for user0/ }).first());
    await expect.element(page.getByRole('menu', { name: /Actions for user0/ })).toBeVisible();
    await userEvent.click(page.getByRole('menuitem', { name: 'Delete account' }));
    expect(onRowAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: expect.objectContaining({ id: 'delete', danger: true }),
      }),
    );
  });

  it('opens peek on row click and closes with Escape', async () => {
    await render(<ChromeDataTable />);

    await userEvent.click(page.getByText('user0@demo.zextras.io'));
    await expect
      .element(page.getByRole('complementary', { name: 'Details: user0@demo.zextras.io' }))
      .toBeVisible();

    await userEvent.keyboard('{ArrowDown}');
    await expect
      .element(page.getByRole('complementary', { name: 'Details: user1@demo.zextras.io' }))
      .toBeVisible();

    await userEvent.keyboard('{Escape}');
    await expect
      .element(page.getByRole('complementary', { name: /Details:/ }))
      .not.toBeInTheDocument();
  });
});
