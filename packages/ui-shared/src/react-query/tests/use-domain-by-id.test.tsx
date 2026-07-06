/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { domainByIdKey, useDomainById } from '../use-domain-by-id';

vi.mock('../../network/fetch', () => ({
	soapFetch: vi.fn(),
}));

const { soapFetch } = await import('../../network/fetch');

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const Wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	Wrapper.displayName = 'Wrapper';
	return Wrapper;
}

describe('domainByIdKey', () => {
	it('should build the correct key with default applyConfig', () => {
		expect(domainByIdKey('domain-1')).toEqual(['domain', 'by-id', 'domain-1', 1]);
	});

	it('should build the correct key with custom applyConfig', () => {
		expect(domainByIdKey('domain-1', 0)).toEqual(['domain', 'by-id', 'domain-1', 0]);
	});

	it('should handle undefined domainId', () => {
		expect(domainByIdKey(undefined)).toEqual(['domain', 'by-id', undefined, 1]);
	});
});

describe('useDomainById', () => {
	it('should fetch domain by id and return the first domain', async () => {
		const mockDomain = { id: 'domain-1', name: 'example.com', a: [] };
		vi.mocked(soapFetch).mockResolvedValue({ domain: [mockDomain] });

		const wrapper = createWrapper();
		const { result } = renderHook(() => useDomainById({ domainId: 'domain-1' }), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(soapFetch).toHaveBeenCalledWith('GetDomain', {
			_jsns: 'urn:zimbraAdmin',
			domain: { by: 'id', _content: 'domain-1' },
			applyConfig: 1,
		});
		expect(result.current.data).toEqual(mockDomain);
	});

	it('should not fetch when domainId is undefined', () => {
		const wrapper = createWrapper();
		const { result } = renderHook(() => useDomainById({ domainId: undefined }), { wrapper });

		expect(result.current.fetchStatus).toBe('idle');
		expect(soapFetch).not.toHaveBeenCalled();
	});

	it('should not fetch when enabled is false', () => {
		const wrapper = createWrapper();
		const { result } = renderHook(
			() => useDomainById({ domainId: 'domain-1', enabled: false }),
			{ wrapper },
		);

		expect(result.current.fetchStatus).toBe('idle');
		expect(soapFetch).not.toHaveBeenCalled();
	});

	it('should handle fetch errors', async () => {
		vi.mocked(soapFetch).mockRejectedValue(new Error('Fetch failed'));

		const wrapper = createWrapper();
		const { result } = renderHook(() => useDomainById({ domainId: 'domain-err' }), { wrapper });

		await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });
		expect(result.current.error).toBeInstanceOf(Error);
	});
});
