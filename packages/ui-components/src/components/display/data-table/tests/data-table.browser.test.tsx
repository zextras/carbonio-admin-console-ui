/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RowSelectionState } from '@tanstack/react-table';
import i18next from 'i18next';
import { noop } from 'lodash-es';
import { type ReactElement, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { type DataTableBulkActionEvent, DataTableBulkBar } from '../bulk/bulk-bar';
import { DataTableBulkJob } from '../bulk/bulk-job';
import { DataTableRoot } from '../data-table-root';
import { DataTableLiveRegion } from '../live-region';
import { buildFilterChips, removeFilterChip, toColumnFilters } from '../models/filter-model';
import { DataTablePagination } from '../pagination';
import { DataTablePeekPanel } from '../peek-panel';
import { DataTableStaleBanner } from '../stale-banner';
import { DataTableTable } from '../table';
import { DataTableTableFooter } from '../table-footer';
import { DataTableCustomize } from '../toolbar/customize';
import { DataTableFilterChips } from '../toolbar/filter-chips';
import { DataTableFilters } from '../toolbar/filters';
import { DataTableSearch } from '../toolbar/search';
import { DataTableToolbar } from '../toolbar/toolbar';
import type {
  DataTableBulkAction,
  DataTableCellEditCommit,
  DataTableColumnDef,
  DataTableFilterDef,
  DataTableFiltersState,
  DataTableRowAction,
  DataTableStatus,
} from '../types';

// The parts default their labels through react-i18next; without an instance
// the interpolated defaults ("Bulk actions, {{total}} selected") would leak
// through verbatim. Same minimal setup as the app browser-test wrapper.
const testI18n = i18next.createInstance();
await testI18n.init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: { en: { translation: {} } },
});

async function renderTable(ui: ReactElement): Promise<void> {
  await render(<I18nextProvider i18n={testI18n}>{ui}</I18nextProvider>);
}

/**
 * The th → columnheader role mapping is not resolvable by the browser-mode
 * role engine, so the Account header cell is anchored on its visible text.
 */
function accountHeaderAriaSort(): string | null {
  const header = Array.from(document.querySelectorAll('thead th')).find((th) =>
    th.textContent?.includes('Account'),
  );
  return header?.getAttribute('aria-sort') ?? null;
}

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

const ROW_ACTIONS: Array<DataTableRowAction> = [
  { id: 'edit', label: 'Edit account' },
  { id: 'delete', label: 'Delete account', danger: true },
];

const VARIANT_A_ACTIONS: Array<DataTableBulkAction> = [
  { id: 'enable', label: 'Enable', reversible: true },
  { id: 'delete', label: 'Delete', danger: true },
];

const VARIANT_B_ACTIONS: Array<DataTableBulkAction> = [
  { id: 'hold', label: 'Hold', reversible: true },
  { id: 'delete', label: 'Delete', danger: true },
];

type BulkUndoPayload = { undo?: { message: string; onUndo: () => void } } | undefined;

type BulkActionHandler = (event: DataTableBulkActionEvent) => void | Promise<BulkUndoPayload>;

/**
 * Self-contained client table: sorting/pagination/filtering all local,
 * selection enabled, full toolbar + bulk bar + footer/pagination swap
 * (the view owns which footer renders, like the migrated views).
 */
function ClientDataTable({
  status = 'idle',
  onRetry,
  paginationThreshold = 10,
}: {
  status?: DataTableStatus;
  onRetry?: () => void;
  paginationThreshold?: number;
}) {
  const [filters, setFilters] = useState<DataTableFiltersState>({});
  return (
    <DataTableRoot
      data={ALL_ROWS}
      columns={columns}
      getRowId={(row) => row.id}
      manualSorting={false}
      manualPagination={false}
      manualFiltering={false}
      enableRowSelection
      primaryColumnId="account"
      initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
    >
      <DataTableLiveRegion />
      <DataTableToolbar>
        <DataTableSearch
          value=""
          onSearchChange={noop}
          placeholder="Search accounts"
          label="Search accounts"
        />
        <DataTableFilters
          filterDefs={STATUS_FILTER_DEFS}
          filters={filters}
          onFiltersChange={setFilters}
          onApplyResetSelection={noop}
        />
        <DataTableCustomize />
      </DataTableToolbar>
      <DataTableBulkBar totalMatchingCount={ALL_ROWS.length} enableSelectAllMatching />
      <DataTableTable
        aria-label="Manage Accounts"
        status={status}
        onRetry={onRetry}
        emptyTitle="No accounts yet"
        emptyDescription="Create the first one, or adjust your filters to see results."
        errorTitle="Failed to load accounts"
        errorDescription="Please try again."
        retryLabel="Retry"
      />
      {ALL_ROWS.length > paginationThreshold ? (
        <DataTablePagination pageSizeOptions={[10, 25, 50, 100]} />
      ) : (
        <DataTableTableFooter paginationThreshold={paginationThreshold} />
      )}
    </DataTableRoot>
  );
}

