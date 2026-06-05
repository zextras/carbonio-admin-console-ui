/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act, fireEvent, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

vi.mock('@zextras/ui-components', () => ({
  Checkbox: ({ value, onClick, 'aria-label': ariaLabel }: any) => (
    <input
      type="checkbox"
      checked={value}
      onClick={onClick}
      aria-label={ariaLabel}
      data-testid="checkbox"
    />
  ),
}));

import CosRowFactory, { type CosRowFactoryProps } from '../cos-row-factory';

function renderRow(overrides: Partial<CosRowFactoryProps> = {}): ReturnType<typeof render> {
  const defaultProps: CosRowFactoryProps = {
    index: 0,
    row: { id: 'row-1', columns: ['Column A', 'Column B'] },
    onChange: vi.fn(),
    selected: false,
    selectionMode: false,
    multiSelect: false,
    showCheckbox: false,
    ...overrides,
  };
  return render(<CosRowFactory {...defaultProps} />);
}

describe('CosRowFactory', () => {
  describe('Rendering', () => {
    it('should render a table row', () => {
      const { container } = renderRow();
      expect(container.querySelector('tr')).not.toBeNull();
    });

    it('should render index when checkbox is not shown', () => {
      const { container } = renderRow({ index: 5, showCheckbox: false });
      expect(container.textContent).toContain('5');
    });

    it('should render custom renderIndex when provided', () => {
      const { container } = renderRow({
        index: 3,
        showCheckbox: false,
        renderIndex: (i) => `#${i}`,
      });
      expect(container.textContent).toContain('#3');
    });

    it('should render column text', () => {
      const { container } = renderRow();
      expect(container.textContent).toContain('Column A');
      expect(container.textContent).toContain('Column B');
    });
  });

  describe('Selection', () => {
    it('should render checkbox when showCheckbox and selected', () => {
      const { container } = renderRow({ showCheckbox: true, selected: true });
      const checkbox = container.querySelector('[data-testid="checkbox"]');
      expect(checkbox).not.toBeNull();
    });

    it('should render checkbox when showCheckbox and selectionMode', () => {
      const { container } = renderRow({ showCheckbox: true, selectionMode: true });
      const checkbox = container.querySelector('[data-testid="checkbox"]');
      expect(checkbox).not.toBeNull();
    });

    it('should call onChange with row id when checkbox is clicked on non-clickable row', async () => {
      const onChange = vi.fn();
      const { container } = renderRow({
        showCheckbox: true,
        selected: true,
        onChange,
        row: { id: 'test-id', columns: ['A'], clickable: false },
      });
      const checkbox = container.querySelector('[data-testid="checkbox"]')!;
      await userEvent.click(checkbox);
      expect(onChange).toHaveBeenCalledWith('test-id');
    });
  });

  describe('Row click', () => {
    it('should call onChange when clickable row is clicked', async () => {
      const onChange = vi.fn();
      const { container } = renderRow({
        showCheckbox: false,
        onChange,
        row: { id: 'row-1', columns: ['A'], clickable: true },
      });
      const tr = container.querySelector('tr')!;
      await userEvent.click(tr);
      expect(onChange).toHaveBeenCalledWith('row-1');
    });

    it('should call row.onClick when row is clicked outside checkbox', async () => {
      const rowOnClick = vi.fn();
      const { container } = renderRow({
        showCheckbox: false,
        row: { id: 'row-1', columns: ['A'], onClick: rowOnClick, clickable: true },
      });
      const tr = container.querySelector('tr')!;
      await userEvent.click(tr);
      expect(rowOnClick).toHaveBeenCalled();
    });

    it('should call onChange when clickable row with checkbox is clicked on non-checkbox area', async () => {
      const onChange = vi.fn();
      const { container } = renderRow({
        showCheckbox: true,
        selected: true,
        onChange,
        row: { id: 'row-1', columns: ['A'], clickable: true },
      });
      const td = container.querySelectorAll('td')[1];
      await userEvent.click(td);
      expect(onChange).toHaveBeenCalledWith('row-1');
    });
  });

  describe('Styling', () => {
    it('should add selected class when selected', () => {
      const { container } = renderRow({ selected: true, showCheckbox: true });
      const tr = container.querySelector('tr');
      expect(tr?.className).toMatch(/selected/);
    });

    it('should add selected class when highlighted', () => {
      const { container } = renderRow({
        row: { id: 'row-1', columns: ['A'], highlight: true },
      });
      const tr = container.querySelector('tr');
      expect(tr?.className).toMatch(/selected/);
    });

    it('should add custom rowClassName', () => {
      const { container } = renderRow({ rowClassName: 'my-custom-class' });
      const tr = container.querySelector('tr');
      expect(tr?.className).toContain('my-custom-class');
    });
  });

  describe('Hover behavior', () => {
    it('should show checkbox on mouseEnter when showCheckboxOnHover', () => {
      const { container } = renderRow({
        showCheckbox: true,
        showCheckboxOnHover: true,
        selected: false,
        selectionMode: false,
        multiSelect: false,
      });
      const tr = container.querySelector('tr')!;
      fireEvent.mouseEnter(tr);
      const checkbox = container.querySelector('[data-testid="checkbox"]');
      expect(checkbox).not.toBeNull();
    });

    it('should use setTimeout when hoverDelay > 0', () => {
      vi.useFakeTimers();
      const { container } = renderRow({
        showCheckbox: true,
        showCheckboxOnHover: true,
        hoverDelay: 200,
        selected: false,
        selectionMode: false,
        multiSelect: false,
      });
      const tr = container.querySelector('tr')!;
      fireEvent.mouseEnter(tr);

      let checkbox = container.querySelector('[data-testid="checkbox"]');
      expect(checkbox).toBeNull();

      act(() => {
        vi.advanceTimersByTime(200);
      });
      checkbox = container.querySelector('[data-testid="checkbox"]');
      expect(checkbox).not.toBeNull();
      vi.useRealTimers();
    });

    it('should clear hover timer on mouseLeave', () => {
      vi.useFakeTimers();
      const { container } = renderRow({
        showCheckbox: true,
        showCheckboxOnHover: true,
        hoverDelay: 200,
        selected: false,
        selectionMode: false,
        multiSelect: false,
      });
      const tr = container.querySelector('tr')!;
      fireEvent.mouseEnter(tr);
      fireEvent.mouseLeave(tr);

      vi.advanceTimersByTime(200);
      const checkbox = container.querySelector('[data-testid="checkbox"]');
      expect(checkbox).toBeNull();
      vi.useRealTimers();
    });
  });

  describe('cellClassName', () => {
    it('should apply string cellClassName to all cells', () => {
      const { container } = renderRow({
        cellClassName: 'custom-cell',
        row: { id: 'row-1', columns: ['A', 'B'] },
      });
      const tds = container.querySelectorAll('td');
      expect(tds[1].className).toContain('custom-cell');
      expect(tds[2].className).toContain('custom-cell');
    });

    it('should apply function cellClassName with column index', () => {
      const { container } = renderRow({
        cellClassName: (i: number) => `col-${i}`,
        row: { id: 'row-1', columns: ['A', 'B'] },
      });
      const tds = container.querySelectorAll('td');
      expect(tds[1].className).toBe('col-0');
      expect(tds[2].className).toBe('col-1');
    });
  });
});
