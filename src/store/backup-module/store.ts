/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import create from 'zustand';
import produce from 'immer';
import { devtools } from 'zustand/middleware';
import { Server } from '../../../types';

type BackupModuleState = {
	backupModuleEnable: boolean;
	setBackupModuleEnable: (v: boolean) => void;
};

export const useBackupModuleStore = create<BackupModuleState>(
	devtools((set) => ({
		backupModuleEnable: false,

		setBackupModuleEnable: (backupModuleEnable): void =>
			set({ backupModuleEnable }, false, 'setBackupModuleEnable')
	}))
);
