/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	buildFilterChips,
	Button,
	type DataTableColumnDef,
	DataTableCustomize,
	DataTableFilterChips,
	type DataTableFilterDef,
	DataTableFilters,
	DataTableLiveRegion,
	DataTablePagination,
	DataTableRoot,
	type DataTableRowAction,
	DataTableSearch,
	DataTableTable,
	DataTableTableFooter,
	DataTableToolbar,
	removeFilterChip,
	StatusBadge,
} from '@zextras/ui-components';
import {
	enumFilterValues,
	replaceHistory,
	resolveTableStatus,
	useDebouncedValue,
} from '@zextras/ui-shared';
import { format } from 'date-fns';
import { noop } from 'lodash-es';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	ACCOUNTS,
	ASC,
	CREATE_NEW_DOMAIN_ROUTE_ID,
	DESC,
	RECORD_DISPLAY_LIMIT,
} from '../../../constants';
import { useQueryErrorSnackbar } from '../../../hooks/use-query-error-snackbar';
import { useServerTableState } from '../../../hooks/use-server-table-state';
import { useDomainListDirectory } from '../../../services/use-domain-list-directory';
import { getAccountStatusBadgeTone, getStatusDisplay } from '../../../utils/status';
import { getDateFromStr } from '../../utility/utils';
import { DomainRowItem, flattenDomainAttributes } from './domain-list-row';
import styles from './domains.module.css';

const DOMAIN_SORTABLE_IDS = new Set(['name', 'created']);

const NAME_SORT: Array<{ id: string; desc: boolean }> = [{ id: 'name', desc: false }];

type DomainSortState = Array<{ id: string; desc: boolean }>;

const DOMAIN_STATUS_IDS = [
	'active',
	'maintenance',
	'locked',
	'closed',
	'pending',
	'lockout',
	'suspended',
] as const;

function joinLdapFragments(fragments: Array<string>): string {
	if (fragments.length === 0) {
		return '';
	}
	const joined = fragments.join('');
	return fragments.length > 1 ? `(|${joined})` : joined;
}

function statusFilterToLdap(statusIds: Array<string>): string {
	const fragments = statusIds.map((status) => `(&(zimbraDomainStatus=${status}))`);
	return joinLdapFragments(fragments);
}

function buildSearchFilterQuery(searchStr: string, statusFilter: string): string {
	let filterQuery = '';
	if (statusFilter) {
		filterQuery += statusFilter;
	}
	if (searchStr) {
		filterQuery += `(|(zimbraDomainName=*${searchStr}*))`;
	}
	if (statusFilter && searchStr) {
		return `(&${filterQuery})`;
	}
	return filterQuery;
}

function sortingToDomainParams(sorting: DomainSortState): {
	sortBy: string;
	sortAscending: typeof ASC | typeof DESC;
} {
	const entry = sorting.find((item) => DOMAIN_SORTABLE_IDS.has(item.id)) ?? NAME_SORT[0];
	const sortBy = entry.id === 'created' ? 'zimbraCreateTimestamp' : 'zimbraDomainName';
	return {
		sortBy,
		sortAscending: entry.desc ? DESC : ASC,
	};
}

function formatDomainCreatedAt(timestamp: string): string {
	if (!timestamp) {
		return '';
	}
	try {
		const date = getDateFromStr(timestamp) as Date | null;
		if (!date || Number.isNaN(date.getTime())) {
			return '';
		}
		return format(date, 'dd/MM/yyyy');
	} catch {
		return '';
	}
}

type DomainCellProps = {
	row: { original: DomainRowItem };
};

const DomainNameCell = ({ row }: DomainCellProps) => (
	<ds-text as="span" size="small" color="gray0" weight="regular">
		{row.original.name || ' '}
	</ds-text>
);

const DomainStatusCell = ({ row }: DomainCellProps) => {
	const { t } = useTranslation();
	const status = row.original.zimbraDomainStatus;
	const { label: statusLabel } = getStatusDisplay(status, t);
	return <StatusBadge tone={getAccountStatusBadgeTone(status)} label={statusLabel} />;
};

