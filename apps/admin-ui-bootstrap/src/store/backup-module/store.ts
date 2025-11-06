/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Backup Module store state interface
 */
export interface BackupModuleState {
	/** Whether the backup module is enabled */
	backupModuleEnable: boolean;
	/** List of backup servers */
	backupServerList: Array<any>;
	/** Whether the backup module is licensed */
	isBackupModuleLicensed: boolean;

	// Actions
	/** Set whether the backup module is enabled */
	setBackupModuleEnable: (v: boolean) => void;
	/** Set the list of backup servers */
	setBackupServerList: (backupServerList: Array<any>) => void;
	/** Set whether the backup module is licensed */
	setIsBackupModuleLicensed: (v: boolean) => void;
}

/**
 * Zustand store for managing backup module state across admin UI applications
 * 
 * This store manages:
 * - Backup module enablement status
 * - Backup server lists
 * - Backup module licensing information
 * 
 * @example
 * ```tsx
 * import { useBackupModuleStore } from '@zextras/admin-ui-bootstrap';
 * 
 * function MyComponent() {
 *   const backupModuleEnable = useBackupModuleStore((state) => state.backupModuleEnable);
 *   const setBackupModuleEnable = useBackupModuleStore((state) => state.setBackupModuleEnable);
 *   
 *   return <div>Backup Module: {backupModuleEnable ? 'Enabled' : 'Disabled'}</div>;
 * }
 * ```
 */
export const useBackupModuleStore = create<BackupModuleState>()(
	devtools(
		(set) => ({
			backupModuleEnable: false,
			backupServerList: [],
			isBackupModuleLicensed: false,

			setBackupModuleEnable: (backupModuleEnable): void =>
				set({ backupModuleEnable }, false, 'setBackupModuleEnable'),
			
			setBackupServerList: (backupServerList): void =>
				set({ backupServerList }, false, 'setBackupServerList'),
			
			setIsBackupModuleLicensed: (isBackupModuleLicensed): void =>
				set({ isBackupModuleLicensed }, false, 'setIsBackupModuleLicensed')
		}),
		{ name: 'BackupModuleStore' }
	)
);
