/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import create from 'zustand';
import produce from 'immer';
import { devtools } from 'zustand/middleware';
import { Cos } from '../../../types';

type CosState = {
	cos: Cos;
	setCos: (cos: Cos) => void;
	removeCos: () => void;
};

export const useCosStore = create<CosState>(
	devtools((set) => ({
		cos: {},
		setCos: (cos): void => set({ cos }, false, 'setCos'),
		removeCos: (): void =>
			set(
				produce((state) => {
					state.cos = {};
				})
			)
	}))
);
