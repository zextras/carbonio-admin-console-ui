/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../../web-components';

import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { createDataTableColumnHelper } from '../create-data-table';
import { DataTable } from '../data-table';
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

describe('DataTable', () => {
	it('renders headers and all rows when pagination is disabled', async () => {
		render(<DataTable data={data} columns={columns} />);
		await expect.element(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
		expect((await page.getByRole('row').all()).length).toBe(13);
	});

	it('injects the selection column and reports selected rows via onSelectionChange', async () => {
		const selected: Array<Person> = [];
		render(
			<DataTable
				data={data}
				columns={columns}
				enableRowSelection
				onSelectionChange={(rows) => {
					selected.splice(0, selected.length, ...rows);
				}}
			/>,
		);
		await userEvent.click(page.getByRole('checkbox', { name: 'Select row 1', exact: true }));
		expect(selected).toHaveLength(1);
		expect(selected[0]?.name).toBe('Ada Lovelace');
		await expect.element(page.getByRole('row').nth(1)).toHaveAttribute('data-selected', 'true');
	});

	it('renders the toolbar slot with working pagination', async () => {
		render(
			<DataTable
				data={data}
				columns={columns}
				enablePagination
				toolbar={
					<>
						<DataTableGlobalFilter />
						<DataTablePagination />
					</>
				}
			/>,
		);
		await expect.element(page.getByText('1 of 2')).toBeVisible();
		expect((await page.getByRole('row').all()).length).toBe(11);
		await userEvent.click(page.getByRole('button', { name: 'Next page' }));
		expect((await page.getByRole('row').all()).length).toBe(3);
	});

	it('supports expansion of sub rows via getSubRows', async () => {
		render(
			<DataTable
				data={data.slice(0, 2)}
				columns={columns}
				enableExpanding
				getSubRows={(row) =>
					row.id === '1' ? [{ id: '1-child', name: 'Child row', age: 1 }] : undefined
				}
			/>,
		);
		await expect
			.element(page.getByRole('button', { name: 'Expand row 1' }))
			.toBeVisible();
		expect((await page.getByRole('row').all()).length).toBe(3);
		await userEvent.click(page.getByRole('button', { name: 'Expand row 1' }));
		await expect.element(page.getByRole('cell', { name: 'Child row' })).toBeVisible();
		expect((await page.getByRole('row').all()).length).toBe(4);
	});

	it('honours controlled sorting state', async () => {
		render(
			<DataTable
				data={data.slice(0, 3)}
				columns={columns}
				state={{ sorting: [{ id: 'name', desc: true }] }}
			/>,
		);
		await expect.element(page.getByRole('row').nth(1)).toBeVisible();
		const firstDataRow = await page.getByRole('row').nth(1).element();
		expect(firstDataRow?.textContent).toContain('Person 3');
	});
});
