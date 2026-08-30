/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { SortDirection } from '@tanstack/react-table';

type SortIndicatorProps = {
	direction: false | SortDirection;
};

const SORT_ICONS = {
	asc: 'ChevronSortUpOutline',
	desc: 'ChevronSortDownOutline',
	none: 'ChevronSortEmptyOutline',
} as const;

const SortIndicator = ({ direction }: SortIndicatorProps) => (
	<ds-icon
		icon={direction ? SORT_ICONS[direction] : SORT_ICONS.none}
		size="small"
		aria-hidden="true"
	/>
);

export { SortIndicator };
