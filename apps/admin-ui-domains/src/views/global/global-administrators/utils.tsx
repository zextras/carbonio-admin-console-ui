/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type AdminAccountEntry = {
	id?: string;
	name?: string;
	description?: string;
	zimbraIsAdminAccount?: string;
	zimbraIsDelegatedAdminAccount?: string;
	zimbraIsExternalVirtualAccount?: string;
	zimbraIsSystemAccount?: string;
};

/** Human-readable admin type of a flattened SearchDirectory entry. */
export function getAccountUserType(item: AdminAccountEntry): string {
	if (item.zimbraIsAdminAccount === 'TRUE') return 'Admin';
	if (item.zimbraIsDelegatedAdminAccount === 'TRUE') return 'DelegatedAdmin';
	if (item.zimbraIsExternalVirtualAccount === 'TRUE') return 'External';
	if (item.zimbraIsSystemAccount === 'TRUE') return 'System';
	return 'Normal';
}

/** Table rows for the administrators list; every cell opens the detail view. */
export function buildAdministratorRows(
	accounts: Array<AdminAccountEntry>,
	onOpenDetail: (account: AdminAccountEntry) => void,
): Array<{ id: string; columns: Array<React.ReactElement>; item: AdminAccountEntry; clickable: boolean }> {
	return accounts.map((item) => ({
		id: item?.id ?? '',
		columns: [
			<ds-text
				as="span"
				size="small"
				key={`${item?.id}-name`}
				color="gray0"
				weight="regular"
				onClick={(): void => onOpenDetail(item)}
			>
				{item?.name || ' '}
			</ds-text>,
			<ds-text
				as="span"
				size="small"
				key={`${item?.id}-type`}
				color="gray0"
				weight="light"
				onClick={(): void => onOpenDetail(item)}
			>
				{getAccountUserType(item)}
			</ds-text>,
			<ds-text
				as="span"
				size="small"
				key={`${item?.id}-domain`}
				color="gray0"
				weight="light"
				onClick={(): void => onOpenDetail(item)}
			>
				{item?.name?.split('@')[1] || ' '}
			</ds-text>,
			<ds-text
				as="span"
				size="small"
				weight="light"
				key={`${item?.id}-description`}
				color="gray0"
				onClick={(event: { stopPropagation: () => void }): void => {
					event.stopPropagation();
					onOpenDetail(item);
				}}
			>
				{item?.description || <>&nbsp;</>}
			</ds-text>,
		],
		item,
		clickable: true,
	}));
}
