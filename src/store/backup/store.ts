/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import create from 'zustand';
import { devtools } from 'zustand/middleware';

type BackupState = {
	globalConfig: any;
	setGlobalConfig: (backup: any) => void;
	selectedServer: string;
	setSelectedBackupServer: (server: string) => void;
};

export const useBackupStore = create<BackupState>(
	devtools((set) => ({
		globalConfig: {},
		setGlobalConfig: (globalConfig): void => set({ globalConfig }, false, 'setGlobalConfig'),
		selectedServer: '',
		setSelectedBackupServer: (selectedServer): void => {
			set({ selectedServer }, false, 'setSelectedServer');
		}
	}))
);
