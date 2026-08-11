/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SUBSCRIPTIONS_ROUTE_ID, useAppStore } from '@zextras/ui-shared';
import { getQueryClient, LocationDisplay, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { LicenseBanner } from '../LicenseBanner';

describe('LicenseBanner', () => {
	const maintenanceEndDate = 1750272000000;

	function createLicenseData(maintenanceStatus: 'expiring' | 'expired' | 'invalid') {
		return {
			response: {
				type: 'REGULAR',
				subType: 'PERPETUAL',
				maintenanceEndDate,
				maintenanceStatus,
				features: [],
			},
			ok: true,
		};
	}

	async function setupLicenseBannerTest(
		component: React.ReactElement,
		maintenanceStatus: 'expiring' | 'expired' | 'invalid',
	) {
		const queryClient = getQueryClient();
		queryClient.setQueryData(['subscription', 'license'], createLicenseData(maintenanceStatus));

		// Register the subscriptions route so buildPath resolves the prefixed
		// path (/manage/subscriptions), mirroring how the shell bootstraps routes.
		useAppStore.setState({
			routes: {
				[SUBSCRIPTIONS_ROUTE_ID]: {
					id: SUBSCRIPTIONS_ROUTE_ID,
					route: SUBSCRIPTIONS_ROUTE_ID,
					path: `manage/${SUBSCRIPTIONS_ROUTE_ID}`,
					app: 'carbonio-admin-ui-subscription',
				},
			},
		});

		return await setupBrowserTest(component, { queryClient });
	}

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders expiring message', async () => {
		await setupLicenseBannerTest(<LicenseBanner />, 'expiring');

		await expect.element(page.getByText(/Maintenance expires on/i)).toBeVisible();
	});

	it('renders expired message', async () => {
		await setupLicenseBannerTest(<LicenseBanner />, 'expired');
		await expect.element(page.getByText(/Maintenance has expired./i)).toBeVisible();
	});

	it('renders invalid message', async () => {
		await setupLicenseBannerTest(<LicenseBanner />, 'invalid');

		await expect
			.element(page.getByText(/Your maintenance does not support Carbonio version/i))
			.toBeVisible();
	});

	it('shows redirect button when redirectButtonHasToAppear is true', async () => {
		await setupLicenseBannerTest(<LicenseBanner redirectButtonHasToAppear />, 'expired');
		await expect.element(page.getByText(/View Subscription Details/i)).toBeVisible();
	});

	it('does not show redirect button when redirectButtonHasToAppear is false', async () => {
		await setupLicenseBannerTest(<LicenseBanner />, 'expired');
		expect(page.getByText('View Subscription Details').elements()).toHaveLength(0);
	});

	it('closes the banner when close button is clicked', async () => {
		await setupLicenseBannerTest(<LicenseBanner />, 'expired');

		const closeButton = page.getByRole('button', { name: /close/i });
		await expect.element(closeButton).toBeVisible();
		await closeButton.click();

		expect(closeButton.elements()).toHaveLength(0);
	});

	it('closes the banner when close button is clicked (invalid)', async () => {
		await setupLicenseBannerTest(<LicenseBanner />, 'invalid');

		const closeButton = page.getByRole('button', { name: /close/i });
		await expect.element(closeButton).toBeVisible();
		await closeButton.click();

		expect(closeButton.elements()).toHaveLength(0);
	});

	it('should redirect when View Subscription Details button is clicked', async () => {
		await setupLicenseBannerTest(
			<>
				<LicenseBanner redirectButtonHasToAppear />
				<LocationDisplay />
			</>,
			'expired',
		);
		const button = page.getByRole('button', { name: 'View Subscription Details' });
		await button.click();
		const location = page.getByTestId('location');
		await expect.element(location).toHaveTextContent(`/manage/${SUBSCRIPTIONS_ROUTE_ID}`);
	});
});
