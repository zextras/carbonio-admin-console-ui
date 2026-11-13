/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import HoverableRowFactory, { type HoverableRowProps } from '../hoverable-row-factory';

function renderRow(overrides: Partial<HoverableRowProps> = {}): ReturnType<typeof render> {
  const props: HoverableRowProps = {
    index: 3,
    row: { id: 'row-1', columns: ['Alice', 'alice@example.com'] },
    onChange: vi.fn(),
    selected: false,
    selectionMode: false,
    multiSelect: true,
    showCheckbox: true,
    ...overrides,
  };
  return render(
    <table>
      <tbody>
        <HoverableRowFactory {...props} />
      </tbody>
    </table>,
  );
}

function getRow(): HTMLElement {
  return screen.getByRole('row');
}

describe('HoverableRowFactory', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the index until the row is hovered, then the checkbox', () => {
    renderRow();

    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.queryByTestId('checkbox')).toBeNull();

    fireEvent.mouseEnter(getRow());
    expect(screen.getByTestId('checkbox')).toBeTruthy();

    fireEvent.mouseLeave(getRow());
    expect(screen.queryByTestId('checkbox')).toBeNull();
  });

  it('shows the checkbox when the row receives focus', () => {
    renderRow();

    fireEvent.focus(getRow());
    expect(screen.getByTestId('checkbox')).toBeTruthy();

    fireEvent.blur(getRow());
    expect(screen.queryByTestId('checkbox')).toBeNull();
  });

  it('waits for the hover delay before showing the checkbox', () => {
    vi.useFakeTimers();
    renderRow({ hoverDelay: 200 });

    fireEvent.mouseEnter(getRow());
    expect(screen.queryByTestId('checkbox')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByTestId('checkbox')).toBeTruthy();
  });

  it('cancels the pending hover when the pointer leaves before the delay', () => {
    vi.useFakeTimers();
    renderRow({ hoverDelay: 200 });

    fireEvent.mouseEnter(getRow());
    fireEvent.mouseLeave(getRow());
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByTestId('checkbox')).toBeNull();
  });

  it('calls the row onClick when clicking outside the checkbox', () => {
    const onRowClick = vi.fn();
    const onChange = vi.fn();
    renderRow({
      showCheckboxOnHover: false,
      onChange,
      row: { id: 'row-1', columns: ['Alice'], onClick: onRowClick },
    });

    fireEvent.click(screen.getByText('Alice'));

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('selects through the checkbox when the row is not clickable', () => {
    const onChange = vi.fn();
    renderRow({ showCheckboxOnHover: false, onChange });

    fireEvent.click(screen.getByTestId('checkbox'));

    expect(onChange).toHaveBeenCalledWith('row-1');
  });

  it('selects on row click when the row is clickable', () => {
    const onChange = vi.fn();
    renderRow({ showCheckbox: false, onChange });

    fireEvent.click(screen.getByText('Alice'));

    expect(onChange).toHaveBeenCalledWith('row-1');
  });

  it('uses renderIndex and custom cell class names', () => {
    renderRow({
      showCheckbox: false,
      renderIndex: (index) => <span>#{index}</span>,
      cellClassName: (colIndex) => `col-${colIndex}`,
    });

    expect(screen.getByText('#3')).toBeTruthy();
    // cells: index cell, column 0, column 1
    expect(screen.getAllByRole('cell')[2].className).toBe('col-1');
  });
});
