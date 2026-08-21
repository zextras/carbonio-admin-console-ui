/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, CustomHeaderFactory, HoverableRowFactory, ListRow, ModalOverlay, Paging, Row, Table, TrackNumberPerPage, useSnackbar, } from '@zextras/ui-components';
import { postSoapFetchRequest, searchDirectory, useUserSettings } from '@zextras/ui-shared';
import { debounce } from 'lodash-es';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Attribute, CosMaxAccountValues, objectType } from '../../../../../types';
import logo from '../../../../assets/guardian.svg';
import {
  ADMIN_GROUP_FLAG,
  HELPDESK_ADMINS,
  RECORD_DISPLAY_LIMIT,
  SYSTEM_ACCOUNT_FLAG,
  ZIMBRA_ADMIN_URN,
  ZIMBRA_DOMAIN_COS_MAX_ACCOUNTS,
} from '../../../../constants';
import { useSelectedDomain } from '../../../../hooks/use-selected-domain';
import { accountListDirectory } from '../../../../services/account-list-directory-service';
import { getAccountMembershipRequest } from '../../../../services/get-account-membership';
import { InitDomainForDelegation } from '../../../../services/init-domain-for-delegation';
import { removeDistributionListMember } from '../../../../services/remove-distributionlist-member-service';
import ScrollContainer from '../../../components/scrollComponent';
import { generateSnackbarFromError } from '../../../error/generate-snackbar-error';
import { EditAccount } from '../../edit-account/edit-account';
import DisableDelegateAdminModel from './disable-delegate-admin-model';

