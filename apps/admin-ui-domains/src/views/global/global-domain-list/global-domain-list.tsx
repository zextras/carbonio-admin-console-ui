/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  DataTable,
  type DataTableBulkAction,
  type DataTableBulkActionContext,
  type DataTableColumnDef,
  type DataTableFilterDef,
  type DataTableFiltersState,
  type DataTableRowAction,
  type DataTableStatus,
  useSnackbar,
} from '@zextras/ui-components';
import { replaceHistory, type SoapEntity, useDebouncedValue } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ACCOUNTS, RECORD_DISPLAY_LIMIT } from '../../../constants';
import { useQueryErrorSnackbar } from '../../../hooks/use-query-error-snackbar';
import { useDomainSearch } from '../../../services/use-domain-search';
import { attributesToObject, parseDomainAttributes } from '../../../utils/attributes';
import { getStatusDisplay } from '../../../utils/status';
import styles from './global-domain-list.module.css';

type DomainSortState = Array<{ id: string; desc: boolean }>;

const DOMAIN_STATUS_VALUES = ['active', 'closed', 'locked', 'maintenance', 'suspended'] as const;

function sortingToAscending(sorting: DomainSortState): string {
  const nameSort = sorting.find((entry) => entry.id === 'name');
  if (!nameSort) {
    return '1';
  }
  return nameSort.desc ? '0' : '1';
}

function resolveTableStatus(
  isPending: boolean,
  isError: boolean,
  rowCount: number,
): DataTableStatus {
  if (isPending) {
    return 'loading';
  }
  if (isError) {
    return 'error';
  }
  if (rowCount === 0) {
    return 'empty';
  }
  return 'idle';
}

function enumFilterValues(filters: DataTableFiltersState, filterId: string): Array<string> {
  const value = filters[filterId];
  if (!Array.isArray(value)) {
    return [];
  }
  return value;
}

function openDomainAccounts(domainId: string): void {
  replaceHistory(`/${domainId}/${ACCOUNTS}`);
}

export const GlobalDomainList = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(RECORD_DISPLAY_LIMIT);
  const [searchString, setSearchString] = useState('');
  const [filters, setFilters] = useState<DataTableFiltersState>({});
  const [sorting, setSorting] = useState<DomainSortState>([{ id: 'name', desc: false }]);

  const debouncedSearch = useDebouncedValue(searchString, 700);
  const statusFilters = enumFilterValues(filters, 'status');
  const sortAscending = sortingToAscending(sorting);

  const { data, isPending, isError, error, refetch } = useDomainSearch({
    searchQuery: debouncedSearch,
    limit,
    offset,
    sortAscending,
    statusFilters,
  });

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

  function handleBulkAction({
    action,
    selectedCount,
  }: DataTableBulkActionContext): { undo: { message: string; onUndo: () => void } } | void {
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
      return;
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
          <DataTable
            aria-label={t('domain.domain_list', 'Domains List')}
            data={rawDomains}
            columns={columns}
            getRowId={(row) => row.id}
            primaryColumnId="name"
            status={tableStatus}
            onRetry={() => {
              void refetch();
            }}
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
            enableSearch
            searchValue={searchString}
            onSearchChange={(value) => {
              setSearchString(value);
              setOffset(0);
            }}
            searchPlaceholder={t(
              'label.i_am_looking_for_this_domain',
              `I'm looking for this domain…`,
            )}
            searchLabel={t(
              'label.i_am_looking_for_this_domain',
              `I'm looking for this domain…`,
            )}
            filterDefs={filterDefs}
            filters={filters}
            onFiltersChange={(next) => {
              setFilters(next);
              setOffset(0);
            }}
            enableCustomize
            enablePeek
            peekTitle={(domain) => domain.name}
            peekStatus={(domain) => {
              const status = parseDomainAttributes(domain.a ?? []).zimbraDomainStatus;
              return getStatusDisplay(status, t).label;
            }}
            peekFields={(domain) => {
              const attrs = attributesToObject(domain.a ?? []);
              const status = parseDomainAttributes(domain.a ?? []).zimbraDomainStatus;
              const fields: Array<{ label: string; value: string }> = [
                {
                  label: t('label.status', 'Status'),
                  value: getStatusDisplay(status, t).label,
                },
              ];
              if (attrs.description) {
                fields.push({
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
            rowActions={rowActions}
            onRowAction={({ action, row }) => {
              if (action.id === 'open') {
                openDomainAccounts(row.id);
              }
            }}
            manualSorting
            sorting={sorting}
            onSortingChange={(updater) => {
              setSorting((prev) => {
                const next = typeof updater === 'function' ? updater(prev) : updater;
                const nameOnly = next.filter((entry) => entry.id === 'name').slice(0, 1);
                return nameOnly.length > 0 ? nameOnly : [{ id: 'name', desc: false }];
              });
              setOffset(0);
            }}
            manualPagination
            pagination={{ pageIndex: Math.floor(offset / limit), pageSize: limit }}
            onPaginationChange={(updater) => {
              const current = { pageIndex: Math.floor(offset / limit), pageSize: limit };
              const next = typeof updater === 'function' ? updater(current) : updater;
              if (next.pageSize !== limit) {
                setLimit(next.pageSize);
                setOffset(0);
                return;
              }
              setOffset(next.pageIndex * next.pageSize);
            }}
            rowCount={totalDomain}
            paginationThreshold={RECORD_DISPLAY_LIMIT}
            pageSizeOptions={[10, 25, 50, 100]}
            enableRowSelection
            enableSelectAllMatching
            totalMatchingCount={totalDomain}
            bulkVariant="A"
            bulkActions={bulkActions}
            onBulkAction={handleBulkAction}
          />
        </div>
      </div>
    </div>
  );
};
