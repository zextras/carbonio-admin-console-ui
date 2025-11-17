/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* THIS FILE CONTAINS HOOKS, BUT ESLINT IS DUMB */

import { compact, map } from 'lodash';
import React, { useMemo, FunctionComponent } from 'react';

import { Action } from '../../../types';
import AppContextProvider from '../../boot/app/app-context-provider';

import { useIntegrationsStore } from './store';

export const useIntegratedComponent = (id: string): [FunctionComponent<unknown>, boolean] => {
	const Integration = useIntegrationsStore((s) => s.components?.[id]);
	return useMemo(() => {
		if (Integration) {
			const C: FunctionComponent<unknown> = (props: unknown) => (
				<AppContextProvider pkg={Integration.app}>
					{}
					{/* @ts-ignore */}
					<Integration.item {...props} />
				</AppContextProvider>
			);
			return [C, true];
		}
		return [(): null => null, false];
	}, [Integration]);
};

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
