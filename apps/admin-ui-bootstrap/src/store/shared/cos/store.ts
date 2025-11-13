/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type CosUIState = {
	cosView: string;
	setCosView: (cosView: string) => void;
};

export const useCosUIStore = create<CosUIState>()(
	devtools((set) => ({
		cosView: '',
		setCosView: (cosView) =>
			set({ cosView }, false, 'setCosView')
	}))
);