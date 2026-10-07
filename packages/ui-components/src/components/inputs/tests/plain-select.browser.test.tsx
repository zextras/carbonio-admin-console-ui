/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { PlainSelect } from '../plain-select';
import type { SelectItem } from '../Select';

const FRUITS: Array<SelectItem> = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
];

const FRUITS_WITH_DISABLED: Array<SelectItem> = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana', disabled: true },
  { label: 'Cherry', value: 'cherry' },
];

function ControlledFruitSelect({
  initialSelection,
  picks,
}: {
  initialSelection: SelectItem;
  picks: Array<string>;
}): React.JSX.Element {
  const [selection, setSelection] = useState(initialSelection);
  return (
    <PlainSelect
      label="Fruit"
      items={FRUITS}
      selection={selection}
      onChange={(value) => {
        picks.push(value);
        setSelection(FRUITS.find((item) => item.value === value) ?? FRUITS[0]);
      }}
    />
  );
}

describe('PlainSelect', () => {
  describe('trigger semantics', () => {
    it('renders a button trigger whose accessible name is the label', async () => {
      await render(<PlainSelect label="Fruit" items={FRUITS} selection={FRUITS[0]} onChange={() => {}} />);

      await expect.element(page.getByRole('button', { name: 'Fruit' })).toBeVisible();
    });

    it('shows the selected item label inside the field box', async () => {
      await render(<PlainSelect label="Fruit" items={FRUITS} selection={FRUITS[1]} onChange={() => {}} />);

      const trigger = (await page.getByRole('button', { name: 'Fruit' }).element()) as HTMLButtonElement;
      expect(trigger.textContent).toBe('Banana');
    });

    it('keeps the trigger visible and clickable when the selection label is empty', async () => {
      await render(
        <PlainSelect
          label="Fruit"
          items={FRUITS}
          selection={{ label: '', value: '' }}
          onChange={() => {}}
        />,
      );

      const trigger = page.getByRole('button', { name: 'Fruit' });
      await expect.element(trigger).toBeVisible();
      await trigger.click();
      await expect.element(page.getByRole('option', { name: 'Apple' })).toBeVisible();
    });

    it('declares a listbox popup, collapsed by default', async () => {
      await render(<PlainSelect label="Fruit" items={FRUITS} selection={FRUITS[0]} onChange={() => {}} />);

      const trigger = page.getByRole('button', { name: 'Fruit' });
      await expect.element(trigger).toHaveAttribute('aria-haspopup', 'listbox');
      await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
    });

    it('renders the required asterisk in the label while keeping the accessible name clean', async () => {
      await render(
        <PlainSelect label="Fruit" items={FRUITS} selection={FRUITS[0]} onChange={() => {}} required />,
      );

      const trigger = (await page
        .getByRole('button', { name: 'Fruit' })
        .element()) as HTMLButtonElement;
      expect(trigger.labels?.[0]?.textContent).toBe('Fruit*');
      const mark = trigger.labels?.[0]?.lastElementChild;
      expect(mark?.textContent).toBe('*');
      expect(mark?.getAttribute('aria-hidden')).toBe('true');
    });

    it('cannot be interacted with when disabled', async () => {
      await render(
        <PlainSelect label="Fruit" items={FRUITS} selection={FRUITS[0]} onChange={() => {}} disabled />,
      );

      await expect.element(page.getByRole('button', { name: 'Fruit' })).toBeDisabled();
      await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('popup behavior', () => {
    it('opens on click: aria-expanded flips, options are listed, aria-controls wires to the popup', async () => {
      await render(<PlainSelect label="Fruit" items={FRUITS} selection={FRUITS[0]} onChange={() => {}} />);

      await page.getByRole('button', { name: 'Fruit' }).click();

      const trigger = page.getByRole('button', { name: 'Fruit' });
      await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
      const controls = (await trigger.element()).getAttribute('aria-controls');
      expect(controls).toBeTruthy();
      expect(document.getElementById(controls as string)).not.toBeNull();
      await expect.element(page.getByRole('option', { name: 'Apple' })).toBeVisible();
      await expect.element(page.getByRole('option', { name: 'Banana' })).toBeVisible();
      await expect.element(page.getByRole('option', { name: 'Cherry' })).toBeVisible();
    });

    it('marks the current selection as selected', async () => {
      await render(<PlainSelect label="Fruit" items={FRUITS} selection={FRUITS[1]} onChange={() => {}} />);

      await page.getByRole('button', { name: 'Fruit' }).click();

      await expect
        .element(page.getByRole('option', { name: 'Banana' }))
        .toHaveAttribute('aria-selected', 'true');
      await expect
        .element(page.getByRole('option', { name: 'Apple' }))
        .toHaveAttribute('aria-selected', 'false');
    });

    it('fires onChange with the picked value, closes, and shows the new selection', async () => {
      const picks: Array<string> = [];
      await render(<ControlledFruitSelect initialSelection={FRUITS[0]} picks={picks} />);

      await page.getByRole('button', { name: 'Fruit' }).click();
      await page.getByRole('option', { name: 'Cherry' }).click();

      expect(picks).toEqual(['cherry']);
      await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
      const trigger = (await page.getByRole('button', { name: 'Fruit' }).element()) as HTMLButtonElement;
      expect(trigger.textContent).toBe('Cherry');
    });

    it('does not pick disabled items', async () => {
      const picks: Array<string> = [];
      await render(
        <PlainSelect
          label="Fruit"
          items={FRUITS_WITH_DISABLED}
          selection={FRUITS_WITH_DISABLED[0]}
          onChange={(value) => {
            picks.push(value);
          }}
        />,
      );

      await page.getByRole('button', { name: 'Fruit' }).click();
      await page.getByRole('option', { name: 'Banana' }).click({ force: true });

      expect(picks).toEqual([]);
      await expect.element(page.getByRole('listbox')).toBeVisible();
    });

    it('flips the chevron icon while open', async () => {
      await render(<PlainSelect label="Fruit" items={FRUITS} selection={FRUITS[0]} onChange={() => {}} />);

      await expect.element(page.getByTestId('icon: ChevronDown')).toBeVisible();
      await page.getByRole('button', { name: 'Fruit' }).click();
      await expect.element(page.getByTestId('icon: ChevronUp')).toBeVisible();
    });
  });

  describe('keyboard interaction', () => {
    it('reopens with ArrowDown after Escape, starting from the current selection', async () => {
      await render(<PlainSelect label="Fruit" items={FRUITS} selection={FRUITS[1]} onChange={() => {}} />);

      await page.getByRole('button', { name: 'Fruit' }).click();
      await userEvent.keyboard('[Escape]');
      await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();

      await userEvent.keyboard('[ArrowDown]');
      await expect.element(page.getByRole('listbox')).toBeVisible();
      await expect
        .element(page.getByRole('option', { name: 'Banana' }))
        .toHaveAttribute('data-active', 'true');
    });

    it('moves the active option with ArrowDown and picks it with Enter', async () => {
      const picks: Array<string> = [];
      await render(
        <PlainSelect
          label="Fruit"
          items={FRUITS}
          selection={FRUITS[0]}
          onChange={(value) => {
            picks.push(value);
          }}
        />,
      );

      await page.getByRole('button', { name: 'Fruit' }).click();
      await userEvent.keyboard('[ArrowDown]');
      await expect
        .element(page.getByRole('option', { name: 'Banana' }))
        .toHaveAttribute('data-active', 'true');
      await userEvent.keyboard('[Enter]');

      expect(picks).toEqual(['banana']);
      await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
    });

    it('closes with Escape without picking', async () => {
      const picks: Array<string> = [];
      await render(
        <PlainSelect
          label="Fruit"
          items={FRUITS}
          selection={FRUITS[0]}
          onChange={(value) => {
            picks.push(value);
          }}
        />,
      );

      await page.getByRole('button', { name: 'Fruit' }).click();
      await userEvent.keyboard('[Escape]');

      expect(picks).toEqual([]);
      await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
      const trigger = await page.getByRole('button', { name: 'Fruit' }).element();
      expect(document.activeElement).toBe(trigger);
    });
  });

  describe('input shell parity', () => {
    it('links the description via aria-describedby', async () => {
      await render(
        <PlainSelect
          label="Fruit"
          items={FRUITS}
          selection={FRUITS[0]}
          onChange={() => {}}
          description="Pick a fruit"
        />,
      );

      const trigger = await page.getByRole('button', { name: 'Fruit' }).element();
      const describedBy = trigger.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(describedBy as string)?.textContent).toBe('Pick a fruit');
    });

    it('applies the error styling to the field box with hasError', async () => {
      await render(
        <PlainSelect label="Fruit" items={FRUITS} selection={FRUITS[0]} onChange={() => {}} hasError />,
      );

      const trigger = (await page.getByRole('button', { name: 'Fruit' }).element()) as HTMLElement;
      const box = trigger.parentElement as HTMLElement;
      expect(box.getAttribute('data-error')).toBe('true');
    });

    it('does not apply the error styling without hasError', async () => {
      await render(<PlainSelect label="Fruit" items={FRUITS} selection={FRUITS[0]} onChange={() => {}} />);

      const trigger = (await page.getByRole('button', { name: 'Fruit' }).element()) as HTMLElement;
      const box = trigger.parentElement as HTMLElement;
      expect(box.getAttribute('data-error')).toBeNull();
    });

    it('renders a custom icon inside the field box after the chevron', async () => {
      await render(
        <PlainSelect
          label="Fruit"
          items={FRUITS}
          selection={FRUITS[0]}
          onChange={() => {}}
          icon={<span>custom icon</span>}
        />,
      );

      const trigger = (await page.getByRole('button', { name: 'Fruit' }).element()) as HTMLElement;
      const box = trigger.parentElement as HTMLElement;
      const customIcon = (await page.getByText('custom icon').element()) as HTMLElement;
      expect(box.contains(customIcon)).toBe(true);
      const chevron = box.querySelector('ds-icon[icon="ChevronDown"]');
      expect(chevron).not.toBeNull();
      expect(
        chevron
          ? chevron.compareDocumentPosition(customIcon) & Node.DOCUMENT_POSITION_FOLLOWING
          : 0,
      ).not.toBe(0);
    });
  });
});