/** Client filtering harness: applied filters become column filters on the table. */
function FilteringDataTable() {
  const [filters, setFilters] = useState<DataTableFiltersState>({});
  const filterChips = buildFilterChips(filters, STATUS_FILTER_DEFS);
  return (
    <DataTableRoot
      data={ALL_ROWS}
      columns={columns}
      getRowId={(row) => row.id}
      manualSorting={false}
      manualPagination={false}
      manualFiltering={false}
      searchColumnIds={['account', 'displayName']}
      primaryColumnId="account"
      state={{ columnFilters: toColumnFilters(filters, STATUS_FILTER_DEFS), globalFilter: '' }}
    >
      <DataTableLiveRegion />
      <DataTableToolbar>
        <DataTableSearch
          value=""
          onSearchChange={noop}
          placeholder="Search accounts"
          label="Search accounts"
        />
        <DataTableFilters
          filterDefs={STATUS_FILTER_DEFS}
          filters={filters}
          onFiltersChange={setFilters}
          onApplyResetSelection={noop}
        />
        <DataTableCustomize />
      </DataTableToolbar>
      <DataTableFilterChips
        chips={filterChips}
        onRemoveChip={(chip) => {
          setFilters(removeFilterChip(filters, chip));
        }}
        onClearAll={() => {
          setFilters({});
        }}
      />
      <DataTableTable aria-label="Manage Accounts" />
      <DataTableTableFooter paginationThreshold={100} />
    </DataTableRoot>
  );
}

/** Customize-only toolbar harness for density/column layout scenarios. */
function CustomizeDataTable() {
  return (
    <DataTableRoot
      data={ALL_ROWS}
      columns={columns}
      getRowId={(row) => row.id}
      manualSorting={false}
      manualPagination={false}
      manualFiltering={false}
      primaryColumnId="account"
    >
      <DataTableLiveRegion />
      <DataTableToolbar>
        <DataTableCustomize />
      </DataTableToolbar>
      <DataTableTable aria-label="Manage Accounts" />
      <DataTableTableFooter paginationThreshold={100} />
    </DataTableRoot>
  );
}

/** Row chrome harness: inline edit, copy, row actions and peek. */
function ChromeDataTable({
  onCellEditCommit,
  onRowAction,
  onCopyCell,
}: {
  onCellEditCommit?: (commit: DataTableCellEditCommit<Account>) => void;
  onRowAction?: (payload: { action: DataTableRowAction; row: Account }) => void;
  onCopyCell?: (value: string) => void;
}) {
  return (
    <DataTableRoot
      data={ALL_ROWS.slice(0, 5)}
      columns={columns}
      getRowId={(row) => row.id}
      manualSorting={false}
      manualPagination={false}
      manualFiltering={false}
      primaryColumnId="account"
      rowActions={ROW_ACTIONS}
      onRowAction={onRowAction}
    >
      <DataTableLiveRegion />
      <DataTableTable
        aria-label="Manage Accounts"
        enablePeek
        onCellEditCommit={onCellEditCommit}
        onCopyCell={(value) => {
          onCopyCell?.(value);
        }}
      />
      <DataTableTableFooter paginationThreshold={100} />
      <DataTablePeekPanel<Account> title={(row) => row.account} />
    </DataTableRoot>
  );
}

/** Bulk variant A: the bulk bar replaces the toolbar while rows are selected. */
function BulkVariantATable({ onBulkAction }: { onBulkAction?: BulkActionHandler }) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const hasSelection = Object.values(rowSelection).some(Boolean);
  return (
    <DataTableRoot
      data={ALL_ROWS.slice(0, 5)}
      columns={columns}
      getRowId={(row) => row.id}
      manualSorting={false}
      manualPagination={false}
      manualFiltering={false}
      primaryColumnId="account"
      enableRowSelection
      state={{ rowSelection }}
      onRowSelectionChange={setRowSelection}
    >
      <DataTableLiveRegion />
      {!hasSelection && (
        <DataTableToolbar>
          <DataTableSearch
            value=""
            onSearchChange={noop}
            placeholder="Search accounts"
            label="Search accounts"
          />
        </DataTableToolbar>
      )}
      <DataTableBulkBar actions={VARIANT_A_ACTIONS} onBulkAction={onBulkAction} />
      <DataTableTable aria-label="Manage Accounts" />
      <DataTableTableFooter paginationThreshold={100} />
    </DataTableRoot>
  );
}

