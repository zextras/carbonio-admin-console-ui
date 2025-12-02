/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Store, configureStore, createSlice } from '@reduxjs/toolkit';

import { CarbonioModule } from '../../types';

const _uselessSlice = createSlice({
	name: '_useless',
	initialState: {},
	reducers: {}
});

export default class StoreFactory {
	private _cache: { [pkgName: string]: Store<any> } = {};

	getStoreForApp(pkg: CarbonioModule): Store<any> {
		if (this._cache[pkg.name]) return this._cache[pkg?.name];
		const store = configureStore({
			devTools: __CARBONIO_DEV__
				? {
						name: pkg.name
					}
				: false,
			middleware: (getDefaultMiddleware) => {
				const baseMiddleware = getDefaultMiddleware();
				return baseMiddleware;
			},
			reducer: {
				_useless: _uselessSlice.reducer
			}
		});
		this._cache[pkg?.name] = store;
		return store;
	}
}
