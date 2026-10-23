/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { PlainCheckbox } from '../plain-checkbox';

const ControlledCheckbox = () => {
  const [checked, setChecked] = useState(false);
  return (
    <PlainCheckbox
      label="Keep a copy"
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    />
  );
};

describe('PlainCheckbox', () => {
  describe('semantics', () => {
    it('should expose a native checkbox whose accessible name is the label', async () => {
      await render(<PlainCheckbox label="Keep a copy" />);

      await expect.element(page.getByRole('checkbox', { name: 'Keep a copy' })).not.toBeChecked();
    });

    it('should keep the description out of the accessible name and link it via aria-describedby', async () => {
      await render(<PlainCheckbox label="Keep a copy" description="Stored in the sent folder" />);

      await expect
        .element(page.getByRole('checkbox', { name: 'Keep a copy' }))
        .toHaveAccessibleDescription('Stored in the sent folder');
    });

    it('should merge a caller-provided aria-describedby with the description id', async () => {
      await render(
        <>
          <span id="extra">Extra hint</span>
          <PlainCheckbox label="Keep a copy" description="Main hint" aria-describedby="extra" />
        </>,
      );

      await expect
        .element(page.getByRole('checkbox', { name: 'Keep a copy' }))
        .toHaveAccessibleDescription('Extra hint Main hint');
    });

    it('should not set aria-describedby without a description', async () => {
      await render(<PlainCheckbox label="Keep a copy" description={null} />);

      await expect
        .element(page.getByRole('checkbox', { name: 'Keep a copy' }))
        .not.toHaveAttribute('aria-describedby');
    });

    it('should be named by aria-label when rendered without a visible label', async () => {
      await render(<PlainCheckbox aria-label="Select row" />);

      await expect.element(page.getByRole('checkbox', { name: 'Select row' })).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should toggle when the label is clicked', async () => {
      await render(<ControlledCheckbox />);

      await page.getByText('Keep a copy').click();
      await expect.element(page.getByRole('checkbox', { name: 'Keep a copy' })).toBeChecked();
    });

    it('should not toggle when the description is clicked', async () => {
      await render(<PlainCheckbox label="Keep a copy" description="Stored in the sent folder" />);

      await page.getByText('Stored in the sent folder').click();
      await expect.element(page.getByRole('checkbox', { name: 'Keep a copy' })).not.toBeChecked();
    });

    it('should toggle with Space when focused', async () => {
      await render(<ControlledCheckbox />);

      await userEvent.tab();
      const input = page.getByRole('checkbox', { name: 'Keep a copy' });
      await expect.element(input).toHaveFocus();
      await userEvent.keyboard(' ');
      await expect.element(input).toBeChecked();
    });

    it('should not toggle nor fire onChange when disabled', async () => {
      const onChange = vi.fn();
      await render(<PlainCheckbox label="Keep a copy" disabled onChange={onChange} />);

      const input = page.getByRole('checkbox', { name: 'Keep a copy' });
      await expect.element(input).toBeDisabled();
      await page.getByText('Keep a copy').click({ force: true });
      expect(onChange).not.toHaveBeenCalled();
      await expect.element(input).not.toBeChecked();
    });

    it('should skip a disabled checkbox when tabbing', async () => {
      await render(
        <>
          <PlainCheckbox label="Disabled" disabled />
          <PlainCheckbox label="Enabled" />
        </>,
      );

      await userEvent.tab();
      await expect.element(page.getByRole('checkbox', { name: 'Enabled' })).toHaveFocus();
    });
  });

  describe('focus', () => {
    it('should show a focus ring on keyboard focus', async () => {
      await render(<PlainCheckbox label="Keep a copy" />);

      await userEvent.tab();
      const input = page.getByRole('checkbox', { name: 'Keep a copy' }).element();
      const icon = input.nextElementSibling as Element;
      expect(getComputedStyle(icon).outlineStyle).toBe('solid');
    });
  });
});
