/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Button,
	CustomHeaderFactory,
	Dropdown,
	HoverableRowFactory,
	Input,
	Padding,
	Select,
	Table,
	useSnackbar,
} from '@zextras/ui-components';
import { searchDirectory, useDebouncedValue } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DISPLAYNAME, FETCH_DATA_LIMIT } from '../../../../constants';
import { useAddDistributionListMember } from '../../../../services/use-add-distribution-list-member';
import { useInitializedDomains } from '../../../../services/use-initialized-domains';
import { useRemoveDistributionListMember } from '../../../../services/use-remove-distribution-list-member';
import styles from './admin-rights-section.module.css';

export type AdminGroup = {
	id: string;
	name: string;
	a?: Array<{ n: string; _content: string }>;
	via?: string;
};

/** Admin-group memberships: direct only (no `via`) with the admin flag set. */
export function filterAdminGroups(dl: Array<AdminGroup> = []): Array<AdminGroup> {
	return dl.filter(
		(list) =>
			list.a &&
			list?.via === undefined &&
			list?.a?.some((item) => item.n === 'zimbraIsAdminGroup' && item._content === 'TRUE'),
	);
}

/** Table rows for the granted admin rights: name shown without `__`, split at `@`. */
export function buildAdminGroupRows(
	adminGroups: Array<AdminGroup>,
): Array<{ id: string; columns: Array<React.ReactElement>; clickable: boolean }> {
	return adminGroups.map((group) => ({
		id: group.id,
		columns: [
			<ds-text key={`${group.id}-name`} weight="light" as="span">
				{group.name.replace(new RegExp('__', 'g'), '').split('@')[0]}
			</ds-text>,
			<ds-text color="text" key={`${group.id}-domain`} weight="light" as="span">
				{group.name.replace(new RegExp('__', 'g'), '').split('@')[1]}
			</ds-text>,
		],
		clickable: true,
	}));
}

type AdminRightsSectionProps = {
	accountId: string;
	accountName: string;
	adminGroups: Array<AdminGroup>;
	onLoadingChange: (isLoading: boolean) => void;
};

/**
 * Delegated-administration rights: domain search, admin-group selection,
 * grant/revoke actions and the granted-rights table. Membership refreshes
 * through `accountMembership` invalidation after each mutation.
 */
