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
	useSnackbar,
	Divider,
	Button
} from '@zextras/carbonio-design-system';
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	getSoapFetchRequest
} from '@zextras/carbonio-shell-ui';
import { debounce } from 'lodash';
import { Trans, useTranslation } from 'react-i18next';

import { RestoreDeleteAccountContext } from './restore-delete-account-context';
import { useDomainStore } from '../../../../store/domain/store';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import Paging from '../../../components/paging';
import ListRow from '../../../list/list-row';
import { getFormatedShortDate } from '../../../utility/utils';

const RestoreDeleteInheritedSelectSection: FC<any> = () => {
	const { t } = useTranslation();
	const [accounts, setAccounts] = useState<Array<any>>([]);
	const [accountRows, setAccountRows] = useState<Array<any>>([]);
	const [selectedAccountRows, setSelectedAccountRows] = useState<any>([]);
	const [accountOffset, setAccountOffset] = useState<number>(0);
	const [accountLimit, setAccountLimit] = useState<number>(10);
	const domainName = useDomainStore((state) => state.domain?.name);
	const createSnackbar = useSnackbar();
	const context = useContext(RestoreDeleteAccountContext);
	const { restoreAccountDetail, setRestoreAccountDetail } = context;
	const [searchString, setSearchString] = useState<string>();
	const [totalItem, setTotalItem] = useState(1);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
	const [hasError, setHasError] = useState<boolean>(false);

	const accountHeader: any[] = useMemo(
		() => [
			{
				id: 'account',
				label: t('label.account', 'Account'),
				width: '30%',
				bold: true
			},
			{
				id: 'serverName',
				label: t('label.server_name', 'Server Name'),
				width: '30%',
				bold: true
			},
			{
				id: 'hasBackup',
				label: t('label.has_backup', 'Has Backup'),
				width: '10%',
				bold: true
			},
			{
				id: 'creat_date',
				label: t('label.creation_date', 'Creation Date'),
				width: '10%',
				bold: true
			},
			{
				id: 'delete_date',
				label: t('label.deletion_date', 'Deletion Date'),
				width: '10%',
				bold: true
			}
		],
		[t]
	);

	const getBackupAccounts = useCallback(
		// eslint-disable-next-line sonarjs/cognitive-complexity,default-param-last
		(searchText = '', offset = 0) => {
			setIsRequestInProgress(true);
			setAccounts([]);
			getSoapFetchRequest(
				`/service/extension/zextras_admin/backup/getBackupAccounts?page=${offset}&pageSize=${accountLimit}&domains=${domainName}&filter=${searchText}`
			)
				.then((data: any) => {
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
							severity: 'error',
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
					} else if (page === undefined || page === 0) {
						setTotalItem(1);
					}
				})
				.catch(() => setHasError(true));
		},
		[domainName, createSnackbar, accountLimit]
	);

	useEffect(() => {
		getBackupAccounts();
	}, [getBackupAccounts]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchAccount = useCallback(
		debounce((searchText) => {
			setSearchString(searchText);
			setAccountOffset(0);
			getBackupAccounts(searchText, 0);
		}, 1000),
		[debounce]
	);

	useMemo(() => {
		if (accounts && accounts.length > 0) {
			const allRows = accounts.map((item: any) => ({
				id: `${item?.id}-${item?.serverName}`,
				columns: [
					<Container
						key={item?.name}
						onClick={(): void => {
							setSelectedAccountRows([item]);
						}}
						crossAlignment="flex-start"
					>
						<Text size="small" weight="regular" key={item?.name} color="gray0">
							{item?.name}
						</Text>
					</Container>,
					<Container
						key={item?.serverName}
						onClick={(): void => {
							setSelectedAccountRows([item]);
						}}
						crossAlignment="flex-start"
					>
						<Text size="small" weight="light" key={item?.serverName} color="gray0">
							{item?.serverName}
						</Text>
					</Container>,
					<Container
						key={item?.status}
						onClick={(): void => {
							setSelectedAccountRows([item]);
						}}
						crossAlignment="flex-start"
					>
						<Text size="small" weight="light" key={item?.status} color="gray0">
							{item?.status === 'Active' ? 'Yes' : 'No'}
						</Text>
					</Container>,
					<Container
						key={item?.creationTimestamp}
						onClick={(): void => {
							setSelectedAccountRows([item]);
						}}
						crossAlignment="flex-start"
					>
						<Text size="small" weight="light" key={item?.creationTimestamp} color="gray0">
							{getFormatedShortDate(new Date(item?.creationTimestamp))}
						</Text>
					</Container>,
					<Container
						key={item?.id}
						onClick={(): void => {
							setSelectedAccountRows([item]);
						}}
						crossAlignment="flex-start"
					>
						<Text size="small" weight="light" key={item?.id} color="gray0">
							{item?.deletedTimestamp ? getFormatedShortDate(new Date(item?.deletedTimestamp)) : ''}
						</Text>
					</Container>
				]
			}));
			setAccountRows(allRows);
		} else {
			setAccountRows([]);
		}
	}, [accounts]);

	useEffect(() => {
		if (searchString !== undefined) {
			searchAccount(searchString);
		}
	}, [searchString, searchAccount]);

	useMemo(() => {
		if (selectedAccountRows && selectedAccountRows.length > 0) {
			const findAccount = selectedAccountRows[0];
			if (!!findAccount && findAccount?.id) {
				setRestoreAccountDetail(() => ({
					name: findAccount?.name,
					id: findAccount?.id,
					status: findAccount?.status,
					createDate: findAccount?.creationTimestamp,
					serverName: findAccount?.serverName
				}));
			}
		}
	}, [selectedAccountRows, setRestoreAccountDetail]);

	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			width="100%"
			padding={{ top: 'extralarge' }}
			style={{ overflowY: 'auto' }}
			maxHeight="calc(100vh - 17.5em)"
		>
			<Row mainAlignment="flex-start" width="100%">
				<Container crossAlignment="flex-start" background="gray6">
					<Row
						orientation="horizontal"
						mainAlignment="space-between"
						crossAlignment="flex-start"
						width="fill"
						padding={{ bottom: 'large', right: 'large', left: 'large' }}
					>
						<Container padding={{ bottom: 'medium' }} crossAlignment="flex-start">
							<Text size="medium" color="gray0" weight="regular">
								{t(
									'label.restore_select_account_row_1',
									`Through this tool, you'll be able to restore an entire account from the backup into a new account.`
								)}
							</Text>
						</Container>
						<Container padding={{ bottom: 'medium' }} crossAlignment="flex-start">
							{
								<Text size="medium" color="gray0" weight="regular">
									<Trans
										i18nKey="label.restore_select_account_row_2"
										defaults="<bold>Note</bold> that all the mails, appointments, contacts, and settings of the account will be restored, as they were at the chosen timestamp."
										components={{ bold: <strong /> }}
									/>
								</Text>
							}
						</Container>
						<Container padding={{ bottom: 'medium', top: 'large' }}>
							<Input
								disabled={accountRows.length === 0 && !searchString && !hasError}
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
							<Row height={isRequestInProgress ? 'fit' : 'calc(100vh - 35.625em)'}>
								<Table
									style={{ overflow: 'auto', height: '100%' }}
									multiSelect={false}
									rows={accountRows}
									headers={accountHeader}
									showCheckbox={false}
									selectedRows={selectedAccountRows}
									RowFactory={CustomRowFactory}
									HeaderFactory={CustomHeaderFactory}
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
											color="primary"
											label=""
											loading
											onClick={(): null => null}
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
									currentPageProp={accountOffset ? accountOffset + 1 : 1}
									onPageChange={(val: number): void => {
										setAccountOffset(val - 1);
										getBackupAccounts(searchString, val - 1);
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
export default RestoreDeleteInheritedSelectSection;
