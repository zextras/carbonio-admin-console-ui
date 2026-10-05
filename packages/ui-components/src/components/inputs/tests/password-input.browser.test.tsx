/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { PasswordInput } from '../password-input';

function ControlledPasswordInput(): React.JSX.Element {
  const [value, setValue] = useState('');
  return <PasswordInput label="Secret key" value={value} onChange={(e) => setValue(e.target.value)} />;
}

describe('PasswordInput', () => {
  it('renders a textbox whose accessible name is the label, masked by default', async () => {
    await render(<ControlledPasswordInput />);

    const input = (await page
      .getByRole('textbox', { name: 'Secret key' })
      .element()) as HTMLInputElement;
    expect(input.labels?.[0]?.textContent).toBe('Secret key');
    expect(input.type).toBe('password');
    expect(input.autocomplete).toBe('off');
  });

  it('stays controlled while typing', async () => {
    await render(<ControlledPasswordInput />);

    await userEvent.type(page.getByRole('textbox', { name: 'Secret key' }), 'hunter2');

    await expect.element(page.getByRole('textbox', { name: 'Secret key' })).toHaveValue('hunter2');
  });

  it('reveals the secret through a pressed toggle button and keeps focus on the field', async () => {
    await render(<ControlledPasswordInput />);
    await userEvent.type(page.getByRole('textbox', { name: 'Secret key' }), 'hunter2');

    const toggle = page.getByRole('button', { name: 'Show password' });
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();

    const input = (await page
      .getByRole('textbox', { name: 'Secret key' })
      .element()) as HTMLInputElement;
    expect(input.type).toBe('text');
    await expect
      .element(page.getByRole('button', { name: 'Hide password' }))
      .toHaveAttribute('aria-pressed', 'true');
    expect(document.activeElement).toBe(input);
  });

  it('masks again on a second toggle', async () => {
    await render(<ControlledPasswordInput />);

    await page.getByRole('button', { name: 'Show password' }).click();
    await page.getByRole('button', { name: 'Hide password' }).click();

    const input = (await page
      .getByRole('textbox', { name: 'Secret key' })
      .element()) as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('links the description via aria-describedby and marks errors', async () => {
    await render(
      <PasswordInput
        label="Secret key"
        value=""
        onChange={() => {}}
        description="Secret key is required"
        hasError
      />,
    );

    const input = await page.getByRole('textbox', { name: 'Secret key' }).element();
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)?.textContent).toBe(
      'Secret key is required',
    );
    await expect
      .element(page.getByRole('textbox', { name: 'Secret key' }))
      .toHaveAttribute('aria-invalid', 'true');
  });

  it('disables both the field and the toggle button', async () => {
    await render(<PasswordInput label="Secret key" value="" onChange={() => {}} disabled />);

    await expect.element(page.getByRole('textbox', { name: 'Secret key' })).toBeDisabled();
    await expect.element(page.getByRole('button', { name: 'Show password' })).toBeDisabled();
  });

  it('allows overriding the autoComplete default', async () => {
    await render(
      <PasswordInput label="Secret key" value="" onChange={() => {}} autoComplete="new-password" />,
    );

    const input = (await page
      .getByRole('textbox', { name: 'Secret key' })
      .element()) as HTMLInputElement;
    expect(input.autocomplete).toBe('new-password');
  });
});
