/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { page } from 'vitest/browser';

import { MANAGE_APP_ID, SUBSCRIPTIONS_ROUTE_ID } from '../../../constants';
import { LicenseBanner } from '../license-banner';

describe('LicenseBanner', () => {
	const maintenanceEndDate = 1750272000000;

	function createLicenseData(maintenanceStatus: 'expiring' | 'expired' | 'invalid') {
		return {
			response: {
				type: 'REGULAR',
				subType: 'PERPETUAL',
				maintenanceEndDate,
				maintenanceStatus,
				features: []
			},
			ok: true
		};
	}

	function setupLicenseBannerTest(
		component: React.ReactElement,
		maintenanceStatus: 'expiring' | 'expired' | 'invalid'
	) {
		const queryClient = getQueryClient();
		queryClient.setQueryData(['subscription', 'license'], createLicenseData(maintenanceStatus));

		return setupBrowserTest(component, { queryClient });
	}

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders expiring message', async () => {
		setupLicenseBannerTest(<LicenseBanner />, 'expiring');

		// Check if any text appears first
		await expect.element(page.getByText(/Your maintenance has expired/i)).toBeVisible();
	});

	it('renders expired message', async () => {
		setupLicenseBannerTest(<LicenseBanner />, 'expired');
		// Match either 18 or 19 Jun 2025 depending on timezone
		await expect.element(page.getByText(/Your maintenance expires on/i)).toBeVisible();
	});

	it('renders invalid message', async () => {
		setupLicenseBannerTest(<LicenseBanner />, 'invalid');

		// Check if any text appears first
		await expect.element(page.getByText(/Your subscription does not support Carbonio version/i)).toBeVisible();
	});

	it('shows redirect button when redirectButtonHasToAppear is true', async () => {
		setupLicenseBannerTest(<LicenseBanner redirectButtonHasToAppear />, 'expired');
		await expect.element(page.getByText(/View Subscription Details/i)).toBeVisible();
	});

	it('does not show redirect button when redirectButtonHasToAppear is false', async () => {
		setupLicenseBannerTest(<LicenseBanner />, 'expired');
		expect(page.getByText('View Subscription Details').elements()).toHaveLength(0);
	});


	it('closes the banner when close button is clicked', async () => {
		setupLicenseBannerTest(<LicenseBanner />, 'expired');

		await expect.element(page.getByTestId('license-banner-close-button')).toBeVisible();
		await page.getByTestId('license-banner-close-button').click();

		// After clicking close, the banner should not be visible
		expect(page.getByTestId('license-banner-close-button').elements()).toHaveLength(0);
	});

	it('closes the banner when close button is clicked invalid', async () => {
		setupLicenseBannerTest(<LicenseBanner />, 'invalid');

		await expect.element(page.getByTestId('license-banner-close-button')).toBeVisible();
		await page.getByTestId('license-banner-close-button').click();

		// After clicking close, the banner should not be visible
		expect(page.getByTestId('license-banner-close-button').elements()).toHaveLength(0);
	});

	it('should redirect when View Subscription Details button is clicked', async () => {
		setupLicenseBannerTest(<LicenseBanner redirectButtonHasToAppear />, 'expired');
		const button = page.getByRole('button', { name: 'View Subscription Details' });
		await button.click();
		expect(globalThis.location.pathname).toBe(`/${MANAGE_APP_ID}/${SUBSCRIPTIONS_ROUTE_ID}`);
	});
});
