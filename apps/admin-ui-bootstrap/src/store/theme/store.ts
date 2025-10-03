/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type ThemeState = {
	isDarkMode: boolean;
	setIsDarkMode: (backup: any) => void;
};

export const useThemeStore = create<ThemeState>()(
	devtools((set) => ({
		isDarkMode: false,
		setIsDarkMode: (isDarkMode): void => set({ isDarkMode }, false, 'setDarkMode')
	}))
);
