/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type ModuleLicenseState = {
	moduleLicense: Array<Record<string, string | number | boolean>>;
	licenseInfo: Record<string, any> | null;
	setModuleLicense: (v: Array<Record<string, string | number | boolean>>) => void;
	setLicenseInfo: (v: Record<string, any>) => void;
};

export const useModuleLicenseStore = create<ModuleLicenseState>()(
	devtools((set) => ({
		moduleLicense: [],
		licenseInfo: null,
		setModuleLicense: (moduleLicense) => set({ moduleLicense }, false, 'setModuleLicense'),
		setLicenseInfo: (licenseInfo) => set({ licenseInfo }, false, 'setLicenseInfo'),
	}))
);
