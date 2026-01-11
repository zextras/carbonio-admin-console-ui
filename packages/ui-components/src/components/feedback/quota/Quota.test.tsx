/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { screen, setup } from '../../../test-utils';
import { SELECTORS } from '../../../testUtils/constants';
import { Quota } from './Quota';

describe('Quota', () => {
	it('should render correctly', () => {
		setup(<Quota fill={50} />);
		expect(screen.getByTestId(SELECTORS.quota)).toBeVisible();
	});
});
