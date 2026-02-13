/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { type StickyBarState } from './types';

export const useStickyBarStore = create<StickyBarState>()(
	devtools(
		(set) => ({
			isSticky: false,
			setIsSticky: (isSticky): void => set({ isSticky }, false, 'setIsSticky')
		}),
		{ name: 'StickyBarStore' }
	)
);
