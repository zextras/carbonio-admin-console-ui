/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { NumberInput } from '../number-input';

describe('NumberInput', () => {
  describe('number semantics', () => {
    it('renders a spinbutton whose accessible name is the label', async () => {
      await render(<NumberInput label="Limit" value="5" onChange={() => {}} />);

      await expect.element(page.getByRole('spinbutton', { name: 'Limit' })).toBeVisible();
    });

    it('sets type number and inputMode numeric on the input', async () => {
      await render(<NumberInput label="Limit" value="" onChange={() => {}} />);

      const input = page.getByRole('spinbutton', { name: 'Limit' });
      await expect.element(input).toHaveAttribute('type', 'number');
      await expect.element(input).toHaveAttribute('inputmode', 'numeric');
    });
  });

  describe('value handling', () => {
    it('renders the controlled value', async () => {
      await render(<NumberInput label="Limit" value="42" onChange={() => {}} />);

      const input = (await page.getByRole('spinbutton', { name: 'Limit' }).element()) as HTMLInputElement;
      expect(input.value).toBe('42');
    });

    it('fires onChange with the sanitized string and stays controlled while typing', async () => {
      const changes: Array<string> = [];
      const ControlledLimitInput = (): React.JSX.Element => {
        const [value, setValue] = useState('');
        return (
          <NumberInput
            label="Limit"
            value={value}
            onChange={(v) => {
              setValue(v);
              changes.push(v);
            }}
          />
        );
      };
      await render(<ControlledLimitInput />);

      await userEvent.type(page.getByRole('spinbutton', { name: 'Limit' }), '123');

      const input = (await page.getByRole('spinbutton', { name: 'Limit' }).element()) as HTMLInputElement;
      expect(input.value).toBe('123');
      expect(changes).toEqual(['1', '12', '123']);
    });

    it('collapses leading zeros while typing', async () => {
      const changes: Array<string> = [];
      const ControlledLimitInput = (): React.JSX.Element => {
        const [value, setValue] = useState('');
        return (
          <NumberInput
            label="Limit"
            value={value}
            onChange={(v) => {
              setValue(v);
              changes.push(v);
            }}
          />
        );
      };
      await render(<ControlledLimitInput />);

      await userEvent.type(page.getByRole('spinbutton', { name: 'Limit' }), '007');

      const input = (await page.getByRole('spinbutton', { name: 'Limit' }).element()) as HTMLInputElement;
      expect(input.value).toBe('7');
      expect(changes).toEqual(['0', '0', '7']);
    });

    it('drops non-digit characters while typing', async () => {
      const changes: Array<string> = [];
      const ControlledLimitInput = (): React.JSX.Element => {
        const [value, setValue] = useState('');
        return (
          <NumberInput
            label="Limit"
            value={value}
            onChange={(v) => {
              setValue(v);
              changes.push(v);
            }}
          />
        );
      };
      await render(<ControlledLimitInput />);

      await userEvent.type(page.getByRole('spinbutton', { name: 'Limit' }), '1e5');

      const input = (await page.getByRole('spinbutton', { name: 'Limit' }).element()) as HTMLInputElement;
      expect(input.value).toBe('15');
      expect(changes.every((change) => /^[\d]*$/.test(change))).toBe(true);
    });

    it('passes the empty string through when the field is cleared', async () => {
      const changes: Array<string> = [];
      const ControlledLimitInput = (): React.JSX.Element => {
        const [value, setValue] = useState('7');
        return (
          <NumberInput
            label="Limit"
            value={value}
            onChange={(v) => {
              setValue(v);
              changes.push(v);
            }}
          />
        );
      };
      await render(<ControlledLimitInput />);

      await userEvent.fill(page.getByRole('spinbutton', { name: 'Limit' }), '');

      const input = (await page.getByRole('spinbutton', { name: 'Limit' }).element()) as HTMLInputElement;
      expect(input.value).toBe('');
      expect(changes).toEqual(['']);
    });
  });

  describe('plain input feature forwarding', () => {
    it('marks the field invalid and links the description via aria-describedby', async () => {
      await render(
        <NumberInput label="Limit" value="" onChange={() => {}} hasError description="Invalid limit" />,
      );

      const input = page.getByRole('spinbutton', { name: 'Limit' });
      await expect.element(input).toHaveAttribute('aria-invalid', 'true');

      const inputElement = await input.element();
      const describedBy = inputElement.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(describedBy as string)?.textContent).toBe('Invalid limit');
    });

    it('disables the field', async () => {
      await render(<NumberInput label="Limit" value="3" onChange={() => {}} disabled />);

      await expect.element(page.getByRole('spinbutton', { name: 'Limit' })).toBeDisabled();
    });

    it('renders a custom icon inside the field box', async () => {
      await render(
        <NumberInput label="Limit" value="" onChange={() => {}} icon={<span>custom icon</span>} />,
      );

      const customIcon = await page.getByText('custom icon').element();
      const input = await page.getByRole('spinbutton', { name: 'Limit' }).element();
      const box = input.parentElement as HTMLElement;
      expect(box.contains(customIcon)).toBe(true);
    });
  });
});
