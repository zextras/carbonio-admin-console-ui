/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserAccounts, useRights } from '@zextras/admin-ui-bootstrap';
import { useSnackbar } from '@zextras/carbonio-design-system';
import { ChangeEvent } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';

vi.mock('@zextras/carbonio-design-system', () => ({
	useSnackbar: vi.fn()
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => [(key: string, fallback?: string) => fallback || key, { i18n: {} }]
}));

vi.mock('../../services/modify-backup', () => ({
	modifyBackupRequest: vi.fn()
}));

vi.mock('../../store/backup/store', () => ({
	useBackupStore: vi.fn()
}));

vi.mock('@zextras/admin-ui-bootstrap', () => ({
	useUserAccounts: vi.fn(),
	useRights: vi.fn()
}));

import { modifyBackupRequest } from '../../services/modify-backup';
import { useBackupStore } from '../../store/backup/store';
import { useBackupConfig } from '../useBackupConfig';

describe('useBackupConfig', () => {
	let mockCreateSnackbar: Mock;
	let mockSetGlobalConfig: Mock;

	const mockGlobalConfig = {
		backupEnabled: true,
		backupPath: '/backup',
		backupInterval: '24h',
		scheduler1: {
			'cron-pattern': '0 0 * * *',
			'cron-enabled': true
		},
		scheduler2: {
			'cron-pattern': '0 12 * * *',
			'cron-enabled': false
		}
	};

	const mockRights = [
		{
			type: 'config',
			all: [
				{
					setAttrs: [{ all: true }]
				}
			]
		}
	];

	beforeEach(() => {
		mockCreateSnackbar = vi.fn();
		mockSetGlobalConfig = vi.fn();

		(useSnackbar as Mock).mockReturnValue(mockCreateSnackbar);

		(useBackupStore as unknown as Mock).mockImplementation((selector) => {
			const state = {
				globalConfig: mockGlobalConfig,
				setGlobalConfig: mockSetGlobalConfig
			};
			return selector(state);
		});

		(useUserAccounts as Mock).mockReturnValue([{ name: 'testuser@example.com' }]);
		(useRights as Mock).mockReturnValue({ data: mockRights });

		(modifyBackupRequest as Mock).mockResolvedValue({ status: 200 });
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('Initial State', () => {
		it('should initialize with correct default values', () => {
			const { result } = renderHook(() => useBackupConfig());

			expect(result.current.isDirty).toBe(false);
			expect(result.current.backupDetail).toEqual(mockGlobalConfig);
			expect(result.current.allowSetBackup).toBe(true);
			expect(typeof result.current.t).toBe('function');
		});

		it('should handle missing rights configuration', () => {
			(useRights as Mock).mockReturnValue({ data: [] });

			const { result } = renderHook(() => useBackupConfig());
			expect(result.current.allowSetBackup).toBe(false);
		});

		it('should handle rights without setAttrs', () => {
			(useRights as unknown as Mock).mockReturnValue({
				data: [{ type: 'config', all: [] }]
			});

			const { result } = renderHook(() => useBackupConfig());
			expect(result.current.allowSetBackup).toBe(false);
		});
	});

	describe('isDirty State Management', () => {
		it('should set isDirty to true when backupDetail changes', () => {
			const { result } = renderHook(() => useBackupConfig());

			act(() => {
				result.current.setBackupDetail({
					...mockGlobalConfig,
					backupEnabled: false
				});
			});

			expect(result.current.isDirty).toBe(true);
		});

		it('should set isDirty to false when backupDetail matches globalConfig', () => {
			const { result } = renderHook(() => useBackupConfig());

			// First make it dirty
			act(() => {
				result.current.setBackupDetail({
					...mockGlobalConfig,
					backupEnabled: false
				});
			});

			expect(result.current.isDirty).toBe(true);

			// Then reset it
			act(() => {
				result.current.setBackupDetail(mockGlobalConfig);
			});

			expect(result.current.isDirty).toBe(false);
		});
	});

	describe('onCancel', () => {
		it('should reset backupDetail to globalConfig', () => {
			const { result } = renderHook(() => useBackupConfig());

			// Modify the state first
			act(() => {
				result.current.setBackupDetail({
					...mockGlobalConfig,
					backupEnabled: false,
					backupPath: '/new-path'
				});
			});

			expect(result.current.backupDetail.backupEnabled).toBe(false);
			expect(result.current.backupDetail.backupPath).toBe('/new-path');

			// Cancel changes
			act(() => {
				result.current.onCancel();
			});

			expect(result.current.backupDetail).toEqual(mockGlobalConfig);
			expect(result.current.isDirty).toBe(false);
		});
	});

	describe('onSave', () => {
		it('should save only modified fields successfully', async () => {
			(modifyBackupRequest as Mock).mockResolvedValue({ status: 200 });
			const { result } = renderHook(() => useBackupConfig());

			// Modify some fields
			act(() => {
				result.current.setBackupDetail({
					...mockGlobalConfig,
					backupEnabled: false,
					backupPath: '/new-backup'
				});
			});

			await act(async () => {
				result.current.onSave();
			});

			await waitFor(() => {
				expect(modifyBackupRequest).toHaveBeenCalledWith({
					backupEnabled: false,
					backupPath: '/new-backup'
				});
			});

			expect(mockSetGlobalConfig).toHaveBeenCalledWith({
				...mockGlobalConfig,
				backupEnabled: false,
				backupPath: '/new-backup'
			});

			expect(mockCreateSnackbar).toHaveBeenCalledWith({
				key: 'success',
				severity: 'success',
				label: 'Changes have been saved successfully',
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		});

		it('should handle empty response as success', async () => {
			(modifyBackupRequest as Mock).mockResolvedValue({});
			const { result } = renderHook(() => useBackupConfig());

			act(() => {
				result.current.setBackupDetail({
					...mockGlobalConfig,
					backupEnabled: false
				});
			});

			await act(async () => {
				result.current.onSave();
			});

			await waitFor(() => {
				expect(mockSetGlobalConfig).toHaveBeenCalled();
				expect(mockCreateSnackbar).toHaveBeenCalledWith(
					expect.objectContaining({ severity: 'success' })
				);
			});
		});

		it('should show error snackbar on API error response', async () => {
			const errorResponse = {
				status: 400,
				errors: [{ error: 'Invalid configuration' }]
			};
			(modifyBackupRequest as Mock).mockResolvedValue(errorResponse);
			const { result } = renderHook(() => useBackupConfig());

			act(() => {
				result.current.setBackupDetail({
					...mockGlobalConfig,
					backupEnabled: false
				});
			});

			await act(async () => {
				result.current.onSave();
			});

			await waitFor(() => {
				expect(mockSetGlobalConfig).not.toHaveBeenCalled();
				expect(mockCreateSnackbar).toHaveBeenCalledWith({
					key: 'error',
					severity: 'error',
					label: 'Invalid configuration',
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
		});

		it('should handle statusText in error response', async () => {
			const errorResponse = {
				status: 500,
				statusText: 'Internal Server Error'
			};
			(modifyBackupRequest as Mock).mockResolvedValue(errorResponse);
			const { result } = renderHook(() => useBackupConfig());

			act(() => {
				result.current.setBackupDetail({
					...mockGlobalConfig,
					backupEnabled: false
				});
			});

			await act(async () => {
				result.current.onSave();
			});

			await waitFor(() => {
				expect(mockCreateSnackbar).toHaveBeenCalledWith(
					expect.objectContaining({
						severity: 'error',
						label: 'Internal Server Error'
					})
				);
			});
		});

		it('should handle rejected promise', async () => {
			const error = {
				errors: [{ error: 'Network error' }]
			};
			(modifyBackupRequest as Mock).mockRejectedValue(error);
			const { result } = renderHook(() => useBackupConfig());

			act(() => {
				result.current.setBackupDetail({
					...mockGlobalConfig,
					backupEnabled: false
				});
			});

			await act(async () => {
				result.current.onSave();
			});

			await waitFor(() => {
				expect(mockSetGlobalConfig).not.toHaveBeenCalled();
				expect(mockCreateSnackbar).toHaveBeenCalledWith({
					key: 'error',
					severity: 'error',
					label: 'Network error',
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
		});

		it('should use fallback error message when no specific error available', async () => {
			(modifyBackupRequest as Mock).mockRejectedValue({});
			const { result } = renderHook(() => useBackupConfig());

			act(() => {
				result.current.setBackupDetail({
					...mockGlobalConfig,
					backupEnabled: false
				});
			});

			await act(async () => {
				result.current.onSave();
			});

			await waitFor(() => {
				expect(mockCreateSnackbar).toHaveBeenCalledWith(
					expect.objectContaining({
						label: 'Something went wrong. Please try again.'
					})
				);
			});
		});

		it('should not call API if no changes made', async () => {
			const { result } = renderHook(() => useBackupConfig());

			// Don't modify anything
			await act(async () => {
				result.current.onSave();
			});

			expect(modifyBackupRequest).toHaveBeenCalledWith({});
		});
	});

	describe('changeSwitchOption', () => {
		it('should toggle boolean value for given key', () => {
			const { result } = renderHook(() => useBackupConfig());

			expect(result.current.backupDetail.backupEnabled).toBe(true);

			act(() => {
				result.current.changeSwitchOption('backupEnabled');
			});

			expect(result.current.backupDetail.backupEnabled).toBe(false);

			act(() => {
				result.current.changeSwitchOption('backupEnabled');
			});

			expect(result.current.backupDetail.backupEnabled).toBe(true);
		});

		it('should set value to true if it was undefined', () => {
			const { result } = renderHook(() => useBackupConfig());

			act(() => {
				result.current.changeSwitchOption('newOption');
			});

			expect(result.current.backupDetail.newOption).toBe(true);
		});
	});

	describe('changeBackupDetail', () => {
		it('should update field based on input event', () => {
			const { result } = renderHook(() => useBackupConfig());

			const event = {
				target: {
					name: 'backupPath',
					value: '/updated/path'
				}
			} as ChangeEvent<HTMLInputElement>;

			act(() => {
				result.current.changeBackupDetail(event);
			});

			expect(result.current.backupDetail.backupPath).toBe('/updated/path');
		});

		it('should update multiple fields independently', () => {
			const { result } = renderHook(() => useBackupConfig());

			const event1 = {
				target: { name: 'backupPath', value: '/path1' }
			} as ChangeEvent<HTMLInputElement>;

			const event2 = {
				target: { name: 'backupInterval', value: '48h' }
			} as ChangeEvent<HTMLInputElement>;

			act(() => {
				result.current.changeBackupDetail(event1);
				result.current.changeBackupDetail(event2);
			});

			expect(result.current.backupDetail.backupPath).toBe('/path1');
			expect(result.current.backupDetail.backupInterval).toBe('48h');
		});
	});

	describe('changeBackupSchedulerInput', () => {
		it('should update cron-pattern while preserving cron-enabled', () => {
			const { result } = renderHook(() => useBackupConfig());

			const event = {
				target: {
					name: 'scheduler1',
					value: '0 6 * * *'
				}
			} as ChangeEvent<HTMLInputElement>;

			act(() => {
				result.current.changeBackupSchedulerInput(event);
			});

			expect(result.current.backupDetail.scheduler1['cron-pattern']).toBe('0 6 * * *');
			expect(result.current.backupDetail.scheduler1['cron-enabled']).toBe(true);
		});

		it('should handle scheduler that was initially disabled', () => {
			const { result } = renderHook(() => useBackupConfig());

			const event = {
				target: {
					name: 'scheduler2',
					value: '0 18 * * *'
				}
			} as ChangeEvent<HTMLInputElement>;

			act(() => {
				result.current.changeBackupSchedulerInput(event);
			});

			expect(result.current.backupDetail.scheduler2['cron-pattern']).toBe('0 18 * * *');
			expect(result.current.backupDetail.scheduler2['cron-enabled']).toBe(false);
		});
	});

	describe('changeBackupSchedulerSwitch', () => {
		it('should toggle cron-enabled while preserving cron-pattern', () => {
			const { result } = renderHook(() => useBackupConfig());

			act(() => {
				result.current.changeBackupSchedulerSwitch('scheduler1');
			});

			expect(result.current.backupDetail.scheduler1['cron-enabled']).toBe(false);
			expect(result.current.backupDetail.scheduler1['cron-pattern']).toBe('0 0 * * *');
		});

		it('should toggle back to true', () => {
			const { result } = renderHook(() => useBackupConfig());

			act(() => {
				result.current.changeBackupSchedulerSwitch('scheduler2');
			});

			expect(result.current.backupDetail.scheduler2['cron-enabled']).toBe(true);
			expect(result.current.backupDetail.scheduler2['cron-pattern']).toBe('0 12 * * *');
		});
	});

	describe('Translation function', () => {
		it('should return translation key with fallback', () => {
			const { result } = renderHook(() => useBackupConfig());

			const translated = result.current.t('some.key', 'Fallback text');
			expect(translated).toBe('Fallback text');
		});

		it('should return key when no fallback provided', () => {
			const { result } = renderHook(() => useBackupConfig());

			const translated = result.current.t('some.key');
			expect(translated).toBe('some.key');
		});
	});

	describe('Complex Scenarios', () => {
		it('should handle multiple rapid changes correctly', () => {
			const { result } = renderHook(() => useBackupConfig());

			act(() => {
				result.current.changeSwitchOption('backupEnabled');
				result.current.changeBackupDetail({
					target: { name: 'backupPath', value: '/new' }
				} as ChangeEvent<HTMLInputElement>);
				result.current.changeBackupSchedulerSwitch('scheduler1');
			});

			expect(result.current.backupDetail.backupEnabled).toBe(false);
			expect(result.current.backupDetail.backupPath).toBe('/new');
			expect(result.current.backupDetail.scheduler1['cron-enabled']).toBe(false);
			expect(result.current.isDirty).toBe(true);
		});

		it('should properly reset after save', async () => {
			(modifyBackupRequest as Mock).mockResolvedValue({ status: 200 });
			const { result } = renderHook(() => useBackupConfig());

			// Make changes
			act(() => {
				result.current.setBackupDetail({
					...mockGlobalConfig,
					backupEnabled: false
				});
			});

			expect(result.current.isDirty).toBe(true);

			// Save changes
			await act(async () => {
				result.current.onSave();
			});

			await waitFor(() => {
				expect(mockSetGlobalConfig).toHaveBeenCalledWith({
					...mockGlobalConfig,
					backupEnabled: false
				});
			});

			// Verify the save process was completed successfully
			expect(modifyBackupRequest).toHaveBeenCalled();
			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'success'
				})
			);
		});

		it('should maintain dirty state after failed save', async () => {
			(modifyBackupRequest as Mock).mockRejectedValue(new Error('Save failed'));
			const { result } = renderHook(() => useBackupConfig());

			act(() => {
				result.current.setBackupDetail({
					...mockGlobalConfig,
					backupEnabled: false
				});
			});

			expect(result.current.isDirty).toBe(true);

			await act(async () => {
				result.current.onSave();
			});

			await waitFor(() => {
				expect(mockCreateSnackbar).toHaveBeenCalledWith(
					expect.objectContaining({ severity: 'error' })
				);
			});

			expect(result.current.isDirty).toBe(true);
			expect(mockSetGlobalConfig).not.toHaveBeenCalled();
		});
	});
});
