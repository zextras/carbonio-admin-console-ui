/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { InheritedSwitch, type InheritedSwitchProps } from '../inherited-switch';

function renderSwitch(props: Partial<InheritedSwitchProps> = {}) {
  return render(
    <InheritedSwitch
      label="Enable Chat"
      inputName="carbonioFeatureWscEnabled"
      onChange={() => {}}
      onChangeReset={() => {}}
      {...props}
    />,
  );
}

describe('InheritedSwitch', () => {
  it('should render a switch named after the label', async () => {
    await renderSwitch();

    await expect.element(page.getByRole('switch', { name: 'Enable Chat' })).toBeInTheDocument();
  });

  it('should render the description under the title and link it to the switch', async () => {
    await renderSwitch({ description: 'Users can chat' });

    await expect
      .element(page.getByRole('switch', { name: 'Enable Chat' }))
      .toHaveAccessibleDescription('Users can chat');
  });

  it('should show the inherited value when there is no own value', async () => {
    await renderSwitch({ inheritedValue: 'TRUE' });

    await expect.element(page.getByRole('switch', { name: 'Enable Chat' })).toBeChecked();
  });

  it('should prefer the own value over the inherited one', async () => {
    await renderSwitch({ subValue: 'FALSE', inheritedValue: 'TRUE' });

    await expect.element(page.getByRole('switch', { name: 'Enable Chat' })).not.toBeChecked();
  });

  it('should call onChange with the input name when the title is clicked', async () => {
    const onChange = vi.fn();
    await renderSwitch({ onChange });

    await page.getByText('Enable Chat').click();
    expect(onChange).toHaveBeenCalledWith('carbonioFeatureWscEnabled');
  });

  it('should not render the revert icon when the value is inherited', async () => {
    await renderSwitch({ inheritedValue: 'TRUE' });

    await expect.element(page.getByTestId('icon: RefreshOutline')).not.toBeInTheDocument();
  });

  it('should call onChangeReset when the revert icon is clicked', async () => {
    const onChangeReset = vi.fn();
    await renderSwitch({ subValue: 'FALSE', fromSubValue: 'FALSE', inheritedValue: 'TRUE', onChangeReset });

    await page.getByTestId('icon: RefreshOutline').click();
    expect(onChangeReset).toHaveBeenCalledTimes(1);
  });

  it('should show the inherited value in the revert tooltip', async () => {
    await renderSwitch({ subValue: 'FALSE', fromSubValue: 'FALSE', inheritedValue: 'TRUE' });

    await page.getByTestId('icon: RefreshOutline').hover();
    await expect.element(page.getByText('Click to revert.')).toBeVisible();
    await expect.element(page.getByText('true', { exact: false })).toBeVisible();
  });

  it('should disable the switch when disabled', async () => {
    const onChange = vi.fn();
    await renderSwitch({ disabled: true, onChange });

    await expect.element(page.getByRole('switch', { name: 'Enable Chat' })).toBeDisabled();
    await page.getByText('Enable Chat').click({ force: true });
    expect(onChange).not.toHaveBeenCalled();
  });
});
