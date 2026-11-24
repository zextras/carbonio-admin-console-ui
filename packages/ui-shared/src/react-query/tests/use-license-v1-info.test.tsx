/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import React from 'react';

import {
	LicenseV1QueryError,
	licenseV1Retry,
	queryFnLicenseV1Info,
	useLicenseV1Info,
} from '../use-license-v1-info';

const regularLicense = {
	licenseType: 'regular',
	status: 'valid',
	companyName: 'Acme Corp',
	partner: 'Zextras Partner',
	orderId: 'ORD-123',
	carbonioVersion: '25.1.2',
	activationToken: 'activation-token',
	startDate: '2026-01-01T00:00:00.000Z',
	endDate: '2027-01-01T00:00:00.000Z',
	totalActiveAccountsNumber: 42,
	lastSyncTime: '2026-11-16T10:30:00.000Z',
	editions: [{ name: 'Email', status: 'green', assignedSeats: 5, totalSeats: 10 }],
	addOns: [],
};

function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: 0 },
		},
	});
}

function createWrapper(queryClient: QueryClient) {
	return function Wrapper({ children }: { children: React.ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe('queryFnLicenseV1Info', () => {
	it('should unwrap the license on success', async () => {
		createAPIInterceptor('get', '/services/license/v1/info', () => HttpResponse.json(regularLicense));

		await expect(queryFnLicenseV1Info()).resolves.toEqual(regularLicense);
	});

	it('should return null when no license is installed', async () => {
		createAPIInterceptor('get', '/services/license/v1/info', () =>
			HttpResponse.json({}, { status: 404 }),
		);

		await expect(queryFnLicenseV1Info()).resolves.toBeNull();
	});

	it('should throw a LicenseV1QueryError carrying the LicenseV1Error on failure', async () => {
		createAPIInterceptor('get', '/services/license/v1/info', () =>
			HttpResponse.json({}, { status: 500 }),
		);

		let captured: unknown;
		try {
			await queryFnLicenseV1Info();
		} catch (e) {
			captured = e;
		}

		expect(captured).toBeInstanceOf(LicenseV1QueryError);
		expect((captured as LicenseV1QueryError).licenseError).toEqual({
			kind: 'http-error',
			status: 500,
			detail: '{}',
		});
	});
});

describe('licenseV1Retry', () => {
	it('should retry network errors', () => {
		const error = new LicenseV1QueryError({ kind: 'network-error', detail: 'Failed to fetch' });
		expect(licenseV1Retry(0, error)).toBe(true);
	});

	it('should retry http-error with status 500 or above', () => {
		const error = new LicenseV1QueryError({ kind: 'http-error', status: 503, detail: 'oops' });
		expect(licenseV1Retry(1, error)).toBe(true);
	});

	it('should not retry http-error with status below 500', () => {
		const error = new LicenseV1QueryError({ kind: 'http-error', status: 401, detail: 'nope' });
		expect(licenseV1Retry(0, error)).toBe(false);
	});

	it('should not retry invalid-payload errors', () => {
		const error = new LicenseV1QueryError({ kind: 'invalid-payload', detail: 'not JSON' });
		expect(licenseV1Retry(0, error)).toBe(false);
	});

	it('should not retry unknown errors', () => {
		expect(licenseV1Retry(0, new Error('whatever'))).toBe(false);
	});

	it('should stop after two retries', () => {
		const error = new LicenseV1QueryError({ kind: 'network-error', detail: 'Failed to fetch' });
		expect(licenseV1Retry(2, error)).toBe(false);
	});
});

describe('useLicenseV1Info', () => {
	it('should return the license as data', async () => {
		createAPIInterceptor('get', '/services/license/v1/info', () => HttpResponse.json(regularLicense));
		const queryClient = createQueryClient();

		const { result } = renderHook(() => useLicenseV1Info(), {
			wrapper: createWrapper(queryClient),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toEqual(regularLicense);
	});

	it('should return null data without error state when no license is installed', async () => {
		createAPIInterceptor('get', '/services/license/v1/info', () =>
			HttpResponse.json({}, { status: 404 }),
		);
		const queryClient = createQueryClient();

		const { result } = renderHook(() => useLicenseV1Info(), {
			wrapper: createWrapper(queryClient),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toBeNull();
		expect(result.current.error).toBeNull();
	});

	it('should retry a 500 twice before surfacing the error', async () => {
		let calls = 0;
		createAPIInterceptor('get', '/services/license/v1/info', () => {
			calls += 1;
			return HttpResponse.json({}, { status: 500 });
		});
		const queryClient = createQueryClient();

		const { result } = renderHook(() => useLicenseV1Info({ retryDelay: 0 }), {
			wrapper: createWrapper(queryClient),
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(calls).toBe(3);
		expect(result.current.error).toBeInstanceOf(LicenseV1QueryError);
	});

	it('should not retry an invalid-payload failure', async () => {
		let calls = 0;
		createAPIInterceptor('get', '/services/license/v1/info', () => {
			calls += 1;
			return HttpResponse.json({ licenseType: 'quantum', status: 'valid' });
		});
		const queryClient = createQueryClient();

		const { result } = renderHook(() => useLicenseV1Info({ retryDelay: 0 }), {
			wrapper: createWrapper(queryClient),
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(calls).toBe(1);
	});
});
