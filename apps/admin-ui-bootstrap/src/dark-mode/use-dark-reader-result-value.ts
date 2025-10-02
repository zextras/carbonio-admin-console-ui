/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react';

import type { DarkReaderPropValues } from '../../types';
import { DARK_READER_VALUES } from '../constants';
import { useLoginConfigStore } from '../store/login/store';

export function isDarkReaderPropValues(
	maybeDarkReaderPropValue: unknown
): maybeDarkReaderPropValue is DarkReaderPropValues {
	return (
		typeof maybeDarkReaderPropValue === 'string' &&
		DARK_READER_VALUES.includes(maybeDarkReaderPropValue as DarkReaderPropValues)
	);
}

// return the final calculated value between ZappDarkreaderModeZimletProp value and carbonioWebUiDarkMode config
export function useDarkReaderResultValue(): undefined | DarkReaderPropValues {
	const { carbonioWebUiDarkMode } = useLoginConfigStore();

	return useMemo(() => (carbonioWebUiDarkMode && 'enabled') || 'disabled', [carbonioWebUiDarkMode]);
}
