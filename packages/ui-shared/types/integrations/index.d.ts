/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MouseEvent } from 'react';

export type IntegrationsState = {
	actions: ActionMap;
	functions: FunctionMap;
	registerActions: (
		...items: Array<{ id: string; action: ActionFactory<unknown>; type: string }>
	) => void;
	registerFunctions: (...items: Array<{ id: string; fn: AnyFunction }>) => void;
};

export type Action = {
	id: string;
	label: string;
	icon: string;
	click: (ev: MouseEvent) => void;
	type: string;
	primary?: boolean;
	group?: string;
	disabled?: boolean;
	[key: string]: unknown;
};

export type ActionFactory<T> = (target: T) => Action;

export type ActionMap = Record<string, Record<string, ActionFactory<unknown>>>;

export type AnyFunction = (...args: unknown[]) => unknown;
