/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { getSoapFetchRequest } from '../network/fetch';

type BackupServer = Record<string, any>;

type BackupServersResponse = {
	backupModuleEnable: boolean;
	backupServerList: Array<BackupServer>;
	isBackupModuleLicensed: boolean;
};

type BackupServersOptions = Omit<UseQueryOptions<BackupServersResponse>, 'queryKey' | 'queryFn'> & {
	enabled?: boolean;
};

// Query function for backup servers
const queryFn = async (): Promise<BackupServersResponse> => {
	const response = getSoapFetchRequest(
		'/service/extension/zextras_admin/core/getAllServers?module=zxbackup'
	) as any;

	const backupServers = response?.servers;
	const backupModuleEnable =
		backupServers && Array.isArray(backupServers) && backupServers.length > 0;

	return {
		backupModuleEnable,
		backupServerList: backupModuleEnable ? (backupServers as Array<BackupServer>) : [],
		isBackupModuleLicensed: backupModuleEnable
	};
};

export const useBackupServers = (options: BackupServersOptions = {}) => {
	const { enabled = true, ...queryOptions } = options;

	return useQuery({
		queryKey: ['backup-servers'],
		queryFn,
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: 2,
		retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
		...queryOptions
	});
};
