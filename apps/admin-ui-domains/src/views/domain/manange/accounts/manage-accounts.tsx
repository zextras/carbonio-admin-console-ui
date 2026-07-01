/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  Input,
  ModalOverlay,
  Padding,
  Paging,
  Row,
  type SelectItem,
  Table,
  type THeader,
  Tooltip,
  TrackNumberPerPage,
  useSnackbar,
} from '@zextras/ui-components';
import {
  type CosAttribute,
  getCoreAttributes,
  getCosGeneralInformation,
  type GetCosResponse,
  getFileQuotaById,
  postSoapFetchRequest,
  useDomainStore,
  useIsAdvanced,
  useTotalQuotaActive,
  useUserAccount,
} from '@zextras/ui-shared';
import { format } from 'date-fns';
import { debounce, filter, flatMapDeep } from 'lodash-es';
import {
  ChangeEvent,
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
  Attribute,
  type GetAccountMembershipResponse,
  type GetAccountResponse,
  type GetSessionsResponse,
  type SearchDirectoryResponse,
  type SessionInfo,
  type SoapEntity,
  type TRow,
  type ZextrasRawResponse,
} from '../../../../../types';

type Signature = {
  id?: string;
  name: string;
  content?: { type?: 'text/plain' | 'text/html'; _content?: string };
};
import logo from '../../../../assets/gardian.svg';
import {
  ABQ_MODE,
  ACCOUNT,
  ASC,
  BACKUP_ENABLED,
  BACKUP_SELF_UNDELETE_ALLOWED,
  COS,
  DESC,
  FILES_QUOTA_LIMIT,
  FILES_QUOTA_USED,
  MAILBOX_QUOTA_USED,
  RECORD_DISPLAY_LIMIT,
  TOTAL_COMPUTED_QUOTA_LIMIT,
  TOTAL_QUOTA_SOURCE,
  TOTAL_QUOTA_STATUS,
  TOTAL_QUOTA_USED,
  TOTAL_QUOTA_USED_BY_MODULE,
  ZIMBRA_ADMIN_URN,
} from '../../../../constants';
import {
  accountListDirectory,
  getMailboxQuota,
} from '../../../../services/account-list-directory-service';
import { checkRightRequest } from '../../../../services/check-right';
import { countAccount } from '../../../../services/count-account-service';
import { getAccountRequest } from '../../../../services/get-account';
import { getAccountMembershipRequest } from '../../../../services/get-account-membership';
import { getAccountQuota } from '../../../../services/get-account-quota';
import { getCosQuota } from '../../../../services/get-cos-quota';
import { getDomainQuota } from '../../../../services/get-domain-quota';
import { getSessions } from '../../../../services/get-sessions';
import { getSingatures } from '../../../../services/get-signature-service';
import { fetchSoap } from '../../../../services/listOTP-service';
import ScrollContainer from '../../../components/scrollComponent';
import { generateSnackbarFromError } from '../../../error/generate-snackbar-error';
import { AccountContext, AccountDetail, CosDetail } from './account-context';
import CreateAccount from './create-account/create-account';
import EditAccount from './edit-account/edit-account';

type UserSession = {
  name: string;
  sid: string;
  zid: string;
  ip: string;
  service: string;
};

type CheckRightResponse = {
  allow: boolean;
  _jsns?: string;
};

type Timer = ReturnType<typeof setTimeout>;

type DelegateMembership = {
  label: string;
  closable: boolean;
  disabled: boolean;
};

type MailFolder = {
  id: string;
  name?: string;
  acl?: { grant?: Array<FolderGrant> };
  folder?: Array<MailFolder>;
  [key: string]: unknown;
};

type FolderGrant = {
  d?: string;
  zid?: string;
  gt?: string;
  [key: string]: unknown;
};

