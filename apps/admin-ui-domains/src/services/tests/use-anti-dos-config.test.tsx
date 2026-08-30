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
	get: vi.fn(),
}));

vi.mock('../mobile-anti-dos-service', () => ({
	getMobileAntiDosService: mocks.get,
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
		mocks.get.mockImplementation(async (attribute: string) => {
			switch (attribute) {
				case 'mobileAntiDosServiceEnabled':
					return makeValueResponse(true);
				case 'mobileAntiDosServiceJailDuration':
					return makeValueResponse(30);
				case 'mobileAntiDosServiceMaxRequests':
					return makeValueResponse(undefined, 100);
				case 'mobileAntiDosServiceTimeWindow':
					return makeValueResponse(60000);
			}
		});

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
		mocks.get.mockImplementation(async (attribute: string) => {
			if (attribute === 'mobileAntiDosServiceJailDuration') {
				throw new Error('boom');
			}
			return makeValueResponse(1);
		});

		const { result } = renderHook(() => useAntiDosConfig(), {
			wrapper: QueryWrapper,
		});

		await waitFor(() => expect(result.current.error).toBeInstanceOf(Error), { timeout: 4000 });
	});
});
