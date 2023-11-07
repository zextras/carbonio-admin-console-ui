/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState, useMemo, useCallback, useRef } from 'react';

import {
	Container,
	Row,
	Text,
	Table,
	Divider,
	Button,
	useSnackbar
} from '@zextras/carbonio-design-system';
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	postSoapFetchRequest
} from '@zextras/carbonio-shell-ui';
import { flatMapDeep, filter } from 'lodash';
import moment from 'moment';
import { Trans, useTranslation } from 'react-i18next';

import { AccountContext } from './manange/accounts/account-context';
import AccountDetailView from './manange/accounts/account-detail-view';
import EditAccount from './manange/accounts/edit-account/edit-account';
import logo from '../../assets/gardian.svg';
import { accountListDirectory } from '../../services/account-list-directory-service';
import {
	getCosGeneralInformation,
	GetCosResponse,
	CosA
} from '../../services/cos-general-information-service';
import { getAccountRequest } from '../../services/get-account';
import { getAccountMembershipRequest } from '../../services/get-account-membership';
import { getSingatures } from '../../services/get-signature-service';
import { fetchSoap } from '../../services/listOTP-service';
import { useAuthIsAdvanced } from '../../store/auth-advanced/store';
import CustomHeaderFactory from '../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../app/shared/customTableRowFactory';
import TrackNumberPerPage from '../app/shared/track-number-per-page';
import ModalOverlay from '../components/ModalOverlay';
import Paging from '../components/paging';

const GlobalDelegates: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const [accountDetail, setAccountDetail] = useState<any>({});
	const [cosDetail, setCosDetail] = useState<any>({});
	const [accSpecificDetail, setAccSpecificDetail] = useState<any>({});
	const [defaultTab, setDefaultTab] = useState('general');
	const [directMemberList, setDirectMemberList] = useState<any>({});
	const [inDirectMemberList, setInDirectMemberList] = useState<any>({});
	const [initAccountDetail, setInitAccountDetail] = useState<any>({});
	const [otpList, setOtpList] = useState<any[]>([]);
	const [credentialList, setCredentialList] = useState<any[]>([]);
	const [identitiesList, setIdentitiesList] = useState<any[]>([]);
	const [folderList, setFolderList] = useState<any[]>([]);
	const [deligateDetail, setDeligateDetail] = useState<any>({});
	const [deleteAdministrationRights, setDeleteAdministrationRights] = useState([]);

	const flatten: any = useCallback((item: any) => [item, flatMapDeep(item.folder, flatten)], []);
	const isAdvanced = useAuthIsAdvanced((state: any) => state.isAdvanced);
	const tableRef = useRef(null);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);

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
	const [limit, setLimit] = useState<number>(20);
	const [totalAccount, setTotalAccount] = useState<number>(0);
	const [showAccountDetailView, setShowAccountDetailView] = useState<boolean>(false);
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
	const getSignatureDetail = useCallback((id): void => {
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

	const accountUserType = useCallback((item): string => {
		if (item.zimbraIsAdminAccount === 'TRUE') return 'Admin';
		if (item.zimbraIsDelegatedAdminAccount === 'TRUE') return 'DelegatedAdmin';
		if (item.zimbraIsExternalVirtualAccount === 'TRUE') return 'External';
		if (item.zimbraIsSystemAccount === 'TRUE') return 'System';
		return 'Normal';
	}, []);
	const getAccountSpecificDetail = useCallback((id): void => {
		getAccountRequest(id, 0).then((res: any) => {
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
	const getCosDetail = useCallback((id): void => {
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
		// eslint-disable-next-line sonarjs/cognitive-complexity
		(id): void => {
			getAccountRequest(id, 1)
				.then((data: any) => {
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
						type: 'error',
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
		(id): void => {
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
						type: 'error',
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
		(id): void => {
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
										{item?.status ? t('label.enabled', 'Enabled') : t('label.disabled', 'Disabled')}
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
	const getCredentialList = useCallback((id): void => {
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
		(acc, delegateList): void => {
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
						// const folder: any[] = filter(userDelegate, { d: ele?.grantee?.[0]?.name });
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
		(acc): void => {
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

	const openDetailView = useCallback(
		(acc: any): void => {
			setShowAccountDetailView(true);
			getAccountDetail(acc?.id);
			getSignatureDetail(acc?.id);
			getAccountMembership(acc?.id);
			getIdentitiesList(acc);
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
			isAdvanced,
			getCredentialList,
			getListOtp
		]
	);
	// eslint-disable-next-line sonarjs/cognitive-complexity
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
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error
						? error?.error
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [accountUserType, limit, offset, openDetailView, t, createSnackbar]);

	const closeAccountDetailDialog = useCallback(() => {
		if (showAccountDetailView) {
			setShowAccountDetailView(false);
		}
	}, [showAccountDetailView]);

	const handleKeyEvent = useCallback(
		(event) => {
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
		getAccountList();
	}, [offset, getAccountList]);

	return (
		<Container mainAlignment="flex-start" background="gray6">
			<Row padding={{ left: 'large' }} mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="3.625rem"
				>
					<Row orientation="horizontal" width="100%" mainAlignment="flex-start">
						<Text size="medium" weight="bold" color="gray0">
							{t('label.global_delegates', 'Global Delegates')}
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
				height="calc(100vh - 12.5rem)"
				padding={{ all: 'large' }}
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
								height: 'calc(100vh - 21.25rem)',
								position: 'relative'
							}}
							ref={tableRef}
						>
							<Table
								rows={!isRequestInProgress ? accountList : []}
								headers={headers}
								showCheckbox={false}
								multiSelect={false}
								style={{
									overflow: 'auto',
									height: isRequestInProgress || accountList.length === 0 ? '14%' : '100%'
								}}
								RowFactory={CustomRowFactory}
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore // Need to fix it with custom soultion
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
									orientation="horizontal"
									mainAlignment="space-between"
									width="100%"
									style={{ position: 'absolute', bottom: '-4rem' }}
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
										<TrackNumberPerPage pageSize={limit} />
									</Container>
								</Container>
							)}
							<AccountContext.Provider
								value={{
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
									setDeleteAdministrationRights
								}}
							>
								{showAccountDetailView && (
									<ModalOverlay setOpen={setShowAccountDetailView} open={showAccountDetailView}>
										<AccountDetailView
											selectedAccount={selectedAccount}
											setShowAccountDetailView={setShowAccountDetailView}
											setShowEditAccountView={setShowEditAccountView}
											STATUS_COLOR={STATUS_COLOR}
											getAccountList={getAccountList}
											cosDetail={cosDetail}
										/>
									</ModalOverlay>
								)}

								{showEditAccountView && (
									<ModalOverlay
										setOpen={setShowEditAccountView}
										open={showEditAccountView}
										maxWidth="58.75rem"
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
											setShowAccountDetailView={setShowAccountDetailView}
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
