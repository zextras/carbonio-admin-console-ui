/* eslint-disable no-param-reassign */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { produce } from 'immer';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type ConfigState = {
	config: Array<any>;
	userId: string;
	setConfig: (config: any) => void;
	addConfig: (config: any) => void;
	removeConfig: () => void;
	removeConfigItems: (config: any) => void;
	updateConfig: (key: any, value: any) => void;
	setUserId: (userName: string) => void;
};

export const useConfigStore = create<ConfigState>()(
	devtools((set) => ({
		config: [],
		userId: '',
		setUserId: (userId): void => set({ userId }, false, 'setUserId'),
		setConfig: (config): void => set({ config }, false, 'setConfig'),
		addConfig: (config): void =>
			set(
				produce((state) => {
					state.config = [...state.config, ...config];
				})
			),
		removeConfig: (): void =>
			set(
				produce((state: any) => {
					state.config = [];
				})
			),
		removeConfigItems: (config): void =>
			set(
				produce((state: any) => {
					state.config = state.config.filter((item: any) => item?.n !== config?.n);
				})
			),
		updateConfig: (key, value): void =>
			set(
				produce((state: any) => {
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
				})
			)
	}))
);
