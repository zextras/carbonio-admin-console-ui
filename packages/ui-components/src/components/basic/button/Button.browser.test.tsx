/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { Tooltip } from '../../display/Tooltip';
import { Button } from './Button';

describe('Button', () => {
  const label = 'buttonlabel';
  test('The label must be Upper Case', async () => {
    const clickFn = vi.fn();
    setupBrowserTest(<Button label={label} onClick={clickFn} />);
    expect(page.getByText(label)).toBeVisible();
    expect(page.getByText(label)).toHaveStyle('text-transform: uppercase');
  });
  test('Click on its label', async () => {
    const onClick = vi.fn();
    setupBrowserTest(<Button label={label} onClick={onClick} />);
    const button = page.getByText(new RegExp(label, 'i'));
    await button.click();
    expect(onClick).toHaveBeenCalled();
  });
  test('button is disabled when disabled prop is passed', async () => {
    setupBrowserTest(<Button label={label} onClick={() => {}} disabled />);

    const button = page.getByRole('button', { name: new RegExp(label, 'i') });
    await expect.element(button).toBeDisabled();
  });

  test('Trigger the onClick with the keyboard', async () => {
    let clicked = false;

    setupBrowserTest(
      <Button
        label={label}
        onClick={() => {
          clicked = true;
        }}
      />,
    );

    const button = page.getByRole('button', { name: new RegExp(label, 'i') });
    button.element().focus();
    await userEvent.keyboard('{Enter}');

    expect(clicked).toBe(true);
  });
  test('Show an icon', () => {
    const clickFn = vi.fn();
    setupBrowserTest(<Button label={label} icon="BulbOutline" onClick={clickFn} />);
    expect(page.getByText(new RegExp(label, 'i'))).toBeVisible();
    expect(page.getByTestId('icon: BulbOutline')).toBeVisible();
  });

  test('Show tooltip on button', async () => {
    setupBrowserTest(
      <Tooltip label={'Tooltip label'}>
        <Button label={'Button'} onClick={() => {}} />
      </Tooltip>,
    );

    const button = page.getByRole('button', { name: /Button/i });

    const tooltip = page.getByText('Tooltip label');
    await expect.element(tooltip).not.toBeInTheDocument();

    await userEvent.hover(button);

    await expect.element(tooltip).toBeVisible();

    await userEvent.unhover(button);
    await expect.element(tooltip).not.toBeInTheDocument();
  });
});
