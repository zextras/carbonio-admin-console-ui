/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import type { GlobalConfig } from '../../types';
import { dumpGlobalConfig } from './dump-global-config';
import { backupQueryKeys } from './backup-query-keys';

export const useGlobalConfig = () =>
	useQuery({
		queryKey: backupQueryKeys.globalConfig(),
		queryFn: async (): Promise<GlobalConfig> => {
			const data = await dumpGlobalConfig();
			if (data?.Body?.response?.content) {
				const parsed = JSON.parse(data.Body.response.content);
				if (parsed?.response) {
					return parsed.response as GlobalConfig;
				}
			}
			return {};
		},
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
