/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getDomainInformation } from '../services/get-domain-information';

export const domainByIdKey = (domainId?: string, applyConfig = 1) =>
	['domain', 'by-id', domainId, applyConfig] as const;

type UseDomainByIdOptions = {
	domainId?: string;
	applyConfig?: number;
	enabled?: boolean;
};

export const useDomainById = <T = unknown>({
	domainId,
	applyConfig = 1,
	enabled = true,
}: UseDomainByIdOptions) => {
	return useQuery<T>({
		queryKey: domainByIdKey(domainId, applyConfig),
		queryFn: async () => {
			const response = await getDomainInformation(domainId as string, applyConfig);
			return response?.domain?.[0];
		},
		enabled: enabled && Boolean(domainId),
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
};
