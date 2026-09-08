/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { Input } from '../../../inputs/Input';
import styles from '../data-table.module.css';
import { useDataTableContext } from '../data-table-contexts';

type DataTableGlobalFilterProps = {
	label?: string;
	className?: string;
};

const DataTableGlobalFilter = ({ label, className }: DataTableGlobalFilterProps) => {
	const table = useDataTableContext();
	const { t } = useTranslation();

	return (
		<div className={clsx(styles.globalFilter, className)}>
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
