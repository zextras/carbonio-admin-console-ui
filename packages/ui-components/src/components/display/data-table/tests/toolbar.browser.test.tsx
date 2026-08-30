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
import { DataTableHeader } from '../table-header';
import { DataTableColumnVisibility } from '../toolbar/column-visibility';
import { DataTableGlobalFilter } from '../toolbar/global-filter';
import { DataTablePagination } from '../toolbar/pagination';

type Person = { id: string; name: string; age: number };

const data: Array<Person> = Array.from({ length: 12 }, (_, index) => ({
	id: String(index + 1),
	name: index === 0 ? 'Ada Lovelace' : `Person ${index + 1}`,
	age: 30 + index,
}));

const helper = createDataTableColumnHelper<Person>();

const columns = helper.columns([
	helper.accessor('name', { header: 'Name' }),
	helper.accessor('age', { header: 'Age' }),
]);

function ToolbarHarness() {
	const table = useDataTable<Person>({
		data,
		columns,
		enableGlobalFilter: true,
		enableHiding: true,
		initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
	});
	return (
		<table.AppTable>
			<div>
				<DataTableGlobalFilter />
				<DataTableColumnVisibility />
				<DataTablePagination />
			</div>
			<table className="dt-table">
				<DataTableHeader />
				<DataTableBody />
			</table>
		</table.AppTable>
	);
}

describe('data-table toolbar parts', () => {
	it('filters rows globally while typing', async () => {
		render(<ToolbarHarness />);
		await expect.element(page.getByRole('cell', { name: 'Person 2' })).toBeVisible();
		await userEvent.fill(page.getByRole('textbox', { name: 'Search' }), 'Ada');
		await expect.element(page.getByRole('cell', { name: 'Ada Lovelace' })).toBeVisible();
		expect((await page.getByRole('row').all()).length).toBe(2);
	});

	it('paginates with next and last controls', async () => {
		render(<ToolbarHarness />);
		await expect.element(page.getByText('1 of 2')).toBeVisible();
		expect((await page.getByRole('row').all()).length).toBe(11);
		await userEvent.click(page.getByRole('button', { name: 'Last page' }));
		await expect.element(page.getByText('2 of 2')).toBeVisible();
		expect((await page.getByRole('row').all()).length).toBe(3);
		await userEvent.click(page.getByRole('button', { name: 'First page' }));
		await expect.element(page.getByText('1 of 2')).toBeVisible();
		expect((await page.getByRole('row').all()).length).toBe(11);
		await userEvent.click(page.getByRole('button', { name: 'Next page' }));
		await expect.element(page.getByText('2 of 2')).toBeVisible();
	});

	it('toggles column visibility from the dropdown', async () => {
		render(<ToolbarHarness />);
		await expect.element(page.getByRole('columnheader', { name: 'Age' })).toBeVisible();
		await userEvent.click(page.getByRole('button', { name: 'Columns' }));
		await userEvent.click(page.getByTestId('dropdown-popper-list').getByText('Age'));
		expect((await page.getByRole('columnheader').all()).length).toBe(1);
	});
});
