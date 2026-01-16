/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { screen } from '@testing-library/react';
import { vi } from 'vitest';

import { ICONS } from '../../test-utils/constants';
import { setupTest } from '../../test-utils/test-utils';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  test('Render a checkbox with a label', () => {
    const onChange = vi.fn();
    setupTest(<Checkbox label="Checkbox label" />);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/checkbox label/i)).toBeVisible();
    expect(screen.getByTestId(ICONS.checkboxOff)).toBeVisible();
  });

  test('Click on the checkbox', async () => {
    const onChange = vi.fn();
    const { user } = setupTest(<Checkbox onChange={onChange} />);
    await user.click(screen.getByTestId(ICONS.checkboxOff));
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByTestId(ICONS.checkboxOn)).toBeVisible();
  });
});
