/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import { Button } from '../../../basic/button/Button';
import { Dropdown } from '../../../display/Dropdown';
import type { DropdownItem } from '../../../display/Dropdown';
import { useDataTableContext } from '../data-table-contexts';

const DataTableColumnVisibility = () => {
	const table = useDataTableContext();
	const { t } = useTranslation();

	return (
		<table.Subscribe selector={(state) => state.columnVisibility}>
			{() => {
				const items: Array<DropdownItem> = table
					.getAllLeafColumns()
					.filter((column) => column.getCanHide())
					.map((column) => ({
						id: column.id,
						label:
							typeof column.columnDef.header === 'string'
								? column.columnDef.header
								: column.id,
						selected: column.getIsVisible(),
						keepOpen: true,
						onClick: () => {
							column.toggleVisibility();
						},
					}));

				return (
					<Dropdown items={items}>
						<Button
							type="ghost"
							size="medium"
							icon="Options"
							aria-label={t('label.columns', 'Columns')}
							onClick={(): null => null}
						/>
					</Dropdown>
				);
			}}
		</table.Subscribe>
	);
};

export { DataTableColumnVisibility };
