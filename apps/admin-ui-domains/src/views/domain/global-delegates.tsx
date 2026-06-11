/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  ModalOverlay,
  Paging,
  Row,
  Table,
  type THeader,
  TrackNumberPerPage,
  useSnackbar,
} from '@zextras/ui-components';
import {
  CosAttribute,
  getCosGeneralInformation,
  type GetCosResponse,
  postSoapFetchRequest,
  useIsAdvanced,
} from '@zextras/ui-shared';
import { format } from 'date-fns';
import { debounce, filter, flatMapDeep } from 'lodash-es';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
  type Attribute,
  type GetAccountMembershipResponse,
  type GetAccountResponse,
  type GetSessionsResponse,
  type SearchDirectoryResponse,
  type SessionInfo,
  type Signature,
  type SoapEntity,
  type TRow,
  type ZextrasRawResponse,
} from '../../../types';
import logo from '../../assets/gardian.svg';
import { RECORD_DISPLAY_LIMIT, ZIMBRA_ADMIN_URN } from '../../constants';
import { accountListDirectory } from '../../services/account-list-directory-service';
import { getAccountRequest } from '../../services/get-account';
import { getAccountMembershipRequest } from '../../services/get-account-membership';
import { getSessions } from '../../services/get-sessions';
import { getSingatures } from '../../services/get-signature-service';
import { fetchSoap } from '../../services/listOTP-service';
import ScrollContainer from '../components/scrollComponent';
import { generateSnackbarFromError } from '../error/generate-snackbar-error';
import { AccountContext, AccountDetail, CosDetail } from './manange/accounts/account-context';
import EditAccount from './manange/accounts/edit-account/edit-account';

type UserSession = {
  name: string;
  sid: string;
  zid: string;
  ip: string;
  service: string;
};

type DelegateMembership = { label: string; closable: boolean; disabled: boolean };

type FolderGrant = {
  d: string;
  gt: string;
  zid: string;
  id?: string;
  name?: string;
};

type MailFolder = {
  id: string;
  name?: string;
  folder?: Array<MailFolder>;
  acl?: { grant?: Array<FolderGrant> };
};

type DelegateIdentity = {
  grantee?: Array<{ id?: string; name?: string; type?: string }>;
  folder?: Array<FolderGrant>;
};

type OtpItem = {
  id: string;
  label?: string;
  enabled?: boolean;
  failed_attempts?: number;
  created: string | number;
  description?: string;
};

type StatusColorMap = Record<string, { color: string; label: string }>;

type AccountTableRow = TRow & { item?: SoapEntity };
type OtpTableRow = TRow & { item?: OtpItem };

