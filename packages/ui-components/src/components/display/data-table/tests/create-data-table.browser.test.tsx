/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../../web-components';

import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { createDataTableColumnHelper, useDataTable } from '../create-data-table';
import { dataTableContexts } from '../data-table-contexts';

type Person = { id: string; name: string };

const helper = createDataTableColumnHelper<Person>();

const columns = helper.columns([helper.accessor('name', { header: 'Name' })]);

function HookProbe() {
	const table = useDataTable({
		data: [{ id: '1', name: 'Ada' }],
		columns,
	});
	return (
		<div data-table-id={table.options.data.length}>{table.getRowModel().rows[0]?.id}</div>
	);
}

describe('create-data-table', () => {
	it('builds a working table instance with the bundled features', async () => {
		render(<HookProbe />);
		await expect.element(page.getByText('0')).toBeVisible();
	});

	it('exposes isolated contexts', () => {
		expect(dataTableContexts.tableContext).toBeDefined();
		expect(dataTableContexts.cellContext).toBeDefined();
		expect(dataTableContexts.headerContext).toBeDefined();
		expect(dataTableContexts.useTableContext).toBeTypeOf('function');
	});
});
