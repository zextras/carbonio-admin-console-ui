/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ChangeEvent, useState } from 'react';

type UseTableFilterReturn = {
  filterValue: string;
  filteredRows: Array<any>;
  handleFilterChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export function useTableFilter(sourceRows: Array<any>): UseTableFilterReturn {
  const [filterValue, setFilterValue] = useState('');
  const [filteredRows, setFilteredRows] = useState<Array<any>>([]);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (value !== '') {
      setFilterValue(value);
      const filtered = sourceRows.filter((item: any) =>
        item?.id?.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredRows(filtered);
    } else {
      setFilterValue('');
      setFilteredRows(sourceRows);
    }
  };

  return { filterValue, filteredRows, handleFilterChange };
}
