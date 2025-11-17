/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { useConfigStore } from './store';
import { Attribute } from '../../../types';

export const useAllConfig = (): Array<Attribute> => {
	const config = useConfigStore((s) => s.globalAttributes);
	return useMemo(() => config || [], [config]);
};
