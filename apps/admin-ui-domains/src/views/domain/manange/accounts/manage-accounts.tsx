/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	postSoapFetchRequest,
	useDomainStore,
	useIsAdvanced,
	useUserAccount} from '@zextras/admin-ui-bootstrap';
import {
	Button,
	Container,
	Divider,
	Icon,
	Input,
	Padding,
	Row,
	Table,
	Text,
	Tooltip,
	useSnackbar} from '@zextras/carbonio-design-system';
import { format } from 'date-fns';
import { debounce, filter,flatMapDeep } from 'lodash-es';
import { FC, useCallback, useEffect, useMemo, useRef,useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

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
	ZIMBRA_ADMIN_URN
} from '../../../../constants';
import {
	accountListDirectory,
	getMailboxQuota
} from '../../../../services/account-list-directory-service';
import { checkRightRequest } from '../../../../services/check-right';
import {
	CosA,
	getCosGeneralInformation,
	GetCosResponse} from '../../../../services/cos-general-information-service';
import { getAccountRequest } from '../../../../services/get-account';
import { getAccountMembershipRequest } from '../../../../services/get-account-membership';
import { getCoreAttributes } from '../../../../services/get-core-attributes';
import { getFileQuotaById } from '../../../../services/get-file-quota';
import { getSessions } from '../../../../services/get-sessions';
import { getSingatures } from '../../../../services/get-signature-service';
import { fetchSoap } from '../../../../services/listOTP-service';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import TrackNumberPerPage from '../../../app/shared/track-number-per-page';
import ModalOverlay from '../../../components/ModalOverlay';
import Paging from '../../../components/paging';
import ScrollContainer from '../../../components/scrollComponent';
import { generateSnackbarFromError } from '../../../error/generate-snackbar-error';
import { AccountContext } from './account-context';
import { AccountType } from './account-types/account-types';
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
	allow: true;
	_jsns: string;
};

