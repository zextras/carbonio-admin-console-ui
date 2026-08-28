/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Row } from '@zextras/ui-components';
import { useState } from 'react';

import { useSearchGal } from '../../../../services/use-search-gal';
import { useDebouncedValue } from '../edit-mailing-detail/hooks/use-debounced-value';

type GalSearchItem = {
	id: string;
	name: string;
	customComponent: React.ReactElement;
};

/**
 * Shared GAL email search used by the owners / send-as / send-to tabs:
 * owns the input value and debounces it into the cached `useSearchGal`
 * query. Items are derived directly from the query data; the raw contact
 * list is exposed for grantee-type resolution (see `useGalContactTypes`).
 */
export function useGalEmailSearch() {
	const [searchValue, setSearchValue] = useState('');
	const debouncedSearchValue = useDebouncedValue(searchValue);

	const galQuery = useSearchGal(debouncedSearchValue);

	const contactList = galQuery.data?.cn ?? [];

	const items: Array<GalSearchItem> = contactList.map((item: any) => ({
		id: item?.id,
		name: item?._attrs?.email,
		customComponent: (
			<Row
				key={item?.id}
				style={{
					display: 'block',
					textAlign: 'left',
					height: 'inherit',
					padding: '3px',
					width: 'inherit'
				}}
				onClick={(): void => {
					setSearchValue(item?._attrs?.email);
				}}
			>
				{item?._attrs?.email}
			</Row>
		)
	}));

	return { searchValue, setSearchValue, items, contactList, isDebouncing: debouncedSearchValue !== searchValue };
}
