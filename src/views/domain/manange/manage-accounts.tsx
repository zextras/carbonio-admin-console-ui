/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState, useMemo, useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { Container, Input, Row, Text, Table, Divider, Icon } from '@zextras/carbonio-design-system';
import logo from '../../../assets/gardian.svg';
import { useDomainStore } from '../../../store/domain/store';

import Paginig from '../../components/paging';
import { accountListDirectory } from '../../../services/account-list-directory-service';
import AccountDetailView from './account-detail-view';
import ListRow from '../../list/list-row';

const ManageAccounts: FC = () => {
	const [t] = useTranslation();
	const domainName = useDomainStore((state) => state.domain?.name);

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
										setSelectedAccount(item);
										setShowAccountDetailView(true);
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
										setSelectedAccount(item);
										setShowAccountDetailView(true);
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
										setSelectedAccount(item);
										setShowAccountDetailView(true);
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
										setSelectedAccount(item);
										setShowAccountDetailView(true);
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
										setSelectedAccount(item);
										setShowAccountDetailView(true);
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
	}, [STATUS_COLOR, accountUserType, domainName, limit, offset, searchQuery]);
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
						<Row
							padding={{ all: 'large' }}
							mainAlignment="flex-start"
							width="100%"
							crossAlignment="flex-start"
						>
							<Text size="medium" weight="bold" color="gray0">
								{t('domain.account_list', 'Account List')}
							</Text>
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
				style={{ overflow: 'auto' }}
				width="100%"
				height="calc(100vh - 200px)"
			>
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
					<Container height="fit" crossAlignment="flex-start" background="gray6">
						<Container padding={{ top: 'large', right: 'small', left: 'small' }}>
							<ListRow>
								<Container padding={{ top: 'large', right: 'small', left: 'small' }}>
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
										CustomIcon={(): any => (
											<Icon icon="FunnelOutline" size="large" color="primary" />
										)}
									/>
								</Container>
							</ListRow>
						</Container>

						<Container padding={{ all: 'large' }}>
							{accountList.length !== 0 && (
								<ListRow>
									<Table rows={accountList} headers={headers} showCheckbox multiSelect />
								</ListRow>
							)}
							{accountList.length === 0 && (
								<Container orientation="column" crossAlignment="center" mainAlignment="flex-start">
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
						</Container>
					</Container>
				</Row>
			</Container>
			{showAccountDetailView && (
				<AccountDetailView
					selectedAccount={selectedAccount}
					setShowAccountDetailView={setShowAccountDetailView}
					STATUS_COLOR={STATUS_COLOR}
				/>
			)}
		</Container>
	);
};

export default ManageAccounts;
