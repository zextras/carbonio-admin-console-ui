/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSet2faPolicies = vi.hoisted(() => vi.fn());

vi.mock('../set-2fa-policies', () => ({
	set2faPolicies: mockSet2faPolicies,
}));

import { domainQueryKeys } from '../domain-query-keys';
import { parseSet2faResponse, useSet2faPolicies } from '../use-set-2fa-policies';

function makeEnvelope(content: unknown): unknown {
	return {
		Body: {
			response: {
				content: JSON.stringify(content),
			},
		},
	};
}

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

const INPUT = { service: 'WebUI', trustedDevice: 1, trustedIpRange: 'empty' };

describe('parseSet2faResponse', () => {
	it('should extract ok and message from the zextras content envelope', () => {
		expect(parseSet2faResponse(makeEnvelope({ ok: 'ok', message: 'ok' }))).toEqual({
			ok: true,
			message: 'ok',
			error: undefined,
		});
	});

	it('should return ok=false with error when the response is not ok', () => {
		expect(parseSet2faResponse(makeEnvelope({ ok: false, error: 'denied' }))).toEqual({
			ok: false,
			message: undefined,
			error: 'denied',
		});
	});

	it('should tolerate missing content', () => {
		expect(parseSet2faResponse({ Body: {} })).toEqual({
			ok: false,
			message: undefined,
			error: undefined,
		});
	});
});

describe('useSet2faPolicies', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should call the service, return the message, and invalidate the policies query', async () => {
		mockSet2faPolicies.mockResolvedValue(makeEnvelope({ ok: 'ok', message: 'ok' }));
		const queryClient = new QueryClient();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

		const { result } = renderHook(() => useSet2faPolicies('example.com'), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate(INPUT));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mockSet2faPolicies).toHaveBeenCalledWith('example.com', 'WebUI', 1, 'empty');
		expect(result.current.data).toEqual({ message: 'ok' });
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.twoFactorPolicies('example.com'),
		});
	});

	it('should throw with the response error when the policy update is rejected', async () => {
		mockSet2faPolicies.mockResolvedValue(makeEnvelope({ ok: false, error: 'denied' }));
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useSet2faPolicies('example.com'), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate(INPUT));
		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.error).toBeInstanceOf(Error);
		expect((result.current.error as Error).message).toBe('denied');
	});
});
