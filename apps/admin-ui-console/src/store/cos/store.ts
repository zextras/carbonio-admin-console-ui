 
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { produce } from 'immer';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { Cos } from '../../../types';

type CosState = {
	cos: Cos;
	totalAccount: number;
	totalDomain: number;
	setCos: (cos: Cos) => void;
	removeCos: () => void;
	setTotalAccount: (totalAccount: number) => void;
	setTotalDomain: (totalDomain: number) => void;
	cosView: string;
	setCosView: (cosView: string) => void;
};

export const useCosStore = create<CosState>()(
	devtools((set) => ({
		cos: {},
		totalAccount: 0,
		totalDomain: 0,
		cosView: '',
		setCos: (cos): void => set({ cos }, false, 'setCos'),
		setTotalAccount: (totalAccount): void => set({ totalAccount }, false, 'setTotalAccount'),
		setTotalDomain: (totalDomain): void => set({ totalDomain }, false, 'setTotalDomain'),
		setCosView: (cosView): void =>
			set(
				produce((state) => {
					state.cosView = cosView;
				}),
				false,
				'setCosView'
			),
		removeCos: (): void =>
			set(
				produce((state) => {
					state.cos = {};
					state.totalAccount = 0;
					state.totalDomain = 0;
				})
			)
	}))
);
