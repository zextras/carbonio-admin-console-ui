/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, CustomHeaderFactory, HoverableRowFactory, Input, ModalOverlay, Padding, Paging, Row, Table, Tooltip, TrackNumberPerPage, useSnackbar, } from '@zextras/ui-components';
import { debounce } from 'lodash-es';
import { ChangeEvent, FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../../../assets/gardian.svg';
import {
  ASC,
  DESC,
  RECORD_DISPLAY_LIMIT,
} from '../../../../constants';
import { useSelectedDomain } from '../../../../hooks/use-selected-domain';
import { accountListDirectory } from '../../../../services/account-list-directory-service';
import { countAccount } from '../../../../services/count-account-service';
import ScrollContainer from '../../../components/scrollComponent';
import { generateSnackbarFromError } from '../../../error/generate-snackbar-error';
import { getAccountStatusColors } from '../../constants/account-status-colors';
import CreateAccount from './create-account/create-account';
import { EditAccount } from './edit-account/edit-account';

type Timer = ReturnType<typeof setTimeout>;
const ManageAccounts: FC = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const timer = useRef<Timer | undefined>(undefined);
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name;
  const [defaultTab, setDefaultTab] = useState('general');
  const tableRef = useRef<HTMLTableElement>(null);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [sortedColumn, setSortedColumn] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<typeof ASC | typeof DESC>(ASC);
  const [isTableTooTall, setIsTableTooTall] = useState(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [accountSearchCurrentPage, setAccountSearchCurrentPage] = useState(1);

  const accountTypeFilter: any = useMemo(
    () => [
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
    ],
    [],
  );

  const accountStatusFilter: any = useMemo(
    () => [
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
    ],
    [t],
  );
  const headers: any = useMemo(
    () => [
      {
        id: 'name',
        label: t('label.email', 'Email'),
        width: '25%',
        bold: true,
        sortable: true,
        onSortChange: (id: string, order: typeof ASC | typeof DESC): void => {
          setSortOrder(order);
          setSortedColumn(id);
        },
      },
      {
        id: 'displayName',
        label: t('label.person_name', 'Name'),
        width: '15%',
        bold: true,
        sortable: true,
        onSortChange: (id: string, order: typeof ASC | typeof DESC): void => {
          setSortOrder(order);
          setSortedColumn(id);
        },
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
        items: [
          { label: accountTypeFilter[0].label, value: accountTypeFilter[0].value },
          { label: accountTypeFilter[1].label, value: accountTypeFilter[1].value },
          { label: accountTypeFilter[2].label, value: accountTypeFilter[2].value },
          { label: accountTypeFilter[3].label, value: accountTypeFilter[3].value },
          { label: accountTypeFilter[4].label, value: accountTypeFilter[4].value },
        ],

        onChange: (e: any) => {
          if (e?.length > 0) {
            let typeQuery = '';
            e.forEach((item: { value: string }) => {
              typeQuery += item.value;
            });
            if (e?.length > 1) {
              typeQuery = `(|${typeQuery})`;
            }
            setTypeFilter(typeQuery);
          } else {
            setTypeFilter('');
          }
        },
      },
      {
        id: 'status',
        label: t('label.status', 'Status'),
        width: '10%',
        i18nAllLabel: t('label.all', 'All'),
        bold: true,
        items: [
          { label: accountStatusFilter[0].label, value: accountStatusFilter[0].value },
          { label: accountStatusFilter[1].label, value: accountStatusFilter[1].value },
          { label: accountStatusFilter[2].label, value: accountStatusFilter[2].value },
          { label: accountStatusFilter[3].label, value: accountStatusFilter[3].value },
          { label: accountStatusFilter[4].label, value: accountStatusFilter[4].value },
          { label: accountStatusFilter[5].label, value: accountStatusFilter[5].value },
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
        },
      },
      {
        id: 'description',
        label: t('label.description', 'Description'),
        width: '40%',
        bold: true,
      },
    ],
    [accountStatusFilter, accountTypeFilter, t],
  );

  const [accountList, setAccountList] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>({});
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
  const [searchString, setSearchString] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [totalAccount, setTotalAccount] = useState<number>(0);
  const [totalAccountCreated, setTotalAccountCreated] = useState<number>(0);
  const [showAccountDetailView, setShowAccountDetailView] = useState<boolean>(false);
  const [showCreateAccountView, setShowCreateAccountView] = useState<boolean>(false);
  const [showEditAccountView, setShowEditAccountView] = useState<boolean>(false);
  const [isAccountDeleted, setIsAccountDeleted] = useState<boolean>(false);
  const [isAccountCreated, setIsAccountCreated] = useState<boolean>(false);



  const STATUS_COLOR = getAccountStatusColors(t);

  const accountUserType = useCallback((item: any): string => {
    if (item.zimbraIsAdminAccount === 'TRUE') return 'Admin';
    if (item.zimbraIsDelegatedAdminAccount === 'TRUE') return 'DelegatedAdmin';
    if (item.zimbraIsExternalVirtualAccount === 'TRUE') return 'External';
    if (item.zimbraIsSystemAccount === 'TRUE') return 'System';
    return 'Normal';
  }, []);

  const openDetailView = useCallback((acc: any): void => {
    setSelectedAccount(acc);
    setShowEditAccountView(true);
  }, []);

  const handleClickTableRow = (item: any): void => {
    openDetailView(item);
  };

  const getTotalFilteredUser = useCallback((): void => {
    if (domainName) {
      countAccount(domainName)
        .then((res) => {
          if (res) {
            const coses = res?.cos;
            let counter = 0;
            for (const cos in coses) {
              if (coses[cos].name != 'defaultExternal') {
                counter = counter + Number(coses[cos]._content);
              }
            }
            setTotalAccountCreated(counter);
          }
        })
        .catch((error) => {
          const snackbarConfig = generateSnackbarFromError(error, t);
          createSnackbar(snackbarConfig);
          setHasError(true);
        });
    }
  }, [domainName, t, createSnackbar]);

  const getAccountList = useCallback((): void => {
    setIsRequestInProgress(true);
    const type = 'accounts';
    const attrs =
      'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraCreateTimestamp,zimbraLastLogonTimestamp,zimbraMailQuota,zimbraNotes,mail';
    const offsetParam = offset ?? 0;
    accountListDirectory(
      attrs,
      type,
      domainName,
      searchQuery,
      offsetParam,
      limit,
      sortedColumn,
      sortOrder,
    )
      .then((data) => {
        setIsRequestInProgress(false);
        const accountListResponse: any = data?.account || [];
        if (accountListResponse && Array.isArray(accountListResponse)) {
          const accountListArr: any = [];
          setTotalAccount(data.searchTotal || 0);
          accountListResponse.forEach((item: any): any => {
            item?.a?.forEach((ele: any) => {
              if (ele?.n === 'mail') {
                if (item[ele?.n]) {
                  item[ele?.n].push(ele._content);
                } else {
                  item[ele?.n] = [ele._content];
                }
              } else if (ele?.pd && ele?.n === 'zimbraIsAdminAccount' && ele?.pd === true) {
                item[ele?.n] = 'TRUE';
              } else {
                item[ele?.n] = ele._content;
              }
            });
            accountListArr.push({
              id: item?.id,
              columns: [
                <ds-text
                  as="span"
                  size="small"
                  key={item?.id}
                  color="gray0"
                  weight="regular"
                  onClick={(): void => {
                    handleClickTableRow(item);
                  }}
                >
                  {item?.name || ' '}
                </ds-text>,
                <ds-text
                  as="span"
                  size="small"
                  key={item?.id}
                  color="gray0"
                  weight="light"
                  onClick={(): void => {
                    handleClickTableRow(item);
                  }}
                >
                  {item?.displayName || <>&nbsp;</>}
                </ds-text>,
                <>
                  {item?.mail?.length - 1 || 0 ? (
                    <Tooltip
                      key={item?.id}
                      placement="bottom"
                      label={item?.mail.slice(1).join(', ')}
                      maxWidth="auto"
                    >
                      <ds-text
                        as="span"
                        size="small"
                        weight="light"
                        key={item?.id}
                        color="#828282"
                        onClick={(): void => {
                          handleClickTableRow(item);
                        }}
                      >
                        {item?.mail?.length - 1 || 0}
                      </ds-text>
                    </Tooltip>
                  ) : (
                    <ds-text
                      as="span"
                      size="small"
                      key={item?.id}
                      color="#828282"
                      weight="light"
                      onClick={(): void => {
                        handleClickTableRow(item);
                      }}
                    >
                      0
                    </ds-text>
                  )}
                </>,
                <ds-text
                  as="span"
                  size="small"
                  key={item?.id}
                  color="gray0"
                  weight="light"
                  onClick={(): void => {
                    handleClickTableRow(item);
                  }}
                >
                  {accountUserType(item)}
                </ds-text>,
                <ds-text
                  as="span"
                  size="small"
                  weight="light"
                  key={item?.id}
                  color={STATUS_COLOR[item?.zimbraAccountStatus]?.color}
                  onClick={(): void => {
                    handleClickTableRow(item);
                  }}
                >
                  {STATUS_COLOR[item?.zimbraAccountStatus]?.label}
                </ds-text>,
                <Tooltip key={`${item.id}-userDesc`} label={item?.description || <>&nbsp;</>}>
                  <ds-text
                    as="span"
                    size="small"
                    weight="light"
                    key={item?.id}
                    color="gray0"
                    onClick={(event: { stopPropagation: () => void }): void => {
                      event.stopPropagation();
                      handleClickTableRow(item);
                    }}
                  >
                    {item?.description ?? <>&nbsp;</>}
                  </ds-text>
                </Tooltip>,
              ],
              item,
              clickable: true,
            });
          });
          setAccountList(accountListArr);
        }
        setIsRequestInProgress(false);
      })
      .catch((error) => {
        const snackbarConfig = generateSnackbarFromError(error, t);
        createSnackbar(snackbarConfig);
        setIsRequestInProgress(false);
        setHasError(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    domainName,
    searchQuery,
    offset,
    limit,
    sortedColumn,
    sortOrder,
    accountUserType,
    STATUS_COLOR,
    openDetailView,
    createSnackbar,
    t,
  ]);

  const generateSearchFilterQuery = useCallback(
    (searchStr: string, sfilter: string, tfilter: string): string => {
      let filterQuery = '';
      if (tfilter) {
        filterQuery += tfilter;
      }
      if (sfilter) {
        filterQuery += sfilter;
      }
      if (searchStr) {
        filterQuery += `(|(mail=*${searchStr}*)(cn=*${searchStr}*)(sn=*${searchStr}*)(gn=*${searchStr}*)(displayName=*${searchStr}*)(zimbraMailDeliveryAddress=*${searchStr}*))`;
      }
      if ((tfilter && sfilter) || (sfilter && searchStr) || (tfilter && searchStr)) {
        return `(&${filterQuery})`;
      }
      return filterQuery;
    },
    [],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchAccountList = useCallback(
    debounce((searchStr: string, sfilter: string, tfilter: string) => {
      setSearchQuery(generateSearchFilterQuery(searchStr, sfilter, tfilter));
    }, 700),
    [debounce, generateSearchFilterQuery],
  );
  useEffect(() => {
    searchAccountList(searchString, statusFilter, typeFilter);
  }, [searchAccountList, searchString, typeFilter, statusFilter]);

  useEffect(() => {
    if (domainName) {
      getAccountList();
    }
  }, [domainName, getAccountList]);

  useEffect(() => {
    setAccountSearchCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (domainName) {
      if (totalAccountCreated == 0 || isAccountCreated === true || isAccountDeleted === true) {
        getTotalFilteredUser();
        setIsAccountCreated(false);
        setIsAccountDeleted(false);
      }
    }
  }, [
    showCreateAccountView,
    domainName,
    setIsAccountCreated,
    setIsAccountDeleted,
    isAccountDeleted,
    isAccountCreated,
    totalAccountCreated,
    getTotalFilteredUser,
  ]);

  const closeAccountDetailDialog = useCallback(() => {
    if (showAccountDetailView) {
      setShowAccountDetailView(false);
    }
  }, [showAccountDetailView]);

  const handleKeyEvent = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAccountDetailDialog();
      }
    },
    [closeAccountDetailDialog],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyEvent);
    };
  }, [handleKeyEvent]);

  useEffect(() => {
    const table = tableRef.current;

    const handleResize = debounce((): void => {
      if (table) {
        const tableHeight = table.clientHeight + 375;
        const viewportHeight = window.innerHeight;
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
    const value = e.target.value;
    if (timer.current) {
      clearTimeout(timer.current);
    }
    if (value != '') {
      setSearchString(value);
      const newTimer = setTimeout(() => {
        setSearchQuery(generateSearchFilterQuery(value, statusFilter, typeFilter));
      }, 600);
      timer.current = newTimer;
    } else {
      setSearchString('');
      setSearchQuery(generateSearchFilterQuery(value, statusFilter, typeFilter));
    }
  };

  return (
    <Container
      padding={{ top: 'large', left: 'large', right: 'large' }}
      mainAlignment="flex-start"
      background="gray6"
    >
      <Row mainAlignment="flex-start" width="100%">
        <Container
          orientation="vertical"
          mainAlignment="space-around"
          background="gray6"
          height="3.625rem"
        >
          <Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
            <Row mainAlignment="flex-start" width="40%" crossAlignment="flex-start">
              <ds-text as="h1" size="medium" weight="bold" color="gray0">
                {t('domain.account_list', 'Accounts List')}
              </ds-text>
            </Row>
            <Row mainAlignment="flex-start" width="40%" crossAlignment="flex-start">
              <ds-text as="p" size="medium" overflow="break-word">
                {t('domain.accounts.totalAccounts', 'Total Accounts')} : {totalAccountCreated}
              </ds-text>
            </Row>
            <Row width="20%" mainAlignment="flex-end" crossAlignment="flex-end">
              <Padding all={'0'}>
                <Button
                  color="primary"
                  icon="Plus"
                  onClick={(): void => setShowCreateAccountView(true)}
                />
              </Padding>
            </Row>
          </Row>
        </Container>
      </Row>
      <Row orientation="horizontal" width="100%" background="gray6">
        <ds-divider></ds-divider>
      </Row>
      <Container
        orientation="column"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        width="100%"
        style={{
          position: 'relative',
          overflow: 'auto',
          minHeight: '10rem',
        }}
        padding={{ top: 'small', left: 'small', right: 'small' }}
      >
        <Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
          <Container height="fit" crossAlignment="flex-start" background="gray6">
            <Row
              orientation="horizontal"
              mainAlignment="space-between"
              crossAlignment="flex-start"
              width="fill"
              padding={{ bottom: 'large' }}
            >
              <Container>
                <Input
                  label={t('label.i_am_looking_for_this_account', `I'm looking for this account…`)}
                  disabled={accountList.length === 0 && searchString.length === 0 && !hasError}
                  value={searchString}
                  backgroundColor="gray5"
                  onChange={handleInputChange}
                  CustomIcon={(): any => (
                    <ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
                  )}
                />
              </Container>
            </Row>
            <Row
              orientation="horizontal"
              mainAlignment="space-between"
              crossAlignment="flex-start"
              width="fill"
              style={{
                position: 'relative',
              }}
            >
              <Table
                rows={!isRequestInProgress ? accountList : []}
                headers={headers}
                showCheckbox={false}
                multiSelect={false}
                ref={tableRef}
                style={{
                  overflow: 'auto',
                  height: isRequestInProgress || accountList.length === 0 ? '50%' : '100%',
                }}
                RowFactory={HoverableRowFactory}
                HeaderFactory={CustomHeaderFactory}
              />
              {isRequestInProgress && (
                <Container
                  crossAlignment="center"
                  mainAlignment="center"
                  height="auto"
                  padding={{ top: 'medium' }}
                >
                  <ds-spinner></ds-spinner>
                </Container>
              )}
              {accountList.length === 0 && !isRequestInProgress && (
                <Container orientation="column" crossAlignment="center" mainAlignment="center">
                  <Row>
                    <img src={logo} alt="logo" />
                  </Row>
                  <Row
                    padding={{ top: 'extralarge' }}
                    orientation="vertical"
                    crossAlignment="center"
                    style={{ textAlign: 'center' }}
                  >
                    <ds-text
                      as="p"
                      weight="light"
                      color="#828282"
                      size="large"
                      overflow="break-word"
                    >
                      {t('label.this_list_is_empty', 'This list is empty.')}
                    </ds-text>
                  </Row>
                  <Row
                    orientation="vertical"
                    crossAlignment="center"
                    style={{ textAlign: 'center' }}
                    padding={{ top: 'small' }}
                    width="53%"
                  >
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
                  </Row>
                </Container>
              )}
              {accountList.length !== 0 && (
                <Container
                  style={{
                    position: 'sticky',
                    bottom: isTableTooTall ? '0' : '-4rem',
                  }}
                >
                  <ScrollContainer isVisible={isTableTooTall} />
                  <Container
                    orientation="horizontal"
                    mainAlignment="space-between"
                    background="gray6"
                    width="100%"
                    padding={{ right: 'extralarge' }}
                    height="auto"
                  >
                    <Container crossAlignment="flex-start">
                      <Paging
                        totalItem={totalAccount}
                        setOffset={setOffset}
                        pageSize={limit}
                        currentPageProp={accountSearchCurrentPage}
                        onPageChange={setAccountSearchCurrentPage}
                      />
                    </Container>
                    <Container
                      crossAlignment="flex-end"
                      orientation="horizontal"
                      mainAlignment="flex-end"
                      padding={{ top: 'small' }}
                    >
                      <TrackNumberPerPage setPageSize={setLimit} />
                    </Container>
                  </Container>
                </Container>
              )}
              {showEditAccountView && (
                <ModalOverlay open={showEditAccountView} maxWidth="58.75rem">
                  <EditAccount
                    account={selectedAccount}
                    onClose={(): void => {
                      setShowEditAccountView(false);
                      setDefaultTab('general');
                    }}
                    onSaved={(): void => {
                      getAccountList();
                    }}
                    onDeleted={(): void => {
                      setIsAccountDeleted(true);
                    }}
                    defaultTab={defaultTab}
                  />
                </ModalOverlay>
              )}
            </Row>
          </Container>
        </Row>
      </Container>
      {showCreateAccountView && (
        <ModalOverlay open={showCreateAccountView} maxWidth="58.75rem">
          <CreateAccount
            setShowCreateAccountView={setShowCreateAccountView}
            setIsAccountCreated={setIsAccountCreated}
            getAccountList={getAccountList}
            setShowEditAccountView={setShowEditAccountView}
            openDetailView={openDetailView}
            setShowAccountDetailView={setShowAccountDetailView}
            setDefaultTab={setDefaultTab}
          />
        </ModalOverlay>
      )}
    </Container>
  );
};

export default ManageAccounts;
