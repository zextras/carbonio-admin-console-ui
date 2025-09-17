/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { find, get as _get } from 'lodash';
import { create } from 'zustand';

import { ConfigAttributesState } from '../../../types';
import { CONTENT } from '../../constants';

export const useConfigStore = create<ConfigAttributesState>((set, get) => ({
	globalAttributes: [],
	domainInformation: {
		id: '',
		name: '',
		a: []
	},
	getConfigAttribute: (key: string): string =>
		_get(find(get().domainInformation.a, { n: key }), CONTENT) ??
		_get(find(get().globalAttributes, { n: key }), CONTENT)
}));
