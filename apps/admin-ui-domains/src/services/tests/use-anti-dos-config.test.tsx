/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	getEnabled: vi.fn(),
	getJailDuration: vi.fn(),
	getMaxRequests: vi.fn(),
	getTimeWindow: vi.fn(),
}));

vi.mock('../get-mobile-anti-dos-service', () => ({
	getMobileAntiDosService: mocks.getEnabled,
}));
vi.mock('../get-mobile-anti-dos-service-jail-duration', () => ({
	getMobileAntiDosServiceJailDuration: mocks.getJailDuration,
}));
vi.mock('../get-mobile-anti-dos-service-max-requests', () => ({
	getMobileAntiDosServiceMaxRequests: mocks.getMaxRequests,
}));
vi.mock('../get-mobile-anti-dos-service-time-window', () => ({
	getMobileAntiDosServiceTimeWindow: mocks.getTimeWindow,
}));

import { parseAntiDosEnabled, parseAntiDosValue, useAntiDosConfig } from '../use-anti-dos-config';

function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function makeValueResponse(value: unknown, inheritedValue?: unknown): unknown {
	return {
		Body: {
			response: {
				content: JSON.stringify({
					response: { values: [{ value, inheritedValue }] },
				}),
			},
		},
	};
}

describe('parse helpers', () => {
	it('should read enabled from value only', () => {
		expect(parseAntiDosEnabled(makeValueResponse(true, false))).toBe(true);
		expect(parseAntiDosEnabled(makeValueResponse(undefined, true))).toBe(false);
	});

	it('should fall back to inheritedValue for numeric settings', () => {
		expect(parseAntiDosValue(makeValueResponse(30))).toBe('30');
		expect(parseAntiDosValue(makeValueResponse(undefined, 60))).toBe('60');
	});
});

describe('useAntiDosConfig', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should combine the four config gets into one object', async () => {
		mocks.getEnabled.mockResolvedValue(makeValueResponse(true));
		mocks.getJailDuration.mockResolvedValue(makeValueResponse(30));
		mocks.getMaxRequests.mockResolvedValue(makeValueResponse(undefined, 100));
		mocks.getTimeWindow.mockResolvedValue(makeValueResponse(60000));

		const { result } = renderHook(() => useAntiDosConfig(), {
			wrapper: QueryWrapper,
		});

		await waitFor(() =>
			expect(result.current.data).toEqual({
				enabled: true,
				jailDuration: '30',
				maxRequests: '100',
				timeWindow: '60000',
			}),
		);
	});

	it('should expose the error when any get rejects', async () => {
		mocks.getEnabled.mockResolvedValue(makeValueResponse(true));
		mocks.getJailDuration.mockRejectedValue(new Error('boom'));
		mocks.getMaxRequests.mockResolvedValue(makeValueResponse(1));
		mocks.getTimeWindow.mockResolvedValue(makeValueResponse(1));

		const { result } = renderHook(() => useAntiDosConfig(), {
			wrapper: QueryWrapper,
		});

		await waitFor(() => expect(result.current.error).toBeInstanceOf(Error), { timeout: 4000 });
	});
});
