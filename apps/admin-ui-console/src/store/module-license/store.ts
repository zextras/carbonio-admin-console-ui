/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type ModuleLicenseState = {
	licenseInfo: Record<string, any> | null;
	setLicenseInfo: (v: Record<string, any>) => void;
	reset: () => void;
};

export const useModuleLicenseStore = create<ModuleLicenseState>()(
	devtools((set) => ({
		licenseInfo: null,
		setLicenseInfo: (licenseInfo) => set({ licenseInfo }, false, 'setLicenseInfo'),
		reset: () => set({ licenseInfo: null })
	}))
);
