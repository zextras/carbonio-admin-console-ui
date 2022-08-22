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
	Divider
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { debounce } from 'lodash';
import ListRow from '../../../list/list-row';
import Paginig from '../../../components/paging';
import { useDomainStore } from '../../../../store/domain/store';
import { RestoreDeleteAccountContext } from './restore-delete-account-context';

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
	const [searchString, setSearchString] = useState<string>('');
	const [totalItem, setTotalItem] = useState(1);

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
			fetch(
				`/service/extension/zextras_admin/backup/getBackupAccounts?page=${accountOffset}&pageSize=${accountLimit}&domains=${domainName}&targetServers=all_servers&filter=${searchText}`,
				{
					method: 'GET',
					credentials: 'include'
				}
			)
				.then((response) => response.json())
				.then((data) => {
					const error = data?.all_server?.error?.message;
					let backupAccounts = data?.accounts;
					let page = data?.maxPage;
					if (!!domainName && !!data[domainName]) {
						backupAccounts = data[domainName]?.response?.accounts;
						page = data[domainName]?.response?.maxPage;
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
						{item?.creationTimestamp}
					</Text>,
					<Text size="medium" weight="bold" key={item?.id} color="#828282"></Text>
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
		}, 700),
		[debounce]
	);

	useEffect(() => {
		searchAccount(searchString);
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
						className="dddddddd"
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
							<Row height="calc(100vh - 490px)">
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
							</Row>
						</ListRow>
						<ListRow>
							<Container padding={{ top: 'large', bottom: 'small' }}>
								<Divider />
							</Container>
						</ListRow>
						<ListRow>
							<Container mainAlignment="flex-end" crossAlignment="flex-end">
								<Paginig
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
