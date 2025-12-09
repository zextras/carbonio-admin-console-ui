/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';
import { find } from 'lodash';

import { CONFIG } from '../constants';
import { soapFetch } from '../network/fetch';
import { useUserAccounts } from './use-account';

type Right = {
	type: string;
	all: Array<{
		right?: {
			n: string;
		}[];
		setAttrs?: {
			all: boolean;
		}[];
		getAttrs?: {
			all: boolean;
		}[];
	}>;
	inDomains?: Array<{
		rights: Array<{
			right?: {
				n: string;
			}[];
		}>;
	}>;
};

type RightsOptions = {
	enabled?: boolean;
	userName?: string;
};

// Query function to fetch effective rights for a user
const queryFn = async (userName: string): Promise<Array<Right>> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		grantee: {
			by: 'name',
			_content: userName
		}
	};

	const response = await soapFetch('GetAllEffectiveRights', {
		...request
	});

	return (response as any)?.target || [];
};

const useRights = ({ enabled = true, userName }: RightsOptions = {}) => {
	return useQuery({
		queryKey: ['effective-rights', userName],
		queryFn: () => queryFn(userName || ''),
		enabled: enabled && Boolean(userName),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: 2,
		retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchOnWindowFocus: false,
		refetchOnReconnect: true
	});
};

export const useHasRight = (
	options: RightsOptions & { rightType?: string; rightName?: string } = {}
) => {
	const { rightType, rightName, ...rightsOptions } = options;
	const result = useRights(rightsOptions);

	return {
		...result,
		data: Boolean(
			result.data?.some(
				(right) =>
					rightType &&
					right.type === rightType &&
					rightName &&
					(right.all?.[0] as any)?.right?.some((r: any) => r.n === rightName)
			)
		)
	};
};

export const useHasAllRights = () => {
	const accounts = useUserAccounts();
	const userName = accounts?.[0]?.name || '';

	const { data: rights } = useRights({
		userName,
		enabled: Boolean(userName)
	});

	const rightsConfig: Right = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
	return !!(
		rightsConfig?.all?.[0]?.getAttrs?.[0]?.all || rightsConfig?.all?.[0]?.setAttrs?.[0]?.all
	);
};

export const useRightsByType = (options: RightsOptions & { rightType?: string } = {}) => {
	const { rightType, ...rightsOptions } = options;
	const result = useRights(rightsOptions);

	return {
		...result,
		data: rightType ? result.data?.filter((right) => right.type === rightType) : result.data
	};
};

// Utility function to extract rights of a specific type from the rights array
export const getRights = (rights: Right[], type: string): Array<{ n?: string }> => {
	let right: Array<{ n?: string }> = [];
	const filteredType = rights.filter((item) => item?.type === type);

	if (filteredType && filteredType.length > 0) {
		if (
			filteredType[0]?.all &&
			Array.isArray(filteredType[0]?.all) &&
			filteredType[0]?.all.length > 0
		) {
			right = filteredType[0]?.all[0].right || [];
		}
	}
	return right;
};

// Utility function to get all rights of a specific type
export const getAllRights = (rights: Right[], type: string): Right[] =>
	rights.filter((item) => item?.type === type);

export const useCurrentUserRights = () => {
	const accounts = useUserAccounts();
	const userName = accounts?.[0]?.name || '';

	const result = useRights({
		userName,
		enabled: Boolean(userName)
	});

	return {
		...result,
		data: result.data || []
	};
};
