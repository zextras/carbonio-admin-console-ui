/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react';

import type { DarkReaderPropValues } from '../../types';
import { useLoginConfigStore } from '../store/login/store';

// return the final calculated value between ZappDarkreaderModeZimletProp value and carbonioWebUiDarkMode config
export function useDarkReaderResultValue(): undefined | DarkReaderPropValues {
	const { carbonioWebUiDarkMode } = useLoginConfigStore();

	return useMemo(() => (carbonioWebUiDarkMode && 'enabled') || 'disabled', [carbonioWebUiDarkMode]);
}
