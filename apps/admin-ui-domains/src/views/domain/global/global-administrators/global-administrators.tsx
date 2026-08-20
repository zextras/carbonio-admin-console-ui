/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQueryClient } from '@tanstack/react-query';
import {
	CustomHeaderFactory,
	HoverableRowFactory,
	ModalOverlay,
	Paging,
	Table,
	TrackNumberPerPage,
} from '@zextras/ui-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RECORD_DISPLAY_LIMIT } from '../../../../constants';
import {
	adminAccountListQueryKeys,
	useAdminAccountList,
} from '../../../../services/use-admin-account-list';
import { EditAccount } from '../../edit-account/edit-account';
import { AdministratorsEmptyState } from './administrators-empty-state';
import styles from './global-administrators.module.css';
import { type AdminAccountEntry,buildAdministratorRows } from './utils';

/**
 * Global administrators view: paginated list of admin/delegated-admin
 * accounts, with the account editor opened over the table on row click.
 */
export const GlobalAdministrators = () => {
	const [t] = useTranslation();
	const queryClient = useQueryClient();
	const [offset, setOffset] = useState<number>(0);
	const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
	const [selectedAccount, setSelectedAccount] = useState<{
		id: string;
		name: string;
		[key: string]: unknown;
	} | null>(null);
	const [showEditAccountView, setShowEditAccountView] = useState<boolean>(false);

	const { data, isFetching } = useAdminAccountList(offset, limit);
	const accounts = data?.accounts ?? [];
	const totalAccount = data?.total ?? 0;

	const openDetailView = (acc: AdminAccountEntry): void => {
		setSelectedAccount({ ...acc, id: acc.id ?? '', name: acc.name ?? '' });
		setShowEditAccountView(true);
	};

	const accountList = buildAdministratorRows(accounts, openDetailView);

	const headers = [
		{
			id: 'account',
			label: t('label.account', 'Account'),
			width: '25%',
			bold: true,
		},
		{
			id: 'type',
			label: t('label.type', 'Type'),
			width: '15%',
			bold: true,
		},
		{
			id: 'domain',
			label: t('label.domain', 'domain'),
			width: '20%',
			bold: true,
		},
		{
			id: 'description',
			label: t('label.description', 'Description'),
			width: '40%',
			bold: true,
		},
	];

	const invalidateAdminAccountList = (): void => {
		void queryClient.invalidateQueries({
			queryKey: adminAccountListQueryKeys.all,
		});
	};

	return (
		<div className={styles.root}>
			<div className={styles.header}>
				<ds-text as="h1" size="medium" weight="bold" color="gray0">
					{t('label.administrators', 'Administrators')}
				</ds-text>
			</div>
			<div className={styles.dividerRow}>
				<ds-divider></ds-divider>
			</div>
		<div className={styles.contentWrapper}>
			<div className={styles.tableCard}>
				<div className={styles.subtitleRow}>
					<ds-text as="h2" size="small" weight="bold" color="gray0">
						{t('domain.administration_rights', 'Administration Rights')}
					</ds-text>
				</div>
				<div className={styles.tableArea}>
					<Table
						rows={isFetching ? [] : accountList}
						headers={headers}
						showCheckbox={false}
						multiSelect={false}
						style={{
							overflow: 'auto',
							height: isFetching || accountList.length === 0 ? '50%' : '100%',
						}}
						RowFactory={HoverableRowFactory}
						HeaderFactory={CustomHeaderFactory}
					/>
					{isFetching && (
						<div className={styles.spinner}>
							<ds-spinner></ds-spinner>
						</div>
					)}
					{accountList.length === 0 && !isFetching && <AdministratorsEmptyState />}
					{accountList.length !== 0 && (
						<div className={styles.footer}>
							<div className={styles.paging}>
								<Paging totalItem={totalAccount} setOffset={setOffset} pageSize={limit} />
							</div>
							<div className={styles.perPage}>
								<TrackNumberPerPage setPageSize={setLimit} />
							</div>
						</div>
					)}
					{showEditAccountView && selectedAccount && (
						<ModalOverlay open={showEditAccountView} maxWidth="58.75rem">
							<EditAccount
								account={selectedAccount}
								onClose={(): void => {
									setShowEditAccountView(false);
								}}
								onSaved={invalidateAdminAccountList}
								onDeleted={invalidateAdminAccountList}
								defaultTab="general"
							/>
						</ModalOverlay>
					)}
				</div>
			</div>
		</div>
		</div>
	);
};
