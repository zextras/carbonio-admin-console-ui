/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { DataTableFilterChip } from '../models/types';
import { DataTableFilterChips } from './filter-chips';

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

describe('DataTableFilterChips', () => {
  it('renders nothing without chips', () => {
    render(<DataTableFilterChips chips={[]} onRemoveChip={vi.fn()} onClearAll={vi.fn()} />);
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('renders locale-aware labels for numeric bounds (max-only, bounded, min-only)', () => {
    const chips: Array<DataTableFilterChip> = [
      { key: 'size:max', filterId: 'size', label: 'Size: ≤ 50', bounds: { max: 50 } },
      { key: 'size:range', filterId: 'size', label: 'Size: 10–50', bounds: { min: 10, max: 50 } },
      { key: 'size:min', filterId: 'size', label: 'Size: ≥ 10', bounds: { min: 10 } },
    ];
    render(<DataTableFilterChips chips={chips} onRemoveChip={vi.fn()} onClearAll={vi.fn()} />);
    expect(screen.getByText('Size: ≤ 50')).toBeTruthy();
    expect(screen.getByText('Size: 10–50')).toBeTruthy();
    expect(screen.getByText('Size: ≥ 10')).toBeTruthy();
  });

  it('formats numeric bounds with the runtime locale', () => {
    const chips: Array<DataTableFilterChip> = [
      { key: 'size:max', filterId: 'size', label: 'Size: ≤ 1234', bounds: { max: 1234 } },
    ];
    render(<DataTableFilterChips chips={chips} onRemoveChip={vi.fn()} onClearAll={vi.fn()} />);
    expect(screen.getByText(`Size: ≤ ${(1234).toLocaleString()}`)).toBeTruthy();
  });

  it('falls back to the model label when there are no bounds', () => {
    const chips: Array<DataTableFilterChip> = [
      { key: 'status:active', filterId: 'status', label: 'Status: Active' },
    ];
    render(<DataTableFilterChips chips={chips} onRemoveChip={vi.fn()} onClearAll={vi.fn()} />);
    expect(screen.getByText('Status: Active')).toBeTruthy();
  });

  it('keeps the model formatting for date bounds', () => {
    const chips: Array<DataTableFilterChip> = [
      {
        key: 'created',
        filterId: 'created',
        label: 'Created: 2024-01-01–2024-01-31',
        bounds: { min: '2024-01-01', max: '2024-01-31' },
      },
    ];
    render(<DataTableFilterChips chips={chips} onRemoveChip={vi.fn()} onClearAll={vi.fn()} />);
    expect(screen.getByText('Created: 2024-01-01–2024-01-31')).toBeTruthy();
  });

  it('falls back to the model label when bounds are present but empty', () => {
    const chips: Array<DataTableFilterChip> = [
      { key: 'size', filterId: 'size', label: 'Size: any', bounds: {} },
    ];
    render(<DataTableFilterChips chips={chips} onRemoveChip={vi.fn()} onClearAll={vi.fn()} />);
    expect(screen.getByText('Size: any')).toBeTruthy();
  });

  it('calls onRemoveChip with the chip and exposes an i18n remove aria-label', () => {
    const onRemoveChip = vi.fn();
    const chip: DataTableFilterChip = {
      key: 'size:max',
      filterId: 'size',
      label: 'Size: ≤ 50',
      bounds: { max: 50 },
    };
    render(
      <DataTableFilterChips chips={[chip]} onRemoveChip={onRemoveChip} onClearAll={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remove filter: Size: ≤ 50' }));
    expect(onRemoveChip).toHaveBeenCalledTimes(1);
    expect(onRemoveChip).toHaveBeenCalledWith(chip);
  });

  it('calls onClearAll with an i18n default label', () => {
    const onClearAll = vi.fn();
    const chips: Array<DataTableFilterChip> = [
      { key: 'status:active', filterId: 'status', label: 'Status: Active' },
    ];
    render(<DataTableFilterChips chips={chips} onRemoveChip={vi.fn()} onClearAll={onClearAll} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it('supports a custom clear-all label', () => {
    const chips: Array<DataTableFilterChip> = [
      { key: 'status:active', filterId: 'status', label: 'Status: Active' },
    ];
    render(
      <DataTableFilterChips
        chips={chips}
        onRemoveChip={vi.fn()}
        onClearAll={vi.fn()}
        clearAllLabel="Delete filters"
      />,
    );
    expect(screen.getByRole('button', { name: 'Delete filters' })).toBeTruthy();
  });
});
