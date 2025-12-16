/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* THIS FILE CONTAINS HOOKS, BUT ESLINT IS DUMB */

import { compact, map } from 'lodash-es';
import { useMemo } from 'react';

import { Action } from '../../../types';
import { useIntegrationsStore } from './store';

export const useActions = <T,>(target: T, type: string): Array<Action> => {
	const factories = useIntegrationsStore((s) => s.actions[type]);
	return useMemo(
		() =>
			compact(
				map(factories, (f) => {
					try {
						return f(target);
					} catch (e) {
						console.error(e);
						return undefined;
					}
				})
			) ?? [],
		[factories, target]
	);
};
