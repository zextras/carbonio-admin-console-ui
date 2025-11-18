/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { page } from 'vitest/browser';
import { setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { Mock } from 'vitest';

import { MANAGE_APP_ID, SUBSCRIPTIONS_ROUTE_ID } from '../../../constants';
import { useModuleLicenseInfo } from '../../../hooks/use-subscription';
import { LicenseBanner } from '../license-banner';

vi.mock('../../../hooks/use-subscription', () => ({
	useModuleLicenseInfo: vi.fn()
}));

describe('LicenseBanner', () => {
	const maintenanceEndDate = 1750272000000;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders expiring message', async () => {
		(useModuleLicenseInfo as Mock).mockReturnValue({
			moduleLicenseInfo: {
				maintenanceEndDate,
				maintenanceStatus: 'expiring'
			},
			licenseBannerShouldBeDisplayed: true
		});
		setupBrowserTest(<LicenseBanner />);
		await expect.element(page.getByText(/will expire on 18 Jun 2025/i)).toBeVisible();
	});

	it('renders expired message', async () => {
		(useModuleLicenseInfo as Mock).mockReturnValue({
			moduleLicenseInfo: {
				maintenanceEndDate,
				maintenanceStatus: 'expired'
			},
			licenseBannerShouldBeDisplayed: true
		});
		setupBrowserTest(<LicenseBanner />);
		await expect.element(page.getByText(/expired on 18 Jun 2025/i)).toBeVisible();
	});

	it('shows redirect button when redirectButtonHasToAppear is true', async () => {
		(useModuleLicenseInfo as Mock).mockReturnValue({
			moduleLicenseInfo: {
				maintenanceEndDate,
				maintenanceStatus: 'expired'
			},
			licenseBannerShouldBeDisplayed: true
		});

		setupBrowserTest(<LicenseBanner redirectButtonHasToAppear />);
		await expect.element(page.getByText(/View Subscription Details/i)).toBeVisible();
	});

	it('does not show redirect button when redirectButtonHasToAppear is false', async () => {
		(useModuleLicenseInfo as Mock).mockReturnValue({
			moduleLicenseInfo: {
				maintenanceEndDate,
				maintenanceStatus: 'expired'
			},
			licenseBannerShouldBeDisplayed: true
		});
		setupBrowserTest(<LicenseBanner />);
		expect(page.getByText('View Subscription Details').elements()).toHaveLength(0);
	});

	it('closes the banner when close button is clicked', async () => {
		const setIsLicenseBannerOpen = vi.fn();
		(useModuleLicenseInfo as Mock).mockReturnValue({
			moduleLicenseInfo: {
				maintenanceEndDate,
				maintenanceStatus: 'expired'
			},
			licenseBannerShouldBeDisplayed: true,
			setIsLicenseBannerOpen
		});
		setupBrowserTest(<LicenseBanner />);
		await page.getByTestId('license-banner-close-button').click();
		expect(setIsLicenseBannerOpen).toHaveBeenCalledWith(false);
	});

	it('should redirect when View Subscription Details button is clicked', async () => {
		const setIsLicenseBannerOpen = vi.fn();
		(useModuleLicenseInfo as Mock).mockReturnValue({
			moduleLicenseInfo: {
				maintenanceEndDate,
				maintenanceStatus: 'expired'
			},
			licenseBannerShouldBeDisplayed: true,
			setIsLicenseBannerOpen
		});
		setupBrowserTest(<LicenseBanner redirectButtonHasToAppear />);
		const button = page.getByRole('button', { name: 'View Subscription Details' });
		await button.click();
		expect(globalThis.location.pathname).toBe(`/${MANAGE_APP_ID}/${SUBSCRIPTIONS_ROUTE_ID}`);
	});
});
