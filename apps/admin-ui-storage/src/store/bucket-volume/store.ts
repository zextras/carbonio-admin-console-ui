/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { BucketVolume } from '../../../types';

type BucketVolumeState = {
	isVolumeAllDetail: Array<BucketVolume>;
	setIsVolumeAllDetail: (isVolumeAllDetail: Array<BucketVolume>) => void;
	isAllocationToggle: boolean;
	setIsAllocationToggle: (isAllocationToggle: boolean) => void;
};

export const useBucketVolumeStore = create<BucketVolumeState>()(
	devtools((set) => ({
		isVolumeAllDetail: [],
		isAllocationToggle: false,
		setIsVolumeAllDetail: (isVolumeAllDetail): void =>
			set({ isVolumeAllDetail }, false, 'setIsVolumeAllDetail'),
		setIsAllocationToggle: (isAllocationToggle): void =>
			set({ isAllocationToggle }, false, 'setIsAllocationToggle')
	}))
);