const ManageAccounts: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const domainName = useDomainStore((state) => state.domain?.name);
	const [accountDetail, setAccountDetail] = useState<any>({});
	const [cosDetail, setCosDetail] = useState<any>({});
	const [accSpecificDetail, setAccSpecificDetail] = useState<any>({});
	const [defaultTab, setDefaultTab] = useState('general');
	const [directMemberList, setDirectMemberList] = useState<any>([]);
	const [inDirectMemberList, setInDirectMemberList] = useState<any>([]);
	const [initAccountDetail, setInitAccountDetail] = useState<any>({});
	const [defaultCOS, setDefaultCOS] = useState<boolean>(false);
	const [otpList, setOtpList] = useState<any[]>([]);
	const [credentialList, setCredentialList] = useState<any[]>([]);
	const [identitiesList, setIdentitiesList] = useState<any[]>([]);
	const [folderList, setFolderList] = useState<any[]>([]);
	const [deligateDetail, setDeligateDetail] = useState<any>({});
	const [deleteAdministrationRights, setDeleteAdministrationRights] = useState([]);
	const [allUserSessionList, setAllUserSessionList] = useState<Array<UserSession>>([]);
	const [userSessionList, setUserSessionList] = useState<Array<UserSession>>([]);
	const flatten: any = useCallback((item: any) => [item, flatMapDeep(item.folder, flatten)], []);
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

	const accountTypeFilter: any = useMemo(
		() => [
			{
				label: 'Admin',
				value: '(&(zimbraIsAdminAccount=TRUE))'
			},
			{
				label: 'DelegatedAdmin',
				value: '(&(zimbraIsDelegatedAdminAccount=TRUE)(!(zimbraIsAdminAccount=TRUE)))'
			},
			{
				label: 'External',
				value: '(&(zimbraIsExternalVirtualAccount=TRUE))'
			},
			{
				label: 'System',
				value: '(&(zimbraIsSystemAccount=TRUE))'
			},
			{
				label: 'Normal',
				value:
					'(&(!(zimbraIsAdminAccount=TRUE))(!(zimbraIsDelegatedAdminAccount=TRUE))(!(zimbraIsSystemAccount=TRUE))(!(zimbraIsExternalVirtualAccount=TRUE)))'
			}
		],
		[]
	);

	const accountStatusFilter: any = useMemo(
		() => [
			{
				label: t('label.active', 'Active'),
				value: '(&(zimbraAccountStatus=active))'
			},
			{
				label: t('label.in_maintenance', 'In maintenance'),
				value: '(&(zimbraAccountStatus=maintenance))'
			},
			{
				label: t('label.locked', 'Locked'),
				value: '(&(zimbraAccountStatus=locked))'
			},
			{
				label: t('label.closed', 'Closed'),
				value: '(&(zimbraAccountStatus=closed))'
			},
			{
				label: t('label.pending', 'Pending'),
				value: '(&(zimbraAccountStatus=pending))'
			},
			{
				label: t('label.lockout', 'Lockout'),
				value: '(&(zimbraAccountStatus=lockout))'
			}
		],
		[t]
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
				}
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
				}
			},
			{
				id: 'aliases',
				label: t('label.Aliases', 'Aliases'),
				width: '10%',
				bold: true
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
					{ label: accountTypeFilter[4].label, value: accountTypeFilter[4].value }
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
				}
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
					{ label: accountStatusFilter[5].label, value: accountStatusFilter[5].value }
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
				id: 'description',
				label: t('label.description', 'Description'),
				width: '40%',
				bold: true
			}
		],
		[accountStatusFilter, accountTypeFilter, t]
	);

	const [accountList, setAccountList] = useState<any[]>([]);
	const [selectedAccount, setSelectedAccount] = useState<any>({});
	const [offset, setOffset] = useState<number>(0);
	const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
	const [searchString, setSearchString] = useState<string>('');
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [totalAccount, setTotalAccount] = useState<number>(0);
	const [showAccountDetailView, setShowAccountDetailView] = useState<boolean>(false);
	const [showCreateAccountView, setShowCreateAccountView] = useState<boolean>(false);
	const [showEditAccountView, setShowEditAccountView] = useState<boolean>(false);
	const [initialGlobalRights, setinitialGlobalRights] = useState({
		setGlobalConfig: false,
		getGlobalConfig: false
	});
	const [globalRights, setGlobalRights] = useState({
		setGlobalConfig: false,
		getGlobalConfig: false
	});

	const [signatureList, setSignatureList] = useState<any[]>([]);
	const [signatureItems, setSignatureItems] = useState<any[]>([]);
	const [signatureData, setSignatureData]: any = useState([]);
	const [isDirty, setIsDirty] = useState<boolean>(false);

	const generateSignatureList = (signatureResponse: any): void => {
		if (signatureResponse && Array.isArray(signatureResponse)) {
			setSignatureList(signatureResponse);
		}
	};
	const getSignatureDetail = useCallback((id: string): void => {
		getSingatures(id).then((data) => {
			const signatureResponse = data?.Body?.GetSignaturesResponse?.signature || [];
			generateSignatureList(signatureResponse);
			setSignatureData(signatureResponse);
		});
	}, []);

	const STATUS_COLOR: any = useMemo(
		() => ({
			active: {
				color: '#8BC34A',
				label: t('label.active', 'Active')
			},
			maintenance: {
				color: '#2196D3',
				label: t('label.in_maintenance', 'In maintenance')
			},
			locked: {
				color: '#D74942',
				label: t('label.locked', 'Locked')
			},
			closed: {
				color: '#828282',
				label: t('label.closed', 'Closed')
			},
			pending: {
				color: '#828282',
				label: t('label.pending', 'Pending')
			},
			lockout: {
				color: '#D74942',
				label: t('label.lockout', 'Lockout')
			}
		}),
		[t]
	);

	const accountUserType = useCallback((item: any): string => {
		if (item.zimbraIsAdminAccount === 'TRUE') return 'Admin';
		if (item.zimbraIsDelegatedAdminAccount === 'TRUE') return 'DelegatedAdmin';
		if (item.zimbraIsExternalVirtualAccount === 'TRUE') return 'External';
		if (item.zimbraIsSystemAccount === 'TRUE') return 'System';
		return 'Normal';
	}, []);
	const getAccountSpecificDetail = useCallback((id: string): void => {
		getAccountRequest(id, '', 0).then((res: any) => {
			const accountObj: any = {};

			res?.account?.[0]?.a?.forEach((ele: any) => {
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
			const obj: any = {};
			data?.cos?.[0]?.a?.forEach((ele: CosA) => {
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
				account: `${id}`
			}).then((res: any) => {
				if (res?.ok) {
					const otpListResponse = res.response?.list;
					if (otpListResponse && Array.isArray(otpListResponse)) {
						const otpListArr: any = [];
						otpListResponse.forEach((item: any): any => {
							otpListArr.push({
								id: item?.id,
								columns: [
									<Text size="medium" key={item?.id} color="gray0">
										{item?.label || ' '}
									</Text>,
									<Text size="medium" key={item?.id} color="gray0">
										{item?.enabled
											? t('label.enabled', 'Enabled')
											: t('label.disabled', 'Disabled')}
									</Text>,
									<Text size="medium" key={item?.id}>
										{item?.failed_attempts}
									</Text>,
									<Text size="medium" key={item?.id}>
										{format(new Date(item?.created), 'dd/MMM/yyyy')}
									</Text>,
									<Text size="medium" key={item?.id} color="gray0">
										{item?.description || <>&nbsp;</>}
									</Text>
								],
								item,
								clickable: true
							});
						});
						setOtpList(otpListArr);
					}
				}
			});
		},
		[t]
	);
	const getCredentialList = useCallback((id: string): void => {
		fetchSoap('zextras', {
			_jsns: ZIMBRA_ADMIN_URN,
			module: 'ZxAuth',
			action: 'credential',
			request: 'list',
			account: `${id}`
		}).then((res: any) => {
			if (res.response?.values) {
				setCredentialList(res.response?.values);
			} else {
				setCredentialList([]);
			}
		});
	}, []);
	const getABQStatus = useCallback((acc: any) => {
		const body = [
			{
				configType: ACCOUNT,
				configName: [acc],
				attrName: [ABQ_MODE]
			},
			{
				configType: ACCOUNT,
				configName: [acc],
				attrName: [BACKUP_ENABLED]
			},
			{
				configType: ACCOUNT,
				configName: [acc],
				attrName: [BACKUP_SELF_UNDELETE_ALLOWED]
			}
		];
		getCoreAttributes(body).then((data) => {
			if (data?.attributes) {
				setAccountDetail((prev: AccountType) => ({
					...prev,
					...{
						abqMode: data?.attributes?.abqMode?.[0]?.value || '',
						backupEnabled: data?.attributes?.backupEnabled?.[0]?.value,
						backupSelfUndeleteAllowed: !!data?.attributes?.backupSelfUndeleteAllowed?.[0]?.value
					}
				}));
				setInitAccountDetail((prev: AccountType) => ({
					...prev,
					...{
						abqMode: data?.attributes?.abqMode?.[0]?.value || '',
						backupEnabled: data?.attributes?.backupEnabled?.[0]?.value,
						backupSelfUndeleteAllowed: !!data?.attributes?.backupSelfUndeleteAllowed?.[0]?.value
					}
				}));
			}
		});
	}, []);

	const setAccDetailValue = useCallback(
		(key: string, value: string): void => {
			setAccountDetail((prev: Record<string, string>) => ({ ...prev, [key]: value }));
			setInitAccountDetail((prev: Record<string, string>) => ({ ...prev, [key]: value }));
		},
		[setAccountDetail, setInitAccountDetail]
	);

	const getFileQuotaByAccId = useCallback(
		(accId: string): Promise<void> =>
			getFileQuotaById(accId).then((res: any) => {
				if (res?.limit) {
					setAccDetailValue(FILES_QUOTA_LIMIT, res?.limit);
				}
				if (res?.used) {
					setAccDetailValue(FILES_QUOTA_USED, res?.used);
				}
			}),
		[setAccDetailValue]
	);

	const getFileQuotaByCosId = useCallback(
		(cosId: string): Promise<void> =>
			getFileQuotaById(cosId, COS).then((res: any) => {
				if (res?.limit) {
					setCosDetail((prev: any) => ({ ...prev, [FILES_QUOTA_LIMIT]: res?.limit }));
				}
			}),
		[]
	);

	const getMailboxQuotaUsed = useCallback(
		(accId: string): Promise<void> =>
			getMailboxQuota(accId).then((data) => {
				setAccDetailValue(MAILBOX_QUOTA_USED, data?.mbox?.[0]?.s || 0);
			}),
		[setAccDetailValue]
	);
	const getDeletePasswordRight = useCallback(
		(target: string): void => {
			checkRightRequest(target, account?.name ?? '', 'set.account.userPassword').then(
				(data: CheckRightResponse) => {
					setAllowedDeletePassword(data?.allow);
				}
			);
		},
		[account?.name]
	);

	const getAccountDetail = useCallback(
		(id: string): void => {
			getAccountRequest(id, '', 1)
				.then((data: any) => {
					const obj: any = {};

					data?.account?.[0]?.a?.forEach((ele: any) => {
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
						getListOtp(data?.account?.[0]?.name);
						getCredentialList(data?.account?.[0]?.name);
						getABQStatus(id);
						getFileQuotaByAccId(id);
						setTimeout(() => {
							getFileQuotaByCosId(obj.zimbraCOSId);
						}, 2000);
					}
				})

				.catch((error) => {
					setShowEditAccountView(false);
					createSnackbar({
						key: 'error',
						severity: 'error',
						label: error?.message
							? error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
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
			t
		]
	);
	const getAccountMembership = useCallback(
		(id: string): void => {
			getAccountMembershipRequest(id)
				.then((data: any) => {
					const directMemArr: any[] = [];
					const inDirectMemArr: any[] = [];

					data?.dl?.forEach((ele: any) => {
						if (ele?.via)
							inDirectMemArr.push({ label: ele?.name, closable: false, disabled: true });
						else directMemArr.push({ label: ele?.name, closable: false, disabled: true });
					});

					setDirectMemberList(directMemArr);
					setInDirectMemberList(inDirectMemArr);
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
						replace: true
					});
				});
		},
		[setDirectMemberList, setInDirectMemberList, t, createSnackbar]
	);

	const getFolderList = useCallback(
		(acc: any, delegateList: any): void => {
			postSoapFetchRequest(
				`/service/admin/soap/GetFolderRequest`,
				{
					_jsns: 'urn:zimbraMail'
				},
				'GetFolderRequest',
				acc.id
			).then((res: any) => {
				const allFolder =
					res?.Body?.GetFolderResponse?.folder ||
					flatMapDeep(res?.Body?.GetFolderResponse?.folder, flatten) ||
					[];
				allFolder.forEach((ele: any) => {
					ele.id = ele.id.split(':')[1];
					return ele;
				});
				const filteredFolders = filter(allFolder, (ele: any) =>
					['1', '2', '7', '10', '4', '5', '6', '3'].includes(ele.id)
				);
				const userDelegate: any[] = [];
				filteredFolders.forEach((ele: any) => {
					ele?.acl?.grant &&
						ele?.acl?.grant.forEach((el: any) => {
							userDelegate.push({ ...el, id: ele.id, name: ele.name });
						});
				});
				setFolderList(filteredFolders);
				userDelegate.forEach((ele: any) => {
					let found = false;
					delegateList.forEach((el: any) => {
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
							folder: [ele]
						});
					}
				});

				setIdentitiesList(delegateList);
			});
		},
		[flatten]
	);
	const getIdentitiesList = useCallback(
		(acc: any): void => {
			const request: any = {
				_jsns: ZIMBRA_ADMIN_URN,
				target: {
					_content: acc.name,
					type: 'account',
					by: 'name'
				}
			};
			postSoapFetchRequest(
				`/service/admin/soap/GetGrantsRequest`,
				{
					...request
				},
				'GetGrantsRequest',
				acc.id
			).then((res: any) => {
				getFolderList(acc, res?.Body?.GetGrantsResponse?.grant || []);
			});
		},
		[getFolderList]
	);

	const getAllUserSession = useCallback((acc: any) => {
		const sessionType: string[] = ['admin', 'imap', 'soap'];
		setUserSessionList([]);
		setAllUserSessionList([]);
		sessionType.forEach((item: string) => {
			getSessions(item, acc).then((resp: any) => {
				if (resp && resp?.s) {
					const existingSession = resp?.s;
					if (existingSession) {
						const session: UserSession[] = [];
						const filterSession = existingSession.filter(
							(sessionItem: any) => sessionItem?.name === acc
						);
						if (filterSession.length > 0) {
							filterSession.forEach((element: any) => {
								session.push({
									ip: '',
									name: element?.name,
									sid: element?.sid,
									service: '',
									zid: element?.zid
								});
							});
						}
						setUserSessionList((prev: any) => [...prev, ...session]);
						setAllUserSessionList((prev: any) => [...prev, ...session]);
					}
				}
			});
		});
	}, []);

	const openDetailView = useCallback(
		(acc: any): void => {
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
			getDeletePasswordRight
		]
	);

	const handleClickTableRow = (item: any): void => {
		openDetailView(item);
	};

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
			sortOrder
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
							} else {
								item[ele?.n] = ele._content;
							}
						});
						accountListArr.push({
							id: item?.id,
							columns: [
								<Text
									size="small"
									key={item?.id}
									color="gray0"
									weight="regular"
									onClick={(): void => {
										handleClickTableRow(item);
									}}
								>
									{item?.name || ' '}
								</Text>,
								<Text
									size="small"
									key={item?.id}
									color="gray0"
									weight="light"
									onClick={(): void => {
										handleClickTableRow(item);
									}}
								>
									{item?.displayName || <>&nbsp;</>}
								</Text>,
								<>
									{item?.mail?.length - 1 || 0 ? (
										<Tooltip
											key={item?.id}
											placement="bottom"
											label={item?.mail.slice(1).join(', ')}
											maxWidth="auto"
										>
											<Text
												size="small"
												weight="light"
												key={item?.id}
												color="#828282"
												onClick={(): void => {
													handleClickTableRow(item);
												}}
											>
												{item?.mail?.length - 1 || 0}
											</Text>
										</Tooltip>
									) : (
										<Text
											size="small"
											key={item?.id}
											color="#828282"
											weight="light"
											onClick={(): void => {
												handleClickTableRow(item);
											}}
										>
											0
										</Text>
									)}
								</>,
								<Text
									size="small"
									key={item?.id}
									color="gray0"
									weight="light"
									onClick={(): void => {
										handleClickTableRow(item);
									}}
								>
									{accountUserType(item)}
								</Text>,
								<Text
									size="small"
									weight="light"
									key={item?.id}
									color={STATUS_COLOR[item?.zimbraAccountStatus]?.color}
									onClick={(): void => {
										handleClickTableRow(item);
									}}
								>
									{STATUS_COLOR[item?.zimbraAccountStatus]?.label}
								</Text>,
								<Text
									size="small"
									weight="light"
									key={item?.id}
									color="gray0"
									onClick={(event: { stopPropagation: () => void }): void => {
										event.stopPropagation();
										handleClickTableRow(item);
									}}
								>
									{item?.description || <>&nbsp;</>}
								</Text>
							],
							item,
							clickable: true
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
		t
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
		[]
	);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchAccountList = useCallback(
		debounce((searchStr: string, sfilter: string, tfilter: string) => {
			setSearchQuery(generateSearchFilterQuery(searchStr, sfilter, tfilter));
		}, 700),
		[debounce, generateSearchFilterQuery]
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
		[closeAccountDetailDialog]
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
			setAllowedDeletePassword
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
			allowedDeletePassword
		]
	);

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
						<Row mainAlignment="flex-start" width="30%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('domain.account_list', 'Accounts List')}
							</Text>
						</Row>
						<Row width="70%" mainAlignment="flex-end" crossAlignment="flex-end">
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
				<Divider />
			</Row>
			<Container
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				width="100%"
				style={{
					position: 'relative',
					overflow: 'auto',
					minHeight: '10rem'
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
									onChange={(e: any): any => {
										setSearchString(e.target.value);
									}}
									CustomIcon={(): any => <Icon icon="FunnelOutline" size="large" color="primary" />}
								/>
							</Container>
						</Row>
						<Row
							orientation="horizontal"
							mainAlignment="space-between"
							crossAlignment="flex-start"
							width="fill"
							style={{
								position: 'relative'
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
									height: isRequestInProgress || accountList.length === 0 ? '50%' : '100%'
								}}
								RowFactory={CustomRowFactory}
								HeaderFactory={CustomHeaderFactory}
							/>
							{isRequestInProgress && (
								<Container
									crossAlignment="center"
									mainAlignment="center"
									height="auto"
									padding={{ top: 'medium' }}
								>
									<Button
										type="ghost"
										color="primary"
										label=""
										loading
										onClick={(): null => null}
									/>
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
										<Text weight="light" color="#828282" size="large" overflow="break-word">
											{t('label.this_list_is_empty', 'This list is empty.')}
										</Text>
									</Row>
									<Row
										orientation="vertical"
										crossAlignment="center"
										style={{ textAlign: 'center' }}
										padding={{ top: 'small' }}
										width="53%"
									>
										<Text weight="light" color="#828282" size="large" overflow="break-word">
											<Trans
												i18nKey="label.create_account_list_msg"
												defaults="You can create a new Account by clicking on <bold>Create</bold> button (upper left corner) or on the Add (<bold>+</bold>) button up here"
												components={{ bold: <strong /> }}
											/>
										</Text>
									</Row>
								</Container>
							)}
							{accountList.length !== 0 && (
								<Container
									style={{
										position: 'sticky',
										bottom: isTableTooTall ? '0' : '-4rem'
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
				<ModalOverlay open={showCreateAccountView}>
					<CreateAccount
						setShowCreateAccountView={setShowCreateAccountView}
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
