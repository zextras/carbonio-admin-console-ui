/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { screen } from '@testing-library/react';
import { vi } from 'vitest';

import { setupTest } from 'admin-ui-test-utils';
import { Button } from './Button';

describe('Button', () => {
  const label = 'buttonlabel';

  test('The label must be Upper Case', () => {
    const clickFn = vi.fn();
    setupTest(<Button label={label} onClick={clickFn} />);
    expect(screen.getByText(label)).toBeVisible();
    expect(screen.getByText(label)).toHaveStyle('text-transform: uppercase');
  });

  test('Click on its label', async () => {
    const onClick = vi.fn();
    const { user } = setupTest(<Button label={label} onClick={onClick} />);
    const button = screen.getByRole('button', { name: new RegExp(label, 'i') });
    await user.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  test('button is disabled when disabled prop is passed', () => {
    setupTest(<Button label={label} onClick={() => {}} disabled />);

    const button = screen.getByRole('button', { name: new RegExp(label, 'i') });
    expect(button).toBeDisabled();
  });

  test('Show an icon', () => {
    const clickFn = vi.fn();
    setupTest(<Button label={label} icon="BulbOutline" onClick={clickFn} />);
    expect(screen.getByText(new RegExp(label, 'i'))).toBeVisible();
    expect(screen.getByTestId('icon: BulbOutline')).toBeVisible();
  });
});

