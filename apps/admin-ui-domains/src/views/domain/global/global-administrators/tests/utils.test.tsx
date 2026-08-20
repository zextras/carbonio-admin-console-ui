/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { type AdminAccountEntry,buildAdministratorRows, getAccountUserType } from '../utils';

const ACCOUNTS: Array<AdminAccountEntry> = [
	{
		id: 'acc-1',
		name: 'admin@example.com',
		description: 'global admin',
		zimbraIsAdminAccount: 'TRUE',
	},
	{
		id: 'acc-2',
		name: 'delegated@corp.com',
		zimbraIsDelegatedAdminAccount: 'TRUE',
	},
	{ id: 'acc-3', name: 'no-email-account' },
];

describe('getAccountUserType', () => {
	it('should classify global, delegated, external, system and normal accounts', () => {
		expect(getAccountUserType({ zimbraIsAdminAccount: 'TRUE' })).toBe('Admin');
		expect(getAccountUserType({ zimbraIsDelegatedAdminAccount: 'TRUE' })).toBe('DelegatedAdmin');
		expect(getAccountUserType({ zimbraIsExternalVirtualAccount: 'TRUE' })).toBe('External');
		expect(getAccountUserType({ zimbraIsSystemAccount: 'TRUE' })).toBe('System');
		expect(getAccountUserType({})).toBe('Normal');
	});

	it('should prefer Admin over DelegatedAdmin when both are set', () => {
		expect(
			getAccountUserType({ zimbraIsAdminAccount: 'TRUE', zimbraIsDelegatedAdminAccount: 'TRUE' }),
		).toBe('Admin');
	});
});

describe('buildAdministratorRows', () => {
	it('should build one row per account with four cells and metadata', () => {
		const rows = buildAdministratorRows(ACCOUNTS, vi.fn());

		expect(rows).toHaveLength(3);
		expect(rows[0]).toMatchObject({ id: 'acc-1', clickable: true, item: ACCOUNTS[0] });
		expect(rows[0].columns).toHaveLength(4);
	});

	it('should render name, type, domain and description cells', () => {
		const [row] = buildAdministratorRows(ACCOUNTS, vi.fn());

		const nameCell = row.columns[0] as React.ReactElement<{ children: string }>;
		const typeCell = row.columns[1] as React.ReactElement<{ children: string }>;
		const domainCell = row.columns[2] as React.ReactElement<{ children: string }>;
		const descriptionCell = row.columns[3] as React.ReactElement<{ children: string }>;

		expect(nameCell.props.children).toBe('admin@example.com');
		expect(typeCell.props.children).toBe('Admin');
		expect(domainCell.props.children).toBe('example.com');
		expect(descriptionCell.props.children).toBe('global admin');
	});

	it('should fall back to blank cells for missing values', () => {
		const [row] = buildAdministratorRows([ACCOUNTS[2]], vi.fn());

		const typeCell = row.columns[1] as React.ReactElement<{ children: string }>;
		const domainCell = row.columns[2] as React.ReactElement<{ children: string }>;
		expect(typeCell.props.children).toBe('Normal');
		expect(domainCell.props.children).toBe(' ');
	});

	it('should wire every cell click to the detail-view opener', () => {
		const onOpenDetail = vi.fn();

		const [row] = buildAdministratorRows([ACCOUNTS[0]], onOpenDetail);

		for (const cell of row.columns) {
			const props = (cell as React.ReactElement<{ onClick: (e: unknown) => void }>).props;
			props.onClick?.({ stopPropagation: vi.fn() });
		}

		expect(onOpenDetail).toHaveBeenCalledTimes(4);
		expect(onOpenDetail).toHaveBeenCalledWith(ACCOUNTS[0]);
	});

	it('should return an empty array for an empty list', () => {
		expect(buildAdministratorRows([], vi.fn())).toEqual([]);
	});
});
