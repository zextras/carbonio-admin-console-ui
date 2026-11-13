/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CustomHeaderFactory } from '../custom-table-header-factory';

type HeaderFactoryProps = {
  headers: Array<Record<string, unknown>>;
  onChange?: () => void;
  allSelected?: boolean;
  selectionMode?: boolean;
  multiSelect?: boolean;
  showCheckbox?: boolean;
};

function renderHeader(props: HeaderFactoryProps): ReturnType<typeof render> {
  return render(
    <table>
      <thead>
        <CustomHeaderFactory
          onChange={vi.fn()}
          allSelected={false}
          selectionMode={false}
          multiSelect
          showCheckbox
          {...props}
        />
      </thead>
    </table>,
  );
}

function getSortIcon(label: string): string | undefined {
  const header = screen.getByRole('columnheader', { name: label });
  // ds-icon has no accessible role and exposes `icon` only as a property
  // eslint-disable-next-line testing-library/no-node-access
  const icon = header.querySelector<HTMLElement & { icon?: string }>('ds-icon');
  return icon?.icon;
}

describe('CustomHeaderFactory', () => {
  it('cycles the sort order of a sortable column and notifies onSortChange', () => {
    const onSortChange = vi.fn();
    const otherSortChange = vi.fn();
    renderHeader({
      headers: [
        { id: 'name', label: 'Name', sortable: true, onSortChange },
        { id: 'email', label: 'Email', sortable: true, onSortChange: otherSortChange },
      ],
    });

    expect(getSortIcon('Name')).toBe('ChevronSortEmptyOutline');

    fireEvent.click(screen.getByRole('columnheader', { name: 'Name' }));
    expect(onSortChange).toHaveBeenLastCalledWith('name', 'asc');
    expect(getSortIcon('Name')).toBe('ChevronSortUpOutline');

    fireEvent.click(screen.getByRole('columnheader', { name: 'Name' }));
    expect(onSortChange).toHaveBeenLastCalledWith('name', 'desc');
    expect(getSortIcon('Name')).toBe('ChevronSortDownOutline');

    fireEvent.click(screen.getByRole('columnheader', { name: 'Email' }));
    expect(otherSortChange).toHaveBeenLastCalledWith('email', 'asc');
    expect(getSortIcon('Name')).toBe('ChevronSortEmptyOutline');
    expect(onSortChange).toHaveBeenCalledTimes(2);
  });

  it('does not sort columns that are not sortable', () => {
    const onSortChange = vi.fn();
    renderHeader({ headers: [{ id: 'name', label: 'Name', onSortChange }] });

    fireEvent.click(screen.getByRole('columnheader', { name: 'Name' }));

    expect(onSortChange).not.toHaveBeenCalled();
    expect(getSortIcon('Name')).toBeUndefined();
  });

  it('renders a select label for columns with items', () => {
    renderHeader({
      headers: [
        {
          id: 'status',
          label: 'Status',
          bold: true,
          items: [{ label: 'Active', value: 'active' }],
          onChange: vi.fn(),
        },
      ],
    });

    expect(screen.getByRole('button', { name: /Status/ })).toBeTruthy();
  });

  it('shows the select-all checkbox while the row is hovered', () => {
    const onChange = vi.fn();
    renderHeader({ headers: [{ id: 'name', label: 'Name' }], onChange });

    expect(screen.queryByTestId('checkbox')).toBeNull();

    act(() => {
      screen.getByRole('row').dispatchEvent(new MouseEvent('mouseenter'));
    });
    fireEvent.click(screen.getByTestId('checkbox'));
    expect(onChange).toHaveBeenCalledTimes(1);

    act(() => {
      screen.getByRole('row').dispatchEvent(new MouseEvent('mouseleave'));
    });
    expect(screen.queryByTestId('checkbox')).toBeNull();
  });

  it('always shows the checkbox in selection mode', () => {
    renderHeader({ headers: [{ id: 'name', label: 'Name' }], selectionMode: true });

    expect(screen.getByTestId('checkbox')).toBeTruthy();
  });
});
