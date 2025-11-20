/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest, useIsAdvanced } from '@zextras/admin-ui-bootstrap';
import {
	Container,
	Row,
	Text,
	Table,
	Divider,
	Button,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { flatMapDeep, filter, debounce } from 'lodash';
import moment from 'moment';
import React, { FC, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../assets/gardian.svg';
import { RECORD_DISPLAY_LIMIT, ZIMBRA_ADMIN_URN } from '../../constants';
import { accountListDirectory } from '../../services/account-list-directory-service';
import {
	getCosGeneralInformation,
	GetCosResponse,
	CosA
} from '../../services/cos-general-information-service';
import { getAccountRequest } from '../../services/get-account';
import { getAccountMembershipRequest } from '../../services/get-account-membership';
import { getSessions } from '../../services/get-sessions';
import { getSingatures } from '../../services/get-signature-service';
import { fetchSoap } from '../../services/listOTP-service';
import CustomHeaderFactory from '../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../app/shared/customTableRowFactory';
import TrackNumberPerPage from '../app/shared/track-number-per-page';
import ModalOverlay from '../components/ModalOverlay';
import Paging from '../components/paging';
import ScrollContainer from '../components/scrollComponent';
import { generateSnackbarFromError } from '../error/generate-snackbar-error';

import { AccountContext } from './manange/accounts/account-context';
import EditAccount from './manange/accounts/edit-account/edit-account';

type UserSession = {
	name: string;
	sid: string;
	zid: string;
	ip: string;
	service: string;
};

const GlobalDelegates: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const [accountDetail, setAccountDetail] = useState<any>({});
	const [cosDetail, setCosDetail] = useState<any>({});
	const [accSpecificDetail, setAccSpecificDetail] = useState<any>({});
	const [defaultTab, setDefaultTab] = useState('general');
	const [directMemberList, setDirectMemberList] = useState<any>([]);
	const [inDirectMemberList, setInDirectMemberList] = useState<any>([]);
	const [initAccountDetail, setInitAccountDetail] = useState<any>({});
	const [otpList, setOtpList] = useState<any[]>([]);
	const [credentialList, setCredentialList] = useState<any[]>([]);
	const [identitiesList, setIdentitiesList] = useState<any[]>([]);
	const [folderList, setFolderList] = useState<any[]>([]);
	const [deligateDetail, setDeligateDetail] = useState<any>({});
	const [deleteAdministrationRights, setDeleteAdministrationRights] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [defaultCOS, setDefaultCOS] = useState<boolean>(false);
	const [allUserSessionList, setAllUserSessionList] = useState<Array<UserSession>>([]);
	const [userSessionList, setUserSessionList] = useState<Array<UserSession>>([]);
	const flatten: any = useCallback((item: any) => [item, flatMapDeep(item.folder, flatten)], []);
	const isAdvanced = useIsAdvanced();
	const tableRef = useRef<HTMLTableElement>(null);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
	const [isTableTooTall, setIsTableTooTall] = useState(false);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const [allowedDeletePassword, setAllowedDeletePassword] = useState<boolean>(false);

	const headers: any = useMemo(
		() => [
			{
				id: 'account',
				label: t('label.account', 'Account'),
				width: '25%',
				bold: true
			},
			{
				id: 'type',
				label: t('label.type', 'Type'),
				width: '15%',
				bold: true
			},
			{
				id: 'domain',
				label: t('label.domain', 'domain'),
				width: '20%',
				bold: true
			},
			{
				id: 'description',
				label: t('label.description', 'Description'),
				width: '40%',
				bold: true
			}
		],
		[t]
	);

	const [accountList, setAccountList] = useState<any[]>([]);
	const [selectedAccount, setSelectedAccount] = useState<any>({});
	const [offset, setOffset] = useState<number>(0);
	const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
	const [totalAccount, setTotalAccount] = useState<number>(0);
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
		[getAccountSpecificDetail, getCosDetail, createSnackbar, t]
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

	const openDetailView = useCallback(
		(acc: any): void => {
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
			getCredentialList
		]
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
			.then((data: any) => {
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
										openDetailView(item);
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
										openDetailView(item);
									}}
								>
									{accountUserType(item)}
								</Text>,
								<Text
									size="small"
									key={item?.id}
									color="gray0"
									weight="light"
									onClick={(): void => {
										openDetailView(item);
									}}
								>
									{item?.name.split('@')[1] || ' '}
								</Text>,
								<Text
									size="small"
									weight="light"
									key={item?.id}
									color="gray0"
									onClick={(event: { stopPropagation: () => void }): void => {
										event.stopPropagation();
										openDetailView(item);
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
			.catch((error: any) => {
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
						<Text size="medium" weight="bold" color="gray0">
							{t('label.administrators', 'Administrators')}
						</Text>
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
					overflow: 'auto'
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
							<Text size="small" weight="bold" color="gray0">
								{t('domain.administration_rights', 'Administration Rights')}
							</Text>
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
