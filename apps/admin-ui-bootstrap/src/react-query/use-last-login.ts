/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';
import moment from 'moment';

import { soapFetch } from '../network/fetch';

type LastLoginTimestampOptions = {
	enabled?: boolean;
	accountId?: string;
};

/**
 * Hook to fetch and format the last login timestamp for a user account
 */
export const useLastLoginTimestamp = (options: LastLoginTimestampOptions = {}) => {
	const { enabled = true, accountId } = options;

	async function queryFn(): Promise<string> {
		const response = await soapFetch('GetAccount', {
			_jsns: 'urn:zimbraAdmin',
			account: [
				{
					_content: accountId || '',
					by: accountId ? 'id' : 'name'
				}
			],
			applyCos: 0,
			attrs: 'zimbraLastLogonTimestamp'
		});

		const lastLoginAttribute = (response as any)?.account?.[0]?.a?.find(
			(attr: any) => attr.n === 'zimbraLastLogonTimestamp'
		);

		if (!lastLoginAttribute?._content) {
			return '';
		}

		return moment(lastLoginAttribute._content, 'YYYYMMDDHHmmss.SSSZ').format(
			'dddd DD MMM YYYY | h:mm a'
		);
	}

	return useQuery({
		queryKey: ['last-login-timestamp', accountId],
		queryFn,
		enabled: enabled && Boolean(accountId),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: 2,
		retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchOnWindowFocus: false,
		refetchOnReconnect: true
	});
};
