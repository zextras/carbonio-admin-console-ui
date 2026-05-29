/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { format } from 'date-fns';
import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
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
    it('renders the input with the provided label as placeholder', async () => {
      await render(<ControlledDatePicker />);

      const input = page.getByRole('textbox');
      await expect.element(input).toBeVisible();
      await expect.element(input).toHaveAttribute('placeholder', 'Pick a date');
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
});
