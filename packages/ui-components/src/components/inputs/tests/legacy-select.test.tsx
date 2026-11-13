/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LegacySelect } from '../LegacySelect';

const items = [
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Blue', value: 'blue', disabled: true },
];

async function openSelect(label: string): Promise<void> {
  await userEvent.click(screen.getByRole('button', { name: new RegExp(label) }));
}

async function clickItem(label: string): Promise<void> {
  // the trigger may show the same text as the selected label: the dropdown entry comes last
  const matches = await screen.findAllByText(label, { selector: 'ds-text, span, div' });
  await userEvent.click(matches[matches.length - 1]);
}

describe('LegacySelect', () => {
  describe('single selection', () => {
    it('selects an item and shows it in the label when uncontrolled', async () => {
      const onChange = vi.fn();
      render(<LegacySelect label="Color" items={items} onChange={onChange} disablePortal />);

      await openSelect('Color');
      await clickItem('Green');

      expect(onChange).toHaveBeenCalledWith('green');
      expect(screen.getByRole('button', { name: /Green/ })).toBeTruthy();
    });

    it('does not call onChange when the selected item is clicked again', async () => {
      const onChange = vi.fn();
      render(
        <LegacySelect
          label="Color"
          items={items}
          onChange={onChange}
          defaultSelection={items[0]}
          disablePortal
        />,
      );

      await openSelect('Color');
      await clickItem('Red');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('only notifies onChange when controlled', async () => {
      const onChange = vi.fn();
      render(
        <LegacySelect
          label="Color"
          items={items}
          onChange={onChange}
          selection={items[0]}
          disablePortal
        />,
      );

      await openSelect('Color');
      await clickItem('Green');

      expect(onChange).toHaveBeenCalledWith('green');
      expect(screen.getByRole('button', { name: /Red/ })).toBeTruthy();
    });
  });

  describe('multiple selection', () => {
    it('selects and deselects items when uncontrolled', async () => {
      const onChange = vi.fn();
      render(
        <LegacySelect label="Colors" items={items} onChange={onChange} multiple disablePortal />,
      );

      await openSelect('Colors');
      await clickItem('Red');
      expect(onChange).toHaveBeenLastCalledWith([items[0]]);

      await clickItem('Green');
      expect(onChange).toHaveBeenLastCalledWith([items[0], items[1]]);

      await clickItem('Red');
      expect(onChange).toHaveBeenLastCalledWith([items[1]]);
    });

    it('selects every enabled item from the all entry, then deselects them', async () => {
      const onChange = vi.fn();
      render(
        <LegacySelect
          label="Colors"
          items={items}
          onChange={onChange}
          multiple
          i18nAllLabel="Everything"
          disablePortal
        />,
      );

      await openSelect('Colors');
      await clickItem('Everything');
      expect(onChange).toHaveBeenLastCalledWith([items[0], items[1]]);

      await clickItem('Everything');
      expect(onChange).toHaveBeenLastCalledWith([]);
    });

    it('only notifies onChange when controlled', async () => {
      const onChange = vi.fn();
      render(
        <LegacySelect
          label="Colors"
          items={items}
          onChange={onChange}
          multiple
          selection={[items[0], items[1]]}
          i18nAllLabel="Everything"
          disablePortal
        />,
      );

      await openSelect('Colors');
      await clickItem('Green');
      expect(onChange).toHaveBeenLastCalledWith([items[0]]);

      await clickItem('Everything');
      expect(onChange).toHaveBeenLastCalledWith([]);
    });
  });
});
