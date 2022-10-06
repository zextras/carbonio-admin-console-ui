/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import create from 'zustand';
import { devtools } from 'zustand/middleware';

type AuthAdvancedState = {
	isAdvanced: boolean;
	setIsAdvavanced: (isAdvanced: boolean) => void;
};

export const useAuthIsAdvanced = create<AuthAdvancedState>(
	devtools((set) => ({
		isAdvanced: false,
		setIsAdvavanced: (isAdvanced): void => set({ isAdvanced }, false, 'setIsAdvavanced')
	}))
);