const GlobalDelegates: FC = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const [accountDetail, setAccountDetail] = useState<AccountDetail>({});
  const [cosDetail, setCosDetail] = useState<CosDetail>({});
  const [accSpecificDetail, setAccSpecificDetail] = useState<Record<string, string>>({});
  const [defaultTab, setDefaultTab] = useState('general');
  const [directMemberList, setDirectMemberList] = useState<Array<DelegateMembership>>([]);
  const [inDirectMemberList, setInDirectMemberList] = useState<Array<DelegateMembership>>([]);
  const [initAccountDetail, setInitAccountDetail] = useState<Record<string, unknown>>({});
  const [otpList, setOtpList] = useState<Array<OtpTableRow>>([]);
  const [credentialList, setCredentialList] = useState<Array<unknown>>([]);
  const [identitiesList, setIdentitiesList] = useState<Array<DelegateIdentity>>([]);
  const [folderList, setFolderList] = useState<Array<MailFolder>>([]);
  const [deligateDetail, setDeligateDetail] = useState<Record<string, unknown>>({});
  const [deleteAdministrationRights, setDeleteAdministrationRights] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [defaultCOS, setDefaultCOS] = useState<boolean>(false);
  const [allUserSessionList, setAllUserSessionList] = useState<Array<UserSession>>([]);
  const [userSessionList, setUserSessionList] = useState<Array<UserSession>>([]);
  const flatten = useCallback(
    (item: MailFolder): Array<MailFolder> => [item, ...flatMapDeep(item.folder ?? [], flatten)],
    [],
  );
  const isAdvanced = useIsAdvanced();
  const tableRef = useRef<HTMLTableElement>(null);
  const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
  const [isTableTooTall, setIsTableTooTall] = useState(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [allowedDeletePassword, setAllowedDeletePassword] = useState<boolean>(false);

  const headers: Array<THeader> = useMemo(
    () => [
      {
        id: 'account',
        label: t('label.account', 'Account'),
        width: '25%',
        bold: true,
      },
      {
        id: 'type',
        label: t('label.type', 'Type'),
        width: '15%',
        bold: true,
      },
      {
        id: 'domain',
        label: t('label.domain', 'domain'),
        width: '20%',
        bold: true,
      },
      {
        id: 'description',
        label: t('label.description', 'Description'),
        width: '40%',
        bold: true,
      },
    ],
    [t],
  );

  const [accountList, setAccountList] = useState<Array<AccountTableRow>>([]);
  const [selectedAccount, setSelectedAccount] = useState<Record<string, unknown>>({});
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
  const [totalAccount, setTotalAccount] = useState<number>(0);
  const [showEditAccountView, setShowEditAccountView] = useState<boolean>(false);
  const [initialGlobalRights, setinitialGlobalRights] = useState({
    setGlobalConfig: false,
    getGlobalConfig: false,
  });
  const [globalRights, setGlobalRights] = useState({
    setGlobalConfig: false,
    getGlobalConfig: false,
  });

  const [signatureList, setSignatureList] = useState<Array<Signature>>([]);
  const [signatureItems, setSignatureItems] = useState<Array<Signature>>([]);

  const generateSignatureList = (signatureResponse: Array<Signature>): void => {
    if (signatureResponse && Array.isArray(signatureResponse)) {
      setSignatureList(signatureResponse);
    }
  };
  const getSignatureDetail = useCallback((id: string): void => {
    getSingatures(id).then((data) => {
      const signatureResponse =
        ((data as ZextrasRawResponse)?.Body?.GetSignaturesResponse?.signature as
          | Array<Signature>
          | undefined) ?? [];
      generateSignatureList(signatureResponse);
    });
  }, []);

  const STATUS_COLOR: StatusColorMap = useMemo(
    () => ({
      active: {
        color: '#8BC34A',
        label: t('label.active', 'Active'),
      },
      maintenance: {
        color: '#2196D3',
        label: t('label.in_maintenance', 'In maintenance'),
      },
      locked: {
        color: '#D74942',
        label: t('label.locked', 'Locked'),
      },
      closed: {
        color: '#828282',
        label: t('label.closed', 'Closed'),
      },
      pending: {
        color: '#828282',
        label: t('label.pending', 'Pending'),
      },
      lockout: {
        color: '#D74942',
        label: t('label.lockout', 'Lockout'),
      },
    }),
    [t],
  );

  const accountUserType = useCallback((item: Record<string, unknown>): string => {
    if (item.zimbraIsAdminAccount === 'TRUE') return 'Admin';
    if (item.zimbraIsDelegatedAdminAccount === 'TRUE') return 'DelegatedAdmin';
    if (item.zimbraIsExternalVirtualAccount === 'TRUE') return 'External';
    if (item.zimbraIsSystemAccount === 'TRUE') return 'System';
    return 'Normal';
  }, []);
  const getAccountSpecificDetail = useCallback((id: string): void => {
    getAccountRequest(id, '', 0).then((res: GetAccountResponse) => {
      const accountObj: Record<string, string> = {};

      res?.account?.[0]?.a?.forEach((ele: Attribute) => {
        if (accountObj[ele.n]) {
          accountObj[ele.n] = `${accountObj[ele.n]}, ${ele._content}`;
        } else {
          accountObj[ele.n] = ele._content;
        }
      });
      if (accountObj.zimbraIsAdminAccount === undefined) {
        accountObj.zimbraIsAdminAccount = 'FALSE';
      }
      if (accountObj.zimbraIsDelegatedAdminAccount === undefined) {
        accountObj.zimbraIsDelegatedAdminAccount = 'FALSE';
      }
      setAccSpecificDetail({ ...accountObj });
    });
  }, []);
  const getCosDetail = useCallback((id: string): void => {
    getCosGeneralInformation(id).then((data: GetCosResponse) => {
      const obj: Record<string, string> = {};
      data?.cos?.[0]?.a?.forEach((ele: CosAttribute) => {
        if (obj[ele.n]) {
          obj[ele.n] = `${obj[ele.n]}, ${ele._content}`;
        } else {
          obj[ele.n] = ele._content;
        }
      });
      obj.zimbraPrefMailForwardingAddress = obj.zimbraPrefMailForwardingAddress
        ? obj.zimbraPrefMailForwardingAddress
        : '';
      obj.zimbraPrefCalendarForwardInvitesTo = obj.zimbraPrefCalendarForwardInvitesTo
        ? obj.zimbraPrefCalendarForwardInvitesTo
        : '';

      setCosDetail({ ...obj });
    });
  }, []);
  const getAccountDetail = useCallback(
    (id: string): void => {
      getAccountRequest(id, '', 1)
        .then((data: GetAccountResponse) => {
          const obj: Record<string, string> = {};

          data?.account?.[0]?.a?.forEach((ele: Attribute) => {
            if (obj[ele.n]) {
              obj[ele.n] = `${obj[ele.n]}, ${ele._content}`;
            } else {
              obj[ele.n] = ele._content;
            }
          });
          if (obj.userPassword) {
            obj.password = '******';
            obj.repeatPassword = '******';
          } else {
            obj.password = '';
            obj.repeatPassword = '';
          }
          obj.zimbraPrefMailForwardingAddress = obj.zimbraPrefMailForwardingAddress
            ? obj.zimbraPrefMailForwardingAddress
            : '';
          obj.zimbraPrefCalendarForwardInvitesTo = obj.zimbraPrefCalendarForwardInvitesTo
            ? obj.zimbraPrefCalendarForwardInvitesTo
            : '';

          obj.name = data?.account?.[0]?.name ?? '';
          if (obj.zimbraIsAdminAccount === undefined) {
            obj.zimbraIsAdminAccount = 'FALSE';
          }
          if (obj.zimbraIsDelegatedAdminAccount === undefined) {
            obj.zimbraIsDelegatedAdminAccount = 'FALSE';
          }
          setInitAccountDetail({ ...obj });
          setSelectedAccount({ ...obj, id });
          setAccountDetail({ ...obj });
          getAccountSpecificDetail(id);
          getCosDetail(obj.zimbraCOSId);
        })

        .catch((error: Error) => {
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
    [getAccountSpecificDetail, getCosDetail, createSnackbar, t],
  );
  const getAccountMembership = useCallback(
    (id: string): void => {
      getAccountMembershipRequest(id)
        .then((data: GetAccountMembershipResponse) => {
          const directMemArr: Array<DelegateMembership> = [];
          const inDirectMemArr: Array<DelegateMembership> = [];

          data?.dl?.forEach((ele) => {
            if (ele?.via)
              inDirectMemArr.push({ label: ele?.name, closable: false, disabled: true });
            else directMemArr.push({ label: ele?.name, closable: false, disabled: true });
          });

          setDirectMemberList(directMemArr);
          setInDirectMemberList(inDirectMemArr);
        })

        .catch((error: Error) => {
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
    [setDirectMemberList, setInDirectMemberList, t, createSnackbar],
  );
  const getListOtp = useCallback(
    (id: string): void => {
      fetchSoap('zextras', {
        _jsns: ZIMBRA_ADMIN_URN,
        module: 'ZxAuth',
        action: 'list_totp_command',
        account: `${id}`,
      }).then((res) => {
        const typedRes = res as { ok?: boolean; response?: { list?: Array<OtpItem> } };
        if (typedRes?.ok) {
          const otpListResponse = typedRes.response?.list;
          if (otpListResponse && Array.isArray(otpListResponse)) {
            const otpListArr: Array<OtpTableRow> = [];
            otpListResponse.forEach((item: OtpItem) => {
              otpListArr.push({
                id: item?.id,
                columns: [
                  <ds-text as="span" size="medium" key={item?.id} color="gray0">
                    {item?.label || ' '}
                  </ds-text>,
                  <ds-text as="span" size="medium" key={item?.id} color="gray0">
                    {item?.enabled
                      ? t('label.enabled', 'Enabled')
                      : t('label.disabled', 'Disabled')}
                  </ds-text>,
                  <ds-text as="span" size="medium" key={item?.id}>
                    {item?.failed_attempts}
                  </ds-text>,
                  <ds-text as="span" size="medium" key={item?.id}>
                    {format(new Date(item?.created), 'dd/MMM/yyyy')}
                  </ds-text>,
                  <ds-text as="span" size="medium" key={item?.id} color="gray0">
                    {item?.description || <>&nbsp;</>}
                  </ds-text>,
                ],
                item,
                clickable: true,
              });
            });
            setOtpList(otpListArr);
          }
        }
      });
    },
    [t],
  );
  const getCredentialList = useCallback((id: string): void => {
    fetchSoap('zextras', {
      _jsns: ZIMBRA_ADMIN_URN,
      module: 'ZxAuth',
      action: 'credential',
      request: 'list',
      account: `${id}`,
    }).then((res) => {
      const typedRes = res as { response?: { values?: Array<unknown> } };
      if (typedRes.response?.values) {
        setCredentialList(typedRes.response?.values);
      } else {
        setCredentialList([]);
      }
    });
  }, []);
  const getFolderList = useCallback(
    (acc: { id: string; name: string }, delegateList: Array<DelegateIdentity>): void => {
      postSoapFetchRequest(
        `/service/admin/soap/GetFolderRequest`,
        {
          _jsns: 'urn:zimbraMail',
        },
        'GetFolderRequest',
        acc.id,
      ).then((res) => {
        const folderResponse = (res as ZextrasRawResponse)?.Body?.GetFolderResponse?.folder as
          | Array<MailFolder>
          | undefined;
        const allFolder: Array<MailFolder> =
          folderResponse || flatMapDeep(folderResponse ?? [], flatten) || [];
        allFolder.forEach((ele) => {
          ele.id = ele.id.split(':')[1];
          return ele;
        });
        const filteredFolders = filter(allFolder, (ele) =>
          ['1', '2', '7', '10', '4', '5', '6', '3'].includes(ele.id),
        );
        const userDelegate: Array<FolderGrant & { id: string; name?: string }> = [];
        filteredFolders.forEach((ele) => {
          ele?.acl?.grant &&
            ele?.acl?.grant.forEach((el) => {
              userDelegate.push({ ...el, id: ele.id, name: ele.name });
            });
        });
        setFolderList(filteredFolders);
        userDelegate.forEach((ele) => {
          let found = false;
          delegateList.forEach((el) => {
            // const folder: any[] = filter(userDelegate, { d: ele?.grantee?.[0]?.name });
            if (el?.grantee?.[0]?.name === ele?.d) {
              found = true;
              if (el?.folder?.length) {
                el?.folder.push(ele);
              } else {
                el.folder = [ele];
              }
            }
          });
          if (!found) {
            delegateList.push({
              grantee: [{ id: ele.zid, name: ele.d, type: ele.gt }],
              folder: [ele],
            });
          }
        });

        setIdentitiesList(delegateList);
      });
    },
    [flatten],
  );
  const getIdentitiesList = useCallback(
    (acc: { id: string; name: string }): void => {
      const request = {
        _jsns: ZIMBRA_ADMIN_URN,
        target: {
          _content: acc.name,
          type: 'account',
          by: 'name',
        },
      };
      postSoapFetchRequest(
        `/service/admin/soap/GetGrantsRequest`,
        {
          ...request,
        },
        'GetGrantsRequest',
        acc.id,
      ).then((res) => {
        const grants = (res as ZextrasRawResponse)?.Body?.GetGrantsResponse?.grant as
          | Array<DelegateIdentity>
          | undefined;
        getFolderList(acc, grants ?? []);
      });
    },
    [getFolderList],
  );

  const getAllUserSession = useCallback((acc: string) => {
    const sessionType: Array<string> = ['admin', 'imap', 'soap'];
    setUserSessionList([]);
    setAllUserSessionList([]);
    sessionType.forEach((item: string) => {
      getSessions(item, acc).then((resp: GetSessionsResponse) => {
        if (resp && resp?.s) {
          const existingSession = resp?.s;
          if (existingSession) {
            const session: Array<UserSession> = [];
            const filterSession = existingSession.filter(
              (sessionItem: SessionInfo) => sessionItem?.name === acc,
            );
            if (filterSession.length > 0) {
              filterSession.forEach((element: SessionInfo) => {
                session.push({
                  ip: '',
                  name: element?.name,
                  sid: element?.sid,
                  service: '',
                  zid: element?.zid,
                });
              });
            }
            setUserSessionList((prev) => [...prev, ...session]);
            setAllUserSessionList((prev) => [...prev, ...session]);
          }
        }
      });
    });
  }, []);

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

  const accountContextValue = useMemo(
    () => ({
      accountDetail,
      cosDetail,
      setAccountDetail,
      accSpecificDetail,
      setAccSpecificDetail,
      directMemberList,
      inDirectMemberList,
      setDirectMemberList,
      setInDirectMemberList,
      initAccountDetail,
      setInitAccountDetail,
      setSignatureItems,
      setSignatureList,
      otpList,
      getListOtp,
      identitiesList,
      deligateDetail,
      setDeligateDetail,
      getIdentitiesList,
      folderList,
      setFolderList,
      credentialList,
      getCredentialList,
      initialGlobalRights,
      setinitialGlobalRights,
      globalRights,
      setGlobalRights,
      deleteAdministrationRights,
      setDeleteAdministrationRights,
      userSessionList,
      setAllUserSessionList,
      allUserSessionList,
      setUserSessionList,
      defaultCOS,
      setDefaultCOS,
      allowedDeletePassword,
      setAllowedDeletePassword,
    }),
    [
      accountDetail,
      cosDetail,
      accSpecificDetail,
      directMemberList,
      inDirectMemberList,
      initAccountDetail,
      otpList,
      getListOtp,
      identitiesList,
      deligateDetail,
      getIdentitiesList,
      folderList,
      credentialList,
      getCredentialList,
      initialGlobalRights,
      globalRights,
      deleteAdministrationRights,
      userSessionList,
      allUserSessionList,
      defaultCOS,
      allowedDeletePassword,
    ],
  );

  const openDetailView = useCallback(
    (acc: SoapEntity): void => {
      setShowEditAccountView(true);
      getAccountDetail(acc?.id);
      getSignatureDetail(acc?.id);
      getAccountMembership(acc?.id);
      getIdentitiesList(acc);
      getAllUserSession(acc?.name);
      if (isAdvanced) {
        getListOtp(acc?.name);
        getCredentialList(acc?.name);
      }
    },
    [
      getAccountDetail,
      getSignatureDetail,
      getAccountMembership,
      getIdentitiesList,
      getAllUserSession,
      isAdvanced,
      getListOtp,
      getCredentialList,
    ],
  );

  const getAccountList = useCallback((): void => {
    setIsRequestInProgress(true);
    const type = 'accounts';
    const searchQuery =
      '(|(&(zimbraIsAdminAccount=TRUE))(&(zimbraIsDelegatedAdminAccount=TRUE)(!(zimbraIsAdminAccount=TRUE))))';
    const domainName = '';
    const attrs =
      'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraCreateTimestamp,zimbraLastLogonTimestamp,zimbraMailQuota,zimbraNotes,mail';
    accountListDirectory(attrs, type, domainName, searchQuery, offset, limit)
      .then((data: SearchDirectoryResponse<'account' | 'dl' | 'calresource'>) => {
        const accountListResponse = data?.account ?? [];
        if (accountListResponse && Array.isArray(accountListResponse)) {
          const accountListArr: Array<AccountTableRow> = [];
          setTotalAccount(data.searchTotal || 0);
          accountListResponse.forEach((item) => {
            const mutable = item as SoapEntity & Record<string, unknown> & {
              mail?: Array<string>;
              description?: string;
            };
            item?.a?.forEach((ele: Attribute) => {
              if (ele?.n === 'mail') {
                const existing = mutable[ele.n];
                if (Array.isArray(existing)) {
                  existing.push(ele._content);
                } else {
                  mutable[ele.n] = [ele._content];
                }
              } else {
                mutable[ele.n] = ele._content;
              }
            });
            accountListArr.push({
              id: mutable?.id,
              columns: [
                <ds-text
                  as="span"
                  size="small"
                  key={mutable?.id}
                  color="gray0"
                  weight="regular"
                  onClick={(): void => {
                    openDetailView(mutable);
                  }}
                >
                  {mutable?.name || ' '}
                </ds-text>,
                <ds-text
                  as="span"
                  size="small"
                  key={mutable?.id}
                  color="gray0"
                  weight="light"
                  onClick={(): void => {
                    openDetailView(mutable);
                  }}
                >
                  {accountUserType(mutable)}
                </ds-text>,
                <ds-text
                  as="span"
                  size="small"
                  key={mutable?.id}
                  color="gray0"
                  weight="light"
                  onClick={(): void => {
                    openDetailView(mutable);
                  }}
                >
                  {mutable?.name?.split('@')[1] || ' '}
                </ds-text>,
                <ds-text
                  as="span"
                  size="small"
                  weight="light"
                  key={mutable?.id}
                  color="gray0"
                  onClick={(event: { stopPropagation: () => void }): void => {
                    event.stopPropagation();
                    openDetailView(mutable);
                  }}
                >
                  {mutable?.description || <>&nbsp;</>}
                </ds-text>,
              ],
              item: mutable,
              clickable: true,
            });
          });
          setAccountList(accountListArr);
        }
        setIsRequestInProgress(false);
      })
      .catch((error: Error) => {
        const snackbarConfig = generateSnackbarFromError(error, t);
        createSnackbar(snackbarConfig);
        setIsRequestInProgress(false);
      });
  }, [accountUserType, limit, offset, openDetailView, t, createSnackbar]);

  useEffect(() => {
    getAccountList();
  }, [offset, getAccountList]);

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
          <Row orientation="horizontal" width="100%" mainAlignment="flex-start">
            <ds-text as="h1" size="medium" weight="bold" color="gray0">
              {t('label.administrators', 'Administrators')}
            </ds-text>
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
              <ds-text as="h2" size="small" weight="bold" color="gray0">
                {t('domain.administration_rights', 'Administration Rights')}
              </ds-text>
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
                      <Paging totalItem={totalAccount} setOffset={setOffset} pageSize={limit} />
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
              <AccountContext.Provider value={accountContextValue}>
                {showEditAccountView && (
                  <ModalOverlay open={showEditAccountView} maxWidth="58.75rem">
                    <EditAccount
                      setShowEditAccountView={setShowEditAccountView}
                      selectedAccount={selectedAccount}
                      getAccountList={getAccountList}
                      signatureList={signatureList}
                      signatureItems={signatureItems}
                      getAccountDetail={getAccountDetail}
                      defaultTab={defaultTab}
                      setDefaultTab={setDefaultTab}
                      showModal={showModal}
                      setShowModal={setShowModal}
                      isDirty={isDirty}
                      setIsDirty={setIsDirty}
                      STATUS_COLOR={STATUS_COLOR}
                      setIsAccountDeleted={false}
                    />
                  </ModalOverlay>
                )}
              </AccountContext.Provider>
            </Row>
          </Container>
        </Row>
      </Container>
    </Container>
  );
};

export default GlobalDelegates;
