/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type MailstoreListState = {
	allMailstoreList: Array<any>;
	setAllMailstoreList: (v: Array<any>) => void;
};

export const useMailstoreListStore = create<MailstoreListState>()(
	devtools((set) => ({
		allMailstoreList: [],
		setAllMailstoreList: (allMailstoreList): void =>
			set({ allMailstoreList }, false, 'setAllMailstoreList')
	}))
);
