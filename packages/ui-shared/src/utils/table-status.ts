/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Lifecycle of a server-driven table view. Structurally identical to the
 * ui-components `DataTableStatus` union so the result feeds straight into
 * the composable `DataTableTable` status prop (kept local so this package
 * stays independent of `@zextras/ui-components`).
 */
export type TableStatus = 'idle' | 'loading' | 'empty' | 'error';

/**
 * Resolve the table status from a React Query result: a pending query wins,
 * then a failed one, then an empty result set; rows on screen mean idle.
 */
export function resolveTableStatus(
	isPending: boolean,
	isError: boolean,
	rowCount: number,
): TableStatus {
	if (isPending) {
		return 'loading';
	}
	if (isError) {
		return 'error';
	}
	if (rowCount === 0) {
		return 'empty';
	}
	return 'idle';
}

/**
 * Read the string-array value of an enum filter from a filters state.
 * Missing or non-array values (range/date filters, unset ids) resolve to
 * an empty list.
 */
export function enumFilterValues(
	filters: Record<string, unknown>,
	filterId: string,
): Array<string> {
	const value = filters[filterId];
	if (!Array.isArray(value)) {
		return [];
	}
	return value as Array<string>;
}
