/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockList2faPolicies = vi.hoisted(() => vi.fn());

vi.mock('../list-2fa-policies', () => ({
	list2faPolicies: mockList2faPolicies,
}));

import { parse2faPolicies, use2faPolicies } from '../use-2fa-policies';

function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function makeSoapResponse(values: Array<unknown> | undefined): unknown {
	return {
		Body: {
			response: {
				content: JSON.stringify({ response: { values } }),
			},
		},
	};
}

describe('parse2faPolicies', () => {
	it('should extract values from the zextras content envelope', () => {
		const values = [{ WebUI: { trustedDevice: 1, trustedIpRange: [] } }];

		expect(parse2faPolicies(makeSoapResponse(values))).toEqual(values);
	});

	it('should return an empty array when content is missing', () => {
		expect(parse2faPolicies({ Body: {} })).toEqual([]);
		expect(parse2faPolicies(undefined)).toEqual([]);
	});
});

describe('use2faPolicies', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return parsed policies for the given domain', async () => {
		const values = [{ WebUI: { trustedDevice: 1, trustedIpRange: [] } }];
		mockList2faPolicies.mockResolvedValue(makeSoapResponse(values));

		const { result } = renderHook(() => use2faPolicies('example.com'), {
			wrapper: QueryWrapper,
		});

		await waitFor(() => expect(result.current.data).toEqual(values));
		expect(mockList2faPolicies).toHaveBeenCalledWith('example.com');
	});

	it('should expose the error when the service rejects', async () => {
		mockList2faPolicies.mockRejectedValue(new Error('boom'));

		const { result } = renderHook(() => use2faPolicies(''), {
			wrapper: QueryWrapper,
		});

		await waitFor(() => expect(result.current.error).toBeInstanceOf(Error), { timeout: 4000 });
		expect(result.current.error?.message).toBe('boom');
	});

	it('should stay disabled while the domain is undefined', async () => {
		mockList2faPolicies.mockResolvedValue(makeSoapResponse([]));

		const { result } = renderHook(() => use2faPolicies(undefined), {
			wrapper: QueryWrapper,
		});

		expect(result.current.isPending).toBe(true);
		expect(mockList2faPolicies).not.toHaveBeenCalled();
	});
});
