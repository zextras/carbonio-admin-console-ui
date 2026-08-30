/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../../web-components';

import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { createDataTableColumnHelper, useDataTable } from '../create-data-table';
import { buildSelectionColumn } from '../selection-column';
import { DataTableBody } from '../table-body';

type Person = { id: string; name: string; age: number };

const data: Array<Person> = [
	{ id: '1', name: 'Ada Lovelace', age: 36 },
	{ id: '2', name: 'Alan Turing', age: 41 },
	{ id: '3', name: 'Grace Hopper', age: 85 },
];

const helper = createDataTableColumnHelper<Person>();

const columns = helper.columns([
	buildSelectionColumn<Person>(),
	helper.accessor('name', { header: 'Name' }),
	helper.accessor('age', { header: 'Age' }),
]);

function BodyHarness({
	options,
	onRowClick,
	isLoading,
	emptyState,
}: {
	options?: Record<string, unknown>;
	onRowClick?: (row: Person) => void;
	isLoading?: boolean;
	emptyState?: ReactNode;
}) {
	const table = useDataTable<Person>({
		data,
		columns,
		...options,
	});
	return (
		<table.AppTable>
			<table className="dt-table">
				<DataTableBody onRowClick={onRowClick} isLoading={isLoading} emptyState={emptyState} />
			</table>
		</table.AppTable>
	);
}

describe('DataTableBody', () => {
	it('renders one row per data item with cell values', async () => {
		render(<BodyHarness options={{ enableRowSelection: true }} />);
		await expect.element(page.getByRole('cell', { name: 'Ada Lovelace' })).toBeVisible();
		await expect.element(page.getByRole('cell', { name: 'Grace Hopper' })).toBeVisible();
		expect((await page.getByRole('row').all()).length).toBe(3);
	});

	it('marks selected rows via data attribute when checkbox toggles', async () => {
		render(<BodyHarness options={{ enableRowSelection: true }} />);
		await userEvent.click(page.getByRole('checkbox', { name: 'Select row 2' }));
		const row = page.getByRole('row').nth(1);
		await expect.element(row).toHaveAttribute('data-selected', 'true');
	});

	it('calls onRowClick with the row data', async () => {
		let clicked: Person | undefined;
		render(
			<BodyHarness
				options={{}}
				onRowClick={(row) => {
					clicked = row;
				}}
			/>,
		);
		await userEvent.click(page.getByRole('cell', { name: 'Alan Turing' }));
		expect(clicked?.id).toBe('2');
	});

	it('renders the default empty state when there are no rows', async () => {
		render(<BodyHarness options={{ data: [] }} />);
		await expect.element(page.getByText('Empty Table')).toBeVisible();
	});

	it('renders a spinner row when loading without rows', async () => {
		render(<BodyHarness options={{ data: [] }} isLoading />);
		await expect
			.element(page.getByRole('row').first())
			.toHaveAttribute('data-state', 'loading');
	});
});
