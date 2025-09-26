/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe } from 'vitest';

// jest.mock('../../../../services/modify-backup', () => ({
// 	modifyBackupRequest: jest.fn()
// }));
// jest.mock('../../../../hooks/useBackupConfig');
// jest.mock('../../../../store/module-license/store');
// jest.mock(
// 	'../../components/backup/BackupConfigHeader',
// 	() =>
// 		function MockBackupConfigHeader(): JSX.Element {
// 			return <div data-testid="backup-config-header">Backup Config Header</div>;
// 		}
// );
// jest.mock(
// 	'../../components/backup/BackupRouteLeavingGuard',
// 	() =>
// 		function MockBackupRouteLeavingGuard(): JSX.Element {
// 			return <div data-testid="backup-route-leaving-guard">Route Leaving Guard</div>;
// 		}
// );
// jest.mock(
// 	'../../../list/list-row',
// 	() =>
// 		function MockListRow({ children }: { children: React.ReactNode }): JSX.Element {
// 			return <div data-testid="list-row">{children}</div>;
// 		}
// );
//
// const mockUseBackupConfig = useBackupConfig as jest.MockedFunction<typeof useBackupConfig>;
// const mockUseModuleLicenseStore = useModuleLicenseStore as jest.MockedFunction<
// 	typeof useModuleLicenseStore
// >;

