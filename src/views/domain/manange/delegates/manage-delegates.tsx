/* eslint-disable prefer-regex-literals */
/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
	Row,
	Container,
	Divider,
	Text,
	Button,
	Table,
	useSnackbar
} from '@zextras/carbonio-design-system';
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	postSoapFetchRequest,
	useUserAccount,
	useUserSettings
} from '@zextras/carbonio-shell-ui';
import { debounce, filter, flatMapDeep } from 'lodash';
import moment from 'moment';
import { Trans, useTranslation } from 'react-i18next';

import DisableDelegateAdminModel from './disable-delegate-admin-model';
import { Attribute, CosMaxAccountValues, objectType } from '../../../../../types';
import logo from '../../../../assets/guardian.svg';
import {
	ADMIN_GROUP_FLAG,
	HELPDESK_ADMINS,
	RECORD_DISPLAY_LIMIT,
	SYSTEM_ACCOUNT_FLAG,
	ZIMBRA_DOMAIN_COS_MAX_ACCOUNTS
} from '../../../../constants';
import { accountListDirectory } from '../../../../services/account-list-directory-service';
import { checkRightRequest } from '../../../../services/check-right';
import {
	GetCosResponse,
	getCosGeneralInformation,
	CosA
} from '../../../../services/cos-general-information-service';
import { getAccountRequest } from '../../../../services/get-account';
import { getAccountMembershipRequest } from '../../../../services/get-account-membership';
import { getSessions } from '../../../../services/get-sessions';
import { getSingatures } from '../../../../services/get-signature-service';
import { InitDomainForDelegation } from '../../../../services/init-domain-for-delegation';
import { fetchSoap } from '../../../../services/listOTP-service';
import { removeDistributionListMember } from '../../../../services/remove-distributionlist-member-service';
import { searchDirectory } from '../../../../services/search-directory-service';
import { useAuthIsAdvanced } from '../../../../store/auth-advanced/store';
import { useDomainStore } from '../../../../store/domain/store';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import TrackNumberPerPage from '../../../app/shared/track-number-per-page';
import ModalOverlay from '../../../components/ModalOverlay';
import Paging from '../../../components/paging';
import ScrollContainer from '../../../components/scrollComponent';
import { generateSnackbarFromError } from '../../../error/generate-snackbar-error';
import ListRow from '../../../list/list-row';
import { AccountContext } from '../accounts/account-context';
import EditAccount from '../accounts/edit-account/edit-account';

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

