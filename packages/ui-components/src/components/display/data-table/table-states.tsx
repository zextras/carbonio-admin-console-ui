/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './data-table.module.css';

type DataTableStateRowProps = {
	colSpan: number;
	hasRows: boolean;
	isLoading?: boolean;
	emptyState?: ReactNode;
	errorState?: ReactNode;
};

const DataTableStateRow = ({
	colSpan,
	hasRows,
	isLoading,
	emptyState,
	errorState,
}: DataTableStateRowProps) => {
	const { t } = useTranslation();
	if (errorState !== undefined) {
		return (
			<tr data-state="error">
				<td colSpan={colSpan} className={styles.stateCell}>
					{errorState}
				</td>
			</tr>
		);
	}
	if (!hasRows && isLoading) {
		return (
			<tr data-state="loading">
				<td colSpan={colSpan} className={styles.stateCell}>
					<ds-spinner />
				</td>
			</tr>
		);
	}
	if (!hasRows) {
		return (
			<tr data-state="empty">
				<td colSpan={colSpan} className={styles.stateCell}>
					{emptyState ?? t('label.empty_table', 'Empty Table')}
				</td>
			</tr>
		);
	}
	return null;
};

export { DataTableStateRow };
