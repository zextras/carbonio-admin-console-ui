/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import create from 'zustand';
import { devtools } from 'zustand/middleware';

type RightsState = {
	rights: Array<Record<string, unknown>>;
	setRights: (rights: Array<Record<string, unknown>>) => void;
};

export const useRightsStore = create<RightsState>(
	devtools((set) => ({
		rights: [],
		setRights: (rights): void => set({ rights }, false, 'setRights')
	}))
);