export const AdminRightsSection = ({
	accountId,
	accountName,
	adminGroups,
	onLoadingChange,
}: AdminRightsSectionProps) => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const [isDomainSelect, setIsDomainSelect] = useState(false);
	const [searchDomainName, setSearchDomainName] = useState('');
	const [domainId, setDomainId] = useState('');
	const [selectedOption, setSelectedOption] = useState<any>([]);
	const [sendSelectedRows, setSendSelectedRows] = useState<Array<string>>([]);
	const [distributionList, setDistributionList] = useState<any>([]);

	const addMutation = useAddDistributionListMember(accountId);
	const removeMutation = useRemoveDistributionListMember(accountId);

	const debouncedDomain = useDebouncedValue(searchDomainName, 700);
	const { data: domainsData } = useInitializedDomains(debouncedDomain ?? '', !isDomainSelect);
	const domainList =
		domainsData && domainsData.searchTotal > 0 ? domainsData.domain : [];

	const options =
		distributionList?.length > 0
			? distributionList?.map((group: any) => ({
					label:
						group?.a?.find((item: Record<string, string>) => item?.n === DISPLAYNAME)?._content ||
						group.name,
					value: group.id,
				}))
			: [];

	const headers = [
		{
			id: 'rights',
			label: t('label.rights_access_control_lists', 'Rights (Access Control Lists)'),
			width: '48%',
			bold: true,
		},
		{
			id: 'domain',
			label: t('label.domain', 'Domain'),
			width: '48%',
			bold: true,
		},
	];

	const successSnackbar = (label: string): void => {
		createSnackbar({
			key: 'success',
			severity: 'success',
			label,
			autoHideTimeout: 3000,
			hideButton: true,
			replace: true,
		});
	};

	const errorSnackbar = (): void => {
		createSnackbar({
			key: 'error',
			severity: 'error',
			label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
			autoHideTimeout: 3000,
			hideButton: true,
			replace: true,
		});
	};

	const fetchDistributionList = (name: string): void => {
		const attrs =
			'displayName,zimbraId,zimbraMailHost,uid,description,zimbraIsAdminGroup,zimbraMailStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount';
		const types = 'distributionlists,dynamicgroups';
		const query = `zimbraIsAdminGroup=TRUE`;
		searchDirectory({ attr: attrs, type: types, domainName: name || '', query, offset: 0, limit: FETCH_DATA_LIMIT, sortBy: 'name' })
			.then((res) => {
				setDistributionList(res?.dl);
			})
			.catch(() => {
				setDistributionList([]);
			});
	};

	const items = domainList?.map((domain: any) => ({
		id: domain.id,
		label: domain.name,
		customComponent: (
			<div
				key={domain.id}
				role="button"
				tabIndex={0}
				className={styles.domainItem}
				onClick={(): void => {
					setDomainId(domain?.id);
					setSearchDomainName(domain?.name);
					setIsDomainSelect(true);
					fetchDistributionList(domain?.name);
				}}
				onKeyDown={(e): void => {
					if (e.key === 'Enter' || e.key === ' ') {
						setDomainId(domain?.id);
						setSearchDomainName(domain?.name);
						setIsDomainSelect(true);
						fetchDistributionList(domain?.name);
					}
				}}
			>
				{domain?.name}
			</div>
		),
	}));

	const onAdd = (): void => {
		onLoadingChange(true);
		addMutation.mutateAsync(
			{
				listId: selectedOption.value,
				member: accountName,
			},
			{
				onSuccess: (): void => {
					successSnackbar(
						t(
							'label.the_last_changes_has_been_saved_successfully',
							'Changes have been saved successfully',
						),
					);
					onLoadingChange(false);
				},
				onError: (): void => {
					errorSnackbar();
					onLoadingChange(false);
				},
			},
		);
	};

	const onDeleteFromList = (lists: any, type: string): void => {
		if (lists?.length > 0) {
			onLoadingChange(true);
			const entries = lists.map((item: any) =>
				type === 'all'
					? { listId: item.id, member: accountName }
					: { listId: item, member: accountName },
			);
			Promise.all(entries.map((entry: any) => removeMutation.mutateAsync(entry)))
				.then(() => {
					successSnackbar(
						t(
							'account_details.right_for_selected_user_deleted_successfully',
							'Right for selected user deleted successfully',
						),
					);
					onLoadingChange(false);
				})
				.catch(() => {
					errorSnackbar();
					onLoadingChange(false);
				});
		}
		setSendSelectedRows([]);
	};

	return (
		<>
			<div className={styles.addRow}>
				<div className={styles.addCol}>
					<Dropdown
						items={items}
						placement="bottom-start"
						disableAutoFocus
						width="100%"
						style={{ width: '100%' }}
					>
						<Input
							label={t('label.domain', 'Domain')}
							onChange={(ev: any): void => {
								setIsDomainSelect(false);
								setDomainId('');
								setSearchDomainName(ev.target.value);
							}}
							value={searchDomainName}
							backgroundColor="gray5"
						/>
					</Dropdown>
				</div>
				<div className={styles.addCol}>
					<Select
						disabled={options?.length < 1}
						items={options}
						background="gray5"
						label={t('label.rights_access_control_lists', 'Rights (Access Control Lists)')}
						showCheckbox={false}
						selection={selectedOption}
						onChange={(v: any): any => {
							const it = options.find((item: any) => item.value === v);
							setSelectedOption(it);
						}}
					/>
				</div>
				<Padding top="large" right="small">
					<Button
						label={t('label.add', 'Add')}
						onClick={onAdd}
						disabled={domainId === '' || selectedOption?.length === 0}
						type="outlined"
						color="primary"
						size="extralarge"
					/>
				</Padding>
			</div>
			{adminGroups.length > 0 && (
				<>
					<div className={styles.dividerRow}>
						<ds-divider></ds-divider>
					</div>
					<div className={styles.headerRow}>
						<ds-text size="small" color="gray0" weight="bold" as="h2">
							{t(
								'label.This account has Administration rights for',
								'This account has Administration rights for',
							)}
						</ds-text>
					</div>
					<div className={styles.tableRow}>
						<Table
							rows={buildAdminGroupRows(adminGroups)}
							headers={headers}
							showCheckbox={false}
							onSelectionChange={setSendSelectedRows}
							multiSelect={false}
							RowFactory={HoverableRowFactory}
							HeaderFactory={CustomHeaderFactory}
						/>
					</div>
					<div className={styles.removeRow}>
						<div className={styles.removeCol}>
							<Button
								disabled={sendSelectedRows?.length < 1}
								type="ghost"
								onClick={(): void => onDeleteFromList(sendSelectedRows, 'one')}
								label={t('label.remove', 'REMOVE')}
								color="error"
								width="fill"
							/>
						</div>
						<div className={styles.removeCol}>
							<Button
								type="outlined"
								label={t('label.remove_all', 'REMOVE ALL')}
								onClick={(): void => onDeleteFromList(adminGroups, 'all')}
								color="error"
								width="fill"
							/>
						</div>
					</div>
				</>
			)}
		</>
	);
};
