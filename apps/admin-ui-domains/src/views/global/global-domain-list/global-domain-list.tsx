/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	buildFilterChips,
	type DataTableBulkAction,
	type DataTableBulkActionEvent,
	DataTableBulkBar,
	type DataTableColumnDef,
	DataTableCustomize,
	DataTableFilterChips,
	type DataTableFilterDef,
	DataTableFilters,
	DataTableLiveRegion,
	DataTablePagination,
	DataTablePeekPanel,
	DataTableRoot,
	type DataTableRowAction,
	DataTableSearch,
	DataTableTable,
	DataTableTableFooter,
	DataTableToolbar,
	removeFilterChip,
	useSnackbar,
} from '@zextras/ui-components';
import {
	enumFilterValues,
	replaceHistory,
	resolveTableStatus,
	type SoapEntity,
	useDebouncedValue,
} from '@zextras/ui-shared';
import { noop } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ACCOUNTS, RECORD_DISPLAY_LIMIT } from '../../../constants';
import { useQueryErrorSnackbar } from '../../../hooks/use-query-error-snackbar';
import { useServerTableState } from '../../../hooks/use-server-table-state';
import { useDomainSearch } from '../../../services/use-domain-search';
import { attributesToObject, parseDomainAttributes } from '../../../utils/attributes';
import { getStatusDisplay } from '../../../utils/status';
import styles from './global-domain-list.module.css';

type DomainSortState = Array<{ id: string; desc: boolean }>;

type BulkUndoPayload = { undo?: { message: string; onUndo: () => void } } | undefined;

const DOMAIN_STATUS_VALUES = ['active', 'closed', 'locked', 'maintenance', 'suspended'] as const;

const NAME_SORT: DomainSortState = [{ id: 'name', desc: false }];

function sortingToAscending(sorting: DomainSortState): string {
	const nameSort = sorting.find((entry) => entry.id === 'name');
	if (!nameSort) {
		return '1';
	}
	return nameSort.desc ? '0' : '1';
}

function openDomainAccounts(domainId: string): void {
	replaceHistory(`/${domainId}/${ACCOUNTS}`);
}