const ManageDelegates: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const domain = useDomainStore((state) => state.domain);
	const [open, setOpen] = useState(false);
	const [accountName, setAccountName] = useState('');
	const [distributionList, setDistributionList] = useState<objectType[]>([]);
	const [accountDistributionList, setAccountDistributionList] = useState([]);
	const [allAccount, setAllAccount] = useState<any>([]);
	const [loading, setLoading] = useState(false);
	const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
	const userSetting = useUserSettings();
	const [cosDetail, setCosDetail] = useState<any>({});
	const [initAccountDetail, setInitAccountDetail] = useState<any>({});
	const [signatureList, setSignatureList] = useState<any[]>([]);
	const [accSpecificDetail, setAccSpecificDetail] = useState<any>({});
	const [selectedAccount, setSelectedAccount] = useState<any>({});
	const [accountDetail, setAccountDetail] = useState<any>({});
	const [directMemberList, setDirectMemberList] = useState<any>([]);
	const [inDirectMemberList, setInDirectMemberList] = useState<any>([]);
	const [otpList, setOtpList] = useState<any[]>([]);
	const [allUserSessionList, setAllUserSessionList] = useState<Array<UserSession>>([]);
	const [userSessionList, setUserSessionList] = useState<Array<UserSession>>([]);
	const [credentialList, setCredentialList] = useState<any[]>([]);
	const [folderList, setFolderList] = useState<any[]>([]);
	const [identitiesList, setIdentitiesList] = useState<any[]>([]);
	const [totalAccount, setTotalAccount] = useState<number>(0);
	const [offset, setOffset] = useState<number>(0);
	const [pageLimit, setPageLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
	const [signatureItems, setSignatureItems] = useState<any[]>([]);
	const [deligateDetail, setDeligateDetail] = useState<any>({});
	const [deleteAdministrationRights, setDeleteAdministrationRights] = useState([]);
	const [showEditAccountView, setShowEditAccountView] = useState<boolean>(false);
	const [defaultTab, setDefaultTab] = useState('general');
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
	const [showModal, setShowModal] = useState(false);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [defaultCOS, setDefaultCOS] = useState<boolean>(false);
	const domainInformation = useDomainStore((state) => state.domain?.a);
	const [cosMaxAccountList, SetCosMaxAccountList] = useState<Array<CosMaxAccountValues>>([]);
	const [isTableTooTall, setIsTableTooTall] = useState(false);
	const [allowedDeletePassword, setAllowedDeletePassword] = useState<boolean>(false);
	const account = useUserAccount();

	const [initialGlobalRights, setinitialGlobalRights] = useState({
		setGlobalConfig: false,
		getGlobalConfig: false
	});
	const [globalRights, setGlobalRights] = useState({
		setGlobalConfig: false,
		getGlobalConfig: false
	});
	const [isInitDomain, setIsInitDomain] = useState(false);

	const flatten: any = useCallback((item: any) => [item, flatMapDeep(item.folder, flatten)], []);
	const isAdvanced = useAuthIsAdvanced((state: any) => state.isAdvanced);
	const tableRef = useRef<HTMLTableElement>(null);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);

	const headers: any = useMemo(
		() => [
			{
				id: 'account',
				label: t('label.account', 'Account'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

	useMemo(() => {
		if (!!domainInformation && domainInformation.length > 0) {
			const domainCosMaxAccountArray = domainInformation.filter(
				(domainContent: any) => domainContent.n === ZIMBRA_DOMAIN_COS_MAX_ACCOUNTS
			);
			if (domainCosMaxAccountArray && domainCosMaxAccountArray.length > 0) {
				const domainCosMaxAccounts = domainCosMaxAccountArray.map(
					(domainContent: any, index: any) => ({
						id: domainContent._content?.split(':')[0],
						value: domainContent._content?.split(':')[1]
							? domainContent._content?.split(':')[1]
							: -1
					})
				);
				SetCosMaxAccountList(domainCosMaxAccounts);
			} else {
				SetCosMaxAccountList([]);
			}
		}
	}, [domainInformation]);

	const generateSignatureList = (signatureResponse: any): void => {
		if (signatureResponse && Array.isArray(signatureResponse)) {
			setSignatureList(signatureResponse);
		}
	};
	const getSignatureDetail = useCallback((id: string): void => {
		getSingatures(id).then((data: any) => {
			const signatureResponse = data?.Body?.GetSignaturesResponse?.signature || [];
			generateSignatureList(signatureResponse);
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

	const getAccountSpecificDetail = useCallback((id: string): void => {
		getAccountRequest(id, '', 0).then((res: any) => {
			const accountObj: any = {};
			// eslint-disable-next-line array-callback-return
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

	const processAccountData = (data: any): void => {
		const obj: any = {};
		// eslint-disable-next-line array-callback-return
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
		if (obj.zimbraIsAdminAccount === undefined) {
			obj.zimbraIsAdminAccount = 'FALSE';
		}
		if (obj.zimbraIsDelegatedAdminAccount === undefined) {
			obj.zimbraIsDelegatedAdminAccount = 'FALSE';
		}
		return obj;
	};

	const getDeletePasswordRight = useCallback(
		// eslint-disable-next-line sonarjs/cognitive-complexity
		(target: string): void => {
			checkRightRequest(target, account.name, 'set.account.userPassword').then(
				(data: CheckRightResponse) => {
					setAllowedDeletePassword(data?.allow);
				}
			);
		},
		[account.name]
	);

	const getAccountDetail = useCallback(
		(id: string): void => {
			getAccountRequest(id, '', 1)
				.then((data: any) => {
					const obj: any = processAccountData(data);
					setInitAccountDetail({ ...obj });
					setSelectedAccount({ ...obj, id });
					setAccountDetail({ ...obj });
					getAccountSpecificDetail(id);
					getCosDetail(obj.zimbraCOSId);
				})
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				.catch((error: any) => {
					createSnackbar({
						key: 'error',
						severity: 'error',
						label: error?.message
							? error?.message
							: // eslint-disable-next-line sonarjs/no-duplicate-string
							  t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		},
		[getAccountSpecificDetail, getCosDetail, createSnackbar, t]
	);
	const getAccountMembership = useCallback(
		(id: string): void => {
			getAccountMembershipRequest(id)
				.then((data: any) => {
					const directMemArr: any[] = [];
					const inDirectMemArr: any[] = [];
					// eslint-disable-next-line array-callback-return
					data?.dl?.forEach((ele: any) => {
						if (ele?.via)
							inDirectMemArr.push({ label: ele?.name, closable: false, disabled: true });
						else directMemArr.push({ label: ele?.name, closable: false, disabled: true });
					});

					setDirectMemberList(directMemArr);
					setInDirectMemberList(inDirectMemArr);
				})
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				.catch((error: any) => {
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
	const getListOtp = useCallback(
		(id: string): void => {
			fetchSoap('zextras', {
				// eslint-disable-next-line sonarjs/no-duplicate-string
				_jsns: 'urn:zimbraAdmin',
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
										{moment(item?.created).format('DD/MMM/YYYY')}
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
			_jsns: 'urn:zimbraAdmin',
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
					// eslint-disable-next-line prefer-destructuring, no-param-reassign
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
						if (el?.grantee?.[0]?.name === ele?.d) {
							found = true;
							if (el?.folder?.length) {
								el?.folder.push(ele);
							} else {
								// eslint-disable-next-line prefer-destructuring, no-param-reassign
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
				_jsns: 'urn:zimbraAdmin',
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

	const getAllUserSession = useCallback((accName: string) => {
		const sessionType: string[] = ['admin', 'imap', 'soap'];
		setUserSessionList([]);
		setAllUserSessionList([]);
		sessionType.forEach((item: string) => {
			getSessions(item, accName).then((resp: any) => {
				if (resp?.s) {
					const existingSession = resp?.s;
					if (existingSession) {
						const session: UserSession[] = [];
						const filterSession = existingSession.filter(
							(sessionItem: any) => sessionItem?.name === accName
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
			getDeletePasswordRight,
			isAdvanced,
			getListOtp,
			getCredentialList
		]
	);

	const getAccountDistributionList = useCallback(
		(id: string) => {
			getAccountMembershipRequest(id)
				.then((res) => {
					const data = res?.dl?.filter((item: objectType) => item?.via === undefined);

					const tableList = data
						? data.map((item: objectType) => {
								const selectedItem: any = distributionList.filter(
									(i: objectType) => i.name === item.name
								);
								const des = selectedItem[0].a?.filter((i: Attribute) => i.n === 'description')[0]
									._content;
								return {
									...item,
									accname: accountName.split('@')[0],
									description: des
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
						replace: true
					});
				});
		},
		[accountName, createSnackbar, distributionList, t]
	);

	const fetchDistributionList = useCallback(
		(
			query: string,
			name: string | undefined,
			offsetData: number,
			limitData: number,
			type?: string
		): void => {
			if (type === ADMIN_GROUP_FLAG) {
				setLoading(true);
			}
			const attrs =
				'displayName,zimbraId,zimbraMailHost,uid,description,zimbraIsAdminGroup,zimbraMailStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount';
			const types = 'distributionlists,dynamicgroups';
			searchDirectory(attrs, types, name ?? '', query, offsetData, limitData, 'name')
				.then((res) => {
					const data = res?.dl;
					if (data && type === SYSTEM_ACCOUNT_FLAG) {
						setDistributionList((prevDistributionList) => [...prevDistributionList, ...data]);
						if (res.more) {
							fetchDistributionList(
								query,
								domain?.name,
								offsetData + limitData,
								limitData,
								SYSTEM_ACCOUNT_FLAG
							);
						}
					} else if (type === ADMIN_GROUP_FLAG) {
						setIsInitDomain(data?.length > 0);
						setLoading(false);
					}
				})
				.catch((error) => {
					const snackbarConfig = generateSnackbarFromError(error, t);
					createSnackbar(snackbarConfig);
				});
		},
		[createSnackbar, domain?.name, t]
	);

	const handleRevokesGrants = useCallback(() => {
		setLoading(true);
		InitDomainForDelegation('/admin/initDomainForDelegation', {
			_jsns: 'urn:zimbraAdmin',
			domain: domain?.name
		})
			.then((res: objectType) => {
				if (cosMaxAccountList.length > 0) {
					const request: unknown[] = [];
					cosMaxAccountList.forEach((item: CosMaxAccountValues) => {
						const target = {
							_content: item?.id,
							type: 'cos',
							by: 'id'
						};
						const grantee = {
							by: 'name',
							type: 'grp',
							_content: `${HELPDESK_ADMINS}@${domain?.name}`
						};
						request.push(
							postSoapFetchRequest(
								`/service/admin/soap/GrantRightRequest`,
								{
									_jsns: 'urn:zimbraAdmin',
									target,
									grantee,
									right: {
										_content: 'getCos'
									}
								},
								'GrantRightRequest'
							)
						);

						request.push(
							postSoapFetchRequest(
								`/service/admin/soap/GrantRightRequest`,
								{
									_jsns: 'urn:zimbraAdmin',
									target,
									grantee,
									right: {
										_content: 'listCos'
									}
								},
								'GrantRightRequest'
							)
						);

						request.push(
							postSoapFetchRequest(
								`/service/admin/soap/GrantRightRequest`,
								{
									_jsns: 'urn:zimbraAdmin',
									target,
									grantee,
									right: {
										_content: 'assignCos'
									}
								},
								'GrantRightRequest'
							)
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
					SYSTEM_ACCOUNT_FLAG
				);
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: res?.message
						? res?.message
						: t(
								'label.the_last_changes_has_been_saved_successfully',
								'Changes have been saved successfully'
						  ),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
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
					replace: true
				});
			});
	}, [domain?.name, cosMaxAccountList, fetchDistributionList, createSnackbar, t]);

	const onDeleteFromList = useCallback(
		(lists: objectType[], type: string) => {
			if (lists?.length > 0) {
				lists.forEach((item: objectType) => {
					const id: any = {
						n: 'id',
						_content: type === 'all' ? item.id : item
					};
					const dlmItem: any = {
						n: 'dlm',
						_content: accountDetail?.name
					};
					removeDistributionListMember(id, dlmItem)
						.then((data) => {
							if (data) {
								createSnackbar({
									key: 'success',
									severity: 'success',
									label: t(
										'account_details.right_for_selected_user_deleted_successfully',
										'Right for selected user deleted successfully'
									),
									autoHideTimeout: 3000,
									hideButton: true,
									replace: true
								});
								getAccountDistributionList(accountDetail?.zimbraId);
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
								replace: true
							});
						});
				});
			}
		},
		[t, accountDetail, getAccountDistributionList, createSnackbar]
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
							// eslint-disable-next-line no-param-reassign
							item[ele?.n] = [ele._content];
						}
					} else {
						// eslint-disable-next-line no-param-reassign
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
							<Text weight="light">{item?.name || ' '}</Text>
						</Row>
					],
					item,
					clickable: true
				});
			});
			return accountListArr;
		},
		[openDetailView]
	);

	const getAccountList = useCallback((): void => {
		setIsRequestInProgress(true);
		const type = 'accounts';
		const searchQuery =
			'(|(&(zimbraIsAdminAccount=TRUE))(&(zimbraIsDelegatedAdminAccount=TRUE)(!(zimbraIsAdminAccount=TRUE))))';
		const attrs =
			'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraCreateTimestamp,zimbraLastLogonTimestamp,zimbraMailQuota,zimbraNotes,mail';
		accountListDirectory(attrs, type, domain.name, searchQuery, offset, pageLimit)
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
	}, [domain.name, offset, pageLimit, parseAccountListResponse, t, createSnackbar]);

	useEffect(() => {
		fetchDistributionList(
			`(&(!(zimbraIsSystemAccount=TRUE)))`,
			domain?.name,
			0,
			10,
			SYSTEM_ACCOUNT_FLAG
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
			background="gray6"
			mainAlignment="flex-start"
		>
			{accountDistributionList?.length > 0 && open && (
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
								<Text size="medium" weight="bold" color="gray0">
									{t('label.delegates_domain_admins', 'Delegated Domain Admins')}
								</Text>
							</Row>
						</Row>
						<Row orientation="horizontal" width="100%" background="gray6">
							<Divider />
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
									<Divider />
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
						minHeight: '10rem'
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
							<Text size="medium" weight="bold" color="gray0">
								{t('label.administration_rights', 'Administration Rights')}
							</Text>
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
									position: 'relative'
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
										height: isRequestInProgress || allAccount.length === 0 ? '50%' : '100%'
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
								{allAccount.length !== 0 && (
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
					{/* TODO: uncomment once we fix the delgates feature's bug completely. */}
					{/* {allAccount?.length > 0 && (
						<>
							<ListRow padding={{ top: 'large' }}>
								<Padding left="small" width="50%">
									<Button
										disabled={sendSelectedRows?.length < 1}
										type="ghost"
										onClick={(): void => onDeleteFromList(sendSelectedRows, 'one')}
										label={t('label.remove', 'REMOVE')}
										iconPlacement="right"
										width="fill"
										size="extralarge"
										color="error"
									/>
								</Padding>
								<Padding left="small" width="50%">
									<Button
										type="outlined"
										label={t('label.remove_all', 'REMOVE ALL')}
										iconPlacement="right"
										width="fill"
										size="extralarge"
										color="error"
										onClick={(): void => onDeleteFromList(accountDistributionList, 'all')}
									/>
								</Padding>
							</ListRow>
						</>
					)} */}
					<AccountContext.Provider value={accountContextValue}>
						{showEditAccountView && (
							<ModalOverlay
								setOpen={setShowEditAccountView}
								open={showEditAccountView}
								maxWidth="58.75rem"
								setShowModal={setShowModal}
								isDirty={isDirty}
							>
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
				</Container>
			</Container>
		</Container>
	);
};

export default ManageDelegates;
