/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { page } from 'vitest/browser';
import { setupBrowserTest } from 'admin-ui-test-utils';

import { SELECTORS } from '../../../testUtils/constants';
import { Quota } from './Quota';

describe('Quota', () => {
  it('should render correctly', async () => {
    setupBrowserTest(<Quota fill={50} />);
    expect(page.getByTestId(SELECTORS.quota)).toBeVisible();
  });
});
