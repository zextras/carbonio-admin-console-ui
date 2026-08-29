/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	getGrant: vi.fn(),
}));

vi.mock('@zextras/ui-components', () => ({
	useSnackbar: vi.fn(),
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('../get-grant', () => ({ getGrant: mocks.getGrant }));

import { useSnackbar } from '@zextras/ui-components';

import { GRP } from '../../constants';
import {
	countGrantRights,
	useDistributionListGrantRightsCount,
} from '../use-distribution-list-grant-rights-count';
import { buildDistributionListGrantsRequest } from '../use-distribution-list-grants';

const mockCreateSnackbar = vi.fn();

const GRANT_RESPONSE = {
	grant: [
		{ right: [{ _content: 'ownDistList' }] },
		{ right: [{ _content: 'sendAsDistList' }, { _content: 'viewDistList' }] },
	],
};

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const Wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	Wrapper.displayName = 'Wrapper';
	return { wrapper: Wrapper, queryClient };
}

describe('countGrantRights', () => {
	it('sums the rights of every grant', () => {
		expect(countGrantRights(GRANT_RESPONSE)).toBe(3);
	});

	it('returns 0 when the response has no grant array', () => {
		expect(countGrantRights(undefined)).toBe(0);
		expect(countGrantRights({})).toBe(0);
	});
});

describe('useDistributionListGrantRightsCount', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
	});

	it('counts grantee and target rights together', async () => {
		mocks.getGrant.mockResolvedValue(GRANT_RESPONSE);

		const { wrapper } = createWrapper();
		const onCounted = vi.fn();
		const { result } = renderHook(
			() => useDistributionListGrantRightsCount({ onCounted }),
			{ wrapper },
		);

		result.current.mutate('dl-1');

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toBe(6);
		expect(onCounted).toHaveBeenCalledWith(6);
	});

	it('queries grants as grantee and as target', async () => {
		mocks.getGrant.mockResolvedValue({});

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useDistributionListGrantRightsCount(), {
			wrapper,
		});

		result.current.mutate('dl-1');

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(mocks.getGrant).toHaveBeenNthCalledWith(1, {
			grantee: { type: GRP, by: 'id', _content: 'dl-1', all: false },
		});
		expect(mocks.getGrant).toHaveBeenNthCalledWith(
			2,
			buildDistributionListGrantsRequest('dl-1'),
		);
	});

	it('shows an error snackbar and does not count when a request fails', async () => {
		mocks.getGrant.mockRejectedValue(new Error('boom'));

		const { wrapper } = createWrapper();
		const onCounted = vi.fn();
		const { result } = renderHook(
			() => useDistributionListGrantRightsCount({ onCounted }),
			{ wrapper },
		);

		result.current.mutate('dl-1');

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(mockCreateSnackbar).toHaveBeenCalledWith(
			expect.objectContaining({ severity: 'error', label: 'boom' }),
		);
		expect(onCounted).not.toHaveBeenCalled();
	});
});
