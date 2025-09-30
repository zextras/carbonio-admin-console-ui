/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { advancedSupportedApi } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';

import { isAdvancedSupported } from '../isAdvancedSupported';

describe('isAdvancedSupported', () => {
	it('Should return true when  supported is true', async () => {
		advancedSupportedApi.withAdvancedSupported();

		const advancedSupported = await isAdvancedSupported();

		expect(advancedSupported).toEqual({ supported: true });
	});

	it('Should return false when supported is false', async () => {
		advancedSupportedApi.withAdvancedNotSupported();

		const advancedSupported = await isAdvancedSupported();

		expect(advancedSupported).toEqual({ supported: false });
	});

	it('Should return error when the API fails', async () => {
		advancedSupportedApi.withError();

		const advancedSupported = await isAdvancedSupported();

		expect(advancedSupported).toHaveProperty('errorMessage');
	});
});
