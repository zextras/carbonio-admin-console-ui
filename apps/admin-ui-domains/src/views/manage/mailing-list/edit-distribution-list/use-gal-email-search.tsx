/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Row } from '@zextras/ui-components';
import { type ReactElement, useEffect, useState } from 'react';

import { useSearchGal } from '../../../../services/use-search-gal';
import { useSearchWithDebounce } from '../edit-mailing-detail/hooks/use-search-with-debounce';

type GalSearchItem = {
	id: string;
	name: string;
	customComponent: ReactElement;
};

/**
 * Shared GAL email search used by the owners / send-as / send-to tabs:
 * owns the input value, debounces it into the cached `useSearchGal` query and
 * exposes ready-to-render dropdown items. `onResults` receives the raw GAL
 * contact list whenever results arrive (used by the owners tab to accumulate
 * contact types for grantee-type resolution).
 */
export function useGalEmailSearch(onResults?: (contacts: Array<any>) => void) {
	const [searchValue, setSearchValue] = useState('');
	const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
	const [searchResult, setSearchResult] = useState<Array<any>>([]);

	useSearchWithDebounce(searchValue, setDebouncedSearchValue);
	const galQuery = useSearchGal(debouncedSearchValue);

	useEffect(() => {
		const data = galQuery.data;
		if (!data) {
			return;
		}
		const contactList = data?.cn;
		if (contactList) {
			setSearchResult(
				contactList.map((item: any): any => ({
					id: item?.id,
					name: item?._attrs?.email
				}))
			);
			onResults?.(contactList);
		} else {
			setSearchResult([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [galQuery.data]);

	const items: Array<GalSearchItem> = searchResult.map((item: any) => ({
		id: item?.id,
		name: item?.name,
		customComponent: (
			<Row
				style={{
					display: 'block',
					textAlign: 'left',
					height: 'inherit',
					padding: '3px',
					width: 'inherit'
				}}
				onClick={(): void => {
					setSearchValue(item?.name);
				}}
			>
				{item?.name}
			</Row>
		)
	}));

	return { searchValue, setSearchValue, items };
}