export const GlobalDomainList = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	// #5: the query total is only available after the query hook runs, so
	// feed it back into the table state via the documented adjust-state-
	// when-props-change pattern (same as the hook's resetKey); the raw
	// value keeps a pending query (no placeholder data yet) from clamping.
	const [totalRowCount, setTotalRowCount] = useState<number | undefined>();

	const {
		sorting,
		setSorting,
		pagination,
		setPagination,
		rowSelection,
		setRowSelection,
		searchString,
		setSearchString,
		filters,
		setFilters,
	} = useServerTableState({
		pageSize: RECORD_DISPLAY_LIMIT,
		initialSorting: NAME_SORT,
		totalRowCount,
	});

	const debouncedSearch = useDebouncedValue(searchString, 700);
	const statusFilters = enumFilterValues(filters, 'status');
	const sortAscending = sortingToAscending(sorting);

	const { data, isPending, isError, error, refetch } = useDomainSearch({
		searchQuery: debouncedSearch,
		limit: pagination.pageSize,
		offset: pagination.pageIndex * pagination.pageSize,
		sortAscending,
		statusFilters,
	});

	if (data?.searchTotal !== totalRowCount) {
		setTotalRowCount(data?.searchTotal);
	}

	useQueryErrorSnackbar(error);

	const rawDomains = data?.domain ?? [];
	const totalDomain = data?.searchTotal ?? 0;
	const tableStatus = resolveTableStatus(isPending, isError, rawDomains.length);

	const filterDefs: Array<DataTableFilterDef> = [
		{
			id: 'status',
			label: t('label.status', 'Status'),
			type: 'enum',
			options: DOMAIN_STATUS_VALUES.map((value) => {
				const { label } = getStatusDisplay(value, t);
				return { label, value };
			}),
		},
	];

	const rowActions: Array<DataTableRowAction> = [
		{ id: 'open', label: t('label.open_domain', 'Open domain') },
	];

	const bulkActions: Array<DataTableBulkAction> = [
		{ id: 'suspend', label: t('label.suspend', 'Suspend'), reversible: true },
		{ id: 'delete', label: t('label.delete', 'Delete'), danger: true },
	];

	async function handleBulkAction({
		action,
		selectedCount,
	}: DataTableBulkActionEvent): Promise<BulkUndoPayload> {
		const message = t('label.bulk_action_done', '{{count}} domains: {{action}}', {
			count: selectedCount,
			action: action.label,
		});
		if (action.danger) {
			createSnackbar({
				key: `bulk-domain-${action.id}`,
				severity: 'success',
				label: message,
				hideButton: true,
			});
			return undefined;
		}
		return {
			undo: {
				message,
				onUndo: () => {
					createSnackbar({
						key: `bulk-domain-undo-${action.id}`,
						severity: 'info',
						label: t('label.undone', 'Undone'),
						hideButton: true,
					});
				},
			},
		};
	}

	// Only the name column is sortable; clearing it falls back to name
	// ascending, mirroring the SOAP query contract (sortAscending '1').
	function handleSortingChange(
		updater: DomainSortState | ((prev: DomainSortState) => DomainSortState),
	): void {
		setSorting((prev) => {
			const next = typeof updater === 'function' ? updater(prev) : updater;
			const nameOnly = next.filter((entry) => entry.id === 'name').slice(0, 1);
			return nameOnly.length > 0 ? nameOnly : NAME_SORT;
		});
	}

	const columns: Array<DataTableColumnDef<SoapEntity>> = [
		{
			id: 'name',
			accessorKey: 'name',
			header: t('label.domain_name', 'Domain Name'),
			enableSorting: true,
			meta: { width: '25%', primary: true, copyable: true },
			cell: ({ row }) => (
				<ds-text as="span" size="small" color="gray0" weight="regular">
					{row.original.name || ' '}
				</ds-text>
			),
		},
		{
			id: 'status',
			accessorFn: (row) => parseDomainAttributes(row.a ?? []).zimbraDomainStatus,
			header: t('label.status', 'Status'),
			enableSorting: false,
			meta: { width: '75%' },
			cell: ({ row }) => {
				const status = parseDomainAttributes(row.original.a ?? []).zimbraDomainStatus;
				const { color, label } = getStatusDisplay(status, t);
				return (
					<ds-text as="span" size="small" weight="light" color={color}>
						{label}
					</ds-text>
				);
			},
		},
	];

	// Bulk variant A: while rows are selected the bulk bar replaces the
	// toolbar and the active filter chips (the parts render independently,
	// so the view owns the swap).
	const hasSelection = Object.values(rowSelection).some(Boolean);

	const filterChips = buildFilterChips(filters, filterDefs);
	const showPaginationControls = totalDomain > RECORD_DISPLAY_LIMIT;

	return (
		<div className={styles.page}>
			<div className={styles.header}>
				<ds-text as="h1" size="medium" weight="bold" color="gray0">
					{t('domain.domain_list', 'Domains List')}
				</ds-text>
			</div>
			<div className={styles.divider}>
				<ds-divider></ds-divider>
			</div>
			<div className={styles.content}>
				<div className={styles.tablePanel}>
					<DataTableRoot
						data={rawDomains}
						columns={columns}
						getRowId={(row) => row.id}
						primaryColumnId="name"
						getRowLabel={(domain) => domain.name}
						manualSorting
						manualPagination
						manualFiltering
						rowCount={totalDomain}
						state={{ sorting, pagination, rowSelection }}
						onSortingChange={handleSortingChange}
						onPaginationChange={setPagination}
						onRowSelectionChange={setRowSelection}
						enableRowSelection
						rowActions={rowActions}
						onRowAction={({ action, row }) => {
							if (action.id === 'open') {
								openDomainAccounts(row.id);
							}
						}}
					>
						<DataTableLiveRegion />
						{!hasSelection && (
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
									// Page/selection reset is owned by the server
									// table state hook (query-shape change).
									onApplyResetSelection={noop}
								/>
								<DataTableCustomize />
							</DataTableToolbar>
						)}
						{!hasSelection && filterChips.length > 0 && (
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
						<DataTableBulkBar
							actions={bulkActions}
							onBulkAction={handleBulkAction}
							totalMatchingCount={totalDomain}
							enableSelectAllMatching
						/>
						<DataTableTable
							aria-label={t('domain.domain_list', 'Domains List')}
							status={tableStatus}
							onRetry={() => {
								void refetch();
							}}
							enablePeek
							emptyTitle={t('label.this_list_is_empty', 'This list is empty.')}
							emptyDescription={t(
								'label.create_domain_list_msg',
								'You can create a new Domain by clicking on Create button on header menu',
							)}
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
						<DataTablePeekPanel<SoapEntity>
							title={(domain) => domain.name}
							status={(domain) => {
								const status = parseDomainAttributes(
									domain.a ?? [],
								).zimbraDomainStatus;
								return getStatusDisplay(status, t).label;
							}}
							fields={(domain) => {
								const attrs = attributesToObject(domain.a ?? []);
								const status = parseDomainAttributes(
									domain.a ?? [],
								).zimbraDomainStatus;
								const fields: Array<{ id: string; label: string; value: string }> = [
									{
										id: 'status',
										label: t('label.status', 'Status'),
										value: getStatusDisplay(status, t).label,
									},
								];
								if (attrs.description) {
									fields.push({
										id: 'description',
										label: t('label.description', 'Description'),
										value: attrs.description,
									});
								}
								return fields;
							}}
							onOpenFullDetails={(domain) => {
								openDomainAccounts(domain.id);
							}}
							openFullDetailsLabel={t('label.open_domain', 'Open domain')}
						/>
					</DataTableRoot>
				</div>
			</div>
		</div>
	);
};
