/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import HoverableRowFactory from '../hoverable-row-factory';

type SelectableRowProps = {
  onChange?: (id: string) => void;
};

const SelectableRow = ({ onChange }: SelectableRowProps) => {
  const [selected, setSelected] = useState(false);
  return (
    <>
      <button type="button">Before</button>
      <table>
        <tbody>
          <HoverableRowFactory
            index={1}
            row={{ id: 'volume-1', columns: ['message1', 'Primary'] }}
            selected={selected}
            selectionMode={false}
            multiSelect
            showCheckbox
            onChange={(id) => {
              setSelected((prev) => !prev);
              onChange?.(id);
            }}
          />
        </tbody>
      </table>
    </>
  );
};

describe('HoverableRowFactory', () => {
  it('should reach the row checkbox with Tab even before any hover', async () => {
    await render(<SelectableRow />);

    await page.getByRole('button', { name: 'Before' }).element().focus();
    await userEvent.tab();

    const checkbox = page.getByRole('checkbox', { name: 'Select row 1' });
    await expect.element(checkbox).toHaveFocus();
    await expect.element(checkbox).toBeVisible();
  });

  it('should select the row with Space from the keyboard', async () => {
    const onChange = vi.fn();
    await render(<SelectableRow onChange={onChange} />);

    await page.getByRole('button', { name: 'Before' }).element().focus();
    await userEvent.tab();
    await userEvent.keyboard(' ');

    expect(onChange).toHaveBeenCalledExactlyOnceWith('volume-1');
    await expect.element(page.getByRole('checkbox', { name: 'Select row 1' })).toBeChecked();
  });

  it('should show the row index while the checkbox is neither hovered nor focused', async () => {
    await render(<SelectableRow />);

    await expect.element(page.getByText('1', { exact: true })).toBeVisible();
    const checkbox = page.getByRole('checkbox', { name: 'Select row 1' }).element();
    const wrapper = checkbox.closest('td')?.firstElementChild as HTMLElement;
    expect(wrapper.contains(checkbox)).toBe(true);
    expect(wrapper.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  });
});
