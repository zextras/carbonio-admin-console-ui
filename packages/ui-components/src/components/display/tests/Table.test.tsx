/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Table, type THeader, type TRow } from '../Table';

const rows: Array<TRow> = [
  { id: 'r1', columns: ['Alice', 'alice@example.com'] },
  { id: 'r2', columns: ['Bob', 'bob@example.com'] },
];

const headers: Array<THeader> = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email', bold: true },
];

function getRow(text: string): HTMLElement {
  return screen.getByText(text).closest('tr') as HTMLElement;
}

describe('Table', () => {
  it('renders headers and string or element columns', () => {
    render(
      <Table
        headers={headers}
        rows={[...rows, { id: 'r3', columns: ['Carol', <strong key="c">custom cell</strong>] }]}
        showCheckbox={false}
      />,
    );

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Email' })).toBeTruthy();
    expect(screen.getByText('alice@example.com')).toBeTruthy();
    expect(screen.getByText('custom cell')).toBeTruthy();
  });

  it('shows the row index when checkboxes are hidden', () => {
    render(<Table rows={[{ id: 'r1', columns: ['Alice'], index: 42 }]} showCheckbox={false} />);

    expect(within(getRow('Alice')).getByText('42')).toBeTruthy();
  });

  it('renders the header select label for headers with items', () => {
    render(
      <Table
        rows={rows}
        headers={[
          {
            id: 'status',
            label: 'Status',
            bold: true,
            items: [{ label: 'Active', value: 'active' }],
            onChange: vi.fn(),
          },
        ]}
      />,
    );

    expect(screen.getByRole('button', { name: /Status/ })).toBeTruthy();
  });

  describe('uncontrolled mode', () => {
    it('toggles a row selection by clicking it when checkboxes are hidden', () => {
      const onSelectionChange = vi.fn();
      render(<Table rows={rows} showCheckbox={false} onSelectionChange={onSelectionChange} />);

      fireEvent.click(getRow('Alice'));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['r1']);

      fireEvent.click(getRow('Bob'));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['r1', 'r2']);

      fireEvent.click(getRow('Alice'));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['r2']);
    });

    it('keeps a single selection when multiSelect is false', () => {
      const onSelectionChange = vi.fn();
      render(
        <Table
          rows={rows}
          showCheckbox={false}
          multiSelect={false}
          onSelectionChange={onSelectionChange}
        />,
      );

      fireEvent.click(getRow('Alice'));
      fireEvent.click(getRow('Bob'));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['r2']);

      fireEvent.click(getRow('Bob'));
      expect(onSelectionChange).toHaveBeenLastCalledWith([]);
    });

    it('calls the row onClick when clicking outside the checkbox of a selectable row', () => {
      const onRowClick = vi.fn();
      const onSelectionChange = vi.fn();
      render(
        <Table
          rows={[{ id: 'r1', columns: ['Alice'], onClick: onRowClick }]}
          onSelectionChange={onSelectionChange}
        />,
      );

      fireEvent.click(screen.getByText('Alice'));

      expect(onRowClick).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('selects a row through its checkbox when checkboxes are shown', () => {
      const onSelectionChange = vi.fn();
      render(<Table rows={rows} onSelectionChange={onSelectionChange} />);

      const [, firstRowCheckbox] = screen.getAllByTestId('checkbox');
      fireEvent.click(firstRowCheckbox);

      expect(onSelectionChange).toHaveBeenLastCalledWith(['r1']);
    });

    it('selects a clickable row on click even when checkboxes are shown', () => {
      const onSelectionChange = vi.fn();
      render(
        <Table
          rows={[{ id: 'r1', columns: ['Alice'], clickable: true }]}
          onSelectionChange={onSelectionChange}
        />,
      );

      fireEvent.click(getRow('Alice'));

      expect(onSelectionChange).toHaveBeenLastCalledWith(['r1']);
    });

    it('selects and deselects every row from the header checkbox', () => {
      const onSelectionChange = vi.fn();
      render(<Table rows={rows} headers={headers} onSelectionChange={onSelectionChange} />);

      const [headerCheckbox] = screen.getAllByTestId('checkbox');
      fireEvent.click(headerCheckbox);
      expect(onSelectionChange).toHaveBeenLastCalledWith(['r1', 'r2']);

      fireEvent.click(screen.getAllByTestId('checkbox')[0]);
      expect(onSelectionChange).toHaveBeenLastCalledWith([]);
    });
  });

  describe('controlled mode', () => {
    it('reports the toggled selection without changing it', () => {
      const onSelectionChange = vi.fn();
      render(
        <Table
          rows={rows}
          showCheckbox={false}
          selectedRows={['r1']}
          onSelectionChange={onSelectionChange}
        />,
      );

      fireEvent.click(getRow('Bob'));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['r1', 'r2']);

      fireEvent.click(getRow('Alice'));
      expect(onSelectionChange).toHaveBeenLastCalledWith([]);
    });

    it('reports single selection toggles when multiSelect is false', () => {
      const onSelectionChange = vi.fn();
      render(
        <Table
          rows={rows}
          showCheckbox={false}
          multiSelect={false}
          selectedRows={['r1']}
          onSelectionChange={onSelectionChange}
        />,
      );

      fireEvent.click(getRow('Bob'));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['r2']);

      fireEvent.click(getRow('Alice'));
      expect(onSelectionChange).toHaveBeenLastCalledWith([]);
    });

    it('reports select all and deselect all from the header checkbox', () => {
      const onSelectionChange = vi.fn();
      const { rerender } = render(
        <Table rows={rows} selectedRows={[]} onSelectionChange={onSelectionChange} />,
      );

      fireEvent.click(screen.getAllByTestId('checkbox')[0]);
      expect(onSelectionChange).toHaveBeenLastCalledWith(['r1', 'r2']);

      rerender(
        <Table rows={rows} selectedRows={['r1', 'r2']} onSelectionChange={onSelectionChange} />,
      );
      fireEvent.click(screen.getAllByTestId('checkbox')[0]);
      expect(onSelectionChange).toHaveBeenLastCalledWith([]);
    });

    it('does nothing on toggle when no onSelectionChange is provided', () => {
      render(<Table rows={rows} showCheckbox={false} selectedRows={['r1']} />);

      expect(() => fireEvent.click(getRow('Bob'))).not.toThrow();
    });
  });
});
