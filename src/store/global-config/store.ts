/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import create from 'zustand';
import produce from 'immer';
import { devtools } from 'zustand/middleware';

import { CLOBAL_CONFIG_DETAIL_VIEW } from '../../constants';

type GlobalConfigState = {
	globalConfig: any;
	globalConfigList: Array<any>;
	globalConfigView: string;
	setGlobalConfig: (config: any) => void;
	setGlobalConfigList: (configList: Array<any>) => void;
	removeGlobalConfig: () => void;
	setGlobalConfigView: (configView: string) => void;
};

export const useGlobalConfigStore = create<GlobalConfigState>(
	devtools((set) => ({
		globalConfig: {},
		globalConfigList: [],
		globalConfigView: CLOBAL_CONFIG_DETAIL_VIEW,
		setGlobalConfig: (globalConfig): void => set({ globalConfig }, false, 'setGlobalConfig'),
		setGlobalConfigList: (globalConfigList): void =>
			set({ globalConfigList }, false, 'setGlobalConfigList'),
		removeGlobalConfig: (): void =>
			set(
				produce((state) => {
					state.globalConfig = {};
				})
			),
		setGlobalConfigView: (globalConfigView): void =>
			set(
				produce((state) => {
					state.globalConfigView = globalConfigView;
				}),
				false,
				'setGlobalConfigView'
			)
	}))
);
