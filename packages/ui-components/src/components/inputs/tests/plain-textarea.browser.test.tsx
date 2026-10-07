/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { PlainTextarea } from '../plain-textarea';

function ControlledTextarea(): React.JSX.Element {
  const [value, setValue] = useState('');
  return <PlainTextarea label="Notes" value={value} onChange={(e) => setValue(e.target.value)} />;
}

describe('PlainTextarea', () => {
  it('renders a textbox whose accessible name is the label', async () => {
    await render(<PlainTextarea label="Notes" value="" onChange={() => {}} />);

    await expect.element(page.getByRole('textbox', { name: 'Notes' })).toBeVisible();
  });

  it('stays controlled while typing', async () => {
    await render(<ControlledTextarea />);

    await userEvent.type(page.getByRole('textbox', { name: 'Notes' }), 'hello');

    await expect.element(page.getByRole('textbox', { name: 'Notes' })).toHaveValue('hello');
  });

  it('links the description via aria-describedby', async () => {
    await render(
      <PlainTextarea label="Notes" value="" onChange={() => {}} description="Some notes" />,
    );

    const textarea = await page.getByRole('textbox', { name: 'Notes' }).element();
    const describedBy = textarea.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)?.textContent).toBe('Some notes');
  });

  it('marks the field invalid and styles the box with hasError', async () => {
    await render(<PlainTextarea label="Notes" value="" onChange={() => {}} hasError />);

    const textarea = (await page.getByRole('textbox', { name: 'Notes' }).element()) as HTMLElement;
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
    const box = textarea.parentElement as HTMLElement;
    expect(box.getAttribute('data-error')).toBe('true');
  });

  it('cannot be interacted with when disabled', async () => {
    await render(<PlainTextarea label="Notes" value="" onChange={() => {}} disabled />);

    await expect.element(page.getByRole('textbox', { name: 'Notes' })).toBeDisabled();
  });

  it('renders the required asterisk in the label while keeping the accessible name clean', async () => {
    await render(<PlainTextarea label="Notes" value="" onChange={() => {}} required />);

    const textarea = (await page
      .getByRole('textbox', { name: 'Notes' })
      .element()) as HTMLTextAreaElement;
    const label = textarea.labels?.[0];
    expect(label?.textContent).toBe('Notes*');
    expect(label?.lastElementChild?.getAttribute('aria-hidden')).toBe('true');
  });

  it('passes native props through to the textarea', async () => {
    await render(
      <PlainTextarea label="Notes" value="" onChange={() => {}} placeholder="Type here" />,
    );

    await expect
      .element(page.getByRole('textbox', { name: 'Notes' }))
      .toHaveAttribute('placeholder', 'Type here');
  });

  it('reserves two lines when empty and keeps the height fixed while typing', async () => {
    await render(<ControlledTextarea />);

    const textarea = (await page
      .getByRole('textbox', { name: 'Notes' })
      .element()) as HTMLTextAreaElement;
    expect(textarea.offsetHeight).toBeCloseTo(48, 0);

    await userEvent.type(page.getByRole('textbox', { name: 'Notes' }), 'one[Enter]two');

    expect(textarea.offsetHeight).toBeCloseTo(48, 0);
  });

  it('is vertically resizable', async () => {
    await render(<PlainTextarea label="Notes" value="" onChange={() => {}} />);

    const textarea = (await page
      .getByRole('textbox', { name: 'Notes' })
      .element()) as HTMLTextAreaElement;
    expect(getComputedStyle(textarea).resize).toBe('vertical');
  });

  it('shows a scrollbar when the content overflows the reserved lines', async () => {
    await render(<ControlledTextarea />);

    await userEvent.type(
      page.getByRole('textbox', { name: 'Notes' }),
      '1[Enter]2[Enter]3[Enter]4[Enter]5',
    );

    const textarea = (await page
      .getByRole('textbox', { name: 'Notes' })
      .element()) as HTMLTextAreaElement;
    expect(textarea.offsetHeight).toBeLessThanOrEqual(48);
    expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight);
  });
});
