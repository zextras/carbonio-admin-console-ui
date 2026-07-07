/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { GlobalConfig } from '../../../types';

type BackupState = {
	globalConfig: GlobalConfig;
	setGlobalConfig: (backup: GlobalConfig) => void;
};

export const useBackupStore = create<BackupState>()(
	devtools((set) => ({
		globalConfig: {},
		setGlobalConfig: (globalConfig): void => set({ globalConfig }, false, 'setGlobalConfig')
	}))
);
