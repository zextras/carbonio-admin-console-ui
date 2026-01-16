/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { screen } from '@testing-library/react';

import { SELECTORS } from '../../../test-utils/constants';
import { setupTest } from '../../../test-utils/test-utils';
import { Quota } from './Quota';

describe('Quota', () => {
  it('should render correctly', async () => {
    setupTest(<Quota fill={50} />);
    expect(screen.getByTestId(SELECTORS.quota)).toBeVisible();
  });
});