type DelegateIdentity = {
  grantee?: Array<{ id?: string; name?: string; type?: string }>;
  folder?: Array<MailFolder>;
  [key: string]: unknown;
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

type FilterOption = SelectItem<string>;

type AccountTableRow = Omit<TRow, 'id'> & { id: string; item?: SoapEntity };
type OtpTableRow = TRow & { item?: OtpItem };
const ManageAccounts: FC = () => {
  const [t] = useTranslation();
  const isTotalQuotaActive = useTotalQuotaActive();
  const createSnackbar = useSnackbar();
  const timer = useRef<Timer | undefined>(undefined);
  const domainName = useDomainStore((state) => state.domain?.name);
  const domainId = useDomainStore((state) => state.domain?.id);
  const setDomainQuota = useDomainStore((state) => state.setDomainQuota);
  const [accountDetail, setAccountDetail] = useState<AccountDetail>({});
  const [initAccountDetail, setInitAccountDetail] = useState<AccountDetail>({});
  const [cosDetail, setCosDetail] = useState<CosDetail>({});
  const [accSpecificDetail, setAccSpecificDetail] = useState<Record<string, string>>({});
  const [defaultTab, setDefaultTab] = useState('general');
  const [directMemberList, setDirectMemberList] = useState<Array<DelegateMembership>>([]);
  const [inDirectMemberList, setInDirectMemberList] = useState<Array<DelegateMembership>>([]);
  const [defaultCOS, setDefaultCOS] = useState<boolean>(false);
  const [otpList, setOtpList] = useState<Array<OtpTableRow>>([]);
  const [credentialList, setCredentialList] = useState<Array<unknown>>([]);
  const [identitiesList, setIdentitiesList] = useState<Array<DelegateIdentity>>([]);
  const [folderList, setFolderList] = useState<Array<MailFolder>>([]);
  const [deligateDetail, setDeligateDetail] = useState<Record<string, unknown>>({});
  const [deleteAdministrationRights, setDeleteAdministrationRights] = useState([]);
  const [allUserSessionList, setAllUserSessionList] = useState<Array<UserSession>>([]);
  const [userSessionList, setUserSessionList] = useState<Array<UserSession>>([]);
  const flatten = useCallback(
    (item: MailFolder): Array<MailFolder> => [item, ...flatMapDeep(item.folder ?? [], flatten)],
    [],
  );
  const isAdvanced = useIsAdvanced();
  const tableRef = useRef<HTMLTableElement>(null);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [sortedColumn, setSortedColumn] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<typeof ASC | typeof DESC>(ASC);
  const [isTableTooTall, setIsTableTooTall] = useState(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [allowedDeletePassword, setAllowedDeletePassword] = useState<boolean>(false);
  const account = useUserAccount();
  const [accountSearchCurrentPage, setAccountSearchCurrentPage] = useState(1);

  const accountTypeFilter: Array<FilterOption> = useMemo(
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

  const accountStatusFilter: Array<FilterOption> = useMemo(
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
  const headers: Array<THeader> = useMemo(
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
        ] as [FilterOption, ...Array<FilterOption>],

        onChange: (e: Array<FilterOption>) => {
          if (e?.length > 0) {
            let typeQuery = '';
            e.forEach((item: FilterOption) => {
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
        ] as [FilterOption, ...Array<FilterOption>],

        onChange: (e: Array<FilterOption>) => {
          if (e?.length > 0) {
            let statusQuery = '';
            e.forEach((item: FilterOption) => {
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

  const [accountList, setAccountList] = useState<Array<AccountTableRow>>([]);
  const [selectedAccount, setSelectedAccount] = useState<Record<string, unknown>>({});
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
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const generateSignatureList = (signatureResponse: Array<Signature>): void => {
    if (signatureResponse && Array.isArray(signatureResponse)) {
      setSignatureList(signatureResponse);
    }
  };
  const getSignatureDetail = useCallback((id: string): void => {
    getSingatures(id).then((data) => {
      const signatureResponse = data?.Body?.GetSignaturesResponse?.signature || [];
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
  const getListOtp = useCallback(
    (id: string): void => {
      fetchSoap('zextras', {
        _jsns: ZIMBRA_ADMIN_URN,
        module: 'ZxAuth',
        action: 'list_totp_command',
        account: `${id}`,
      }).then((res) => {
        if (res?.ok) {
          const response = (res as { response?: { list?: Array<OtpItem> } }).response;
          const otpListResponse = response?.list;
          if (otpListResponse && Array.isArray(otpListResponse)) {
            const otpListArr: Array<OtpTableRow> = [];
            otpListResponse.forEach((item) => {
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
      const response = (res as { response?: { values?: Array<unknown> } }).response;
      if (response?.values) {
        setCredentialList(response.values);
      } else {
        setCredentialList([]);
      }
    });
  }, []);
  const getABQStatus = useCallback((acc: string) => {
    const body = [
      {
        configType: ACCOUNT,
        configName: [acc],
        attrName: [ABQ_MODE],
      },
      {
        configType: ACCOUNT,
        configName: [acc],
        attrName: [BACKUP_ENABLED],
      },
      {
        configType: ACCOUNT,
        configName: [acc],
        attrName: [BACKUP_SELF_UNDELETE_ALLOWED],
      },
    ];
    getCoreAttributes(body).then((data) => {
      const attributes = data?.attributes as Record<string, Array<{ value: string }>> | undefined;
      if (attributes) {
        setAccountDetail((prev) => ({
          ...prev,
          abqMode: attributes?.abqMode?.[0]?.value || '',
          backupEnabled: attributes?.backupEnabled?.[0]?.value,
          backupSelfUndeleteAllowed: !!attributes?.backupSelfUndeleteAllowed?.[0]?.value,
        }));
        setInitAccountDetail((prev) => ({
          ...prev,
          abqMode: attributes?.abqMode?.[0]?.value || '',
          backupEnabled: attributes?.backupEnabled?.[0]?.value,
          backupSelfUndeleteAllowed: !!attributes?.backupSelfUndeleteAllowed?.[0]?.value,
        }));
      }
    });
  }, []);

  const setAccDetailValue = useCallback(
    (key: string, value: unknown): void => {
      setAccountDetail((prev: Record<string, unknown>) => ({ ...prev, [key]: value }));
      setInitAccountDetail((prev: Record<string, unknown>) => ({ ...prev, [key]: value }));
    },
    [setAccountDetail, setInitAccountDetail],
  );

  const getFileQuotaByAccId = useCallback(
    (accId: string): Promise<void> =>
      getFileQuotaById(accId).then((res) => {
        if (res?.limit) {
          setAccDetailValue(FILES_QUOTA_LIMIT, res?.limit);
        }
        const used = (res as { used?: string })?.used;
        if (used) {
          setAccDetailValue(FILES_QUOTA_USED, used);
        }
      }),
    [setAccDetailValue],
  );

  const getFileQuotaByCosId = useCallback(
    (cosId: string): Promise<void> =>
      getFileQuotaById(cosId, COS).then((res) => {
        if (res?.limit) {
          setCosDetail((prev) => ({ ...prev, [FILES_QUOTA_LIMIT]: res?.limit }));
        }
      }),
    [],
  );

  const getMailboxQuotaUsed = useCallback(
    (accId: string): Promise<void> =>
      getMailboxQuota(accId).then((data) => {
        setAccDetailValue(MAILBOX_QUOTA_USED, data?.mbox?.[0]?.s || 0);
      }),
    [setAccDetailValue],
  );
  const getDeletePasswordRight = useCallback(
    (target: string): void => {
      checkRightRequest(target, account?.name ?? '', 'set.account.userPassword').then(
        (data: CheckRightResponse) => {
          setAllowedDeletePassword(data?.allow);
        },
      );
    },
    [account?.name],
  );

  const retrieveAccountQuotaByAccountId = useCallback(
    (accountId: string, cosIdOfAccount: string): void => {
      getAccountQuota(accountId).then((res) => {
        if (res.type === 'success') {
          setAccDetailValue(TOTAL_COMPUTED_QUOTA_LIMIT, res.totalComputedLimit);
          setAccDetailValue(TOTAL_QUOTA_USED, res.totalUsed);
          setAccDetailValue(TOTAL_QUOTA_USED_BY_MODULE, res.usedByModules);
          setAccDetailValue(TOTAL_QUOTA_SOURCE, res.totalLimitSource);
          setAccDetailValue(TOTAL_QUOTA_STATUS, res.totalStatus);
        } else {
          createSnackbar({
            key: 'retrieveAccountQuotaError',
            severity: 'error',
            label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        }
      });
      getCosQuota(cosIdOfAccount).then((res) => {
        if (res.type === 'success') {
          setCosDetail((prev) => ({
            ...prev,
            [TOTAL_COMPUTED_QUOTA_LIMIT]: res.totalComputedLimit,
          }));
        }
      });
      if (domainId) {
        getDomainQuota(domainId).then((res) => {
          if (res.type !== 'error') {
            setDomainQuota(domainId, res.type === 'success' ? res.limit : 'not-set');
          }
        });
      }
    },
    [createSnackbar, domainId, setAccDetailValue, setDomainQuota, t],
  );

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

          obj.name = data?.account?.[0]?.name;
          obj.domainName = data?.account?.[0]?.name.split('@')[1];
          if (obj.zimbraIsAdminAccount === undefined) {
            obj.zimbraIsAdminAccount = 'FALSE';
          }
          if (obj.zimbraIsDelegatedAdminAccount === undefined) {
            obj.zimbraIsDelegatedAdminAccount = 'FALSE';
          }
          if (!obj.zimbraId) {
            obj.zimbraId = id;
          }
          setInitAccountDetail({ ...obj });
          setSelectedAccount({ ...obj, id });
          setAccountDetail({ ...obj });
          getCosDetail(obj.zimbraCOSId);
          getAccountSpecificDetail(id);
          setDefaultCOS(!obj.zimbraCOSId);
          getMailboxQuotaUsed(id);
          if (isAdvanced) {
            if (isTotalQuotaActive) {
              retrieveAccountQuotaByAccountId(id, obj.zimbraCOSId);
            }
            getListOtp(data?.account?.[0]?.name);
            getCredentialList(data?.account?.[0]?.name);
            getABQStatus(id);
            getFileQuotaByAccId(id);
            setTimeout(() => {
              getFileQuotaByCosId(obj.zimbraCOSId);
            }, 2000);
          }
        })

        .catch((error: Error) => {
          setShowEditAccountView(false);
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
    [
      getAccountSpecificDetail,
      getCosDetail,
      getMailboxQuotaUsed,
      isAdvanced,
      getListOtp,
      getCredentialList,
      getABQStatus,
      getFileQuotaByAccId,
      getFileQuotaByCosId,
      createSnackbar,
      t,
    ],
  );
  const getAccountMembership = useCallback(
    (id: string): void => {
      getAccountMembershipRequest(id)
        .then((data: GetAccountMembershipResponse) => {
          const directMemArr: Array<DelegateMembership> = [];
          const inDirectMemArr: Array<DelegateMembership> = [];

          data?.dl?.forEach((ele) => {
            //remove zimbraIsAdminGroup
            const re = /^__(monitoring|helpdesk|groups|users|delegated|domain)_admins.*/;
            if (re.test(ele?.name)) return;
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
        const folderResponse = ((res as ZextrasRawResponse)?.Body?.GetFolderResponse as
          | { folder?: Array<MailFolder> }
          | undefined)?.folder;
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
        const grants = ((res as ZextrasRawResponse)?.Body?.GetGrantsResponse as
          | { grant?: Array<DelegateIdentity> }
          | undefined)?.grant;
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

  const openDetailView = useCallback(
    (acc: SoapEntity): void => {
      setShowEditAccountView(true);
      getAccountDetail(acc?.id);
      getSignatureDetail(acc?.id);
      getAccountMembership(acc?.id);
      getIdentitiesList(acc);
      getAllUserSession(acc?.name);
      getDeletePasswordRight(acc?.name);
    },
    [
      getAccountDetail,
      getSignatureDetail,
      getAccountMembership,
      getIdentitiesList,
      getAllUserSession,
      getDeletePasswordRight,
    ],
  );

  const handleClickTableRow = (item: SoapEntity): void => {
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
      .then((data: SearchDirectoryResponse<'account' | 'dl' | 'calresource'>) => {
        setIsRequestInProgress(false);
        const accountListResponse = data?.account ?? [];
        if (accountListResponse && Array.isArray(accountListResponse)) {
          const accountListArr: Array<AccountTableRow> = [];
          setTotalAccount(data.searchTotal || 0);
          accountListResponse.forEach((item) => {
            const mutable = item as SoapEntity & Record<string, unknown> & {
              displayName?: string;
              mail?: Array<string>;
              description?: string;
              zimbraAccountStatus?: string;
            };
            item?.a?.forEach((ele: Attribute & { pd?: boolean }) => {
              if (ele?.n === 'mail') {
                const existing = mutable[ele.n];
                if (Array.isArray(existing)) {
                  existing.push(ele._content);
                } else {
                  mutable[ele.n] = [ele._content];
                }
              } else if (ele?.pd && ele?.n === 'zimbraIsAdminAccount' && ele?.pd === true) {
                mutable[ele.n] = 'TRUE';
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
                    handleClickTableRow(mutable);
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
                    handleClickTableRow(mutable);
                  }}
                >
                  {mutable?.displayName || <>&nbsp;</>}
                </ds-text>,
                <>
                  {(mutable?.mail?.length ?? 0) - 1 || 0 ? (
                    <Tooltip
                      key={mutable?.id}
                      placement="bottom"
                      label={mutable?.mail?.slice(1).join(', ') ?? ''}
                      maxWidth="auto"
                    >
                      <ds-text
                        as="span"
                        size="small"
                        weight="light"
                        key={mutable?.id}
                        color="#828282"
                        onClick={(): void => {
                          handleClickTableRow(mutable);
                        }}
                      >
                        {(mutable?.mail?.length ?? 0) - 1 || 0}
                      </ds-text>
                    </Tooltip>
                  ) : (
                    <ds-text
                      as="span"
                      size="small"
                      key={mutable?.id}
                      color="#828282"
                      weight="light"
                      onClick={(): void => {
                        handleClickTableRow(mutable);
                      }}
                    >
                      0
                    </ds-text>
                  )}
                </>,
                <ds-text
                  as="span"
                  size="small"
                  key={mutable?.id}
                  color="gray0"
                  weight="light"
                  onClick={(): void => {
                    handleClickTableRow(mutable);
                  }}
                >
                  {accountUserType(mutable)}
                </ds-text>,
                <ds-text
                  as="span"
                  size="small"
                  weight="light"
                  key={mutable?.id}
                  color={STATUS_COLOR[mutable?.zimbraAccountStatus ?? '']?.color}
                  onClick={(): void => {
                    handleClickTableRow(mutable);
                  }}
                >
                  {STATUS_COLOR[mutable?.zimbraAccountStatus ?? '']?.label}
                </ds-text>,
                <Tooltip key={`${mutable.id}-userDesc`} label={mutable?.description || <>&nbsp;</>}>
                  <ds-text
                    as="span"
                    size="small"
                    weight="light"
                    key={mutable?.id}
                    color="gray0"
                    onClick={(event: { stopPropagation: () => void }): void => {
                      event.stopPropagation();
                      handleClickTableRow(mutable);
                    }}
                  >
                    {mutable?.description ?? <>&nbsp;</>}
                  </ds-text>
                </Tooltip>,
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
                  CustomIcon={(): ReactElement => (
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
              <AccountContext.Provider value={accountContextValue}>
                {showEditAccountView && (
                  <ModalOverlay open={showEditAccountView} maxWidth="58.75rem">
                    <EditAccount
                      setShowEditAccountView={setShowEditAccountView}
                      setIsAccountDeleted={setIsAccountDeleted}
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
                    />
                  </ModalOverlay>
                )}
              </AccountContext.Provider>
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
