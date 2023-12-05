/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Right {
	type: string;
	all: {
		right?: {
			n: string;
		}[];
		setAttrs?: {
			all: boolean;
		}[];
		getAttrs?: {
			all: boolean;
		}[];
	}[];
}
export type Rights = Right[];
type RightsState = {
	rights: Rights;
	setRights: (rights: Rights) => void;
	userType: string;
	setUserType: (userType: string) => void;
};

export const useRightsStore = create<RightsState>()(
	devtools((set) => ({
		rights: [],
		setRights: (rights): void => set({ rights }, false, 'setRights'),
		userType: '',
		setUserType: (userType): void => set({ userType }, false, 'setUserType')
	}))
);
