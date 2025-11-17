/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';
import { soapFetch } from '@zextras/admin-ui-bootstrap';

export type Right = {
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

export type Rights = Right[];

type RightsOptions = {
	enabled?: boolean;
	userName?: string;
};

/**
 * Query function to fetch effective rights for a user
 */
const queryFn = async (userName: string): Promise<Array<Right>> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		grantee: {
			by: 'name',
			_content: userName
		}
	};

	const response = await soapFetch(`GetAllEffectiveRights`, {
		...request
	});

	return (response as any)?.target || [];
};

export const useRights = (options: RightsOptions = {}) => {
	const { enabled = true, userName } = options;

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

export const useRightsByType = (options: RightsOptions & { rightType?: string } = {}) => {
	const { rightType, ...rightsOptions } = options;
	const result = useRights(rightsOptions);

	return {
		...result,
		data: rightType ? result.data?.filter((right) => right.type === rightType) : result.data
	};
};
