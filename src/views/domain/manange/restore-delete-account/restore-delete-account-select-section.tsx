/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Text,
	Input,
	Row,
	Icon,
	Table,
	SnackbarManagerContext,
	Divider,
	Button
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	getSoapFetchRequest
} from '@zextras/carbonio-shell-ui';
import ListRow from '../../../list/list-row';
import Paging from '../../../components/paging';
import { useDomainStore } from '../../../../store/domain/store';
import { RestoreDeleteAccountContext } from './restore-delete-account-context';
import { getFormatedShortDate } from '../../../utility/utils';

const RestoreDeleteAccountSelectSection: FC<any> = () => {
	const { t } = useTranslation();
	const [accounts, setAccounts] = useState<Array<any>>([]);
	const [accountRows, setAccountRows] = useState<Array<any>>([]);
	const [selectedAccountRows, setSelectedAccountRows] = useState<Array<any>>([]);
	const [accountOffset, setAccountOffset] = useState<number>(0);
	const [accountLimit, setAccountLimit] = useState<number>(10);
	const domainName = useDomainStore((state) => state.domain?.name);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const context = useContext(RestoreDeleteAccountContext);
	const { restoreAccountDetail, setRestoreAccountDetail } = context;
	const [searchString, setSearchString] = useState<string>();
	const [totalItem, setTotalItem] = useState(1);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);

	const accountHeader: any[] = useMemo(
		() => [
			{
				id: 'account',
				label: t('label.account', 'Account'),
				width: '30%',
				bold: true
			},
			{
				id: 'status',
				label: t('label.status', 'Status'),
				width: '20%',
				bold: true
			},
			{
				id: 'creat_date',
				label: t('label.creation_date', 'Creation Date'),
				width: '20%',
				bold: true
			},
			{
				id: 'delete_date',
				label: t('label.deletion_date', 'Deletion Date'),
				width: '20%',
				bold: true
			}
		],
		[t]
	);

	const getBackupAccounts = useCallback(
		(searchText) => {
			setIsRequestInProgress(true);
			setAccounts([]);
			getSoapFetchRequest(
				`/service/extension/zextras_admin/backup/getBackupAccounts?page=${accountOffset}&pageSize=${accountLimit}&domains=${domainName}&targetServers=all_servers&filter=${searchText}`
			).then((data: any) => {
				setIsRequestInProgress(false);
				const error = data?.all_server?.error?.message;
				let backupAccounts = data?.accounts;
				let page = data?.maxPage;

				/* Take account list and maxPage from multiserver environment  */
				if (backupAccounts === undefined && !!data) {
					const allServers = Object.keys(data);
					let allServerAccounts: any[] = [];
					const maxPageList: any[] = [];
					allServers.forEach((item: string) => {
						if (data[item]?.response?.accounts) {
							allServerAccounts = allServerAccounts.concat(data[item]?.response?.accounts);
						}
						if (data[item]?.response?.maxPage) {
							maxPageList.push(data[item]?.response?.maxPage);
						}
					});
					if (allServerAccounts && allServerAccounts.length > 0) {
						backupAccounts = allServerAccounts;
						if (maxPageList && maxPageList.length > 0) {
							const max = Math.max(...maxPageList);
							if (max) {
								page = max;
							}
						}
					}
				}
				if (error) {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: error,
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
				if (backupAccounts && Array.isArray(backupAccounts) && backupAccounts.length > 0) {
					setAccounts(backupAccounts);
				}
				if (page) {
					const num: number = page;
					setTotalItem(num * accountLimit);
				} else if (page === 0) {
					setTotalItem(1);
				}
			});
		},
		[domainName, createSnackbar, accountLimit, accountOffset]
	);

	useMemo(() => {
		if (accounts && accounts.length > 0) {
			const allRows = accounts.map((item: any) => ({
				id: item?.id,
				columns: [
					<Text size="medium" weight="bold" key={item?.name} color="#828282">
						{item?.name}
					</Text>,
					<Text size="medium" weight="bold" key={item?.status} color="#828282">
						{item?.status}
					</Text>,
					<Text size="medium" weight="bold" key={item?.creationTimestamp} color="#828282">
						{getFormatedShortDate(new Date(item?.creationTimestamp))}
					</Text>,
					<Text size="medium" weight="bold" key={item?.id} color="#828282">
						{item?.deletedTimestamp ? getFormatedShortDate(new Date(item?.deletedTimestamp)) : ''}
					</Text>
				]
			}));
			setAccountRows(allRows);
		} else {
			setAccountRows([]);
		}
	}, [accounts]);

	useEffect(() => {
		getBackupAccounts('');
	}, [accountOffset, getBackupAccounts]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchAccount = useCallback(
		debounce((searchText) => {
			if (searchText) {
				setAccountOffset(0);
			} else {
				setAccountOffset(0);
			}
			getBackupAccounts(searchText);
		}, 1000),
		[debounce]
	);

	useEffect(() => {
		if (searchString !== undefined) {
			searchAccount(searchString);
		}
	}, [searchString, searchAccount]);

	useMemo(() => {
		if (selectedAccountRows && selectedAccountRows.length > 0) {
			const findAccount = accounts.find((ac: any) => ac?.id === selectedAccountRows[0]);
			if (!!findAccount && findAccount?.id) {
				setRestoreAccountDetail((prev: any) => ({
					...prev,
					name: findAccount?.name,
					id: findAccount?.id,
					status: findAccount?.status,
					createDate: findAccount?.creationTimestamp
				}));
			}
		}
	}, [selectedAccountRows, accounts, setRestoreAccountDetail]);

	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			width="100%"
			padding={{ top: 'extralarge' }}
		>
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container height="fit" crossAlignment="flex-start" background="gray6">
					<Row
						orientation="horizontal"
						mainAlignment="space-between"
						crossAlignment="flex-start"
						width="fill"
						padding={{ bottom: 'large', right: 'large', left: 'large' }}
					>
						<Container padding={{ bottom: 'medium' }}>
							<Input
								backgroundColor="gray5"
								value={searchString}
								onChange={(e: any): void => {
									setSearchString(e.target.value);
								}}
								label={t('label.filter_account_list', 'Filter Account List')}
								CustomIcon={(): any => <Icon icon="FunnelOutline" size="large" color="primary" />}
							/>
						</Container>
						<ListRow>
							<Row height={isRequestInProgress ? 'fit' : 'calc(100vh - 490px)'}>
								<Table
									style={{ overflow: 'auto', height: '100%' }}
									multiSelect={false}
									rows={accountRows}
									headers={accountHeader}
									showCheckbox={false}
									selectedRows={selectedAccountRows}
									onSelectionChange={(selected: any): void => {
										setSelectedAccountRows(selected);
									}}
								/>
								{isRequestInProgress && (
									<Container
										crossAlignment="center"
										mainAlignment="center"
										height="fit"
										padding={{ top: 'medium' }}
									>
										<Button
											type="ghost"
											iconColor="primary"
											height={36}
											label=""
											width={36}
											loading
										/>
									</Container>
								)}
							</Row>
						</ListRow>

						<ListRow>
							<Container padding={{ top: 'large', bottom: 'small' }}>
								<Divider />
							</Container>
						</ListRow>
						<ListRow>
							<Container mainAlignment="flex-end" crossAlignment="flex-end">
								<Paging
									totalItem={totalItem}
									pageSize={accountLimit}
									setOffset={(val: any): void => {
										setAccountOffset(val / accountLimit);
									}}
								/>
							</Container>
						</ListRow>
					</Row>
				</Container>
			</Row>
		</Container>
	);
};
export default RestoreDeleteAccountSelectSection;