/** Bulk variant B: the toolbar stays and the bulk bar renders below it. */
function BulkVariantBTable({ onBulkAction }: { onBulkAction?: BulkActionHandler }) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  return (
    <DataTableRoot
      data={ALL_ROWS.slice(0, 5)}
      columns={columns}
      getRowId={(row) => row.id}
      manualSorting={false}
      manualPagination={false}
      manualFiltering={false}
      primaryColumnId="account"
      enableRowSelection
      state={{ rowSelection }}
      onRowSelectionChange={setRowSelection}
    >
      <DataTableLiveRegion />
      <DataTableToolbar>
        <DataTableSearch
          value=""
          onSearchChange={noop}
          placeholder="Search accounts"
          label="Search accounts"
        />
      </DataTableToolbar>
      <DataTableBulkBar actions={VARIANT_B_ACTIONS} onBulkAction={onBulkAction} />
      <DataTableTable aria-label="Manage Accounts" />
      <DataTableTableFooter paginationThreshold={100} />
    </DataTableRoot>
  );
}

/** Staleness + bulk job chrome harness (view-composed independent parts). */
function StaleJobTable({
  onStaleReload,
  onBulkJobRetryFailed,
}: {
  onStaleReload?: () => void;
  onBulkJobRetryFailed?: () => void;
}) {
  return (
    <DataTableRoot
      data={ALL_ROWS.slice(0, 3)}
      columns={columns}
      getRowId={(row) => row.id}
      manualSorting={false}
      manualPagination={false}
      manualFiltering={false}
      primaryColumnId="account"
    >
      <DataTableLiveRegion />
      <DataTableStaleBanner
        message="Data changed on the server (7 items updated)."
        onReload={() => {
          onStaleReload?.();
        }}
        onDismiss={noop}
      />
      <DataTableBulkJob
        job={{ label: 'Enable — 20 items', done: 20, total: 20, result: { ok: 18, failed: 2 } }}
        onCancel={noop}
        onRetryFailed={() => {
          onBulkJobRetryFailed?.();
        }}
        onDismiss={noop}
      />
      <DataTableTable aria-label="Manage Accounts" />
      <DataTableTableFooter paginationThreshold={100} />
    </DataTableRoot>
  );
}

