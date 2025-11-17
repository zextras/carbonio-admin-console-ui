/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* THIS FILE CONTAINS HOOKS, BUT ESLINT IS DUMB */

import { useIntegrationsStore } from './store';

export const getIntegratedFunction = (id: string): [Function, boolean] => {
	const integration = useIntegrationsStore.getState().functions?.[id];

	return integration ? [integration, true] : [(): void => {}, false];
};
