/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getSessions } from './get-sessions';

export type UserSession = {
	name: string;
	sid: string;
	zid: string;
	ip: string;
	service: string;
};

const SESSION_TYPES = ['admin', 'imap', 'soap'] as const;

export function parseUserSessions(res: any, accountName: string): Array<UserSession> {
	const sessions = res?.s;
	if (!sessions) {
		return [];
	}
	return sessions
		.filter((sessionItem: any) => sessionItem?.name === accountName)
		.map((sessionItem: any) => ({
			ip: '',
			name: sessionItem?.name,
			sid: sessionItem?.sid,
			service: '',
			zid: sessionItem?.zid,
		}));
}

export const useUserSessions = (accountName: string | undefined) =>
	useQuery({
		queryKey: domainQueryKeys.userSessions(accountName ?? ''),
		queryFn: async () => {
			const responses = await Promise.all(
				SESSION_TYPES.map((type) => getSessions(type, accountName!)),
			);
			return responses.flatMap((res) => parseUserSessions(res, accountName!));
		},
		enabled: !!accountName,
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
