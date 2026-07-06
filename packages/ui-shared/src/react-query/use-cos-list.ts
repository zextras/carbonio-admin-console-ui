/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { Attribute } from '../../types';
import { getCosList } from '../services/search-cos-service';

type CosListEntry = {
	id: string;
	name: string;
	a: Array<Attribute>;
};

type CosListResponse = {
	cos?: Array<CosListEntry>;
	searchTotal?: number;
	more?: boolean;
};

type UseCosListOptions = {
	searchQuery: string;
	limit: number;
	offset: number;
	enabled?: boolean;
};

export const useCosList = ({ searchQuery, limit, offset, enabled = true }: UseCosListOptions) => {
	return useQuery({
		queryKey: ['cos', 'list', searchQuery, limit, offset],
		queryFn: () => getCosList<CosListResponse>(searchQuery, limit, offset),
		enabled,
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
};