describe('DataTable (browser)', () => {
  // The copy scenario needs a stubbed clipboard; the original descriptor is
  // captured before each test and restored after so nothing leaks.
  const clipboardWriteText = vi.fn().mockResolvedValue(undefined);
  let originalClipboardDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalClipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: clipboardWriteText },
    });
  });

  afterEach(() => {
    if (originalClipboardDescriptor !== undefined) {
      Object.defineProperty(navigator, 'clipboard', originalClipboardDescriptor);
    } else {
      delete (navigator as { clipboard?: Clipboard }).clipboard;
    }
    document.body.replaceChildren();
  });

  it('renders headers and rows', async () => {
    await renderTable(<ClientDataTable />);

    await expect.element(page.getByRole('table', { name: 'Manage Accounts' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: /Account/ })).toBeVisible();
    await expect.element(page.getByText('user0@demo.zextras.io')).toBeVisible();
  });

  it('cycles column sorting', async () => {
    await renderTable(<ClientDataTable />);

    const sortButton = page.getByRole('button', { name: /Account/ });
    await expect.element(sortButton).toHaveAttribute('data-sorted', 'none');
    await expect.poll(accountHeaderAriaSort).toBe('none');

    await userEvent.click(sortButton);
    await expect.element(sortButton).toHaveAttribute('data-sorted', 'asc');
    await expect.poll(accountHeaderAriaSort).toBe('ascending');

    await userEvent.click(sortButton);
    await expect.element(sortButton).toHaveAttribute('data-sorted', 'desc');
    await expect.poll(accountHeaderAriaSort).toBe('descending');

    await userEvent.click(sortButton);
    await expect.element(sortButton).toHaveAttribute('data-sorted', 'none');
    await expect.poll(accountHeaderAriaSort).toBe('none');
  });

  it('shows selection banner after selecting a row and clears it', async () => {
    await renderTable(<ClientDataTable />);

    await userEvent.click(page.getByRole('checkbox', { name: 'Select row' }).first());

    await expect.element(page.getByRole('toolbar', { name: /1 selected/ })).toBeVisible();

    await userEvent.click(page.getByRole('button', { name: /Clear/ }));
    await expect.element(page.getByRole('toolbar', { name: /selected/ })).not.toBeInTheDocument();
  });

  it('offers select-all-matching when the page is fully selected', async () => {
    await renderTable(<ClientDataTable />);

    await userEvent.click(page.getByRole('checkbox', { name: 'Select all rows on this page' }));

    await expect
      .element(page.getByRole('button', { name: /Select all 25 matching/ }))
      .toBeVisible();

    await userEvent.click(page.getByRole('button', { name: /Select all 25 matching/ }));

    await expect.element(page.getByRole('toolbar', { name: /25 selected/ })).toBeVisible();
  });

  it('hides pagination below the threshold and shows a result count', async () => {
    await renderTable(<ClientDataTable paginationThreshold={100} />);

    await expect.element(page.getByText('25 results')).toBeVisible();
    await expect
      .element(page.getByRole('navigation', { name: 'Table pagination' }))
      .not.toBeInTheDocument();
  });

  it('shows pagination when row count exceeds the threshold', async () => {
    await renderTable(<ClientDataTable paginationThreshold={10} />);

    await expect.element(page.getByRole('navigation', { name: 'Table pagination' })).toBeVisible();
    await expect.element(page.getByLabelText('Rows per page')).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Next page' })).toBeVisible();
  });

  it('renders loading skeleton rows', async () => {
    await renderTable(<ClientDataTable status="loading" />);

    await expect.element(page.getByRole('table', { name: 'Manage Accounts' })).toBeVisible();
    await expect.element(page.getByText('user0@demo.zextras.io')).not.toBeInTheDocument();
  });

  it('renders empty state', async () => {
    await renderTable(<ClientDataTable status="empty" />);

    await expect.element(page.getByText('No accounts yet')).toBeVisible();
    await expect
      .element(page.getByText('Create the first one, or adjust your filters to see results.'))
      .toBeVisible();
  });

  it('renders error state with a working retry action', async () => {
    const onRetry = vi.fn();
    await renderTable(<ClientDataTable status="error" onRetry={onRetry} />);

    await expect.element(page.getByText('Failed to load accounts')).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('opens the filters panel and applies an enum filter with a badge and chip', async () => {
    await renderTable(<FilteringDataTable />);

    await userEvent.click(page.getByRole('button', { name: 'Filters' }));
    await expect.element(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();

    await userEvent.click(page.getByRole('checkbox', { name: 'Active' }));
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));

    await expect.element(page.getByRole('dialog', { name: 'Filters' })).not.toBeInTheDocument();
    // The active-filter count surfaces in the trigger's accessible name.
    await expect.element(page.getByRole('button', { name: 'Filters, 1 active' })).toBeVisible();
    await expect.element(page.getByText('Status: Active')).toBeVisible();
    await expect.element(page.getByText('13 results')).toBeVisible();
    await expect.element(page.getByText('user1@demo.zextras.io')).not.toBeInTheDocument();
  });

  it('clears draft filters without applying them', async () => {
    await renderTable(<FilteringDataTable />);

    await userEvent.click(page.getByRole('button', { name: 'Filters' }));
    await userEvent.click(page.getByRole('checkbox', { name: 'Pending' }));
    await userEvent.click(page.getByRole('button', { name: 'Clear' }));
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));

    await expect.element(page.getByText('Status: Pending')).not.toBeInTheDocument();
    await expect.element(page.getByText('25 results')).toBeVisible();
  });

  it('removes a filter chip and supports Clear all', async () => {
    await renderTable(<FilteringDataTable />);

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
    await renderTable(<CustomizeDataTable />);

    await userEvent.click(page.getByRole('button', { name: 'Customize' }));
    await expect.element(page.getByRole('dialog', { name: 'Customize table' })).toBeVisible();
    await expect
      .element(page.getByRole('radio', { name: 'Comfortable' }))
      .toHaveAttribute('aria-checked', 'true');

    await userEvent.click(page.getByRole('radio', { name: 'Compact' }));
    await expect
      .element(page.getByRole('radio', { name: 'Compact' }))
      .toHaveAttribute('aria-checked', 'true');
    await expect
      .poll(() => document.querySelector('[data-density]')?.getAttribute('data-density'))
      .toBe('compact');
  });

  it('hides a non-locked column and keeps the primary locked', async () => {
    await renderTable(<CustomizeDataTable />);

    await userEvent.click(page.getByRole('button', { name: 'Customize' }));
    await expect.element(page.getByRole('menuitemcheckbox', { name: /Account/ })).toBeDisabled();

    await userEvent.click(page.getByRole('menuitemcheckbox', { name: /Display name/ }));
    await userEvent.click(page.getByRole('button', { name: 'Customize' }));

    await expect
      .element(page.getByRole('button', { name: /Display name/ }))
      .not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: /Account/ })).toBeVisible();
  });

  it('reorders columns with move buttons and Reset restores defaults', async () => {
    await renderTable(<CustomizeDataTable />);

    await userEvent.click(page.getByRole('button', { name: 'Customize' }));
    await userEvent.click(page.getByRole('button', { name: 'Move Display name down' }));

    await expect.element(page.getByRole('button', { name: 'Reset' })).toBeVisible();

    const headerButtons = document.querySelectorAll('thead button');
    const headerLabels = Array.from(headerButtons).map((button) => button.textContent ?? '');
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
    await renderTable(<ChromeDataTable onCellEditCommit={onCellEditCommit} />);

    await userEvent.hover(page.getByText('User 0'));
    // .first() is legacy-suite parity, not duplication handling: this DOM
    // renders exactly one edit trigger per row (no twin sticky/hover layer).
    await userEvent.click(
      page.getByRole('button', { name: /Edit display name for user0/ }).first(),
    );
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
    await userEvent.click(
      page.getByRole('button', { name: /Edit display name for user1/ }).first(),
    );
    await userEvent.keyboard('{Escape}');
    await expect
      .element(page.getByRole('textbox', { name: 'Display name' }))
      .not.toBeInTheDocument();
  });

  it('copies an identity cell value', async () => {
    const onCopyCell = vi.fn();

    await renderTable(<ChromeDataTable onCopyCell={onCopyCell} />);

    await userEvent.hover(page.getByText('user0@demo.zextras.io'));
    await userEvent.click(page.getByRole('button', { name: 'Copy user0@demo.zextras.io' }).first());
    expect(clipboardWriteText).toHaveBeenCalledWith('user0@demo.zextras.io');
    expect(onCopyCell).toHaveBeenCalledWith('user0@demo.zextras.io');
    // The live region clears the announcement after ~1s: assert promptly.
    await expect.element(page.getByText('Copied to clipboard')).toBeVisible();
  });

  it('opens row actions and fires onRowAction', async () => {
    const onRowAction = vi.fn();
    await renderTable(<ChromeDataTable onRowAction={onRowAction} />);

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
    await renderTable(<ChromeDataTable />);

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

  it('shows bulk actions and replaces the toolbar for variant A', async () => {
    const onBulkAction = vi.fn().mockReturnValue({
      undo: { message: '1 item enabled', onUndo: vi.fn() },
    });

    await renderTable(<BulkVariantATable onBulkAction={onBulkAction} />);

    await expect.element(page.getByRole('searchbox', { name: 'Search accounts' })).toBeVisible();
    await userEvent.click(page.getByRole('checkbox', { name: 'Select row' }).first());
    await expect
      .element(page.getByRole('searchbox', { name: 'Search accounts' }))
      .not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Enable' })).toBeVisible();

    await userEvent.click(page.getByRole('button', { name: 'Enable' }));
    expect(onBulkAction).toHaveBeenCalledOnce();
    await expect.element(page.getByText('1 item enabled')).toBeVisible();
  });

  it('keeps the toolbar for bulk variant B and confirms danger actions', async () => {
    const onBulkAction = vi.fn();

    await renderTable(<BulkVariantBTable onBulkAction={onBulkAction} />);

    await userEvent.click(page.getByRole('checkbox', { name: 'Select row' }).first());
    await expect.element(page.getByRole('searchbox', { name: 'Search accounts' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Delete' })).toBeVisible();

    await userEvent.click(page.getByRole('button', { name: 'Delete' }));
    await expect.element(page.getByRole('dialog', { name: 'Are you sure?' })).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'Confirm' }));
    expect(onBulkAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: expect.objectContaining({ id: 'delete' }),
        selectedCount: 1,
      }),
    );
  });

  it('shows the stale banner and bulk job chrome', async () => {
    const onStaleReload = vi.fn();
    const onBulkJobRetryFailed = vi.fn();

    await renderTable(
      <StaleJobTable onStaleReload={onStaleReload} onBulkJobRetryFailed={onBulkJobRetryFailed} />,
    );

    await expect
      .element(page.getByText('Data changed on the server (7 items updated).'))
      .toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'Reload' }));
    expect(onStaleReload).toHaveBeenCalledOnce();

    await expect.element(page.getByText(/18 succeeded/)).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'Retry failed' }));
    expect(onBulkJobRetryFailed).toHaveBeenCalledOnce();
  });
});
