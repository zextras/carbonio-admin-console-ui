/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent } from 'react';

import { useTableFilter } from '../use-table-filter';

const ROWS = [
	{ id: 'allies@example.com' },
	{ id: 'Bishops@example.com' },
	{ id: 'chaplains@example.com' },
	{ id: undefined }
];

function changeEvent(value: string): ChangeEvent<HTMLInputElement> {
	return { target: { value } } as ChangeEvent<HTMLInputElement>;
}

describe('useTableFilter', () => {
	it('starts with an empty filter value and no filtered rows', () => {
		const { result } = renderHook(() => useTableFilter(ROWS));

		expect(result.current.filterValue).toBe('');
		expect(result.current.filteredRows).toEqual([]);
	});

	it('keeps only the rows whose id matches the filter, case-insensitively', () => {
		const { result } = renderHook(() => useTableFilter(ROWS));

		act(() => {
			result.current.handleFilterChange(changeEvent('BISHOPS'));
		});

		expect(result.current.filterValue).toBe('BISHOPS');
		expect(result.current.filteredRows).toEqual([{ id: 'Bishops@example.com' }]);
	});

	it('excludes rows without an id from the filtered results', () => {
		const { result } = renderHook(() => useTableFilter(ROWS));

		act(() => {
			result.current.handleFilterChange(changeEvent('example'));
		});

		expect(result.current.filteredRows).toHaveLength(3);
	});

	it('restores all the source rows when the filter is cleared', () => {
		const { result } = renderHook(() => useTableFilter(ROWS));

		act(() => {
			result.current.handleFilterChange(changeEvent('example'));
		});
		act(() => {
			result.current.handleFilterChange(changeEvent(''));
		});

		expect(result.current.filterValue).toBe('');
		expect(result.current.filteredRows).toEqual(ROWS);
	});
});
