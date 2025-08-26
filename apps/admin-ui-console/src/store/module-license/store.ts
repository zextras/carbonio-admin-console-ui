/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type ModuleLicenseState = {
	moduleLicense: Array<Record<string, string | number | boolean>>;
	setModuleLicense: (v: Array<Record<string, string | number | boolean>>) => void;
};

export const useModuleLicenseStore = create<ModuleLicenseState>()(
	devtools((set) => ({
		moduleLicense: [],
		setModuleLicense: (moduleLicense): void => set({ moduleLicense }, false, 'setModuleLicense')
	}))
);
