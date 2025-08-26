/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type LastLoginState = {
	lastLoginTimestamp: string;
	setLastLoginTimestamp: (arg: string) => void;
};
export const useLastLoginTimestamp = create<LastLoginState>()(
	devtools((set) => ({
		lastLoginTimestamp: '',
		setLastLoginTimestamp: (lastLoginTimestamp): void => set({ lastLoginTimestamp })
	}))
);
