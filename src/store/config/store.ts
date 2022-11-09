/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import create from 'zustand';
import { devtools } from 'zustand/middleware';

type ConfigState = {
	config: Array<any>;
	setConfig: (config: any) => void;
	addConfig: (config: any) => void;
	removeConfig: () => void;
	updateConfig: (key: any, value: any) => void;
};

export const useConfigStore = create<ConfigState>(
	devtools((set) => ({
		config: [],
		setConfig: (config): void => set({ config }, false, 'setConfig'),
		addConfig: (config: any): void => {
			set((state: any) => {
				state.config = [...state.config, ...config];
			});
		},
		removeConfig: (): void => {
			set((state: any) => {
				state.config = [];
			});
		},
		updateConfig: (key, value): void => {
			set((state: any) => {
				const ele = state.config.find((item: any) => item?.n === key);
				state.config = ele
					? state.config.map((item: any) => {
							if (item?.n === key) {
								// eslint-disable-next-line no-param-reassign
								item._content = value;
							}
							return item;
					  })
					: [...state.config, ...[{ n: key, _content: value }]];
			});
		}
	}))
);
