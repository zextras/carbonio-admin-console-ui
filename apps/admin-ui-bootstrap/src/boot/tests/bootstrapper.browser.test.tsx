/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	advancedSupportedApiForBrowser,
	getInfoRequestApiForBrowser,
	loginConfigApiForBrowser,
	minMaxVersionApiForBrowser,
	setupBrowserTest
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import Bootstrapper from '../bootstrapper';

describe('Bootstrapper', () => {
	it('should display error when is advanced supported api fails', async () => {
		advancedSupportedApiForBrowser.withError();
		minMaxVersionApiForBrowser(HttpResponse.error);
		loginConfigApiForBrowser(HttpResponse.error);
		getInfoRequestApiForBrowser(HttpResponse.error);

		setupBrowserTest(<Bootstrapper />, {
			initialRouterEntry: '/carbonioAdmin'
		});

		const errorMessage = page.getByText(
			'We’re sorry, but there was an error trying to load this page'
		);
		await expect.element(errorMessage).toBeVisible();
	});
});
