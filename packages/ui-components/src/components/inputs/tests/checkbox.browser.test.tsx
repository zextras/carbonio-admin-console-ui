/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Checkbox } from '../Checkbox';

const ValueCheckbox = () => {
  const [value, setValue] = useState(false);
  return <Checkbox label="Keep a copy" value={value} onClick={() => setValue((prev) => !prev)} />;
};

describe('Checkbox', () => {
  it('should render an accessible checkbox named after the label', async () => {
    await render(<Checkbox label="Keep a copy" />);

    await expect.element(page.getByRole('checkbox', { name: 'Keep a copy' })).not.toBeChecked();
  });

  it('should reflect the controlled value and toggle through onClick', async () => {
    await render(<ValueCheckbox />);

    const input = page.getByRole('checkbox', { name: 'Keep a copy' });
    await page.getByText('Keep a copy').click();
    await expect.element(input).toBeChecked();
    await input.click();
    await expect.element(input).not.toBeChecked();
  });

  it('should keep the controlled value when onClick does not update it', async () => {
    const onClick = vi.fn();
    await render(<Checkbox label="Keep a copy" value onClick={onClick} />);

    await page.getByText('Keep a copy').click();
    expect(onClick).toHaveBeenCalledTimes(1);
    await expect.element(page.getByRole('checkbox', { name: 'Keep a copy' })).toBeChecked();
  });

  it('should start from defaultChecked and toggle when uncontrolled', async () => {
    const onChange = vi.fn();
    await render(<Checkbox label="Keep a copy" defaultChecked onChange={onChange} />);

    const input = page.getByRole('checkbox', { name: 'Keep a copy' });
    await expect.element(input).toBeChecked();
    await page.getByText('Keep a copy').click();
    await expect.element(input).not.toBeChecked();
    expect(onChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('should not call onChange on mount', async () => {
    const onChange = vi.fn();
    await render(<Checkbox label="Keep a copy" defaultChecked onChange={onChange} />);

    await expect.element(page.getByRole('checkbox', { name: 'Keep a copy' })).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should toggle with Space and with Enter', async () => {
    await render(<ValueCheckbox />);

    const input = page.getByRole('checkbox', { name: 'Keep a copy' });
    await userEvent.tab();
    await userEvent.keyboard(' ');
    await expect.element(input).toBeChecked();
    await userEvent.keyboard('{Enter}');
    await expect.element(input).not.toBeChecked();
  });

  it('should not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    await render(<Checkbox label="Keep a copy" disabled onClick={onClick} />);

    await page.getByText('Keep a copy').click({ force: true });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should apply padding to the root and forward the ref to it', async () => {
    let root: HTMLDivElement | null = null;
    await render(
      <Checkbox
        label="Keep a copy"
        padding={{ top: 'small' }}
        ref={(el) => {
          root = el;
        }}
      />,
    );

    await expect.element(page.getByRole('checkbox', { name: 'Keep a copy' })).toBeInTheDocument();
    expect(root).toBeInstanceOf(HTMLDivElement);
    expect(getComputedStyle(root as unknown as HTMLDivElement).paddingTop).not.toBe('0px');
  });
});
