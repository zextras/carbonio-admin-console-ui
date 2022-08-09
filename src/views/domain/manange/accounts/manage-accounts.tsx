/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState, useMemo, useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
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
	useSnackbar
} from '@zextras/carbonio-design-system';
import logo from '../../../../assets/gardian.svg';
import { useDomainStore } from '../../../../store/domain/store';
import Paginig from '../../../components/paging';
import { accountListDirectory } from '../../../../services/account-list-directory-service';
import { createAccountRequest } from '../../../../services/create-account';
import { getAccountRequest } from '../../../../services/get-account';
import { getAccountMembershipRequest } from '../../../../services/get-account-membership';
import { getSingatures } from '../../../../services/get-signature-service';
import AccountDetailView from './account-detail-view';
import CreateAccount from './create-account/create-account';
import EditAccount from './edit-account/edit-account';
import { AccountContext } from './account-context';

const ManageAccounts: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const domainName = useDomainStore((state) => state.domain?.name);
	const [accountDetail, setAccountDetail] = useState<any>({});
	const [directMemberList, setDirectMemberList] = useState<any>({});
	const [inDirectMemberList, setInDirectMemberList] = useState<any>({});
	const [initAccountDetail, setInitAccountDetail] = useState<any>({});
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
		getSingatures(id)
			.then((response) => response.json())
			.then((data) => {
				const signatureResponse = data?.Body?.GetSignaturesResponse?.signature || [];
				generateSignatureList(signatureResponse);
				setSignatureData(signatureResponse);
			});
	}, []);

	// useEffect(() => {
	// 	getSignatureDetail();
	// }, [getSignatureDetail]);

	const STATUS_COLOR: any = useMemo(
		() => ({
			active: {
				color: '#8BC34A',
				label: t('label.active', 'Active')
			},
			maintenance: {
				color: '#2196D3',
				label: t('label.maintenance', 'Maintenance')
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
				.then((response: any) => response.json())
				.then((data: any) => {
					const obj: any = {};
					// eslint-disable-next-line array-callback-return
					data?.Body?.GetAccountResponse?.account?.[0]?.a?.map((ele: any) => {
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
					setInitAccountDetail({ ...obj });
					setAccountDetail({ ...obj });
				})
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				.catch((error) => {});
		},
		[setAccountDetail]
	);
	const getAccountMembership = useCallback(
		(id): void => {
			getAccountMembershipRequest(id)
				.then((response: any) => response.json())
				.then((data: any) => {
					const directMemArr: any[] = [];
					const inDirectMemArr: any[] = [];
					// eslint-disable-next-line array-callback-return
					data?.Body?.GetAccountMembershipResponse?.dl?.map((ele: any) => {
						if (ele?.via)
							inDirectMemArr.push({ label: ele?.name, closable: false, disabled: true });
						else directMemArr.push({ label: ele?.name, closable: false, disabled: true });
					});

					setDirectMemberList(directMemArr);
					setInDirectMemberList(inDirectMemArr);
				})
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				.catch((error) => {});
		},
		[setDirectMemberList, setInDirectMemberList]
	);
	const openDetailView = useCallback(
		(acc: any): void => {
			setSelectedAccount(acc);
			setShowAccountDetailView(true);
			getAccountDetail(acc?.id);
			getSignatureDetail(acc?.id);
			getAccountMembership(acc?.id);
		},
		[getAccountDetail, getAccountMembership, getSignatureDetail]
	);
	const getAccountList = useCallback((): void => {
		const type = 'accounts';
		const attrs =
			'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraCreateTimestamp,zimbraLastLogonTimestamp,zimbraMailQuota,zimbraNotes';
		accountListDirectory(attrs, type, domainName, searchQuery, offset, limit)
			.then((response) => response.json())
			.then((data) => {
				const accountListResponse: any = data?.Body?.SearchDirectoryResponse?.account || [];
				if (accountListResponse && Array.isArray(accountListResponse)) {
					const accountListArr: any = [];
					setTotalAccount(data?.Body?.SearchDirectoryResponse?.searchTotal || 0);
					accountListResponse.map((item: any): any => {
						item?.a?.map((ele: any) => {
							// eslint-disable-next-line no-param-reassign
							item[ele?.n] = ele._content;
							return '';
						});
						accountListArr.push({
							id: item?.id,
							columns: [
								<Text
									size="medium"
									key={item?.id}
									color="#414141"
									onClick={(event: { stopPropagation: () => void }): void => {
										event.stopPropagation();
										openDetailView(item);
									}}
								>
									{item?.name || ' '}
								</Text>,
								<Text
									size="medium"
									key={item?.id}
									color="#414141"
									onClick={(event: { stopPropagation: () => void }): void => {
										event.stopPropagation();
										openDetailView(item);
									}}
								>
									{item?.displayName || <>&nbsp;</>}
								</Text>,
								<Text
									size="medium"
									key={item?.id}
									color="#828282"
									onClick={(event: { stopPropagation: () => void }): void => {
										event.stopPropagation();
										openDetailView(item);
									}}
								>
									{accountUserType(item)}
								</Text>,
								<Text
									size="medium"
									key={item?.id}
									color={STATUS_COLOR[item?.zimbraAccountStatus]?.color}
									onClick={(event: { stopPropagation: () => void }): void => {
										event.stopPropagation();
										openDetailView(item);
									}}
								>
									{STATUS_COLOR[item?.zimbraAccountStatus]?.label}
								</Text>,
								<Text
									size="medium"
									key={item?.id}
									color="#414141"
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

	const createAccountReq = useCallback(
		(attr, name, password): void => {
			createAccountRequest(attr, name, password)
				.then((response) => response.json())
				.then((data) => {
					const isCreateAccount = data?.Body?.CreateAccountResponse;
					if (isCreateAccount) {
						setShowCreateAccountView(false);
						createSnackbar({
							key: 'success',
							type: 'success',
							label: t(
								'label.account_created_successfully',
								'The account has been created successfully'
							),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					} else {
						createSnackbar({
							key: 'error',
							type: 'error',
							label: data?.Body?.Fault?.Reason?.Text,
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					}
					getAccountList();
				})
				.catch((error) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		},
		[createSnackbar, getAccountList, t]
	);

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="58px"
				>
					<Row orientation="horizontal" width="100%">
						<Row width="50%" mainAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('domain.account_list', 'Account List')}
							</Text>
						</Row>
						<Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
							<Padding right="medium">
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
							<Padding right="medium">
								<Button type="outlined" label={t('label.details', 'DETAILS')} color="primary" />
							</Padding>
							<Button
								type="outlined"
								label={t('label.bulk_actions', 'BULK ACTIONS')}
								icon="ChevronDownOutline"
								iconPlacement="right"
								color="primary"
							/>
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
				padding={{ top: 'extralarge' }}
			>
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
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
									label={t(
										'label.i_am_looking_for_this_account',
										`I'm looking for this account...`
									)}
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
						>
							{accountList.length !== 0 && (
								<Table
									rows={accountList}
									headers={headers}
									showCheckbox={false}
									style={{ overflow: 'auto', height: '100%' }}
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
									<Paginig totalItem={totalAccount} setOffset={setOffset} pageSize={limit} />
								</Row>
							)}
						</Row>
					</Container>
				</Row>
			</Container>
			{showCreateAccountView && (
				<CreateAccount
					setShowCreateAccountView={setShowCreateAccountView}
					createAccountReq={createAccountReq}
				/>
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
					setSignatureList
				}}
			>
				{showAccountDetailView && (
					<AccountDetailView
						selectedAccount={selectedAccount}
						setShowAccountDetailView={setShowAccountDetailView}
						setShowEditAccountView={setShowEditAccountView}
						STATUS_COLOR={STATUS_COLOR}
					/>
				)}

				{showEditAccountView && (
					<EditAccount
						setShowEditAccountView={setShowEditAccountView}
						createAccountReq={createAccountReq}
						selectedAccount={selectedAccount}
						getAccountList={getAccountList}
					/>
				)}
			</AccountContext.Provider>
		</Container>
	);
};

export default ManageAccounts;
