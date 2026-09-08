/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { DataTableFilterDef, DataTableFiltersState } from '../models/types';
import { TableUiProvider } from '../table-ui-store';
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

const filterDefs: Array<DataTableFilterDef> = [
  {
    id: 'status',
    label: 'Status',
    type: 'enum',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Disabled', value: 'disabled' },
    ],
  },
  { id: 'size', label: 'Size', type: 'range' },
];

type FiltersHarnessProps = {
  filters: DataTableFiltersState;
  onFiltersChange?: (next: DataTableFiltersState) => void;
  onApplyResetSelection?: () => void;
};

const FiltersHarness = ({
  filters,
  onFiltersChange,
  onApplyResetSelection,
}: FiltersHarnessProps) => (
  <TableUiProvider>
    <DataTableFilters
      filterDefs={filterDefs}
      filters={filters}
      onFiltersChange={onFiltersChange ?? vi.fn()}
      onApplyResetSelection={onApplyResetSelection ?? vi.fn()}
    />
  </TableUiProvider>
);

function getTrigger(): HTMLElement {
  return screen.getByRole('button', { name: /Filters/ });
}

describe('DataTableFilters', () => {
  it('renders the active filter count badge', () => {
    render(<FiltersHarness filters={{ status: ['active'] }} />);
    expect(screen.getByText('1')).toBeTruthy();
  });

  it('opens and closes the panel via the trigger', () => {
    render(<FiltersHarness filters={{}} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(getTrigger());
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeTruthy();
    expect(getTrigger().getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(getTrigger());
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(getTrigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('links the trigger to the panel with instance-scoped ids', () => {
    render(<FiltersHarness filters={{}} />);
    fireEvent.click(getTrigger());
    const controlsId = getTrigger().getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    expect(screen.getByRole('dialog').getAttribute('id')).toBe(controlsId);
  });

  it('does not emit filter changes while drafting (draft isolation)', () => {
    const onFiltersChange = vi.fn();
    render(<FiltersHarness filters={{}} onFiltersChange={onFiltersChange} />);
    fireEvent.click(getTrigger());
    fireEvent.click(screen.getByRole('checkbox', { name: 'Active' }));
    fireEvent.change(screen.getByLabelText('Size from'), { target: { value: '10' } });
    expect(onFiltersChange).not.toHaveBeenCalled();
  });

  it('sanitizes the draft, emits it, resets selection and closes on Apply', () => {
    const onFiltersChange = vi.fn();
    const onApplyResetSelection = vi.fn();
    render(
      <FiltersHarness
        filters={{}}
        onFiltersChange={onFiltersChange}
        onApplyResetSelection={onApplyResetSelection}
      />,
    );
    fireEvent.click(getTrigger());
    fireEvent.click(screen.getByRole('checkbox', { name: 'Active' }));
    fireEvent.change(screen.getByLabelText('Size from'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onFiltersChange).toHaveBeenCalledTimes(1);
    expect(onFiltersChange).toHaveBeenCalledWith({
      status: ['active'],
      size: { min: 10, max: null },
    });
    expect(onApplyResetSelection).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('drops empty draft values on Apply', () => {
    const onFiltersChange = vi.fn();
    render(<FiltersHarness filters={{}} onFiltersChange={onFiltersChange} />);
    fireEvent.click(getTrigger());
    fireEvent.change(screen.getByLabelText('Size from'), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onFiltersChange).toHaveBeenCalledWith({});
  });

  it('clears the draft without emitting until Apply', () => {
    const onFiltersChange = vi.fn();
    render(<FiltersHarness filters={{ status: ['active'] }} onFiltersChange={onFiltersChange} />);
    fireEvent.click(getTrigger());
    fireEvent.click(screen.getByRole('checkbox', { name: 'Active' }));
    expect(screen.getByRole('checkbox', { name: 'Active' }).getAttribute('aria-checked')).toBe(
      'false',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onFiltersChange).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox', { name: 'Active' }).getAttribute('aria-checked')).toBe(
      'false',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onFiltersChange).toHaveBeenCalledWith({});
  });

  it('discards the draft on close and re-clones the filters on reopen', () => {
    render(<FiltersHarness filters={{ status: ['active'] }} />);
    fireEvent.click(getTrigger());
    expect(screen.getByRole('checkbox', { name: 'Active' }).getAttribute('aria-checked')).toBe(
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close filters' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(getTrigger());
    expect(screen.getByRole('checkbox', { name: 'Active' }).getAttribute('aria-checked')).toBe(
      'true',
    );
  });

  it('closes on outside click without emitting', () => {
    const onFiltersChange = vi.fn();
    render(<FiltersHarness filters={{}} onFiltersChange={onFiltersChange} />);
    fireEvent.click(getTrigger());
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onFiltersChange).not.toHaveBeenCalled();
  });

  it('does not close when clicking inside the panel', () => {
    render(<FiltersHarness filters={{}} />);
    fireEvent.click(getTrigger());
    const panel = screen.getByRole('dialog');
    fireEvent.mouseDown(panel);
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('removes the outside-click listener when closed', async () => {
    render(<FiltersHarness filters={{}} />);
    fireEvent.click(getTrigger());
    fireEvent.click(getTrigger());
    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});
