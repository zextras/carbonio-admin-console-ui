/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { debounce, flatMapDeep, filter } from 'lodash';
import {
	Container,
	Input,
	Row,
	Text,
	Table,
	Divider,
	Icon,
	Padding,
	Button,
	IconButton,
	useSnackbar,
	Tooltip
} from '@zextras/carbonio-design-system';
import moment from 'moment';
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	postSoapFetchRequest
} from '@zextras/carbonio-shell-ui';
import logo from '../../../../assets/gardian.svg';
import { useDomainStore } from '../../../../store/domain/store';
import Paging from '../../../components/paging';
import { accountListDirectory } from '../../../../services/account-list-directory-service';
import { getAccountRequest } from '../../../../services/get-account';
import { getAccountMembershipRequest } from '../../../../services/get-account-membership';
import { getSingatures } from '../../../../services/get-signature-service';
import AccountDetailView from './account-detail-view';
import CreateAccount from './create-account/create-account';
import EditAccount from './edit-account/edit-account';
import { AccountContext } from './account-context';
import { fetchSoap } from '../../../../services/listOTP-service';
import { useAuthIsAdvanced } from '../../../../store/auth-advanced/store';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';
import useOutsideClick from '../../../app/hooks/useoutsideclick';

const ManageAccounts: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const domainName = useDomainStore((state) => state.domain?.name);
	const [accountDetail, setAccountDetail] = useState<any>({});
	const [directMemberList, setDirectMemberList] = useState<any>({});
	const [inDirectMemberList, setInDirectMemberList] = useState<any>({});
	const [initAccountDetail, setInitAccountDetail] = useState<any>({});
	const [otpList, setOtpList] = useState<any[]>([]);
	const [identitiesList, setIdentitiesList] = useState<any[]>([]);
	const [folderList, setFolderList] = useState<any[]>([]);
	const [deligateDetail, setDeligateDetail] = useState<any>({});

	const flatten: any = useCallback((item: any) => [item, flatMapDeep(item.folder, flatten)], []);
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);
	const tableRef = useRef(null);

	const headers: any = useMemo(
		() => [
			{
				id: 'email',
				label: t('label.email', 'Email'),
				width: '25%',
				bold: true
			},
			{
				id: 'name',
				label: t('label.name', 'Name'),
				width: '15%',
				bold: true
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
				width: '10%',
				bold: true
			},
			{
				id: 'status',
				label: t('label.status', 'Status'),
				width: '10%',
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
	const [searchString, setSearchString] = useState<string>('');
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [totalAccount, setTotalAccount] = useState<number>(0);
	const [showAccountDetailView, setShowAccountDetailView] = useState<boolean>(false);
	const [showCreateAccountView, setShowCreateAccountView] = useState<boolean>(false);
	const [showEditAccountView, setShowEditAccountView] = useState<boolean>(false);

	const [signatureList, setSignatureList] = useState<any[]>([]);
	const [signatureItems, setSignatureItems] = useState<any[]>([]);
	const [signatureData, setSignatureData]: any = useState([]);

	const generateSignatureList = (signatureResponse: any): void => {
		if (signatureResponse && Array.isArray(signatureResponse)) {
			setSignatureList(signatureResponse);
		}
	};
	const getSignatureDetail = useCallback((id): void => {
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

	const accountUserType = useCallback((item): string => {
		if (item.zimbraIsAdminAccount === 'TRUE') return 'Admin';
		if (item.zimbraIsDelegatedAdminAccount === 'TRUE') return 'DelegatedAdmin';
		if (item.zimbraIsExternalVirtualAccount === 'TRUE') return 'External';
		if (item.zimbraIsSystemAccount === 'TRUE') return 'System';
		return 'Normal';
	}, []);
	const getAccountDetail = useCallback(
		(id): void => {
			getAccountRequest(id)
				.then((data: any) => {
					const obj: any = {};
					// eslint-disable-next-line array-callback-return
					data?.account?.[0]?.a?.map((ele: any) => {
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

					obj.password = '';
					obj.repeatPassword = '';
					obj.name = data?.account?.[0]?.name;
					setInitAccountDetail({ ...obj });
					setAccountDetail({ ...obj });
				})
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				.catch((error) => {
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
		[setAccountDetail, createSnackbar, t]
	);
	const getAccountMembership = useCallback(
		(id): void => {
			getAccountMembershipRequest(id)
				.then((data: any) => {
					const directMemArr: any[] = [];
					const inDirectMemArr: any[] = [];
					// eslint-disable-next-line array-callback-return
					data?.dl?.map((ele: any) => {
						if (ele?.via)
							inDirectMemArr.push({ label: ele?.name, closable: false, disabled: true });
						else directMemArr.push({ label: ele?.name, closable: false, disabled: true });
					});

					setDirectMemberList(directMemArr);
					setInDirectMemberList(inDirectMemArr);
				})
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				.catch((error) => {
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
				_jsns: 'urn:zimbraAdmin',
				module: 'ZxAuth',
				action: 'list_totp_command',
				account: `${id}`
			}).then((res: any) => {
				if (res?.ok) {
					const otpListResponse = res.response?.list;
					if (otpListResponse && Array.isArray(otpListResponse)) {
						const otpListArr: any = [];
						otpListResponse.map((item: any): any => {
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
							return '';
						});
						setOtpList(otpListArr);
					}
				}
			});
		},
		[t]
	);
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
			setSelectedAccount(acc);
			setShowAccountDetailView(true);
			getAccountDetail(acc?.id);
			getSignatureDetail(acc?.id);
			getAccountMembership(acc?.id);
			getIdentitiesList(acc);
			if (isAdvanced) {
				getListOtp(acc?.name);
			}
		},
		[
			getAccountDetail,
			getSignatureDetail,
			getAccountMembership,
			getIdentitiesList,
			isAdvanced,
			getListOtp
		]
	);
	const getAccountList = useCallback((): void => {
		const type = 'accounts';
		const attrs =
			'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraCreateTimestamp,zimbraLastLogonTimestamp,zimbraMailQuota,zimbraNotes,mail';
		accountListDirectory(attrs, type, domainName, searchQuery, offset, limit).then((data) => {
			const accountListResponse: any = data?.account || [];
			if (accountListResponse && Array.isArray(accountListResponse)) {
				const accountListArr: any = [];
				setTotalAccount(data.searchTotal || 0);
				accountListResponse.map((item: any): any => {
					item?.a?.map((ele: any) => {
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

						return '';
					});
					accountListArr.push({
						id: item?.id,
						columns: [
							<Text
								size="medium"
								key={item?.id}
								color="gray0"
								onClick={(): void => {
									openDetailView(item);
								}}
							>
								{item?.name || ' '}
							</Text>,
							<Text
								size="medium"
								key={item?.id}
								color="gray0"
								onClick={(): void => {
									openDetailView(item);
								}}
							>
								{item?.displayName || <>&nbsp;</>}
							</Text>,
							<>
								{
									// eslint-disable-next-line no-param-reassign, no-unsafe-optional-chaining
									item?.mail?.length - 1 || 0 ? (
										<Tooltip
											key={item?.id}
											placement="bottom"
											label={item?.mail.slice(1).join(', ')}
											maxWidth="auto"
										>
											<Text
												size="medium"
												key={item?.id}
												color="#828282"
												onClick={(): void => {
													openDetailView(item);
												}}
											>
												{
													// eslint-disable-next-line no-param-reassign, no-unsafe-optional-chaining
													item?.mail?.length - 1 || 0
												}
											</Text>
										</Tooltip>
									) : (
										<Text
											size="medium"
											key={item?.id}
											color="#828282"
											onClick={(): void => {
												openDetailView(item);
											}}
										>
											0
										</Text>
									)
								}
							</>,
							<Text
								size="medium"
								key={item?.id}
								color="gray0"
								onClick={(): void => {
									openDetailView(item);
								}}
							>
								{accountUserType(item)}
							</Text>,
							<Text
								size="medium"
								key={item?.id}
								color={STATUS_COLOR[item?.zimbraAccountStatus]?.color}
								onClick={(): void => {
									openDetailView(item);
								}}
							>
								{STATUS_COLOR[item?.zimbraAccountStatus]?.label}
							</Text>,
							<Text
								size="medium"
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
					return '';
				});
				// setAccountList([]);
				setAccountList(accountListArr);
			}
		});
	}, [STATUS_COLOR, accountUserType, domainName, limit, offset, openDetailView, searchQuery]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchAccountList = useCallback(
		debounce((searchText) => {
			if (searchText) {
				setSearchQuery(
					`(|(mail=*${searchText}*)(cn=*${searchText}*)(sn=*${searchText}*)(gn=*${searchText}*)(displayName=*${searchText}*)(zimbraMailDeliveryAddress=*${searchText}*))`
				);
			} else {
				setSearchQuery('');
			}
		}, 700),
		[debounce]
	);
	useEffect(() => {
		searchAccountList(searchString);
	}, [accountList, limit, offset, searchAccountList, searchString]);

	useEffect(() => {
		if (domainName) {
			getAccountList();
		}
	}, [domainName, getAccountList]);

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

	useOutsideClick(tableRef, closeAccountDetailDialog);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyEvent);
		return () => {
			window.removeEventListener('keydown', handleKeyEvent);
		};
	}, [handleKeyEvent]);

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="58px"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
						<Row mainAlignment="flex-start" width="30%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('domain.account_list', 'Accounts List')}
							</Text>
						</Row>
						<Row width="70%" mainAlignment="flex-end" crossAlignment="flex-end">
							<Padding right="large">
								<IconButton
									iconColor="gray6"
									backgroundColor="primary"
									icon="Plus"
									height={36}
									width={36}
									onClick={(): void => {
										setShowCreateAccountView(true);
									}}
								/>
							</Padding>
							<Padding right="large">
								<Button
									type="outlined"
									label={t('label.bulk_actions', 'BULK ACTIONS')}
									icon="ChevronDownOutline"
									iconPlacement="right"
									color="primary"
									height={36}
									disabled
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
				height="calc(100vh - 200px)"
				padding={{ top: 'large' }}
			>
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
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
									value={searchString}
									background="gray5"
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
							height="calc(100vh - 340px)"
							ref={tableRef}
						>
							{accountList.length !== 0 && (
								<Table
									rows={accountList}
									headers={headers}
									showCheckbox={false}
									multiSelect={false}
									style={{ overflow: 'auto', height: '100%' }}
									RowFactory={CustomRowFactory}
									HeaderFactory={CustomHeaderFactory}
								/>
							)}
							{accountList.length === 0 && (
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
							<Row
								orientation="horizontal"
								mainAlignment="space-between"
								crossAlignment="flex-start"
								width="fill"
								padding={{ top: 'medium' }}
							>
								<Divider />
							</Row>
							{accountList.length !== 0 && (
								<Row orientation="horizontal" mainAlignment="flex-start" width="100%">
									<Paging totalItem={totalAccount} setOffset={setOffset} pageSize={limit} />
								</Row>
							)}
							<AccountContext.Provider
								value={{
									accountDetail,
									setAccountDetail,
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
									setFolderList
								}}
							>
								{showAccountDetailView && (
									<AccountDetailView
										selectedAccount={selectedAccount}
										setShowAccountDetailView={setShowAccountDetailView}
										setShowEditAccountView={setShowEditAccountView}
										STATUS_COLOR={STATUS_COLOR}
										getAccountList={getAccountList}
									/>
								)}

								{showEditAccountView && (
									<EditAccount
										setShowEditAccountView={setShowEditAccountView}
										selectedAccount={selectedAccount}
										getAccountList={getAccountList}
										signatureList={signatureList}
										signatureItems={signatureItems}
									/>
								)}
							</AccountContext.Provider>
						</Row>
					</Container>
				</Row>
			</Container>
			{showCreateAccountView && (
				<CreateAccount
					setShowCreateAccountView={setShowCreateAccountView}
					getAccountList={getAccountList}
				/>
			)}
		</Container>
	);
};

export default ManageAccounts;
