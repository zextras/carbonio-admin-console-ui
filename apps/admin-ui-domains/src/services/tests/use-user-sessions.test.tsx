/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetSessions = vi.hoisted(() => vi.fn());

vi.mock('../get-sessions', () => ({
	getSessions: mockGetSessions,
}));

import { parseUserSessions, useUserSessions } from '../use-user-sessions';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

function makeSessionsResponse(sessions: Array<unknown> | undefined): unknown {
	return sessions ? { s: sessions } : {};
}

describe('parseUserSessions', () => {
	it('should filter by account name and map to UserSession shape', () => {
		const res = makeSessionsResponse([
			{ name: 'user@example.com', sid: 'sid-1', zid: 'zid-1' },
			{ name: 'other@example.com', sid: 'sid-2', zid: 'zid-2' },
			{ name: 'user@example.com', sid: 'sid-3', zid: 'zid-3' },
		]);

		expect(parseUserSessions(res, 'user@example.com')).toEqual([
			{ ip: '', name: 'user@example.com', sid: 'sid-1', service: '', zid: 'zid-1' },
			{ ip: '', name: 'user@example.com', sid: 'sid-3', service: '', zid: 'zid-3' },
		]);
	});

	it('should return an empty array when there are no sessions', () => {
		expect(parseUserSessions(makeSessionsResponse(undefined), 'user@example.com')).toEqual([]);
		expect(parseUserSessions({}, 'user@example.com')).toEqual([]);
	});
});

describe('useUserSessions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should merge the admin, imap and soap session lists', async () => {
		const session = { name: 'user@example.com', sid: 'sid-1', zid: 'zid-1' };
		mockGetSessions.mockImplementation(async (type: string) => {
			if (type === 'admin') return makeSessionsResponse([session]);
			if (type === 'imap') return makeSessionsResponse([session]);
			return makeSessionsResponse(undefined);
		});

		const { result } = renderHook(() => useUserSessions('user@example.com'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		const expected = [
			{ ip: '', name: 'user@example.com', sid: 'sid-1', service: '', zid: 'zid-1' },
			{ ip: '', name: 'user@example.com', sid: 'sid-1', service: '', zid: 'zid-1' },
		];
		await waitFor(() => expect(result.current.data).toEqual(expected));
		expect(mockGetSessions).toHaveBeenCalledTimes(3);
		expect(mockGetSessions).toHaveBeenCalledWith('admin', 'user@example.com');
		expect(mockGetSessions).toHaveBeenCalledWith('imap', 'user@example.com');
		expect(mockGetSessions).toHaveBeenCalledWith('soap', 'user@example.com');
	});

	it('should stay disabled while the account name is undefined', async () => {
		mockGetSessions.mockResolvedValue({});

		const { result } = renderHook(() => useUserSessions(undefined), {
			wrapper: makeWrapper(new QueryClient()),
		});

		expect(result.current.isPending).toBe(true);
		expect(mockGetSessions).not.toHaveBeenCalled();
	});
});
