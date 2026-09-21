/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useDataTable } from '../create-data-table';
import type { DataTableFilterDef } from '../models/types';
import { type DataTableTableConfig, TableConfigProvider } from '../table-config-context';
import { TableUiProvider, useTableUi } from '../table-ui-store';
import type { DataTableColumnDef } from '../types';
import { DataTableCustomize } from './customize';
import { DataTableFilters } from './filters';

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

type TestRow = { id: string; name: string; email: string; role: string };

const rows: Array<TestRow> = [
  { id: 'row-1', name: 'Row One', email: 'one@example.com', role: 'admin' },
  { id: 'row-2', name: 'Row Two', email: 'two@example.com', role: 'user' },
];

const columns: Array<DataTableColumnDef<TestRow>> = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
];

type TestTable = ReturnType<typeof useDataTable<TestRow>>;

const config: DataTableTableConfig<TestRow> = {
  primaryColumnId: 'name',
  enableRowSelection: false,
  columns,
  getRowLabel: (row) => row.name,
};

const filterDefs: Array<DataTableFilterDef> = [];

const DensityProbe = () => {
  const density = useTableUi((s) => s.density);
  return <span>Density: {density}</span>;
};

type HarnessProps = {
  onTableReady: (table: TestTable) => void;
  withFilters?: boolean;
  onDensityChange?: (density: 'comfortable' | 'compact') => void;
};

const CustomizeHarness = ({ onTableReady, withFilters = false, onDensityChange }: HarnessProps) => {
  const table = useDataTable<TestRow>({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    initialState: { columnOrder: ['name', 'email', 'role'] },
  });

  return (
    <TableUiProvider>
      <table.AppTable>
        <TableConfigProvider value={config}>
          {/* The table instance is created once (useState initializer inside
              useAppTable), so a mount-time ref callback captures it safely. */}
          <span
            aria-hidden="true"
            ref={(node) => {
              if (node) {
                onTableReady(table);
              }
            }}
          />
          <DensityProbe />
          {withFilters && (
            <DataTableFilters
              filterDefs={filterDefs}
              filters={{}}
              onFiltersChange={vi.fn()}
              onApplyResetSelection={vi.fn()}
            />
          )}
          <DataTableCustomize onDensityChange={onDensityChange} />
        </TableConfigProvider>
      </table.AppTable>
    </TableUiProvider>
  );
};

function renderHarness(
  options: {
    withFilters?: boolean;
    onDensityChange?: (density: 'comfortable' | 'compact') => void;
  } = {},
): { getTable: () => TestTable } {
  const holder: { table?: TestTable } = {};
  render(
    <CustomizeHarness
      onTableReady={(instance) => {
        holder.table = instance;
      }}
      withFilters={options.withFilters}
      onDensityChange={options.onDensityChange}
    />,
  );
  return { getTable: () => holder.table as TestTable };
}

function getCustomizeTrigger(): HTMLElement {
  return screen.getByRole('button', { name: 'Customize' });
}

function openPanel(): void {
  fireEvent.click(getCustomizeTrigger());
}

describe('DataTableCustomize', () => {
  it('opens and closes the panel via the trigger with linked instance-scoped ids', () => {
    renderHarness();
    expect(screen.queryByRole('dialog')).toBeNull();
    openPanel();
    const panel = screen.getByRole('dialog', { name: 'Customize table' });
    expect(getCustomizeTrigger().getAttribute('aria-expanded')).toBe('true');
    const controlsId = getCustomizeTrigger().getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    expect(panel.getAttribute('id')).toBe(controlsId);
    openPanel();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('writes density changes to the UI store and notifies onDensityChange', () => {
    const onDensityChange = vi.fn();
    renderHarness({ onDensityChange });
    expect(screen.getByText('Density: comfortable')).toBeTruthy();
    openPanel();
    fireEvent.click(screen.getByRole('radio', { name: 'Compact' }));
    expect(screen.getByText('Density: compact')).toBeTruthy();
    expect(onDensityChange).toHaveBeenCalledWith('compact');
  });

  it('writes visibility toggles through the table instance', () => {
    const { getTable } = renderHarness();
    openPanel();
    expect(getTable().state.columnVisibility).toEqual({});
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Email' }));

    expect(getTable().state.columnVisibility).toEqual({ email: false });
  });

  it('locks the primary column visibility toggle', () => {
    renderHarness();
    openPanel();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Name' })).toHaveProperty('disabled', true);
  });

  it('writes column order through the table instance (move up)', () => {
    const { getTable } = renderHarness();
    openPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Move Role up' }));

    expect(getTable().state.columnOrder).toEqual(['name', 'role', 'email']);
  });

  it('keeps the primary column pinned first when reordering', () => {
    const { getTable } = renderHarness();
    openPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Move Email up' }));

    expect(getTable().state.columnOrder).toEqual(['name', 'email', 'role']);
  });

  it('resets visibility and order via the Reset button', () => {
    const { getTable } = renderHarness();
    openPanel();
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Email' }));

    expect(getTable().state.columnVisibility).toEqual({ email: false });
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(getTable().state.columnVisibility).toEqual({ name: true, email: true, role: true });
    expect(getTable().state.columnOrder).toEqual(['name', 'email', 'role']);
  });

  it('closes on outside click', () => {
    renderHarness();
    openPanel();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('does not close when clicking inside the panel', () => {
    renderHarness();
    openPanel();
    fireEvent.mouseDown(screen.getByRole('dialog'));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('mutually excludes the filters panel via the shared openPanel slice', () => {
    renderHarness({ withFilters: true });
    openPanel();
    expect(screen.getByRole('dialog', { name: 'Customize table' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Filters/ }));
    expect(screen.queryByRole('dialog', { name: 'Customize table' })).toBeNull();
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeTruthy();
    fireEvent.click(getCustomizeTrigger());
    expect(screen.queryByRole('dialog', { name: 'Filters' })).toBeNull();
    expect(screen.getByRole('dialog', { name: 'Customize table' })).toBeTruthy();
  });
});
