/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from 'react';

function getMatches(query: string): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia(query).matches;
}

function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState<boolean>(() => getMatches(query));

	useEffect(() => {
		const mediaQuery = window.matchMedia(query);
		setMatches(mediaQuery.matches);

		function handleChange(event: MediaQueryListEvent): void {
			setMatches(event.matches);
		}

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, [query]);

	return matches;
}

export { useMediaQuery };
