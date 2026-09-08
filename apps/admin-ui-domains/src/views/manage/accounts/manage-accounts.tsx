/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  DataTable,
  type DataTableBulkAction,
  type DataTableBulkActionContext,
  type DataTableColumnDef,
  type DataTableFilterDef,
  type DataTableFiltersState,
  type DataTableRowAction,
  type DataTableStatus,
  ModalOverlay,
  Tooltip,
  useSnackbar,
} from '@zextras/ui-components';
import { useDebouncedValue } from '@zextras/ui-shared';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ASC, DESC, RECORD_DISPLAY_LIMIT } from '../../../constants';
import { useQueryErrorSnackbar } from '../../../hooks/use-query-error-snackbar';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { domainQueryKeys } from '../../../services/domain-query-keys';
import {
  AccountListEntry,
  parseAccountListDirectory,
  useAccountListDirectory,
} from '../../../services/use-account-list-directory';
import { useModifyAccountAttributes } from '../../../services/use-modify-account-attributes';
import { getStatusDisplay } from '../../../utils/status';
import { EditAccount } from '../../edit-account/edit-account';
import { somethingWrongSnackbarConfig } from '../../edit-account/general-section/utils';
import {
  AccountRowItem,
  flattenAccountAttributes,
  getAccountUserType,
} from './account-row';
import styles from './accounts.module.css';
import { CreateAccount } from './create-account/create-account';

const ACCOUNT_LIST_ATTRS =
  'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraCreateTimestamp,zimbraMailQuota,zimbraNotes,mail';

const ACCOUNT_TYPE_LDAP: Record<string, string> = {
  admin: '(&(zimbraIsAdminAccount=TRUE))',
  delegatedAdmin:
    '(&(zimbraIsDelegatedAdminAccount=TRUE)(!(zimbraIsAdminAccount=TRUE)))',
  external: '(&(zimbraIsExternalVirtualAccount=TRUE))',
  system: '(&(zimbraIsSystemAccount=TRUE))',
  normal:
    '(&(!(zimbraIsAdminAccount=TRUE))(!(zimbraIsDelegatedAdminAccount=TRUE))(!(zimbraIsSystemAccount=TRUE))(!(zimbraIsExternalVirtualAccount=TRUE)))',
};

const ACCOUNT_TYPE_OPTIONS = [
  { id: 'admin', label: 'Admin' },
  { id: 'delegatedAdmin', label: 'DelegatedAdmin' },
  { id: 'external', label: 'External' },
  { id: 'system', label: 'System' },
  { id: 'normal', label: 'Normal' },
] as const;

const ACCOUNT_STATUS_IDS = [
  'active',
  'maintenance',
  'locked',
  'closed',
  'pending',
  'lockout',
] as const;

const ACCOUNT_SORTABLE_IDS = new Set(['name', 'displayName']);

type AccountSortState = Array<{ id: string; desc: boolean }>;

type AccountListData = {
  accounts: Array<AccountListEntry>;
  total: number;
};

function selectAccountListWithTotal(res: { searchTotal?: number }): AccountListData {
  return {
    accounts: parseAccountListDirectory(res),
    total: res?.searchTotal ?? 0,
  };
}

function enumFilterValues(filters: DataTableFiltersState, filterId: string): Array<string> {
  const value = filters[filterId];
  if (!Array.isArray(value)) {
    return [];
  }
  return value;
}

function joinLdapFragments(fragments: Array<string>): string {
  if (fragments.length === 0) {
    return '';
  }
  const joined = fragments.join('');
  return fragments.length > 1 ? `(|${joined})` : joined;
}

function typeFilterToLdap(typeIds: Array<string>): string {
  const fragments = typeIds
    .map((id) => ACCOUNT_TYPE_LDAP[id])
    .filter((fragment): fragment is string => Boolean(fragment));
  return joinLdapFragments(fragments);
}

function statusFilterToLdap(statusIds: Array<string>): string {
  const fragments = statusIds.map((status) => `(&(zimbraAccountStatus=${status}))`);
  return joinLdapFragments(fragments);
}

