/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import create from 'zustand';
import { devtools } from 'zustand/middleware';

type VolumeCreateDataState = {
	volumeDetail: any;
	setVolumeDetail: (v: any) => void;
	isCompression: boolean;
	setIsCompression: (v: boolean) => void;
};

export const useVolumeDataStore = create<VolumeCreateDataState>(
	devtools((set) => ({
		volumeDetail: {},
		isCompression: false,
		setVolumeDetail: (volumeDetail): void => set({ volumeDetail }, false, 'setVolumeDetail'),
		setIsCompression: (isCompression): void => set({ isCompression }, false, 'isCompression')
	}))
);
