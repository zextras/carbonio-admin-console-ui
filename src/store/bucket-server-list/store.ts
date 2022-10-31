/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import create from 'zustand';
import { devtools } from 'zustand/middleware';

type BucketVolumeServersListState = {
	allServersList: Array<any>;
	setAllServersList: (v: Array<any>) => void;
	volumeList: Array<any>;
	setVolumeList: (v: Array<any>) => void;
};

export const useBucketServersListStore = create<BucketVolumeServersListState>(
	devtools((set) => ({
		allServersList: [],
		volumeList: [],
		setAllServersList: (allServersList): void =>
			set({ allServersList }, false, 'setAllServersList'),
		setVolumeList: (volumeList): void => set({ volumeList }, false, 'setVolumeList')
	}))
);
