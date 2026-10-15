/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Switch } from '../Switch';

const ValueSwitch = () => {
  const [value, setValue] = useState(false);
  return <Switch label="Enable mail" value={value} onClick={() => setValue((prev) => !prev)} />;
};

describe('Switch', () => {
  it('should render an accessible switch named after the label', async () => {
    await render(<Switch label="Enable mail" />);

    await expect.element(page.getByRole('switch', { name: 'Enable mail' })).not.toBeChecked();
  });

  it('should render the description under the title and link it to the switch', async () => {
    await render(<Switch label="Enable mail" description="Users can send emails" />);

    await expect
      .element(page.getByRole('switch', { name: 'Enable mail' }))
      .toHaveAccessibleDescription('Users can send emails');
  });

  it('should reflect the controlled value and toggle through onClick', async () => {
    await render(<ValueSwitch />);

    const input = page.getByRole('switch', { name: 'Enable mail' });
    await page.getByText('Enable mail').click();
    await expect.element(input).toBeChecked();
    await input.click();
    await expect.element(input).not.toBeChecked();
  });

  it('should keep the controlled value when onClick does not update it', async () => {
    const onClick = vi.fn();
    await render(<Switch label="Enable mail" value onClick={onClick} />);

    await page.getByText('Enable mail').click();
    expect(onClick).toHaveBeenCalledTimes(1);
    await expect.element(page.getByRole('switch', { name: 'Enable mail' })).toBeChecked();
  });

  it('should start from defaultChecked and toggle when uncontrolled', async () => {
    const onChange = vi.fn();
    await render(<Switch label="Enable mail" defaultChecked onChange={onChange} />);

    const input = page.getByRole('switch', { name: 'Enable mail' });
    await expect.element(input).toBeChecked();
    await page.getByText('Enable mail').click();
    await expect.element(input).not.toBeChecked();
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('should prefer value over defaultChecked when both are passed', async () => {
    await render(<Switch label="Enable mail" value={false} defaultChecked />);

    await expect.element(page.getByRole('switch', { name: 'Enable mail' })).not.toBeChecked();
  });

  it('should not fire handlers when disabled', async () => {
    const onClick = vi.fn();
    await render(<Switch label="Enable mail" disabled onClick={onClick} />);

    await expect.element(page.getByRole('switch', { name: 'Enable mail' })).toBeDisabled();
    await page.getByText('Enable mail').click({ force: true });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should apply the padding prop as root padding', async () => {
    const { container } = await render(<Switch label="Enable mail" padding={{ top: 'large' }} />);

    const root = container.firstElementChild as HTMLElement;
    const computed = getComputedStyle(root);
    expect(computed.paddingTop).not.toBe('0px');
    expect(computed.paddingRight).toBe('0px');
    expect(computed.paddingBottom).toBe('0px');
    expect(computed.paddingLeft).toBe('0px');
  });

  it('should forward data-testid to the input', async () => {
    await render(<Switch label="Enable mail" data-testid="mail-switch" />);

    expect(page.getByRole('switch', { name: 'Enable mail' }).element().dataset.testid).toBe(
      'mail-switch',
    );
  });
});
