/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { searchDirectory } from '@zextras/ui-shared';

import { cosQueryKeys } from './cos-query-keys';
import { generateAccountSearchFilterQuery } from './cos-search-utils';

const ACCOUNT_ATTRS =
	'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraCreateTimestamp,zimbraLastLogonTimestamp,zimbraMailQuota,zimbraNotes,mail';

export const useCosAccounts = (
	cosId: string | undefined,
	searchStr: string,
	offset: number,
	limit: number,
) => {
	return useQuery({
		queryKey: cosQueryKeys.accounts(cosId ?? '', searchStr, offset, limit),
		queryFn: async () => {
			const query = generateAccountSearchFilterQuery(searchStr, cosId);
			const data = await searchDirectory({
				attr: ACCOUNT_ATTRS,
				type: 'accounts',
				domainName: '',
				query,
				offset,
				limit,
			});
			return {
				accounts: data?.account ?? [],
				total: data?.searchTotal ?? 0,
			};
		},
		enabled: !!cosId,
		placeholderData: keepPreviousData,
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
};
