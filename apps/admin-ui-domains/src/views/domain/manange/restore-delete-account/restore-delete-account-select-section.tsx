/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
	Container,
	CustomHeaderFactory,
	HoverableRowFactory,
	Input,
	ListRow,
	Paging,
	Row,
	Table,
} from '@zextras/ui-components';
import { getSoapFetchRequest, useDebouncedValue } from '@zextras/ui-shared';
import { FC, useContext, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useQueryErrorSnackbar } from '../../../../hooks/use-query-error-snackbar';
import { useSelectedDomain } from '../../../../hooks/use-selected-domain';
import { getFormatedShortDate } from '../../../utility/utils';
import { RestoreDeleteAccountContext } from './restore-delete-account-context';

const ACCOUNT_LIMIT = 10;

const backupAccountsQueryKeys = {
	all: ['backup-accounts'] as const,
	list: (domainName: string | undefined, filter: string, page: number) =>
		[...backupAccountsQueryKeys.all, domainName, filter, page] as const,
};

function extractBackupAccounts(data: any): {
	accounts: Array<any>;
	maxPage: number | undefined;
} {
	let backupAccounts = data?.accounts;
	let page = data?.maxPage;

	/* Take account list and maxPage from multiserver environment  */
	if (backupAccounts === undefined && !!data) {
		const allServers = Object.keys(data);
		let allServerAccounts: Array<any> = [];
		const maxPageList: Array<any> = [];
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
	return { accounts: Array.isArray(backupAccounts) ? backupAccounts : [], maxPage: page };
}

const RestoreDeleteInheritedSelectSection: FC<any> = () => {
	const { t } = useTranslation();
	const [selectedAccountRows, setSelectedAccountRows] = useState<any>([]);
	const [accountOffset, setAccountOffset] = useState<number>(0);
	const { data: domain } = useSelectedDomain();
	const domainName = domain?.name;
	const context = useContext(RestoreDeleteAccountContext);
	const { setRestoreAccountDetail } = context;
	const [searchString, setSearchString] = useState<string>('');
	const debouncedSearchString = useDebouncedValue(searchString, 1000);

	const { data, isFetching, isError } = useQuery({
		queryKey: backupAccountsQueryKeys.list(domainName, debouncedSearchString, accountOffset),
		queryFn: () =>
			getSoapFetchRequest(
				`/service/extension/zextras_admin/backup/getBackupAccounts?page=${accountOffset}&pageSize=${ACCOUNT_LIMIT}&domains=${domainName}&filter=${debouncedSearchString}`,
			),
		placeholderData: keepPreviousData,
	});

	const { accounts, maxPage } = extractBackupAccounts(data);
	const totalItem = maxPage ? maxPage * ACCOUNT_LIMIT : 1;

	const responseError = (data as any)?.all_server?.error?.message;
	useQueryErrorSnackbar(responseError);

	const accountHeader: Array<any> = [
		{
			id: 'account',
			label: t('label.account', 'Account'),
			width: '30%',
			bold: true,
		},
		{
			id: 'serverName',
			label: t('label.server_name', 'Server Name'),
			width: '30%',
			bold: true,
		},
		{
			id: 'hasBackup',
			label: t('label.has_backup', 'Has Backup'),
			width: '10%',
			bold: true,
		},
		{
			id: 'creat_date',
			label: t('label.creation_date', 'Creation Date'),
			width: '10%',
			bold: true,
		},
		{
			id: 'delete_date',
			label: t('label.deletion_date', 'Deletion Date'),
			width: '10%',
			bold: true,
		},
	];

	const onAccountRowClick = (item: any): void => {
		setSelectedAccountRows([item]);
		if (item?.id) {
			setRestoreAccountDetail(() => ({
				name: item?.name,
				id: item?.id,
				status: item?.status,
				createDate: item?.creationTimestamp,
				serverName: item?.serverName,
			}));
		}
	};

	const accountRows: Array<any> = accounts.map((item: any) => ({
		id: `${item?.id}-${item?.serverName}`,
		columns: [
			<Container
				key={item?.name}
				onClick={(): void => onAccountRowClick(item)}
				crossAlignment="flex-start"
			>
				<ds-text as="span" size="small" weight="regular" key={item?.name} color="gray0">
					{item?.name}
				</ds-text>
			</Container>,
			<Container
				key={item?.serverName}
				onClick={(): void => onAccountRowClick(item)}
				crossAlignment="flex-start"
			>
				<ds-text as="span" size="small" weight="light" key={item?.serverName} color="gray0">
					{item?.serverName}
				</ds-text>
			</Container>,
			<Container
				key={item?.status}
				onClick={(): void => onAccountRowClick(item)}
				crossAlignment="flex-start"
			>
				<ds-text as="span" size="small" weight="light" key={item?.status} color="gray0">
					{item?.status === 'Active' ? 'Yes' : 'No'}
				</ds-text>
			</Container>,
			<Container
				key={item?.creationTimestamp}
				onClick={(): void => onAccountRowClick(item)}
				crossAlignment="flex-start"
			>
				<ds-text as="span" size="small" weight="light" key={item?.creationTimestamp} color="gray0">
					{getFormatedShortDate(new Date(item?.creationTimestamp))}
				</ds-text>
			</Container>,
			<Container
				key={item?.id}
				onClick={(): void => onAccountRowClick(item)}
				crossAlignment="flex-start"
			>
				<ds-text as="span" size="small" weight="light" key={item?.id} color="gray0">
					{item?.deletedTimestamp ? getFormatedShortDate(new Date(item?.deletedTimestamp)) : ''}
				</ds-text>
			</Container>,
		],
	}));

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
							<ds-text as="p" size="medium" color="gray0" weight="regular">
								{t(
									'label.restore_select_account_row_1',
									`Through this tool, you'll be able to restore an entire account from the backup into a new account.`,
								)}
							</ds-text>
						</Container>
						<Container padding={{ bottom: 'medium' }} crossAlignment="flex-start">
							{
								<ds-text as="p" size="medium" color="gray0" weight="regular">
									<Trans
										i18nKey="label.restore_select_account_row_2"
										defaults="<bold>Note</bold> that all the mails, appointments, contacts, and settings of the account will be restored, as they were at the chosen timestamp."
										components={{ bold: <strong /> }}
									/>
								</ds-text>
							}
						</Container>
						<Container padding={{ bottom: 'medium', top: 'large' }}>
							<Input
								disabled={accountRows.length === 0 && !searchString && !isError}
								backgroundColor="gray5"
								value={searchString}
								onChange={(e: any): void => {
									setSearchString(e.target.value);
									setAccountOffset(0);
								}}
								label={t('label.filter_account_list', 'Filter Account List')}
								CustomIcon={(): any => (
									<ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
								)}
							/>
						</Container>
						<ListRow>
							<Row height={isFetching ? 'fit' : 'calc(100vh - 35.625em)'}>
								<Table
									style={{ overflow: 'auto', height: '100%' }}
									multiSelect={false}
									rows={accountRows}
									headers={accountHeader}
									showCheckbox={false}
									selectedRows={selectedAccountRows}
									RowFactory={HoverableRowFactory}
									HeaderFactory={CustomHeaderFactory}
								/>
								{isFetching && (
									<Container
										crossAlignment="center"
										mainAlignment="center"
										height="fit"
										padding={{ top: 'medium' }}
									>
										<ds-spinner></ds-spinner>
									</Container>
								)}
							</Row>
						</ListRow>

						<ListRow>
							<Container padding={{ top: 'large', bottom: 'small' }}>
								<ds-divider></ds-divider>
							</Container>
						</ListRow>
						<ListRow>
							<Container mainAlignment="flex-end" crossAlignment="flex-end">
								<Paging
									totalItem={totalItem}
									pageSize={ACCOUNT_LIMIT}
									currentPageProp={accountOffset ? accountOffset + 1 : 1}
									onPageChange={(val: number): void => {
										setAccountOffset(val - 1);
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
