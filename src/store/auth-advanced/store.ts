/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import create from 'zustand';
import { devtools } from 'zustand/middleware';

type AuthAdvancedState = {
	isAdvanced: boolean;
	setIsAdvanced: (isAdvanced: boolean) => void;
};

export const useAuthIsAdvanced = create<AuthAdvancedState>(
	devtools((set) => ({
		isAdvanced: false,
		setIsAdvanced: (isAdvanced): void => set({ isAdvanced }, false, 'setIsAdvanced')
	}))
);