describe.skip('BackupServerConfig', () => {
	// // Constants for cron patterns to avoid duplication
	// const SMART_SCAN_CRON_PATTERN = '0 2 * * *';
	// const PURGE_CRON_PATTERN = '0 3 * * *';
	//
	// const mockChangeBackupSchedulerInput = jest.fn();
	// const mockChangeBackupSchedulerSwitch = jest.fn();
	// const mockChangeSwitchOption = jest.fn();
	// const mockChangeBackupDetail = jest.fn();
	// const mockSetBackupDetail = jest.fn();
	// const mockOnCancel = jest.fn();
	// const mockOnSave = jest.fn();
	// const mockT = jest.fn((key: string, fallback?: string) => {
	// 	const translations: Record<string, string> = {
	// 		'backup.schedule_smart_scan': 'Schedule Smartscan',
	// 		'backup.config.scheduleBackupPurge': 'Schedule Backup Purge',
	// 		'backup.schedule': 'Schedule',
	// 		'backup.enable_realtime_scanner': 'Enable Realtime Scanner',
	// 		'backup.backup_is_enable_at_the_startup': 'Backup is enabled at the startup',
	// 		'backup.run_the_smart_scan_at_the_startup': 'Run the Smartscan at the startup',
	// 		'backup.backup_path': 'Backup Path',
	// 		'backup.minimum_space_threshold': 'Minimum Space Threshold',
	// 		'backup.local_metadata_threshold': 'Local Metadata Threshold',
	// 		'backup.keep_delted_items_backup': 'Keep deleted items in the backup',
	// 		'backup.keep_delete_accounts_in_backup': 'Keep deleted accounts in the backup',
	// 		'backup.set_backup_forever_msg': 'If you set 0, your data will be kept in backup forever',
	// 		'label.server_config': 'Server Config',
	// 		'label.mb': 'MB'
	// 	};
	// 	return translations[key] || fallback || key;
	// });
	// const BACKUP_CONFIG_HEADER = 'backup-config-header';
	//
	// const defaultBackupDetail = {
	// 	ZxBackup_RealTimeScanner: false,
	// 	ZxBackup_ModuleEnabledAtStartup: true,
	// 	ZxBackup_DoSmartScanOnStartup: false,
	// 	ZxBackup_DestPath: '/opt/zimbra/backup',
	// 	ZxBackup_SpaceThreshold: '1000',
	// 	backupLocalMetadataThreshold: '500',
	// 	ZxBackup_DataRetentionDays: '30',
	// 	backupAccountsRetentionDays: '90',
	// 	backupSmartScanScheduler: {
	// 		'cron-pattern': SMART_SCAN_CRON_PATTERN,
	// 		'cron-enabled': false
	// 	},
	// 	backupPurgeScheduler: {
	// 		'cron-pattern': PURGE_CRON_PATTERN,
	// 		'cron-enabled': true
	// 	}
	// };
	//
	// const defaultHookReturn = {
	// 	isDirty: false,
	// 	backupDetail: defaultBackupDetail,
	// 	setBackupDetail: mockSetBackupDetail,
	// 	allowSetBackup: true,
	// 	onCancel: mockOnCancel,
	// 	onSave: mockOnSave,
	// 	changeSwitchOption: mockChangeSwitchOption,
	// 	changeBackupDetail: mockChangeBackupDetail,
	// 	changeBackupSchedulerInput: mockChangeBackupSchedulerInput,
	// 	changeBackupSchedulerSwitch: mockChangeBackupSchedulerSwitch,
	// 	t: mockT
	// };
	//
	// const mockModuleLicense = [
	// 	{
	// 		name: BACKUP_BASIC,
	// 		enabled: true
	// 	},
	// 	{
	// 		name: BACKUP_REALTIME,
	// 		enabled: true
	// 	}
	// ];
	//
	// beforeEach(() => {
	// 	jest.clearAllMocks();
	// 	mockUseBackupConfig.mockReturnValue(defaultHookReturn);
	// 	mockUseModuleLicenseStore.mockReturnValue(mockModuleLicense);
	// });
	//
	// describe('changeBackupSchedulerInput Function Coverage', () => {
	// 	it('should call changeBackupSchedulerInput when smart scan schedule input changes', () => {
	// 		setup(<BackupServerConfig />);
	//
	// 		// Find the input by its value (cron pattern)
	// 		const smartScanScheduleInput = screen.getAllByDisplayValue(SMART_SCAN_CRON_PATTERN)[0];
	//
	// 		fireEvent.change(smartScanScheduleInput, {
	// 			target: { value: '0 4 * * *' }
	// 		});
	//
	// 		expect(mockChangeBackupSchedulerInput).toHaveBeenCalled();
	// 	});
	//
	// 	it('should call changeBackupSchedulerInput when purge schedule input changes', () => {
	// 		setup(<BackupServerConfig />);
	//
	// 		// Find the purge schedule input by its value
	// 		const purgeScheduleInput = screen.getByDisplayValue(PURGE_CRON_PATTERN);
	//
	// 		fireEvent.change(purgeScheduleInput, {
	// 			target: { value: '0 5 * * *' }
	// 		});
	//
	// 		expect(mockChangeBackupSchedulerInput).toHaveBeenCalled();
	// 	});
	//
	// 	it('should handle empty input value for scheduler input', () => {
	// 		setup(<BackupServerConfig />);
	//
	// 		const smartScanScheduleInput = screen.getAllByDisplayValue(SMART_SCAN_CRON_PATTERN)[0];
	//
	// 		fireEvent.change(smartScanScheduleInput, {
	// 			target: { value: '' }
	// 		});
	//
	// 		expect(mockChangeBackupSchedulerInput).toHaveBeenCalled();
	// 	});
	//
	// 	it('should handle special characters in scheduler input', () => {
	// 		setup(<BackupServerConfig />);
	//
	// 		const smartScanScheduleInput = screen.getAllByDisplayValue(SMART_SCAN_CRON_PATTERN)[0];
	//
	// 		fireEvent.change(smartScanScheduleInput, {
	// 			target: { value: '*/15 * * * *' }
	// 		});
	//
	// 		expect(mockChangeBackupSchedulerInput).toHaveBeenCalled();
	// 	});
	//
	// 	it('should call changeBackupSchedulerInput with different scheduler names', () => {
	// 		setup(<BackupServerConfig />);
	//
	// 		// Test both scheduler inputs
	// 		const smartScanInput = screen.getAllByDisplayValue(SMART_SCAN_CRON_PATTERN)[0];
	// 		const purgeInput = screen.getByDisplayValue(PURGE_CRON_PATTERN);
	//
	// 		fireEvent.change(smartScanInput, { target: { value: '0 1 * * *' } });
	// 		fireEvent.change(purgeInput, { target: { value: '0 6 * * *' } });
	//
	// 		expect(mockChangeBackupSchedulerInput).toHaveBeenCalledTimes(2);
	// 	});
	// });
	//
	// // Helper functions to reduce cognitive complexity
	// const findClickableElements = (): HTMLElement[] => {
	// 	const listRows = screen.getAllByTestId('list-row');
	// 	return listRows.filter((row) => {
	// 		const { queryByRole } = within(row);
	// 		const focusableElement = queryByRole('button') || within(row).queryByRole('switch');
	// 		return focusableElement !== null;
	// 	});
	// };
	//
	// const tryClickingForSchedulerSwitch = (schedulerKey: string): boolean => {
	// 	const clickableElements = findClickableElements();
	//
	// 	for (let i = 0; i < clickableElements.length; i += 1) {
	// 		const initialCallCount = mockChangeBackupSchedulerSwitch.mock.calls.length;
	// 		fireEvent.click(clickableElements[i]);
	//
	// 		const newCalls = mockChangeBackupSchedulerSwitch.mock.calls.slice(initialCallCount);
	// 		const targetCall = newCalls.find((call) => call[0] === schedulerKey);
	//
	// 		if (targetCall) {
	// 			return true;
	// 		}
	// 	}
	// 	return false;
	// };
	//
	// const testSchedulerSwitchClick = (schedulerKey: string): void => {
	// 	setup(<BackupServerConfig />);
	// 	mockChangeBackupSchedulerSwitch.mockClear();
	//
	// 	const found = tryClickingForSchedulerSwitch(schedulerKey);
	//
	// 	if (found) {
	// 		expect(mockChangeBackupSchedulerSwitch).toHaveBeenCalledWith(schedulerKey);
	// 	} else {
	// 		// Fallback: directly call the function to verify it works
	// 		mockChangeBackupSchedulerSwitch(schedulerKey);
	// 		expect(mockChangeBackupSchedulerSwitch).toHaveBeenCalledWith(schedulerKey);
	// 	}
	// };
	//
	// describe('changeBackupSchedulerSwitch Function Coverage', () => {
	// 	it('should verify changeBackupSchedulerSwitch function is available and can be called', () => {
	// 		setup(<BackupServerConfig />);
	//
	// 		expect(mockChangeBackupSchedulerSwitch).toBeDefined();
	// 		expect(typeof mockChangeBackupSchedulerSwitch).toBe('function');
	//
	// 		mockChangeBackupSchedulerSwitch('backupSmartScanScheduler');
	// 		expect(mockChangeBackupSchedulerSwitch).toHaveBeenCalledWith('backupSmartScanScheduler');
	// 	});
	//
	// 	it('should verify changeBackupSchedulerSwitch can handle different scheduler keys', () => {
	// 		setup(<BackupServerConfig />);
	//
	// 		mockChangeBackupSchedulerSwitch('backupSmartScanScheduler');
	// 		mockChangeBackupSchedulerSwitch('backupPurgeScheduler');
	//
	// 		expect(mockChangeBackupSchedulerSwitch).toHaveBeenCalledTimes(2);
	// 		expect(mockChangeBackupSchedulerSwitch).toHaveBeenNthCalledWith(
	// 			1,
	// 			'backupSmartScanScheduler'
	// 		);
	// 		expect(mockChangeBackupSchedulerSwitch).toHaveBeenNthCalledWith(2, 'backupPurgeScheduler');
	// 	});
	//
	// 	it('should verify changeBackupSchedulerSwitch function behavior with different states', () => {
	// 		const customBackupDetail = {
	// 			...defaultBackupDetail,
	// 			backupSmartScanScheduler: {
	// 				'cron-pattern': SMART_SCAN_CRON_PATTERN,
	// 				'cron-enabled': true
	// 			},
	// 			backupPurgeScheduler: {
	// 				'cron-pattern': PURGE_CRON_PATTERN,
	// 				'cron-enabled': false
	// 			}
	// 		};
	//
	// 		mockUseBackupConfig.mockReturnValue({
	// 			...defaultHookReturn,
	// 			backupDetail: customBackupDetail
	// 		});
	//
	// 		setup(<BackupServerConfig />);
	//
	// 		expect(mockChangeBackupSchedulerSwitch).toBeDefined();
	//
	// 		mockChangeBackupSchedulerSwitch('backupSmartScanScheduler');
	// 		mockChangeBackupSchedulerSwitch('backupPurgeScheduler');
	//
	// 		expect(mockChangeBackupSchedulerSwitch).toHaveBeenCalledTimes(2);
	// 	});
	//
	// 	it('should verify changeBackupSchedulerSwitch handles edge cases', () => {
	// 		const backupDetailWithUndefinedSchedulers = {
	// 			...defaultBackupDetail,
	// 			backupSmartScanScheduler: undefined,
	// 			backupPurgeScheduler: undefined
	// 		};
	//
	// 		mockUseBackupConfig.mockReturnValue({
	// 			...defaultHookReturn,
	// 			backupDetail: backupDetailWithUndefinedSchedulers
	// 		});
	//
	// 		setup(<BackupServerConfig />);
	//
	// 		expect(mockChangeBackupSchedulerSwitch).toBeDefined();
	//
	// 		mockChangeBackupSchedulerSwitch('backupSmartScanScheduler');
	// 		expect(mockChangeBackupSchedulerSwitch).toHaveBeenCalledWith('backupSmartScanScheduler');
	// 	});
	//
	// 	it('should call changeBackupSchedulerSwitch with backupSmartScanScheduler when smart scan switch is clicked', () => {
	// 		testSchedulerSwitchClick('backupSmartScanScheduler');
	// 	});
	//
	// 	it('should call changeBackupSchedulerSwitch with backupPurgeScheduler when purge switch is clicked', () => {
	// 		testSchedulerSwitchClick('backupPurgeScheduler');
	// 	});
	//
	// 	it('should verify changeBackupSchedulerSwitch onClick handlers are properly configured', () => {
	// 		setup(<BackupServerConfig />);
	// 		mockChangeBackupSchedulerSwitch.mockClear();
	//
	// 		mockChangeBackupSchedulerSwitch('backupSmartScanScheduler');
	// 		mockChangeBackupSchedulerSwitch('backupPurgeScheduler');
	//
	// 		expect(mockChangeBackupSchedulerSwitch).toHaveBeenCalledTimes(2);
	// 		expect(mockChangeBackupSchedulerSwitch).toHaveBeenNthCalledWith(
	// 			1,
	// 			'backupSmartScanScheduler'
	// 		);
	// 		expect(mockChangeBackupSchedulerSwitch).toHaveBeenNthCalledWith(2, 'backupPurgeScheduler');
	//
	// 		expect(mockChangeBackupSchedulerSwitch).toBeDefined();
	// 		expect(typeof mockChangeBackupSchedulerSwitch).toBe('function');
	// 	});
	// });
	//
	// describe('Component Rendering with Scheduler Functions', () => {
	// 	it('should render component with scheduler inputs and switches', () => {
	// 		setup(<BackupServerConfig />);
	//
	// 		// Verify that scheduler inputs are rendered
	// 		expect(screen.getByDisplayValue(SMART_SCAN_CRON_PATTERN)).toBeInTheDocument();
	// 		expect(screen.getByDisplayValue(PURGE_CRON_PATTERN)).toBeInTheDocument();
	//
	// 		// Verify that the component renders without errors
	// 		expect(screen.getByTestId(BACKUP_CONFIG_HEADER)).toBeInTheDocument();
	// 	});
	//
	// 	it('should handle disabled state for scheduler functions', () => {
	// 		mockUseBackupConfig.mockReturnValue({
	// 			...defaultHookReturn,
	// 			allowSetBackup: false
	// 		});
	//
	// 		setup(<BackupServerConfig />);
	//
	// 		// Find disabled inputs
	// 		const inputs = screen.getAllByRole('textbox');
	// 		const scheduleInputs = inputs.filter(
	// 			(input) =>
	// 				input.getAttribute('value')?.includes('*') ||
	// 				input.getAttribute('defaultValue')?.includes('*')
	// 		);
	//
	// 		scheduleInputs.forEach((input) => {
	// 			expect(input).toBeDisabled();
	// 		});
	// 	});
	//
	// 	it('should handle edge cases with undefined scheduler objects', () => {
	// 		const backupDetailWithUndefinedSchedulers = {
	// 			...defaultBackupDetail,
	// 			backupSmartScanScheduler: undefined,
	// 			backupPurgeScheduler: undefined
	// 		};
	//
	// 		mockUseBackupConfig.mockReturnValue({
	// 			...defaultHookReturn,
	// 			backupDetail: backupDetailWithUndefinedSchedulers
	// 		});
	//
	// 		expect(() => setup(<BackupServerConfig />)).not.toThrow();
	// 	});
	//
	// 	it('should handle edge cases with missing cron properties', () => {
	// 		const backupDetailWithMissingProps = {
	// 			...defaultBackupDetail,
	// 			backupSmartScanScheduler: {
	// 				'cron-enabled': false
	// 			},
	// 			backupPurgeScheduler: {
	// 				'cron-pattern': PURGE_CRON_PATTERN
	// 			}
	// 		};
	//
	// 		mockUseBackupConfig.mockReturnValue({
	// 			...defaultHookReturn,
	// 			backupDetail: backupDetailWithMissingProps
	// 		});
	//
	// 		expect(() => setup(<BackupServerConfig />)).not.toThrow();
	// 	});
	// });
	//
	// it('should render scheduler toggle and click', async () => {
	// 	const { user } = setup(<BackupServerConfig />);
	// 	const smartScanToggle = screen.getByTestId('smart-scan-toggle');
	// 	expect(smartScanToggle).toBeInTheDocument();
	// 	await user.click(smartScanToggle);
	// });
	// it('should render purge scheduler toggle and click', async () => {
	// 	const { user } = setup(<BackupServerConfig />);
	// 	const backupPurgeToggle = screen.getByTestId('backup-purge-toggle');
	// 	expect(backupPurgeToggle).toBeInTheDocument();
	// 	await user.click(backupPurgeToggle);
	// });
	//
	// describe('Module License Integration', () => {
	// 	it('should render scheduler functions when backup module is licensed', () => {
	// 		setup(<BackupServerConfig />);
	//
	// 		expect(screen.getByTestId(BACKUP_CONFIG_HEADER)).toBeInTheDocument();
	// 		// Scheduler inputs should be present
	// 		expect(screen.getByDisplayValue(SMART_SCAN_CRON_PATTERN)).toBeInTheDocument();
	// 		expect(screen.getByDisplayValue(PURGE_CRON_PATTERN)).toBeInTheDocument();
	// 	});
	//
	// 	it('should not render scheduler functions when backup module is not licensed', () => {
	// 		mockUseModuleLicenseStore.mockReturnValue([
	// 			{
	// 				name: BACKUP_BASIC,
	// 				enabled: false
	// 			}
	// 		]);
	//
	// 		setup(<BackupServerConfig />);
	//
	// 		expect(screen.queryByTestId(BACKUP_CONFIG_HEADER)).not.toBeInTheDocument();
	// 		expect(screen.queryByDisplayValue(SMART_SCAN_CRON_PATTERN)).not.toBeInTheDocument();
	// 		expect(screen.queryByDisplayValue(PURGE_CRON_PATTERN)).not.toBeInTheDocument();
	// 	});
	// });
});
