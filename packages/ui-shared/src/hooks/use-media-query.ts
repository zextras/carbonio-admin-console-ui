/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback, useSyncExternalStore } from 'react';

function getSnapshot(query: string): boolean {
	return window.matchMedia(query).matches;
}

function getServerSnapshot(): boolean {
	return false;
}

function useMediaQuery(query: string): boolean {
	const subscribe = useCallback(
		(onStoreChange: () => void) => {
			const mediaQuery = window.matchMedia(query);
			mediaQuery.addEventListener('change', onStoreChange);
			return () => mediaQuery.removeEventListener('change', onStoreChange);
		},
		[query],
	);

	return useSyncExternalStore(subscribe, () => getSnapshot(query), getServerSnapshot);
}

export { useMediaQuery };
