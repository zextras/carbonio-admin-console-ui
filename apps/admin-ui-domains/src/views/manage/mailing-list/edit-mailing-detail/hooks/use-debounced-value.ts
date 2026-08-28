/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from 'react';

/**
 * Returns a copy of `value` that only updates after `delay` milliseconds of
 * quiet (trailing-edge debounce). Use it to debounce search inputs into
 * queries without debouncing callbacks.
 */
export function useDebouncedValue<T>(value: T, delay = 700): T {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);
		return () => {
			clearTimeout(timer);
		};
	}, [value, delay]);

	return debouncedValue;
}
