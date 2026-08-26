/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  CustomHeaderFactory,
  HoverableRowFactory,
  Input,
  ModalOverlay,
  Paging,
  Table,
  TrackNumberPerPage,
  useSnackbar,
} from '@zextras/ui-components';
import { useDebouncedValue } from '@zextras/ui-shared';
import { debounce } from 'lodash-es';
import { ChangeEvent, ReactElement, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../../assets/gardian.svg';
import { ASC, DESC, RECORD_DISPLAY_LIMIT } from '../../../constants';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { domainQueryKeys } from '../../../services/domain-query-keys';
import {
  AccountListEntry,
  parseAccountListDirectory,
  useAccountListDirectory,
} from '../../../services/use-account-list-directory';
import { useCountAccount } from '../../../services/use-count-account';
import ScrollContainer from '../../components/scrollComponent';
import { EditAccount } from '../../edit-account/edit-account';
import { generateSnackbarFromError } from '../../error/generate-snackbar-error';
import { AccountRowItem, buildAccountRow } from './account-row';
import styles from './accounts.module.css';
import CreateAccount from './create-account/create-account';

const ACCOUNT_LIST_ATTRS =
  'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraCreateTimestamp,zimbraMailQuota,zimbraNotes,mail';

const ACCOUNT_TYPE_FILTERS = [
  {
    label: 'Admin',
    value: '(&(zimbraIsAdminAccount=TRUE))',
  },
  {
    label: 'DelegatedAdmin',
    value: '(&(zimbraIsDelegatedAdminAccount=TRUE)(!(zimbraIsAdminAccount=TRUE)))',
  },
  {
    label: 'External',
    value: '(&(zimbraIsExternalVirtualAccount=TRUE))',
  },
  {
    label: 'System',
    value: '(&(zimbraIsSystemAccount=TRUE))',
  },
  {
    label: 'Normal',
    value:
      '(&(!(zimbraIsAdminAccount=TRUE))(!(zimbraIsDelegatedAdminAccount=TRUE))(!(zimbraIsSystemAccount=TRUE))(!(zimbraIsExternalVirtualAccount=TRUE)))',
  },
] as const;

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

function buildSearchFilterQuery(searchStr: string, statusFilter: string, typeFilter: string): string {
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

function joinFilterSelection(selection: Array<{ value: string }>): string {
  if (selection.length === 0) {
    return '';
  }
  const values = selection.map((item) => item.value).join('');
  return selection.length > 1 ? `(|${values})` : values;
}

export const ManageAccounts = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name;

  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortedColumn, setSortedColumn] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<typeof ASC | typeof DESC>(ASC);
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
  const [searchString, setSearchString] = useState<string>('');
  const [isTableTooTall, setIsTableTooTall] = useState(false);
  const [defaultTab, setDefaultTab] = useState('general');
  const [selectedAccount, setSelectedAccount] = useState<AccountRowItem>({} as AccountRowItem);
  const [showAccountDetailView, setShowAccountDetailView] = useState<boolean>(false);
  const [showCreateAccountView, setShowCreateAccountView] = useState<boolean>(false);
  const [showEditAccountView, setShowEditAccountView] = useState<boolean>(false);

  const tableRef = useRef<HTMLTableElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const accountStatusFilter = [
    {
      label: t('label.active', 'Active'),
      value: '(&(zimbraAccountStatus=active))',
    },
    {
      label: t('label.in_maintenance', 'In maintenance'),
      value: '(&(zimbraAccountStatus=maintenance))',
    },
    {
      label: t('label.locked', 'Locked'),
      value: '(&(zimbraAccountStatus=locked))',
    },
    {
      label: t('label.closed', 'Closed'),
      value: '(&(zimbraAccountStatus=closed))',
    },
    {
      label: t('label.pending', 'Pending'),
      value: '(&(zimbraAccountStatus=pending))',
    },
    {
      label: t('label.lockout', 'Lockout'),
      value: '(&(zimbraAccountStatus=lockout))',
    },
  ];

  const onSortChange = (id: string, order: typeof ASC | typeof DESC): void => {
    setSortOrder(order);
    setSortedColumn(id);
  };

  const headers = [
    {
      id: 'name',
      label: t('label.email', 'Email'),
      width: '25%',
      bold: true,
      sortable: true,
      onSortChange,
    },
    {
      id: 'displayName',
      label: t('label.person_name', 'Name'),
      width: '15%',
      bold: true,
      sortable: true,
      onSortChange,
    },
    {
      id: 'aliases',
      label: t('label.Aliases', 'Aliases'),
      width: '10%',
      bold: true,
    },
    {
      id: 'type',
      label: t('label.type', 'Type'),
      i18nAllLabel: t('label.all', 'All'),
      width: '10%',
      bold: true,
      items: ACCOUNT_TYPE_FILTERS.map((filter) => ({ label: filter.label, value: filter.value })),
      onChange: (e: Array<{ value: string }>): void => {
        setOffset(0);
        setTypeFilter(joinFilterSelection(e ?? []));
      },
    },
    {
      id: 'status',
      label: t('label.status', 'Status'),
      i18nAllLabel: t('label.all', 'All'),
      width: '10%',
      bold: true,
      items: accountStatusFilter.map((filter) => ({ label: filter.label, value: filter.value })),
      onChange: (e: Array<{ value: string }>): void => {
        setOffset(0);
        setStatusFilter(joinFilterSelection(e ?? []));
      },
    },
    {
      id: 'description',
      label: t('label.description', 'Description'),
      width: '40%',
      bold: true,
    },
  ];

  const debouncedSearch = useDebouncedValue(searchString, 700);
  const searchQuery = buildSearchFilterQuery(debouncedSearch, statusFilter, typeFilter);

  const { data, isFetching, isPending, isError, error } = useAccountListDirectory(
    {
      attr: ACCOUNT_LIST_ATTRS,
      type: 'accounts',
      domainName,
      query: searchQuery,
      offset,
      limit,
      sortBy: sortedColumn,
      sortAscending: sortOrder,
      select: selectAccountListWithTotal,
    },
    !!domainName,
  );

  const { data: totalAccountCreated } = useCountAccount(domainName);

  useEffect(() => {
    if (isError) {
      createSnackbar(generateSnackbarFromError(error, t));
    }
  }, [isError, error, createSnackbar, t]);

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

  useEffect(() => {
    const table = tableRef.current;

    const handleResize = debounce((): void => {
      if (table) {
        const tableHeight = table.clientHeight + 375;
        const viewportHeight = globalThis.innerHeight;
        setIsTableTooTall(tableHeight > viewportHeight);
      }
    }, 100);

    if (table && !resizeObserverRef.current) {
      const observer = new ResizeObserver(handleResize);
      resizeObserverRef.current = observer;
      observer.observe(table);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchString(e.target.value);
    setOffset(0);
  };

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

  const accounts: Array<AccountListEntry> = data?.accounts ?? [];
  const accountList = accounts.map((item) => buildAccountRow(item, t, openDetailView));
  const totalAccount = data?.total ?? 0;

  if (isPending) {
    return <ds-page-shimmer></ds-page-shimmer>;
  }

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
              <ds-text as="p" size="medium" overflow="break-word">
                {t('domain.accounts.totalAccounts', 'Total Accounts')} : {totalAccountCreated ?? 0}
              </ds-text>
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
            <div className={styles.searchRow}>
              <div className={styles.searchBox}>
                <Input
                  label={t('label.i_am_looking_for_this_account', `I'm looking for this account…`)}
                  disabled={accounts.length === 0 && searchString.length === 0 && !isError}
                  value={searchString}
                  backgroundColor="gray5"
                  onChange={handleInputChange}
                  CustomIcon={(): ReactElement => (
                    <ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
                  )}
                />
              </div>
            </div>
            <div className={styles.tableRow}>
              <Table
                rows={accountList}
                headers={headers as any}
                showCheckbox={false}
                multiSelect={false}
                ref={tableRef}
                style={{
                  overflow: 'auto',
                  height: accounts.length === 0 ? '50%' : '100%',
                }}
                RowFactory={HoverableRowFactory}
                HeaderFactory={CustomHeaderFactory}
              />
              {accounts.length === 0 && !isFetching && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyImageRow}>
                    <img src={logo} alt="logo" />
                  </div>
                  <div className={styles.emptyTitleRow}>
                    <ds-text
                      as="p"
                      weight="light"
                      color="#828282"
                      size="large"
                      overflow="break-word"
                    >
                      {t('label.this_list_is_empty', 'This list is empty.')}
                    </ds-text>
                  </div>
                  <div className={styles.emptyHelpRow}>
                    <ds-text
                      as="p"
                      weight="light"
                      color="#828282"
                      size="large"
                      overflow="break-word"
                    >
                      <Trans
                        i18nKey="label.create_account_list_msg"
                        defaults="You can create a new Account by clicking on <bold>Create</bold> button (upper left corner) or on the Add (<bold>+</bold>) button up here"
                        components={{ bold: <strong /> }}
                      />
                    </ds-text>
                  </div>
                </div>
              )}
              {accountList.length !== 0 && (
                <div
                  className={styles.pagingSticky}
                  style={{ bottom: isTableTooTall ? '0' : '-4rem' }}
                >
                  <ScrollContainer isVisible={isTableTooTall} />
                  <div className={styles.pagingBar}>
                    <div className={styles.pagingSide}>
                      <Paging
                        key={searchQuery}
                        totalItem={totalAccount}
                        setOffset={setOffset}
                        pageSize={limit}
                      />
                    </div>
                    <div className={styles.pagingTrack}>
                      <TrackNumberPerPage setPageSize={setLimit} />
                    </div>
                  </div>
                </div>
              )}
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