const DomainDescriptionCell = ({ row }: DomainCellProps) => {
	const description = row.original.description || '\u00a0';
	return (
		<ds-text as="span" size="small" weight="light" color="gray0">
			{description}
		</ds-text>
	);
};

const DomainCreatedCell = ({ row }: DomainCellProps) => (
	<ds-text as="span" size="small" color="gray0" weight="light">
		{formatDomainCreatedAt(row.original.zimbraCreateTimestamp) || '\u00a0'}
	</ds-text>
);

export const GlobalDomainList = () => {
	const [t] = useTranslation();
	const [totalRowCount, setTotalRowCount] = useState<number | undefined>();

	const {
		sorting,
		setSorting,
		pagination,
		setPagination,
		searchString,
		setSearchString,
		filters,
		setFilters,
	} = useServerTableState({
		pageSize: RECORD_DISPLAY_LIMIT,
		initialSorting: NAME_SORT,
		totalRowCount,
	});

	const statusFilter = statusFilterToLdap(enumFilterValues(filters, 'status'));
	const debouncedSearch = useDebouncedValue(searchString, 700);
	const searchQuery = buildSearchFilterQuery(debouncedSearch, statusFilter);
	const { sortBy, sortAscending } = sortingToDomainParams(sorting);

	const { data, isPending, isError, error, refetch } = useDomainListDirectory({
		query: searchQuery,
		offset: pagination.pageIndex * pagination.pageSize,
		limit: pagination.pageSize,
		sortBy,
		sortAscending,
	});

	if (data?.total !== totalRowCount) {
		setTotalRowCount(data?.total);
	}

	useQueryErrorSnackbar(error);

	const domains: Array<DomainRowItem> = (data?.domains ?? []).map(flattenDomainAttributes);
	const totalDomain = data?.total ?? 0;
	const tableStatus = resolveTableStatus(isPending, isError, domains.length);

	function openDomain(domain: DomainRowItem): void {
		replaceHistory(`/${domain.id}/${ACCOUNTS}`);
	}

	function handleSortingChange(
		updater: DomainSortState | ((prev: DomainSortState) => DomainSortState),
	): void {
		setSorting((prev) => {
			const next = typeof updater === 'function' ? updater(prev) : updater;
			const sortableOnly = next
				.filter((entry) => DOMAIN_SORTABLE_IDS.has(entry.id))
				.slice(0, 1);
			return sortableOnly.length > 0 ? sortableOnly : NAME_SORT;
		});
	}

	const filterDefs: Array<DataTableFilterDef> = [
		{
			id: 'status',
			label: t('label.status', 'Status'),
			type: 'enum',
			options: DOMAIN_STATUS_IDS.map((value) => {
				const { label } = getStatusDisplay(value, t);
				return { label, value };
			}),
		},
	];

	const rowActions: Array<DataTableRowAction> = [
		{ id: 'open', label: t('label.open_domain', 'Open domain') },
	];

	const columns: Array<DataTableColumnDef<DomainRowItem>> = [
		{
			id: 'name',
			accessorKey: 'name',
			header: t('label.domain', 'Domain'),
			enableSorting: true,
			meta: { width: '30%', fixed: true, primary: true, copyable: true },
			cell: DomainNameCell,
		},
		{
			id: 'status',
			accessorFn: (row) => row.zimbraDomainStatus,
			header: t('label.status', 'Status'),
			enableSorting: false,
			meta: { width: '12rem' },
			cell: DomainStatusCell,
		},
		{
			id: 'description',
			accessorFn: (row) => row.description,
			header: t('label.description', 'Description'),
			enableSorting: false,
			meta: { width: '30%' },
			cell: DomainDescriptionCell,
		},
		{
			id: 'created',
			accessorFn: (row) => row.zimbraCreateTimestamp,
			header: t('label.created', 'Created'),
			enableSorting: true,
			meta: { width: '10rem' },
			cell: DomainCreatedCell,
		},
	];

	const filterChips = buildFilterChips(filters, filterDefs);
	const showPaginationControls = totalDomain > RECORD_DISPLAY_LIMIT;

	return (
		<div className={styles.page}>
			<div className={styles.headerOuterRow}>
				<div className={styles.headerBar}>
					<div className={styles.headerRow}>
						<div className={styles.headerSide}>
							<div className={styles.headerTitles}>
								<ds-text as="h1" size="medium" weight="bold" color="gray0">
									{t('domain.domains.title', 'Domains')}
								</ds-text>
								<ds-text as="p" size="small" weight="light" color="gray1">
									{t('domain.domains.count', '{{count}} domains', {
										count: totalDomain,
									})}
								</ds-text>
							</div>
						</div>
						<div className={styles.headerActions}>
							<Button
								color="primary"
								icon="Plus"
								iconPlacement="left"
								label={t('label.create_domain', 'Create domain')}
								style={{ textTransform: 'none' }}
								onClick={(): void => {
									replaceHistory(`/${CREATE_NEW_DOMAIN_ROUTE_ID}`);
								}}
							/>
						</div>
					</div>
				</div>
			</div>
			<div className={styles.dividerRow}>
				<ds-divider></ds-divider>
			</div>
			<div className={styles.scrollArea}>
				<div className={styles.contentRow}>
					<div className={styles.tablePanel}>
						<div className={styles.tableRow}>
							<DataTableRoot
								data={domains}
								columns={columns}
								getRowId={(row) => row.id}
								primaryColumnId="name"
								getRowLabel={(domain) => domain.name}
								manualSorting
								manualPagination
								manualFiltering
								rowCount={totalDomain}
								persistenceKey="admin.domains.global-domain-list"
								state={{ sorting, pagination }}
								onSortingChange={handleSortingChange}
								onPaginationChange={setPagination}
								rowActions={rowActions}
								rowActionsMode="direct"
								onRowAction={({ action, row }) => {
									if (action.id === 'open') {
										openDomain(row);
									}
								}}
							>
								<DataTableLiveRegion />
								<DataTableToolbar>
									<DataTableSearch
										value={searchString}
										onSearchChange={setSearchString}
										placeholder={t(
											'label.i_am_looking_for_this_domain',
											`I'm looking for this domain…`,
										)}
										label={t(
											'label.i_am_looking_for_this_domain',
											`I'm looking for this domain…`,
										)}
									/>
									<DataTableFilters
										filterDefs={filterDefs}
										filters={filters}
										onFiltersChange={setFilters}
										onApplyResetSelection={noop}
									/>
									<DataTableCustomize />
								</DataTableToolbar>
								{filterChips.length > 0 && (
									<DataTableFilterChips
										chips={filterChips}
										onRemoveChip={(chip) => {
											setFilters(removeFilterChip(filters, chip));
										}}
										onClearAll={() => {
											setFilters({});
										}}
									/>
								)}
								<DataTableTable
									aria-label={t('domain.domains.title', 'Domains')}
									status={tableStatus}
									onRetry={() => {
										void refetch();
									}}
									onRowClick={openDomain}
									emptyTitle={t('label.this_list_is_empty', 'This list is empty.')}
									emptyDescription={
										<Trans
											i18nKey="label.create_domain_list_msg"
											defaults="You can create a new Domain by clicking on <bold>Create</bold> button on header menu"
											components={{ bold: <strong /> }}
										/>
									}
									errorTitle={t('label.something_went_wrong', 'Something went wrong')}
									errorDescription={t(
										'label.could_not_load_domains',
										'We could not load domains. Try again.',
									)}
									retryLabel={t('label.retry', 'Retry')}
								/>
								{tableStatus !== 'loading' &&
									tableStatus !== 'error' &&
									(showPaginationControls ? (
										<DataTablePagination />
									) : (
										<DataTableTableFooter paginationThreshold={RECORD_DISPLAY_LIMIT} />
									))}
							</DataTableRoot>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