function buildSearchFilterQuery(
  searchStr: string,
  statusFilter: string,
  typeFilter: string,
): string {
  let filterQuery = '';
  if (typeFilter) {
    filterQuery += typeFilter;
  }
  if (statusFilter) {
    filterQuery += statusFilter;
  }
  if (searchStr) {
    filterQuery += `(|(mail=*${searchStr}*)(cn=*${searchStr}*)(sn=*${searchStr}*)(gn=*${searchStr}*)(displayName=*${searchStr}*)(zimbraMailDeliveryAddress=*${searchStr}*))`;
  }
  if ((typeFilter && statusFilter) || (statusFilter && searchStr) || (typeFilter && searchStr)) {
    return `(&${filterQuery})`;
  }
  return filterQuery;
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

function sortingToAccountParams(sorting: AccountSortState): {
  sortBy: string;
  sortAscending: typeof ASC | typeof DESC;
} {
  const entry =
    sorting.find((item) => ACCOUNT_SORTABLE_IDS.has(item.id)) ?? ({ id: 'name', desc: false });
  return {
    sortBy: entry.id,
    sortAscending: entry.desc ? DESC : ASC,
  };
}

export const ManageAccounts = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name;

  const [filters, setFilters] = useState<DataTableFiltersState>({});
  const [sorting, setSorting] = useState<AccountSortState>([{ id: 'name', desc: false }]);
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
  const [searchString, setSearchString] = useState<string>('');
  const [defaultTab, setDefaultTab] = useState('general');
  const [selectedAccount, setSelectedAccount] = useState<AccountRowItem>({} as AccountRowItem);
  const [showAccountDetailView, setShowAccountDetailView] = useState<boolean>(false);
  const [showCreateAccountView, setShowCreateAccountView] = useState<boolean>(false);
  const [showEditAccountView, setShowEditAccountView] = useState<boolean>(false);

  const typeFilter = typeFilterToLdap(enumFilterValues(filters, 'type'));
  const statusFilter = statusFilterToLdap(enumFilterValues(filters, 'status'));

  const debouncedSearch = useDebouncedValue(searchString, 700);
  const searchQuery = buildSearchFilterQuery(debouncedSearch, statusFilter, typeFilter);
  const { sortBy, sortAscending } = sortingToAccountParams(sorting);

  const { data, isPending, isError, error, refetch } = useAccountListDirectory(
    {
      attr: ACCOUNT_LIST_ATTRS,
      type: 'accounts',
      domainName,
      query: searchQuery,
      offset,
      limit,
      sortBy,
      sortAscending,
      select: selectAccountListWithTotal,
    },
    !!domainName,
  );

  const modifyAccountAttributes = useModifyAccountAttributes();

  useQueryErrorSnackbar(error);

  const openDetailView = (account: AccountRowItem): void => {
    setSelectedAccount(account);
    setShowEditAccountView(true);
  };

  useEffect(() => {
    const handleKeyEvent = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && showAccountDetailView) {
        setShowAccountDetailView(false);
      }
    };
    globalThis.addEventListener('keydown', handleKeyEvent);
    return () => {
      globalThis.removeEventListener('keydown', handleKeyEvent);
    };
  }, [showAccountDetailView]);

  const refreshAccountList = (): void => {
    void queryClient.invalidateQueries({
      queryKey: domainQueryKeys.accountListDirectory.base(),
    });
  };

  const handleAccountCreated = (created: boolean): void => {
    if (created) {
      void queryClient.invalidateQueries({ queryKey: domainQueryKeys.accountCount.base() });
    }
  };

  const handleAccountDeleted = (): void => {
    void queryClient.invalidateQueries({ queryKey: domainQueryKeys.accountListDirectory.base() });
    void queryClient.invalidateQueries({ queryKey: domainQueryKeys.accountCount.base() });
  };

  const accounts: Array<AccountRowItem> = (data?.accounts ?? []).map(flattenAccountAttributes);
  const totalAccount = data?.total ?? 0;
  const tableStatus = resolveTableStatus(isPending, isError, accounts.length);

  const filterDefs: Array<DataTableFilterDef> = [
    {
      id: 'type',
      label: t('label.type', 'Type'),
      type: 'enum',
      options: ACCOUNT_TYPE_OPTIONS.map((option) => ({
        label: option.label,
        value: option.id,
      })),
    },
    {
      id: 'status',
      label: t('label.status', 'Status'),
      type: 'enum',
      options: ACCOUNT_STATUS_IDS.map((value) => {
        const { label } = getStatusDisplay(value, t);
        return { label, value };
      }),
    },
  ];

  const rowActions: Array<DataTableRowAction> = [
    { id: 'edit', label: t('label.edit_account', 'Edit account') },
  ];

  const bulkActions: Array<DataTableBulkAction> = [
    { id: 'enable', label: t('label.enable', 'Enable'), reversible: true },
    { id: 'disable', label: t('label.disable', 'Disable'), reversible: true },
    { id: 'delete', label: t('label.delete', 'Delete'), danger: true },
  ];

  function handleBulkAction({
    action,
    selectedCount,
  }: DataTableBulkActionContext): { undo: { message: string; onUndo: () => void } } | void {
    const message = t('label.bulk_action_done', '{{count}} accounts: {{action}}', {
      count: selectedCount,
      action: action.label,
    });
    if (action.danger) {
      createSnackbar({
        key: `bulk-${action.id}`,
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
            key: `bulk-undo-${action.id}`,
            severity: 'info',
            label: t('label.undone', 'Undone'),
            hideButton: true,
          });
        },
      },
    };
  }

  const columns: Array<DataTableColumnDef<AccountRowItem>> = [
    {
      id: 'name',
      accessorKey: 'name',
      header: t('label.email', 'Email'),
      enableSorting: true,
      meta: { width: '25%', primary: true, copyable: true },
      cell: ({ row }) => (
        <ds-text as="span" size="small" color="gray0" weight="regular">
          {row.original.name || ' '}
        </ds-text>
      ),
    },
    {
      id: 'displayName',
      accessorFn: (row) => (row.displayName as string | undefined) ?? '',
      header: t('label.person_name', 'Name'),
      enableSorting: true,
      meta: { width: '15%', editable: true },
      cell: ({ row }) => (
        <ds-text as="span" size="small" color="gray0" weight="light">
          {(row.original.displayName as string | undefined) || '\u00a0'}
        </ds-text>
      ),
    },
    {
      id: 'aliases',
      accessorFn: (row) => {
        const mailAddresses = (row.mail as Array<string> | undefined) ?? [];
        return Math.max(mailAddresses.length - 1, 0);
      },
      header: t('label.Aliases', 'Aliases'),
      enableSorting: false,
      meta: { width: '10%' },
      cell: ({ row }) => {
        const mailAddresses = (row.original.mail as Array<string> | undefined) ?? [];
        const aliasCount = Math.max(mailAddresses.length - 1, 0);
        if (aliasCount > 0) {
          return (
            <Tooltip placement="bottom" label={mailAddresses.slice(1).join(', ')} maxWidth="auto">
              <ds-text as="span" size="small" weight="light" color="#828282">
                {aliasCount}
              </ds-text>
            </Tooltip>
          );
        }
        return (
          <ds-text as="span" size="small" color="#828282" weight="light">
            0
          </ds-text>
        );
      },
    },
    {
      id: 'type',
      accessorFn: (row) => getAccountUserType(row),
      header: t('label.type', 'Type'),
      enableSorting: false,
      meta: { width: '10%' },
      cell: ({ row }) => (
        <ds-text as="span" size="small" color="gray0" weight="light">
          {getAccountUserType(row.original)}
        </ds-text>
      ),
    },
    {
      id: 'status',
      accessorFn: (row) => (row.zimbraAccountStatus as string | undefined) ?? '',
      header: t('label.status', 'Status'),
      enableSorting: false,
      meta: { width: '10%' },
      cell: ({ row }) => {
        const status = row.original.zimbraAccountStatus as string | undefined;
        const { color: statusColor, label: statusLabel } = getStatusDisplay(status ?? '', t);
        return (
          <ds-text as="span" size="small" weight="light" color={statusColor}>
            {statusLabel}
          </ds-text>
        );
      },
    },
    {
      id: 'description',
      accessorFn: (row) => (row.description as string | undefined) ?? '',
      header: t('label.description', 'Description'),
      enableSorting: false,
      meta: { width: '30%' },
      cell: ({ row }) => {
        const description = (row.original.description as string | undefined) ?? '\u00a0';
        return (
          <Tooltip label={description}>
            <ds-text as="span" size="small" weight="light" color="gray0">
              {description}
            </ds-text>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.headerOuterRow}>
        <div className={styles.headerBar}>
          <div className={styles.headerRow}>
            <div className={styles.headerSide}>
              <ds-text as="h1" size="medium" weight="bold" color="gray0">
                {t('domain.account_list', 'Accounts List')}
              </ds-text>
            </div>
            <div className={styles.headerSide}>
            </div>
            <div className={styles.headerActions}>
              <Button
                color="primary"
                icon="Plus"
                onClick={(): void => setShowCreateAccountView(true)}
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
              <DataTable
                aria-label={t('domain.account_list', 'Accounts List')}
                data={accounts}
                columns={columns}
                getRowId={(row) => row.id}
                primaryColumnId="name"
                status={tableStatus}
                onRetry={() => {
                  void refetch();
                }}
                emptyTitle={t('label.this_list_is_empty', 'This list is empty.')}
                emptyDescription={t(
                  'label.create_account_list_msg',
                  'You can create a new Account by clicking on Create button (upper left corner) or on the Add (+) button up here',
                )}
                errorTitle={t('label.something_went_wrong', 'Something went wrong')}
                errorDescription={t(
                  'label.could_not_load_accounts',
                  'We could not load accounts. Try again.',
                )}
                retryLabel={t('label.retry', 'Retry')}
                enableSearch
                searchValue={searchString}
                onSearchChange={(value) => {
                  setSearchString(value);
                  setOffset(0);
                }}
                searchPlaceholder={t(
                  'label.i_am_looking_for_this_account',
                  `I'm looking for this account…`,
                )}
                searchLabel={t(
                  'label.i_am_looking_for_this_account',
                  `I'm looking for this account…`,
                )}
                filterDefs={filterDefs}
                filters={filters}
                onFiltersChange={(next) => {
                  setFilters(next);
                  setOffset(0);
                }}
                enableCustomize
                enablePeek
                peekTitle={(account) => account.name}
                peekStatus={(account) => {
                  const status = (account.zimbraAccountStatus as string | undefined) ?? '';
                  return getStatusDisplay(status, t).label;
                }}
                peekFields={(account) => {
                  const mailAddresses = (account.mail as Array<string> | undefined) ?? [];
                  const aliasCount = Math.max(mailAddresses.length - 1, 0);
                  const description = (account.description as string | undefined) ?? '';
                  const displayName = (account.displayName as string | undefined) ?? '';
                  return [
                    {
                      label: t('label.person_name', 'Name'),
                      value: displayName || '—',
                    },
                    {
                      label: t('label.type', 'Type'),
                      value: getAccountUserType(account),
                    },
                    {
                      label: t('label.status', 'Status'),
                      value: getStatusDisplay(
                        (account.zimbraAccountStatus as string | undefined) ?? '',
                        t,
                      ).label,
                    },
                    {
                      label: t('label.Aliases', 'Aliases'),
                      value: String(aliasCount),
                    },
                    {
                      label: t('label.description', 'Description'),
                      value: description || '—',
                    },
                  ];
                }}
                onOpenFullDetails={openDetailView}
                openFullDetailsLabel={t('label.edit_account', 'Edit account')}
                rowActions={rowActions}
                onRowAction={({ action, row }) => {
                  if (action.id === 'edit') {
                    openDetailView(row);
                  }
                }}
                manualSorting
                sorting={sorting}
                onSortingChange={(updater) => {
                  setSorting((prev) => {
                    const next = typeof updater === 'function' ? updater(prev) : updater;
                    const sortableOnly = next
                      .filter((entry) => ACCOUNT_SORTABLE_IDS.has(entry.id))
                      .slice(0, 1);
                    return sortableOnly.length > 0
                      ? sortableOnly
                      : [{ id: 'name', desc: false }];
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
                rowCount={totalAccount}
                paginationThreshold={RECORD_DISPLAY_LIMIT}
                pageSizeOptions={[10, 25, 50, 100]}
                enableRowSelection
                enableSelectAllMatching
                totalMatchingCount={totalAccount}
                bulkVariant="A"
                bulkActions={bulkActions}
                onBulkAction={handleBulkAction}
                onCellEditCommit={({ columnId, value, row }) => {
                  if (columnId !== 'displayName') {
                    return;
                  }
                  void modifyAccountAttributes
                    .mutateAsync({
                      id: row.id,
                      modifiedData: { displayName: value },
                    })
                    .then(() => {
                      createSnackbar({
                        key: `edit-display-name-${row.id}`,
                        severity: 'success',
                        label: t('label.display_name_saved', 'Display name saved: {{value}}', {
                          value,
                        }),
                        hideButton: true,
                      });
                      refreshAccountList();
                    })
                    .catch((error: { message?: string }) => {
                      createSnackbar(somethingWrongSnackbarConfig(error, t));
                    });
                }}
              />
              {showEditAccountView && (
                <ModalOverlay open={showEditAccountView} maxWidth="58.75rem">
                  <EditAccount
                    account={selectedAccount}
                    onClose={(): void => {
                      setShowEditAccountView(false);
                      setDefaultTab('general');
                    }}
                    onSaved={refreshAccountList}
                    onDeleted={handleAccountDeleted}
                    defaultTab={defaultTab}
                  />
                </ModalOverlay>
              )}
            </div>
          </div>
        </div>
      </div>
      {showCreateAccountView && (
        <ModalOverlay open={showCreateAccountView} maxWidth="58.75rem">
          <CreateAccount
            setShowCreateAccountView={setShowCreateAccountView}
            setIsAccountCreated={handleAccountCreated}
            getAccountList={refreshAccountList}
            setShowEditAccountView={setShowEditAccountView}
            openDetailView={openDetailView}
            setShowAccountDetailView={setShowAccountDetailView}
            setDefaultTab={setDefaultTab}
          />
        </ModalOverlay>
      )}
    </div>
  );
};
