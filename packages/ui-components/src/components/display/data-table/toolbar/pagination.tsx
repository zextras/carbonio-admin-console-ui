/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import { Button } from '../../../basic/button/Button';
import { Select } from '../../../inputs/Select';
import styles from '../data-table.module.css';
import { useDataTableContext } from '../data-table-contexts';

const PAGE_SIZE_ITEMS = [10, 25, 50, 100].map((value) => ({
	label: String(value),
	value,
}));

const DataTablePagination = () => {
	const table = useDataTableContext();
	const { t } = useTranslation();

	return (
		<table.Subscribe selector={(state) => state.pagination}>
			{(pagination) => {
				const pageCount = Math.max(1, table.getPageCount());
				return (
					<div className={styles.toolbarGroup}>
						<Select
							items={PAGE_SIZE_ITEMS}
							background="gray5"
							defaultSelection={PAGE_SIZE_ITEMS[0]}
							showCheckbox={false}
							itemTextSize="medium"
							style={{ minWidth: '4rem' }}
							aria-label={t('label.items_per_page', 'items per page')}
							onChange={(value) => {
								table.setPageSize(Number(value ?? 10));
							}}
						/>
						<span className={styles.pageSizeLabel}>
							{t('label.items_per_page', 'items per page')}
						</span>
						<Button
							type="ghost"
							size="medium"
							icon="GoFirstOutline"
							aria-label={t('label.first_page', 'First page')}
							disabled={!table.getCanPreviousPage()}
							onClick={() => {
								table.setPageIndex(0);
							}}
						/>
						<Button
							type="ghost"
							size="medium"
							icon="ChevronLeft"
							aria-label={t('label.previous_page', 'Previous page')}
							disabled={!table.getCanPreviousPage()}
							onClick={() => {
								table.previousPage();
							}}
						/>
						<span className={styles.paginationInfo}>
							{pagination.pageIndex + 1} {t('label.of', 'of')} {pageCount}
						</span>
						<Button
							type="ghost"
							size="medium"
							icon="ChevronRight"
							aria-label={t('label.next_page', 'Next page')}
							disabled={!table.getCanNextPage()}
							onClick={() => {
								table.nextPage();
							}}
						/>
						<Button
							type="ghost"
							size="medium"
							icon="GoLastOutline"
							aria-label={t('label.last_page', 'Last page')}
							disabled={!table.getCanNextPage()}
							onClick={() => {
								table.setPageIndex(pageCount - 1);
							}}
						/>
					</div>
				);
			}}
		</table.Subscribe>
	);
};

export { DataTablePagination };
