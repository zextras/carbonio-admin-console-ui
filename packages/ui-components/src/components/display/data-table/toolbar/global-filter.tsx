/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import { Input } from '../../../inputs/Input';
import { useDataTableContext } from '../data-table-contexts';
import styles from '../data-table.module.css';

type DataTableGlobalFilterProps = {
	label?: string;
};

const DataTableGlobalFilter = ({ label }: DataTableGlobalFilterProps) => {
	const table = useDataTableContext();
	const { t } = useTranslation();

	return (
		<div className={styles.globalFilter}>
			<table.Subscribe selector={(state) => state.globalFilter}>
				{(globalFilter) => (
					<Input
						label={label ?? t('label.search', 'Search')}
						value={typeof globalFilter === 'string' ? globalFilter : ''}
						onChange={(event) => {
							table.setGlobalFilter((event.target as HTMLInputElement).value);
						}}
					/>
				)}
			</table.Subscribe>
		</div>
	);
};

export { DataTableGlobalFilter };
