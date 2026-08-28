/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { searchDirectory } from '@zextras/ui-shared';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ASC, DESC, RECORD_DISPLAY_LIMIT } from '../../../constants';
import { domainQueryKeys } from '../../../services/domain-query-keys';
import { generateSnackbarFromError } from '../../error/generate-snackbar-error';
import { useDebouncedValue } from './edit-mailing-detail/hooks/use-debounced-value';
import { buildSearchFilterQuery } from './mailing-list-query';

/**
 * Owns the distribution list search: free-text (debounced) + status filter,
 * sorting and paging state, and the cached `searchDirectory` query.
 */
export function useDistributionListsSearch(domainName: string | undefined) {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const [searchString, setSearchString] = useState<string>('');
	const [statusFilter, setStatusFilter] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);
	const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
	const [sortedColumn, setSortedColumn] = useState<string>('displayName');
	const [sortOrder, setSortOrder] = useState<typeof ASC | typeof DESC>(ASC);

	const debouncedSearchString = useDebouncedValue(searchString);
	const searchQuery = buildSearchFilterQuery(debouncedSearchString, statusFilter);

	const listsQuery = useQuery({
		queryKey: [
			...domainQueryKeys.distributionLists(),
			domainName,
			searchQuery,
			offset,
			limit,
			sortedColumn,
			sortOrder
		],
		queryFn: async () => {
			const attrs =
				'displayName,zimbraId,zimbraMailHost,uid,description,zimbraMailStatus,zimbraHideInGal';
			const types = 'distributionlists,dynamicgroups';
			try {
				return await searchDirectory({
					attr: attrs,
					type: types,
					domainName: domainName || '',
					query: `${searchQuery}(&(!(zimbraIsAdminGroup=TRUE)))`,
					offset,
					limit,
					sortBy: sortedColumn,
					sortAscending: sortOrder
				});
			} catch (error: any) {
				createSnackbar(generateSnackbarFromError(error, t));
				throw error;
			}
		},
		placeholderData: keepPreviousData
	});

	const mailingListStatusFilter: Array<{ label: string; value: string }> = useMemo(
		() => [
			{
				label: t('domain.mailingList.canReceive', 'Can Receive'),
				value: '(&(zimbraMailStatus=enabled))'
			},
			{
				label: t('domain.mailingList.cantReceive', "Can't Receive"),
				value: '(&(zimbraMailStatus=disabled))'
			}
		],
		[t]
	);

	const headers: Array<any> = useMemo(
		() => [
			{
				id: 'displayName',
				label: t('label.display_name', 'DisplayName'),
				width: '20%',
				bold: true,
				sortable: true,
				onSortChange: (id: string, order: typeof ASC | typeof DESC): void => {
					setSortOrder(order);
					setSortedColumn(id);
				}
			},
			{
				id: 'name',
				label: t('label.address', 'Address'),
				width: '20%',
				bold: true,
				sortable: true,
				onSortChange: (id: string, order: typeof ASC | typeof DESC): void => {
					setSortOrder(order);
					setSortedColumn(id);
				}
			},
			{
				id: 'status',
				label: t('label.status', 'Status'),
				width: '15%',
				i18nAllLabel: t('label.all', 'All'),
				bold: true,
				items: [
					{ label: mailingListStatusFilter[0].label, value: mailingListStatusFilter[0].value },
					{ label: mailingListStatusFilter[1].label, value: mailingListStatusFilter[1].value }
				],
				onChange: (e: any) => {
					if (e?.length > 0) {
						let statusQuery = '';
						e.forEach((item: { value: string }) => {
							statusQuery += item.value;
						});
						if (e?.length > 1) {
							statusQuery = `(|${statusQuery})`;
						}
						setStatusFilter(statusQuery);
					} else {
						setStatusFilter('');
					}
				}
			},
			{
				id: 'dynamic',
				label: t('label.dynamic', 'Dynamic'),
				width: '7%',
				bold: true
			},
			{
				id: 'gal',
				label: t('label.gal', 'GAL'),
				width: '7%',
				bold: true
			},
			{
				id: 'description',
				label: t('label.description', 'Description'),
				width: '15%',
				bold: true
			}
		],
		[mailingListStatusFilter, t]
	);

	return {
		lists: listsQuery.data?.dl ?? [],
		totalAccount: listsQuery.data?.searchTotal ?? 0,
		isFetching: listsQuery.isFetching,
		hasError: listsQuery.isError,
		headers,
		searchString,
		setSearchString,
		setOffset,
		setLimit,
		limit
	};
}
