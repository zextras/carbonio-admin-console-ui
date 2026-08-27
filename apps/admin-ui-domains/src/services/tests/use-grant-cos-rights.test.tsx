/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGrantAllCosRights = vi.hoisted(() => vi.fn());
const mockGrantCosRights = vi.hoisted(() => vi.fn());
const mockRevokeCosRights = vi.hoisted(() => vi.fn());

vi.mock('../grant-cos-rights', () => ({
	grantAllCosRights: mockGrantAllCosRights,
	grantCosRights: mockGrantCosRights,
	revokeCosRights: mockRevokeCosRights,
}));

import { domainQueryKeys } from '../domain-query-keys';
import { useGrantAllCosRights, useGrantCosRights, useRevokeCosRights } from '../use-grant-cos-rights';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe('useGrantCosRights', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should call the service with the COS id and domain name', async () => {
		mockGrantCosRights.mockResolvedValue(undefined);
		const { result } = renderHook(() => useGrantCosRights(), {
			wrapper: makeWrapper(new QueryClient()),
		});

		result.current.mutateAsync({ cosId: 'cos-a', domainName: 'example.com' });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(mockGrantCosRights).toHaveBeenCalledWith('cos-a', 'example.com');
	});
});

describe('useRevokeCosRights', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should call the service with the COS id and domain name', async () => {
		mockRevokeCosRights.mockResolvedValue(undefined);
		const { result } = renderHook(() => useRevokeCosRights(), {
			wrapper: makeWrapper(new QueryClient()),
		});

		result.current.mutateAsync({ cosId: 'cos-a', domainName: 'example.com' });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(mockRevokeCosRights).toHaveBeenCalledWith('cos-a', 'example.com');
	});
});

describe('useGrantAllCosRights', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should call the batch service with the domain name and COS ids', async () => {
		mockGrantAllCosRights.mockResolvedValue([]);
		const { result } = renderHook(() => useGrantAllCosRights(), {
			wrapper: makeWrapper(new QueryClient()),
		});

		result.current.mutateAsync({ domainName: 'example.com', cosIds: ['cos-a', 'cos-b'] });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(mockGrantAllCosRights).toHaveBeenCalledWith('example.com', ['cos-a', 'cos-b']);
	});

	it('should invalidate the initialized-domains queries on success', async () => {
		mockGrantAllCosRights.mockResolvedValue([]);
		const queryClient = new QueryClient();
		queryClient.setQueryData(domainQueryKeys.initializedDomains('example.com'), {
			domain: [],
			searchTotal: 0,
		});
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

		const { result } = renderHook(() => useGrantAllCosRights(), {
			wrapper: makeWrapper(queryClient),
		});

		await result.current.mutateAsync({ domainName: 'example.com', cosIds: ['cos-a'] });

		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: [...domainQueryKeys.all, 'initialized-domains'],
		});
	});

	it('should not invalidate when a grant fails', async () => {
		mockGrantAllCosRights.mockRejectedValue(new Error('grant failed'));
		const queryClient = new QueryClient();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

		const { result } = renderHook(() => useGrantAllCosRights(), {
			wrapper: makeWrapper(queryClient),
		});

		await expect(
			result.current.mutateAsync({ domainName: 'example.com', cosIds: ['cos-a'] }),
		).rejects.toThrow('grant failed');

		expect(invalidateSpy).not.toHaveBeenCalled();
	});
});
