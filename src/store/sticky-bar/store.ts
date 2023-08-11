/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import create from 'zustand';
import { devtools } from 'zustand/middleware';

type StickyBar = {
	isSticky: boolean;
	setIsSticky: (isSticky: boolean) => void;
};

export const useStickyBarStore = create<StickyBar>(
	devtools((set) => ({
		isSticky: false,
		setIsSticky: (isSticky): void => set({ isSticky }, false, 'setIsSticky')
	}))
);
