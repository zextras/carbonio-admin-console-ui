/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { page } from '@vitest/browser/context';
import { useCurrentUserRights } from '@zextras/admin-ui-bootstrap';
import { setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Subscription } from '../subscription';

const mockRights = [
	{
		type: 'config',
		all: [
			{
				setAttrs: [{ all: true }]
			}
		]
	}
];

// Mock the useCurrentUserRights hook
vi.mock('@zextras/admin-ui-bootstrap', async () => {
	const actual = await vi.importActual('@zextras/admin-ui-bootstrap');
	return {
		...actual,
		useCurrentUserRights: vi.fn()
	};
});

// Suppress MSW cleanup errors that occur when tests finish
let unhandledRejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;

beforeAll(() => {
	unhandledRejectionHandler = (event: PromiseRejectionEvent): void => {
		// Suppress MSW deserialization errors that occur during test cleanup
		if (
			event.reason?.message?.includes('Cannot read properties of undefined') &&
			event.reason?.stack?.includes('deserializeRequest')
		) {
			event.preventDefault();
		}
	};
	globalThis.addEventListener('unhandledrejection', unhandledRejectionHandler);
});

afterAll(() => {
	if (unhandledRejectionHandler) {
		globalThis.removeEventListener('unhandledrejection', unhandledRejectionHandler);
	}
});

beforeEach(() => {
	// Mock fetch API to handle any SOAP/API requests
	vi.spyOn(globalThis, 'fetch').mockResolvedValue(
		new Response(JSON.stringify({ Body: {} }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		})
	);

	// Mock useCurrentUserRights hook to return mock rights (React Query result format)
	vi.mocked(useCurrentUserRights).mockReturnValue({
		data: mockRights,
		isPending: false,
		isLoading: false,
		isError: false,
		error: null,
		isSuccess: true,
		isPlaceholderData: false,
		status: 'success',
		fetchStatus: 'idle',
		isRefetching: false,
		isFetching: false,
		isRefetchError: false,
		isLoadingError: false,
		promise: Promise.resolve({ data: mockRights }),
		refetch: vi.fn(),
		hasNextPage: false,
		fetchNextPage: vi.fn(),
		hasPreviousPage: false,
		fetchPreviousPage: vi.fn()
	} as any);
});

// Mock data that matches what the React Query hooks expect (after parsing)
const mockLicenseData = {
	response: {
		subType: 'PERPETUAL',
		expired: false,
		dateStart: 1652140800000,
		dateEnd: 1855526400000,
		maintenanceEndDate: 1750272000000, // 18 Jun 2025
		maintenanceStatus: 'expired' as const,
		type: 'Purchased',
		customer: 'Test Customer',
		accountCount: 7,
		licensedUsers: '99',
		notYetValid: false,
		infrastructureId: '8b2458ac-61e5-47c0-b70b-d27701c3c68d',
		authenticationToken: 'PERPETUAL_LIC',
		endUser: 'Test End User',
		features: [
			{ name: 'backup_realtime', quantity: 'unlimited', enabled: true },
			{ name: 'chats_recording', quantity: 'unlimited', enabled: true },
			{ name: 'files_basic', quantity: 'unlimited', enabled: true },
			{ name: 'storages_basic', quantity: 'unlimited', enabled: true },
			{ name: 'admins_basic', quantity: 'unlimited', enabled: true }
		]
	},
	ok: true
};

const mockVersionData = {
	response: {
		version: '24.10.0'
	},
	ok: true
};

type SetupOptions = {
	licenseData?: any;
	versionData?: any;
};

const setupSubscriptionTest = (component: React.ReactElement, options?: SetupOptions) => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0,
				staleTime: Infinity,
				refetchOnMount: false,
				refetchOnWindowFocus: false,
				refetchOnReconnect: false
			}
		}
	});

	if (options?.licenseData) {
		queryClient.setQueryData(['subscription', 'license'], options.licenseData);
	}
	if (options?.versionData) {
		queryClient.setQueryData(['subscription', 'version'], options.versionData);
	}

	return setupBrowserTest(
		<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
	);
};

describe('Subscription - License Banner', () => {
	it('should display license banner when maintenance status is expired and subType is PERPETUAL', async () => {
		setupSubscriptionTest(<Subscription />, {
			licenseData: mockLicenseData,
			versionData: mockVersionData
		});

		await expect.element(page.getByText(/Your maintenance expired on 18 Jun 2025/i)).toBeVisible();
	});

	it('should display license banner when maintenance status is expiring and subType is PERPETUAL', async () => {
		const expiringLicenseData = {
			...mockLicenseData,
			response: {
				...mockLicenseData.response,
				maintenanceStatus: 'expiring' as const
			}
		};

		setupSubscriptionTest(<Subscription />, {
			licenseData: expiringLicenseData,
			versionData: mockVersionData
		});

		await expect
			.element(page.getByText(/Your maintenance will expire on 18 Jun 2025/i))
			.toBeVisible();
	});

	it('should not display license banner when maintenance status is active', async () => {
		const activeLicenseData = {
			...mockLicenseData,
			response: {
				...mockLicenseData.response,
				maintenanceStatus: 'active' as const
			}
		};

		setupSubscriptionTest(<Subscription />, {
			licenseData: activeLicenseData,
			versionData: mockVersionData
		});

		const bannerTexts = page.getByText(/Your maintenance/i).elements();
		expect(bannerTexts).toHaveLength(0);
	});

	it('should not display license banner when subType is not PERPETUAL', async () => {
		const regularLicenseData = {
			...mockLicenseData,
			response: {
				...mockLicenseData.response,
				subType: 'REGULAR'
			}
		};

		setupSubscriptionTest(<Subscription />, {
			licenseData: regularLicenseData,
			versionData: mockVersionData
		});

		const bannerTexts = page.getByText(/Your maintenance/i).elements();
		expect(bannerTexts).toHaveLength(0);
	});

	it('should hide license banner when close button is clicked', async () => {
		setupSubscriptionTest(<Subscription />, {
			licenseData: mockLicenseData,
			versionData: mockVersionData
		});

		await expect.element(page.getByText(/Your maintenance expired on 18 Jun 2025/i)).toBeVisible();

		const closeButton = page.getByTestId('license-banner-close-button');
		await closeButton.click();

		const bannerTexts = page.getByText(/Your maintenance/i).elements();
		expect(bannerTexts).toHaveLength(0);
	});

	it('should render subscription details section', async () => {
		const activeLicenseData = {
			...mockLicenseData,
			response: {
				...mockLicenseData.response,
				maintenanceStatus: 'active' as const
			}
		};

		setupSubscriptionTest(<Subscription />, {
			licenseData: activeLicenseData,
			versionData: mockVersionData
		});

		await expect.element(page.getByText('Details')).toBeVisible();
		await expect.element(page.getByText('Activation')).toBeVisible();
	});
});
