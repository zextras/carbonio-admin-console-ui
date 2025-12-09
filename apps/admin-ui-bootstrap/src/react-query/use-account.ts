/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { get, join } from 'lodash';
import { useMemo } from 'react';

import { Account, AccountSettings } from '../../types';
import { fetchAccountInfo, fetchAccountSettings } from '../network/account-api';
import { queryClient } from '../providers/react-query-provider';

const accountQueryKeys = {
	all: ['account'] as const,
	info: () => [...accountQueryKeys.all, 'info'] as const,
	settings: () => [...accountQueryKeys.all, 'settings'] as const,
	version: () => [...accountQueryKeys.all, 'version'] as const,
	complete: () => [...accountQueryKeys.all, 'complete'] as const
} as const;

type UseAccountOptions = Omit<UseQueryOptions<Account, Error>, 'queryKey' | 'queryFn'> & {
	enabled?: boolean;
};

type UseAccountSettingsOptions = Omit<
	UseQueryOptions<AccountSettings, Error>,
	'queryKey' | 'queryFn'
> & {
	enabled?: boolean;
};

const useAccount = (options: UseAccountOptions = {}) => {
	return useQuery({
		queryKey: accountQueryKeys.info(),
		queryFn: fetchAccountInfo,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: 2,
		retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
		...options
	});
};

const useAccountSettings = (options: UseAccountSettingsOptions = {}) => {
	return useQuery({
		queryKey: accountQueryKeys.settings(),
		queryFn: fetchAccountSettings,
		staleTime: 30 * 60 * 1000, // 30 minutes - settings change less frequently
		gcTime: 60 * 60 * 1000, // 1 hour
		retry: 2,
		retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
		...options
	});
};

export const useUserAccount = (): Account | undefined => {
	const { data: account } = useAccount();
	return account;
};

export const useUserAccounts = (): Array<Account> => {
	const account = useUserAccount();
	return useMemo(() => (account ? [account] : []), [account]);
};

const getUserSettingsDirect = (): AccountSettings => {
	try {
		const settings = queryClient.getQueryData(['account', 'settings']) as AccountSettings;
		return (
			settings || {
				attrs: {},
				prefs: {},
				props: []
			}
		);
	} catch {
		return {
			attrs: {},
			prefs: {},
			props: []
		};
	}
};

export const useUserSettings = (): AccountSettings => {
	const { data: settings } = useAccountSettings({
		initialData: getUserSettingsDirect()
	});
	return settings as AccountSettings;
};

export const getUserSetting = <T = void>(...paths: Array<string>): string | T => {
	const queryClient = useQueryClient();
	const settings = queryClient.getQueryData<AccountSettings>(accountQueryKeys.settings());

	if (!settings) {
		return undefined as T;
	}

	return get(settings, join(paths, '.'));
};
