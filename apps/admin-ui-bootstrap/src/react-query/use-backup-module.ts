/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';
import { getSoapFetchRequest } from '@zextras/admin-ui-bootstrap';

export type BackupServer = any;

export type BackupModuleState = {
	backupModuleEnable: boolean;
	backupServerList: BackupServer[];
	isBackupModuleLicensed: boolean;
};

/**
 * Query function to fetch backup module information including server list and enablement status
 */
async function queryFn(): Promise<BackupModuleState> {
	const response = await getSoapFetchRequest(
		'/service/extension/zextras_admin/core/getAllServers?module=zxbackup'
	);
	const backupServers = (response as any)?.servers;

	const backupModuleState: BackupModuleState = {
		backupModuleEnable: backupServers && Array.isArray(backupServers) && backupServers.length > 0,
		backupServerList: backupServers || [],
		isBackupModuleLicensed:
			backupServers && Array.isArray(backupServers) && backupServers.length > 0
	};

	return backupModuleState;
}

/**
 * Hook to fetch backup module information including server list and enablement status
 */
export const useBackupModule = (options: { enabled?: boolean; isAdvanced?: boolean } = {}) => {
	const { enabled = true, isAdvanced = true } = options;

	return useQuery({
		queryKey: ['backup-module'],
		queryFn,
		enabled: enabled && isAdvanced,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: 2,
		retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchOnWindowFocus: false,
		refetchOnReconnect: true
	});
};

/**
 * Hook to get just the backup servers list
 */
export const useBackupServers = (options: { enabled?: boolean; isAdvanced?: boolean } = {}) => {
	const result = useBackupModule(options);

	return {
		...result,
		data: result.data?.backupServerList
	};
};

/**
 * Hook to get just the backup module enablement status
 */
export const useBackupModuleEnable = (
	options: { enabled?: boolean; isAdvanced?: boolean } = {}
) => {
	const result = useBackupModule(options);

	return {
		...result,
		data: result.data?.backupModuleEnable
	};
};
