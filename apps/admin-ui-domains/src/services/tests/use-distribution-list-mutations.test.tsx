/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockModifyDistributionList = vi.hoisted(() => vi.fn());
const mockRenameDistributionList = vi.hoisted(() => vi.fn());
const mockDeleteDistributionList = vi.hoisted(() => vi.fn());
const mockDistributionListAction = vi.hoisted(() => vi.fn());
const mockAddMailingListAliasRequest = vi.hoisted(() => vi.fn());
const mockDeleteMailingListAliasRequest = vi.hoisted(() => vi.fn());

vi.mock('../modify-distributionlist-service', () => ({
	modifyDistributionList: mockModifyDistributionList,
}));
vi.mock('../rename-distributionlist-service', () => ({
	renameDistributionList: mockRenameDistributionList,
}));
vi.mock('../delete-distribution-list', () => ({
	deleteDistributionList: mockDeleteDistributionList,
}));
vi.mock('../distribution-list-action-service', () => ({
	distributionListAction: mockDistributionListAction,
}));
vi.mock('../add-mailing-list-alias', () => ({
	addMailingListAliasRequest: mockAddMailingListAliasRequest,
}));
vi.mock('../delete-mailing-list-alias', () => ({
	deleteMailingListAliasRequest: mockDeleteMailingListAliasRequest,
}));

import { domainQueryKeys } from '../domain-query-keys';
import { useAddMailingListAlias } from '../use-add-mailing-list-alias';
import { useDeleteDistributionList } from '../use-delete-distribution-list';
import { useDeleteMailingListAlias } from '../use-delete-mailing-list-alias';
import { useDistributionListAction } from '../use-distribution-list-action';
import { useModifyDistributionList } from '../use-modify-distribution-list';
import { useRenameDistributionList } from '../use-rename-distribution-list';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

const LIST_ID = 'dl-1';

describe('distribution list mutation hooks', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('useModifyDistributionList', () => {
		it('calls the service and invalidates the distribution list query', async () => {
			mockModifyDistributionList.mockResolvedValue({});
			const queryClient = new QueryClient();
			const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

			const { result } = renderHook(() => useModifyDistributionList(LIST_ID), {
				wrapper: makeWrapper(queryClient),
			});

			const attributes = [{ n: 'displayName', _content: 'Team List' }];
			await act(async () => result.current.mutate(attributes));
			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(mockModifyDistributionList).toHaveBeenCalledWith(LIST_ID, attributes);
			expect(invalidateSpy).toHaveBeenCalledWith({
				queryKey: domainQueryKeys.distributionList(LIST_ID),
			});
		});

		it('surfaces service errors', async () => {
			mockModifyDistributionList.mockRejectedValue(new Error('boom'));
			const { result } = renderHook(() => useModifyDistributionList(LIST_ID), {
				wrapper: makeWrapper(new QueryClient()),
			});

			await act(async () => result.current.mutate([{ n: 'displayName', _content: 'x' }]));
			await waitFor(() => expect(result.current.isError).toBe(true));
			expect((result.current.error as Error).message).toBe('boom');
		});
	});

	describe('useRenameDistributionList', () => {
		it('calls the service and invalidates the distribution list query', async () => {
			mockRenameDistributionList.mockResolvedValue({});
			const queryClient = new QueryClient();
			const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

			const { result } = renderHook(() => useRenameDistributionList(LIST_ID), {
				wrapper: makeWrapper(queryClient),
			});

			await act(async () => result.current.mutate('newteam@example.com'));
			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(mockRenameDistributionList).toHaveBeenCalledWith(LIST_ID, 'newteam@example.com');
			expect(invalidateSpy).toHaveBeenCalledWith({
				queryKey: domainQueryKeys.distributionList(LIST_ID),
			});
		});
	});

	describe('useDeleteDistributionList', () => {
		it('calls the service and invalidates the distribution list query', async () => {
			mockDeleteDistributionList.mockResolvedValue({});
			const queryClient = new QueryClient();
			const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

			const { result } = renderHook(() => useDeleteDistributionList(LIST_ID), {
				wrapper: makeWrapper(queryClient),
			});

			await act(async () => result.current.mutate(undefined));
			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(mockDeleteDistributionList).toHaveBeenCalledWith(LIST_ID);
			expect(invalidateSpy).toHaveBeenCalledWith({
				queryKey: domainQueryKeys.distributionList(LIST_ID),
			});
		});
	});

	describe('useDistributionListAction', () => {
		it('calls the service with dl/action and invalidates detail and grants', async () => {
			mockDistributionListAction.mockResolvedValue({});
			const queryClient = new QueryClient();
			const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

			const { result } = renderHook(() => useDistributionListAction(LIST_ID), {
				wrapper: makeWrapper(queryClient),
			});

			const dl = { by: 'id', _content: LIST_ID };
			const action = { op: 'setRights', right: { right: 'sendToDistList', grantee: [] } };
			await act(async () => result.current.mutate({ dl, action }));
			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(mockDistributionListAction).toHaveBeenCalledWith(dl, action);
			expect(invalidateSpy).toHaveBeenCalledWith({
				queryKey: domainQueryKeys.distributionList(LIST_ID),
			});
			expect(invalidateSpy).toHaveBeenCalledWith({
				queryKey: domainQueryKeys.distributionListGrants(LIST_ID),
			});
		});
	});

	describe('useAddMailingListAlias', () => {
		it('calls the service and invalidates the distribution list query', async () => {
			mockAddMailingListAliasRequest.mockResolvedValue({});
			const queryClient = new QueryClient();
			const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

			const { result } = renderHook(() => useAddMailingListAlias(LIST_ID), {
				wrapper: makeWrapper(queryClient),
			});

			await act(async () => result.current.mutate('alias2@example.com'));
			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(mockAddMailingListAliasRequest).toHaveBeenCalledWith(LIST_ID, 'alias2@example.com');
			expect(invalidateSpy).toHaveBeenCalledWith({
				queryKey: domainQueryKeys.distributionList(LIST_ID),
			});
		});
	});

	describe('useDeleteMailingListAlias', () => {
		it('calls the service and invalidates the distribution list query', async () => {
			mockDeleteMailingListAliasRequest.mockResolvedValue({});
			const queryClient = new QueryClient();
			const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

			const { result } = renderHook(() => useDeleteMailingListAlias(LIST_ID), {
				wrapper: makeWrapper(queryClient),
			});

			await act(async () => result.current.mutate('alias1@example.com'));
			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(mockDeleteMailingListAliasRequest).toHaveBeenCalledWith(LIST_ID, 'alias1@example.com');
			expect(invalidateSpy).toHaveBeenCalledWith({
				queryKey: domainQueryKeys.distributionList(LIST_ID),
			});
		});
	});
});
