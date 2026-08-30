/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../../web-components';

import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { describe, expect, it } from 'vitest';

import { createDataTableColumnHelper, useDataTable } from '../create-data-table';
import { DataTableBody } from '../table-body';
import { DataTableFooter } from '../table-footer';
import { DataTableHeader } from '../table-header';

type Person = { id: string; name: string; age: number };

const data: Array<Person> = [
	{ id: '1', name: 'Ada Lovelace', age: 36 },
	{ id: '2', name: 'Alan Turing', age: 41 },
	{ id: '3', name: 'Grace Hopper', age: 85 },
];

const helper = createDataTableColumnHelper<Person>();

const columns = helper.columns([
	helper.accessor('name', { header: 'Name' }),
	helper.accessor('age', { header: 'Age' }),
]);

function HeaderHarness() {
	const table = useDataTable<Person>({
		data,
		columns,
		enableSorting: true,
		enableColumnResizing: true,
	});
	return (
		<table.AppTable>
			<table className="dt-table">
				<DataTableHeader />
				<DataTableBody />
				<DataTableFooter />
			</table>
		</table.AppTable>
	);
}

describe('DataTableHeader', () => {
	it('renders column headers with sort buttons', async () => {
		render(<HeaderHarness />);
		await expect.element(page.getByRole('button', { name: /Name/ })).toBeVisible();
		await expect.element(page.getByRole('button', { name: /Age/ })).toBeVisible();
		await expect.element(page.getByRole('columnheader', { name: /Name/ })).toBeVisible();
	});

	it('sorts ascending then descending on header click and sets aria-sort', async () => {
		render(<HeaderHarness />);
		const sortButton = page.getByRole('button', { name: /Name/ });
		await userEvent.click(sortButton);
		await expect
			.element(page.getByRole('columnheader', { name: /Name/ }))
			.toHaveAttribute('aria-sort', 'ascending');
		await expect.element(page.getByRole('cell', { name: 'Ada Lovelace' })).toBeVisible();
		await userEvent.click(sortButton);
		await expect
			.element(page.getByRole('columnheader', { name: /Name/ }))
			.toHaveAttribute('aria-sort', 'descending');
		await expect.element(page.getByRole('cell', { name: 'Grace Hopper' })).toBeVisible();
	});

	it('renders a resize handle for resizable columns', async () => {
		render(<HeaderHarness />);
		await expect.element(page.getByRole('separator', { name: 'Resize name' })).toBeVisible();
	});
});