const ManageDelegates: FC = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { data: domain } = useSelectedDomain();
  const [open, setOpen] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [distributionList, setDistributionList] = useState<objectType[]>([]);
  const [accountDistributionList, setAccountDistributionList] = useState([]);
  const [allAccount, setAllAccount] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  const userSetting = useUserSettings();
  const [selectedAccount, setSelectedAccount] = useState<any>({});
  const [totalAccount, setTotalAccount] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [pageLimit, setPageLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
  const [showEditAccountView, setShowEditAccountView] = useState<boolean>(false);
  const [defaultTab, setDefaultTab] = useState('general');
  const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
  const domainInformation = domain?.a;
  const [cosMaxAccountList, SetCosMaxAccountList] = useState<Array<CosMaxAccountValues>>([]);
  const [isTableTooTall, setIsTableTooTall] = useState(false);

  const [isInitDomain, setIsInitDomain] = useState(false);


  const tableRef = useRef<HTMLTableElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const headers: any = useMemo(
    () => [
      {
        id: 'account',
        label: t('label.account', 'Account'),
        width: '100%',
        bold: true,
      },
    ],
    [t],
  );

  useMemo(() => {
    if (!!domainInformation && domainInformation.length > 0) {
      const domainCosMaxAccountArray = domainInformation.filter(
        (domainContent: any) => domainContent.n === ZIMBRA_DOMAIN_COS_MAX_ACCOUNTS,
      );
      if (domainCosMaxAccountArray && domainCosMaxAccountArray.length > 0) {
        const domainCosMaxAccounts = domainCosMaxAccountArray.map((domainContent: any) => ({
          id: domainContent._content?.split(':')[0],
          value: domainContent._content?.split(':')[1] ? domainContent._content?.split(':')[1] : -1,
        }));
        SetCosMaxAccountList(domainCosMaxAccounts);
      } else {
        SetCosMaxAccountList([]);
      }
    }
  }, [domainInformation]);


  const openDetailView = useCallback((acc: any): void => {
    setSelectedAccount(acc);
    setShowEditAccountView(true);
  }, []);

  const getAccountDistributionList = useCallback(
    (id: string) => {
      getAccountMembershipRequest(id)
        .then((res) => {
          const data = res?.dl?.filter((item: objectType) => item?.via === undefined);

          const tableList = data
            ? data.map((item: objectType) => {
                const selectedItem: any = distributionList.filter(
                  (i: objectType) => i.name === item.name,
                );
                const des = selectedItem[0].a?.filter((i: Attribute) => i.n === 'description')[0]
                  ._content;
                return {
                  ...item,
                  accname: accountName.split('@')[0],
                  description: des,
                };
              })
            : [];
          setAccountDistributionList(tableList || []);
        })
        .catch((error) => {
          createSnackbar({
            key: 'error',
            severity: 'error',
            label: error?.message
              ? error?.message
              : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        });
    },
    [accountName, createSnackbar, distributionList, t],
  );

  const fetchDistributionList = useCallback(
    (
      query: string,
      name: string | undefined,
      offsetData: number,
      limitData: number,
      type?: string,
    ): void => {
      if (type === ADMIN_GROUP_FLAG) {
        setLoading(true);
      }
      const attrs =
        'displayName,zimbraId,zimbraMailHost,uid,description,zimbraIsAdminGroup,zimbraMailStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount';
      const types = 'distributionlists,dynamicgroups';
      searchDirectory({ attr: attrs, type: types, domainName: name ?? '', query, offset: offsetData, limit: limitData, sortBy: 'name' })
        .then((res) => {
          const data = res?.dl;
          if (data && type === SYSTEM_ACCOUNT_FLAG) {
            setDistributionList((prevDistributionList) => [
              ...prevDistributionList,
              ...(data as unknown as objectType[]),
            ]);
            if (res.more) {
              fetchDistributionList(
                query,
                domain?.name,
                offsetData + limitData,
                limitData,
                SYSTEM_ACCOUNT_FLAG,
              );
            }
          } else if (type === ADMIN_GROUP_FLAG) {
            setIsInitDomain((data?.length ?? 0) > 0);
            setLoading(false);
          }
        })
        .catch((error) => {
          const snackbarConfig = generateSnackbarFromError(error, t);
          createSnackbar(snackbarConfig);
        });
    },
    [createSnackbar, domain?.name, t],
  );

  const handleRevokesGrants = useCallback(() => {
    setLoading(true);
    InitDomainForDelegation('/admin/initDomainForDelegation', {
      _jsns: ZIMBRA_ADMIN_URN,
      domain: domain?.name,
    })
      .then((res: objectType) => {
        if (cosMaxAccountList.length > 0) {
          const request: unknown[] = [];
          cosMaxAccountList.forEach((item: CosMaxAccountValues) => {
            const target = {
              _content: item?.id,
              type: 'cos',
              by: 'id',
            };
            const grantee = {
              by: 'name',
              type: 'grp',
              _content: `${HELPDESK_ADMINS}@${domain?.name}`,
            };
            request.push(
              postSoapFetchRequest(
                `/service/admin/soap/GrantRightRequest`,
                {
                  _jsns: ZIMBRA_ADMIN_URN,
                  target,
                  grantee,
                  right: {
                    _content: 'getCos',
                  },
                },
                'GrantRightRequest',
              ),
            );

            request.push(
              postSoapFetchRequest(
                `/service/admin/soap/GrantRightRequest`,
                {
                  _jsns: ZIMBRA_ADMIN_URN,
                  target,
                  grantee,
                  right: {
                    _content: 'listCos',
                  },
                },
                'GrantRightRequest',
              ),
            );

            request.push(
              postSoapFetchRequest(
                `/service/admin/soap/GrantRightRequest`,
                {
                  _jsns: ZIMBRA_ADMIN_URN,
                  target,
                  grantee,
                  right: {
                    _content: 'assignCos',
                  },
                },
                'GrantRightRequest',
              ),
            );
          });
          Promise.all(request).then();
        }
        setLoading(false);
        fetchDistributionList(
          `(&(!(zimbraIsSystemAccount=TRUE)))`,
          domain?.name,
          0,
          10,
          SYSTEM_ACCOUNT_FLAG,
        );
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: res?.message
            ? res?.message
            : t(
                'label.the_last_changes_has_been_saved_successfully',
                'Changes have been saved successfully',
              ),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      })
      .catch((error) => {
        setLoading(false);
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error?.message
            ? error?.message
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      });
  }, [domain?.name, cosMaxAccountList, fetchDistributionList, createSnackbar, t]);

  const onDeleteFromList = useCallback(
    (lists: objectType[], type: string) => {
      if (lists?.length > 0) {
        lists.forEach((item: objectType) => {
          const id: any = {
            n: 'id',
            _content: type === 'all' ? item.id : item,
          };
          const dlmItem: any = {
            n: 'dlm',
            _content: selectedAccount?.name,
          };
          removeDistributionListMember(id, dlmItem)
            .then((data) => {
              if (data) {
                createSnackbar({
                  key: 'success',
                  severity: 'success',
                  label: t(
                    'account_details.right_for_selected_user_deleted_successfully',
                    'Right for selected user deleted successfully',
                  ),
                  autoHideTimeout: 3000,
                  hideButton: true,
                  replace: true,
                });
                getAccountDistributionList(selectedAccount?.zimbraId);
              }
            })
            .catch((error) => {
              createSnackbar({
                key: 'error',
                severity: 'error',
                label: error?.message
                  ? error?.message
                  : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
                autoHideTimeout: 3000,
                hideButton: true,
                replace: true,
              });
            });
        });
      }
    },
    [t, selectedAccount, getAccountDistributionList, createSnackbar],
  );

  const closeHandler = (): void => {
    setOpen(false);
  };

  const removeAllACLs = (): void => {
    onDeleteFromList(accountDistributionList, 'all');
    setOpen(false);
  };
  const deleteHandler = (): void => {
    setAccountName('');
    setOpen(false);
  };

  const parseAccountListResponse = useCallback(
    (accountListResponse: any): any[] => {
      const accountListArr: any[] = [];
      accountListResponse.forEach((item: any): void => {
        item?.a?.forEach((ele: any) => {
          if (ele?.n === 'mail') {
            if (item[ele?.n]) {
              item[ele?.n].push(ele._content);
            } else {
              item[ele?.n] = [ele._content];
            }
          } else {
            item[ele?.n] = ele._content;
          }
        });
        accountListArr.push({
          id: item?.id,
          columns: [
            <Row
              onClick={(): void => openDetailView(item)}
              key={item?.id}
              style={{ textAlign: 'left', justifyContent: 'flex-start' }}
            >
              <ds-text as="span" weight="light">{item?.name || ' '}</ds-text>
            </Row>,
          ],
          item,
          clickable: true,
        });
      });
      return accountListArr;
    },
    [openDetailView],
  );

  const getAccountList = useCallback((): void => {
    setIsRequestInProgress(true);
    const type = 'accounts';
    const searchQuery =
      '(|(&(zimbraIsAdminAccount=TRUE))(&(zimbraIsDelegatedAdminAccount=TRUE)(!(zimbraIsAdminAccount=TRUE))))';
    const attrs =
      'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraCreateTimestamp,zimbraLastLogonTimestamp,zimbraMailQuota,zimbraNotes,mail';
    accountListDirectory(attrs, type, domain?.name, searchQuery, offset, pageLimit)
      .then((data: any) => {
        const accountListResponse: any = data?.account || [];
        if (accountListResponse && Array.isArray(accountListResponse)) {
          setTotalAccount(data.searchTotal || 0);
          const accountListArr = parseAccountListResponse(accountListResponse);
          setAllAccount(accountListArr);
        }
        setIsRequestInProgress(false);
      })
      .catch((error) => {
        const snackbarConfig = generateSnackbarFromError(error, t);
        createSnackbar(snackbarConfig);
      });
  }, [domain?.name, offset, pageLimit, parseAccountListResponse, t, createSnackbar]);

  useEffect(() => {
    fetchDistributionList(
      `(&(!(zimbraIsSystemAccount=TRUE)))`,
      domain?.name,
      0,
      10,
      SYSTEM_ACCOUNT_FLAG,
    );
    fetchDistributionList(`(zimbraIsAdminGroup=TRUE)`, domain?.name, 0, 10, ADMIN_GROUP_FLAG);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getAccountList();
  }, [offset, getAccountList]);

  useEffect(() => {
    if (userSetting?.attrs) {
      const accountIsGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount;
      if (accountIsGlobalAdmin && accountIsGlobalAdmin === 'TRUE') {
        setIsGlobalAdmin(true);
      }
    }
  }, [userSetting?.attrs]);

  useEffect(() => {
    const table = tableRef.current;

    const handleResize = debounce((): void => {
      if (table) {
        const tableHeight = table.clientHeight + 450;
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

  return (
    <Container
      padding={{ top: 'large', left: 'large', right: 'large' }}
      background="gray6"
      mainAlignment="flex-start"
    >
      {accountDistributionList?.length > 0 && open && domain && (
        <DisableDelegateAdminModel
          open={open}
          closeHandler={closeHandler}
          removeAllACLs={removeAllACLs}
          saveHandler={deleteHandler}
          modelDetail={domain}
        />
      )}
      <Container
        orientation="column"
        background="gray6"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
      >
        <Row mainAlignment="flex-start" width="100%">
          <Container orientation="vertical" mainAlignment="space-around" height="10.5rem">
            <Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
              <Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
                <ds-text as="h1" size="medium" weight="bold" color="gray0">
                  {t('label.delegates_domain_admins', 'Delegated Domain Admins')}
                </ds-text>
              </Row>
            </Row>
            <Row orientation="horizontal" width="100%" background="gray6">
              <ds-divider></ds-divider>
            </Row>
            {isGlobalAdmin && (
              <>
                <ListRow padding={{ vertical: 'large' }}>
                  <Button
                    label={
                      isInitDomain
                        ? t('label.re_init_domain', 'RE-INIT DOMAIN')
                        : t('label.init_domain', 'INIT DOMAIN')
                    }
                    color="primary"
                    onClick={handleRevokesGrants}
                    loading={loading}
                  />
                </ListRow>
                <Row orientation="horizontal" width="100%" background="gray6">
                  <ds-divider></ds-divider>
                </Row>
              </>
            )}
          </Container>
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
          padding={{ top: 'large' }}
        >
          <Row mainAlignment="flex-start" width="100%" padding={{ top: 'large', left: 'large' }}>
            <Row
              mainAlignment="flex-start"
              width="100%"
              crossAlignment="flex-start"
              padding={{ vertical: 'large' }}
            >
              <ds-text as="h2" size="medium" weight="bold" color="gray0">
                {t('label.administration_rights', 'Administration Rights')}
              </ds-text>
            </Row>
          </Row>
          {/* TODO: uncomment once we fix the delgates feature's bug completely. */}
          {/* <ListRow padding={{ all: '0' }}>
						<Padding right="small" width="46%">
							<Input
								label={t('label.account', 'Account')}
								value={accountName}
								backgroundColor="gray5"
								inputName="username"
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									setAccountName(e.target.value);
								}}
								disabled={isDisableRights}
							/>
						</Padding>
						<Padding horizontal="small" width="46%">
							<Select
								items={options}
								label={t('label.access_control_lists', 'Rights (Access Control Lists)')}
								background="gray5"
								showCheckbox={false}
								selection={selectedOption}
								onChange={onOptionChange}
								disabled={isDisableRights}
							/>
						</Padding>
						<Padding left="small" width="8%">
							<Button
								type="outlined"
								label={t('label.add', 'ADD')}
								iconPlacement="right"
								width="fill"
								onClick={onAdd}
								disabled={accountName === '' || selectedOption?.length === 0 || isDisableRights}
								size="extralarge"
							/>
						</Padding>
					</ListRow> */}
          <Row
            mainAlignment="flex-start"
            width="100%"
            padding={{ top: 'small', left: 'small', right: 'small' }}
          >
            <Container height="fit" crossAlignment="flex-start" background="gray6">
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
                  rows={!isRequestInProgress ? allAccount : []}
                  headers={headers}
                  showCheckbox={false}
                  multiSelect={false}
                  ref={tableRef}
                  style={{
                    overflow: 'auto',
                    height: isRequestInProgress || allAccount.length === 0 ? '50%' : '100%',
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
                {allAccount?.length === 0 && !isRequestInProgress && (
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
                      <ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
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
                      <ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
                        <Trans
                          i18nKey="label.create_account_list_msg"
                          defaults="You can create a new Account by clicking on <bold>Create</bold> button (upper left corner) or on the Add (<bold>+</bold>) button up here"
                          components={{ bold: <strong /> }}
                        />
                      </ds-text>
                    </Row>
                  </Container>
                )}
                {allAccount.length !== 0 && (
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
                          pageSize={pageLimit}
                        />
                      </Container>

                      <Container
                        crossAlignment="flex-end"
                        orientation="horizontal"
                        mainAlignment="flex-end"
                        padding={{ top: 'small' }}
                      >
                        <TrackNumberPerPage setPageSize={setPageLimit} />
                      </Container>
                    </Container>
                  </Container>
                )}
              </Row>
            </Container>
          </Row>
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
                  setShowEditAccountView(false);
                }}
                defaultTab={defaultTab}
              />
            </ModalOverlay>
          )}
        </Container>
      </Container>
    </Container>
  );
};

export default ManageDelegates;
