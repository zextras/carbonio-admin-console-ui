/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetSingatures = vi.hoisted(() => vi.fn());

vi.mock('../get-signature-service', () => ({
	getSingatures: mockGetSingatures,
}));

import { parseSignatures, useSignatures } from '../use-signatures';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe('parseSignatures', () => {
	it('should extract the signature array from the envelope', () => {
		const signatures = [{ id: 'sig-1', name: 'default' }];
		expect(
			parseSignatures({ Body: { GetSignaturesResponse: { signature: signatures } } }),
		).toEqual(signatures);
	});

	it('should return an empty array for missing envelopes', () => {
		expect(parseSignatures({ Body: {} })).toEqual([]);
		expect(parseSignatures(undefined)).toEqual([]);
	});
});

describe('useSignatures', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return parsed signatures for the account', async () => {
		const signatures = [{ id: 'sig-1', name: 'default' }];
		mockGetSingatures.mockResolvedValue({
			Body: { GetSignaturesResponse: { signature: signatures } },
		});

		const { result } = renderHook(() => useSignatures('account-1'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.data).toEqual(signatures));
		expect(mockGetSingatures).toHaveBeenCalledWith('account-1');
	});

	it('should stay disabled while the account id is undefined', async () => {
		mockGetSingatures.mockResolvedValue({ Body: {} });

		const { result } = renderHook(() => useSignatures(undefined), {
			wrapper: makeWrapper(new QueryClient()),
		});

		expect(result.current.isPending).toBe(true);
		expect(mockGetSingatures).not.toHaveBeenCalled();
	});
});
