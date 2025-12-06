/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { produce } from 'immer';
import { forEach } from 'lodash';
import { create } from 'zustand';

import { ActionFactory, AnyFunction, IntegrationsState } from '../../../types';

export const useIntegrationsStore = create<IntegrationsState>((set) => ({
	actions: {},
	functions: {},
	registerActions: <T>(
		...items: Array<{ id: string; action: ActionFactory<T>; type: string }>
	): void =>
		set(
			produce((state) => {
				forEach(items, ({ id, action, type }) => {
					if (!state.actions[type]) state.actions[type] = {};

					state.actions[type][id] = action;
				});
			})
		),
	registerFunctions: (...items: Array<{ id: string; fn: AnyFunction }>): void =>
		set(
			produce((state) => {
				forEach(items, ({ id, fn }) => {
					state.functions[id] = fn;
				});
			})
		)
}));
