/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import create from 'zustand';
import { devtools } from 'zustand/middleware';

type BucketVolumeServerNameState = {
	selectedServerName: string;
	setSelectedServerName: (v: string) => void;
	isVolumeAllDetail: Array<any>;
	setIsVolumeAllDetail: (isVolumeAllDetail: Array<any>) => void;
	isAllocationToggle: boolean;
	setIsAllocationToggle: (isAllocationToggle: boolean) => void;
};

export const useBucketVolumeStore = create<BucketVolumeServerNameState>(
	devtools((set) => ({
		selectedServerName: '',
		isVolumeAllDetail: [],
		isAllocationToggle: false,
		setSelectedServerName: (selectedServerName): void =>
			set({ selectedServerName }, false, 'setSelectedServerName'),
		setIsVolumeAllDetail: (isVolumeAllDetail): void =>
			set({ isVolumeAllDetail }, false, 'setIsVolumeAllDetail'),
		setIsAllocationToggle: (isAllocationToggle): void =>
			set({ isAllocationToggle }, false, 'setIsAllocationToggle')
	}))
);
