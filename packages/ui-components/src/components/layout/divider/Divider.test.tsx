/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupTest } from '../../../test-utils/test-utils';
import { screen } from '@testing-library/react';

import { SELECTORS } from '../../../test-utils/constants';
import { Theme } from '../../../theme/theme';
import { Divider } from './Divider';

describe('Divider', () => {
  it('should render correctly', () => {
    setupTest(<Divider />);
    const divider = screen.getByTestId(SELECTORS.divider);
    expect(divider).toBeVisible();
    expect(divider).toHaveStyle({ backgroundColor: Theme.palette.gray2.regular });
  });

  it('should render color correctly', () => {
    setupTest(<Divider color={'primary'} />);
    const divider = screen.getByTestId(SELECTORS.divider);
    expect(divider).toHaveStyle({ backgroundColor: Theme.palette.primary.regular });
  });
});
