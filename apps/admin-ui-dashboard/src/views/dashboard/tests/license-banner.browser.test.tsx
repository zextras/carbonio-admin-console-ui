/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	createBrowserAPIInterceptor,
	createBrowserSoapAPIInterceptor,
	setupBrowserTest
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import React from 'react';
import { page } from 'vitest/browser';

import { MANAGE_APP_ID, SUBSCRIPTIONS_ROUTE_ID } from '../../../constants';
import { LicenseBanner } from '../license-banner';

describe('LicenseBanner', () => {
	const maintenanceEndDate = 1750272000000;

	function createLicenseResponse(maintenanceStatus: 'expiring' | 'expired') {
		return () =>
			HttpResponse.json({
				// response: {
				// 	content: JSON.stringify({
				// 		ok: true,
				// 		response: {
				// 			type: 'REGULAR',
				// 			subType: 'PERPETUAL',
				// 			maintenanceEndDate,
				// 			maintenanceStatus,
				// 			features: ''
				// 		}
				// 	})
				// }
			});
	}

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it.only('renders expiring message', async () => {
		const interceptor = createBrowserAPIInterceptor(
			'post',
			'/service/admin/soap/zextras',
			createLicenseResponse('expiring')
		);
		setupBrowserTest(<LicenseBanner />);
		expect(await interceptor).toHaveBeenCalledOnce();
		console.log('11111');
		// await expect.element(page.getByText(/will expire on 18 Jun 2025/i)).toBeVisible();
	});

	it('renders expired message', async () => {
		createBrowserSoapAPIInterceptor('zextras', createLicenseResponse('expired'));
		setupBrowserTest(<LicenseBanner />);
		await expect.element(page.getByText(/expired on 18 Jun 2025/i)).toBeVisible();
	});

	it('shows redirect button when redirectButtonHasToAppear is true', async () => {
		createBrowserSoapAPIInterceptor('zextras', createLicenseResponse('expired'));
		setupBrowserTest(<LicenseBanner redirectButtonHasToAppear />);
		await expect.element(page.getByText(/View Subscription Details/i)).toBeVisible();
	});

	it('does not show redirect button when redirectButtonHasToAppear is false', async () => {
		createBrowserSoapAPIInterceptor('zextras', createLicenseResponse('expired'));
		setupBrowserTest(<LicenseBanner />);
		expect(page.getByText('View Subscription Details').elements()).toHaveLength(0);
	});

	it('closes the banner when close button is clicked', async () => {
		createBrowserSoapAPIInterceptor('zextras', createLicenseResponse('expired'));
		setupBrowserTest(<LicenseBanner />);

		await expect.element(page.getByTestId('license-banner-close-button')).toBeVisible();
		await page.getByTestId('license-banner-close-button').click();

		// After clicking close, the banner should not be visible
		expect(page.getByTestId('license-banner-close-button').elements()).toHaveLength(0);
	});

	it('should redirect when View Subscription Details button is clicked', async () => {
		createBrowserSoapAPIInterceptor('zextras', createLicenseResponse('expired'));
		setupBrowserTest(<LicenseBanner redirectButtonHasToAppear />);
		const button = page.getByRole('button', { name: 'View Subscription Details' });
		await button.click();
		expect(globalThis.location.pathname).toBe(`/${MANAGE_APP_ID}/${SUBSCRIPTIONS_ROUTE_ID}`);
	});
});
