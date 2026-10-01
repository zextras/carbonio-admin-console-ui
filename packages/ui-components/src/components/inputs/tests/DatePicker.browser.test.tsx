/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { format } from 'date-fns';
import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { DatePicker } from '../DatePicker';

const ControlledDatePicker = ({
  initialDate = null,
  isClearable = false,
  disabled = false,
  minDate,
  maxDate,
  dateFormat,
}: {
  initialDate?: Date | null;
  isClearable?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
}): React.JSX.Element => {
  const [selected, setSelected] = useState<Date | null>(initialDate);
  return (
    <DatePicker
      label="Pick a date"
      selected={selected}
      onChange={setSelected}
      isClearable={isClearable}
      disabled={disabled}
      minDate={minDate}
      maxDate={maxDate}
      dateFormat={dateFormat}
    />
  );
};

describe('DatePicker', () => {
  describe('Rendering', () => {
    it('renders a visible label associated with the input', async () => {
      await render(<ControlledDatePicker />);

      const input = (await page
        .getByRole('textbox', { name: 'Pick a date' })
        .element()) as HTMLInputElement;
      expect(input.labels?.[0]?.textContent).toBe('Pick a date');
    });

    it('renders the input as a read-only display of the date', async () => {
      await render(<ControlledDatePicker />);

      const input = (await page.getByRole('textbox', { name: 'Pick a date' }).element()) as HTMLInputElement;
      expect(input.hasAttribute('readonly')).toBe(true);
    });

    it('renders the selected date formatted in the input', async () => {
      const date = new Date(2026, 4, 29);
      await render(<ControlledDatePicker initialDate={date} dateFormat="dd/MM/yyyy" />);

      const input = page.getByRole('textbox');
      await expect.element(input).toHaveValue('29/05/2026');
    });

    it('renders an empty input when no date is selected', async () => {
      await render(<ControlledDatePicker />);

      const input = page.getByRole('textbox');
      await expect.element(input).toHaveValue('');
    });

    it('uses the default date format when dateFormat is not provided', async () => {
      const date = new Date(2026, 0, 15, 10, 30);
      await render(<ControlledDatePicker initialDate={date} />);

      const input = page.getByRole('textbox');
      const expected = format(date, 'MMMM d, yyyy h:mm aa');
      await expect.element(input).toHaveValue(expected);
    });

    it('renders the calendar icon button', async () => {
      await render(<ControlledDatePicker />);

      const calendarButton = page.getByRole('button', { name: 'Calendar' });
      await expect.element(calendarButton).toBeVisible();
    });

    it('does not render the clear button when isClearable is false', async () => {
      await render(<ControlledDatePicker initialDate={new Date()} />);

      const clearButton = page.getByRole('button', { name: 'Clear' });
      await expect.element(clearButton).not.toBeInTheDocument();
    });

    it('renders the clear button when isClearable is true and a date is selected', async () => {
      await render(<ControlledDatePicker initialDate={new Date()} isClearable />);

      const clearButton = page.getByRole('button', { name: 'Clear' });
      await expect.element(clearButton).toBeVisible();
    });
  });

  describe('Opening and closing the popover', () => {
    it('opens the calendar popover when the calendar icon is clicked', async () => {
      await render(<ControlledDatePicker />);

      const calendarButton = page.getByRole('button', { name: 'Calendar' });
      await calendarButton.click();

      const grid = page.getByRole('grid');
      await expect.element(grid).toBeVisible();
    });

    it('closes the popover when a day is selected', async () => {
      await render(<ControlledDatePicker dateFormat="dd/MM/yyyy" />);

      const calendarButton = page.getByRole('button', { name: 'Calendar' });
      await calendarButton.click();

      const grid = page.getByRole('grid');
      await expect.element(grid).toBeVisible();

      const dayButtons = page.getByRole('gridcell');
      await dayButtons.nth(7).click();

      await expect.element(grid).not.toBeInTheDocument();
    });

    it('closes the popover when clicking outside', async () => {
      await render(
        <>
          <div data-testid="outside">Outside</div>
          <ControlledDatePicker />,
        </>,
      );

      const calendarButton = page.getByRole('button', { name: 'Calendar' });
      await calendarButton.click();

      const grid = page.getByRole('grid');
      await expect.element(grid).toBeVisible();

      await page.getByTestId('outside').click();

      await expect.element(grid).not.toBeInTheDocument();
    });

    it('toggles the popover on subsequent calendar icon clicks', async () => {
      await render(<ControlledDatePicker />);

      const calendarButton = page.getByRole('button', { name: 'Calendar' });
      const grid = page.getByRole('grid');

      await calendarButton.click();
      await expect.element(grid).toBeVisible();

      await calendarButton.click();
      await expect.element(grid).not.toBeInTheDocument();
    });
  });

  describe('Date selection', () => {
    it('updates the input value when a day is selected', async () => {
      await render(<ControlledDatePicker dateFormat="dd/MM/yyyy" />);

      await page.getByRole('button', { name: 'Calendar' }).click();

      const dayButtons = page.getByRole('gridcell');
      await dayButtons.nth(7).click();

      const input = page.getByRole('textbox');
      const value = (input.element() as HTMLInputElement).value;
      expect(value).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it('clears the date when the clear button is clicked', async () => {
      await render(
        <ControlledDatePicker initialDate={new Date()} isClearable dateFormat="dd/MM/yyyy" />,
      );

      const input = page.getByRole('textbox');
      await expect.element(input).not.toHaveValue('');

      await page.getByRole('button', { name: 'Clear' }).click();

      await expect.element(input).toHaveValue('');
    });
  });

  describe('Disabled state', () => {
    it('disables the input when disabled prop is true', async () => {
      await render(<ControlledDatePicker disabled />);

      const input = page.getByRole('textbox');
      await expect.element(input).toBeDisabled();
    });

    it('does not open the popover when disabled', async () => {
      await render(<ControlledDatePicker disabled />);

      const calendarButton = page.getByRole('button', { name: 'Calendar' });
      await expect.element(calendarButton).toBeDisabled();

      const grid = page.getByRole('grid');
      await expect.element(grid).not.toBeInTheDocument();
    });
  });

  describe('Month/year dropdown navigation', () => {
    it('renders dropdown selects in the caption when opened', async () => {
      await render(<ControlledDatePicker />);

      await page.getByRole('button', { name: 'Calendar' }).click();

      const selects = page.getByRole('combobox');
      await expect.element(selects.first()).toBeVisible();
    });
  });

  describe('Accessibility wiring', () => {
    it('links the description via aria-describedby', async () => {
      await render(
        <DatePicker
          label="Pick a date"
          selected={null}
          onChange={() => {}}
          description="Pick the expiration date"
        />,
      );

      const input = await page.getByRole('textbox', { name: 'Pick a date' }).element();
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(describedBy as string)?.textContent).toBe(
        'Pick the expiration date',
      );
    });

    it('marks the field invalid and styles the box with hasError', async () => {
      await render(<DatePicker label="Pick a date" selected={null} onChange={() => {}} hasError />);

      const input = await page.getByRole('textbox', { name: 'Pick a date' }).element();
      expect(input.getAttribute('aria-invalid')).toBe('true');
      const box = input.parentElement as HTMLElement;
      expect(box.getAttribute('data-error')).toBe('true');
    });

    it('wires the calendar button to the popover with aria-expanded and aria-controls', async () => {
      await render(<ControlledDatePicker />);

      const calendarButton = page.getByRole('button', { name: 'Calendar' });
      await expect.element(calendarButton).toHaveAttribute('aria-haspopup', 'dialog');
      await expect.element(calendarButton).toHaveAttribute('aria-expanded', 'false');

      await calendarButton.click();

      await expect.element(calendarButton).toHaveAttribute('aria-expanded', 'true');
      const controls = (await calendarButton.element()).getAttribute('aria-controls');
      expect(controls).toBeTruthy();
      expect(document.getElementById(controls as string)).not.toBeNull();
    });

    it('mirrors the expanded state on the input', async () => {
      await render(<ControlledDatePicker />);

      const input = page.getByRole('textbox', { name: 'Pick a date' });
      await expect.element(input).toHaveAttribute('aria-haspopup', 'dialog');
      await expect.element(input).toHaveAttribute('aria-expanded', 'false');

      await page.getByRole('button', { name: 'Calendar' }).click();

      await expect.element(input).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Keyboard interaction', () => {
    it('opens the popover from the input with Enter', async () => {
      await render(<ControlledDatePicker />);

      const input = page.getByRole('textbox', { name: 'Pick a date' });
      await input.click();
      await userEvent.keyboard('[Enter]');

      await expect.element(page.getByRole('grid')).toBeVisible();
    });

    it('opens the popover from the input with ArrowDown', async () => {
      await render(<ControlledDatePicker />);

      const input = page.getByRole('textbox', { name: 'Pick a date' });
      await input.click();
      await userEvent.keyboard('[ArrowDown]');

      await expect.element(page.getByRole('grid')).toBeVisible();
    });

    it('closes the popover with Escape while it has focus', async () => {
      await render(<ControlledDatePicker />);

      await page.getByRole('button', { name: 'Calendar' }).click();
      await expect.element(page.getByRole('grid')).toBeVisible();

      await userEvent.keyboard('[Escape]');

      await expect.element(page.getByRole('grid')).not.toBeInTheDocument();
    });
  });
});
