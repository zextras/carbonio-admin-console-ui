/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Mock dependencies first, before any imports
jest.mock('@zextras/carbonio-design-system');
jest.mock('../../services/modify-backup', () => ({
	modifyBackupRequest: jest.fn()
}));
jest.mock('../../store/backup/store');
jest.mock('../../store/rights/store');

import { renderHook, act } from '@testing-library/react';
import { useSnackbar } from '@zextras/carbonio-design-system';

import { CONFIG } from '../../constants';
import { modifyBackupRequest } from '../../services/modify-backup';
import { useBackupStore } from '../../store/backup/store';
import { useRightsStore } from '../../store/rights/store';
import { useBackupConfig } from '../useBackupConfig';

jest.mock('react-i18next', () => ({
	useTranslation: (): [(key: string, fallback?: string) => string, { language: string }] => [
		(key: string, fallback?: string): string => fallback || key,
		{ language: 'en' }
	]
}));

const mockCreateSnackbar = jest.fn();
const mockSetGlobalConfig = jest.fn();
const mockModifyBackupRequest = modifyBackupRequest as jest.MockedFunction<
	typeof modifyBackupRequest
>;

describe('useBackupConfig', () => {
	const mockGlobalConfig = {
		backupEnabled: true,
		backupSelfUndeleteAllowed: false,
		abqMode: 'Interactive',
		scheduler: {
			'cron-pattern': '0 2 * * *'
		}
	};

	const mockRights = [
		{
			type: CONFIG,
			all: [
				{
					setAttrs: [{ all: true }],
					getAttrs: [{ all: true }]
				}
			]
		}
	];

	beforeEach(() => {
		jest.clearAllMocks();

		(useSnackbar as jest.Mock).mockReturnValue(mockCreateSnackbar);

		(useBackupStore as unknown as jest.Mock).mockImplementation((selector) => {
			const state = {
				globalConfig: mockGlobalConfig,
				setGlobalConfig: mockSetGlobalConfig
			};
			return selector(state);
		});

		(useRightsStore as unknown as jest.Mock).mockImplementation((selector) => {
			const state = {
				rights: mockRights
			};
			return selector(state);
		});
	});

	describe('initialization', () => {
		it('should initialize with correct default values', () => {
			const { result } = renderHook(() => useBackupConfig());

			expect(result.current.isDirty).toBe(false);
			expect(result.current.backupDetail).toEqual(mockGlobalConfig);
			expect(result.current.allowSetBackup).toBe(true);
			expect(typeof result.current.onCancel).toBe('function');
			expect(typeof result.current.onSave).toBe('function');
			expect(typeof result.current.changeSwitchOption).toBe('function');
			expect(typeof result.current.changeBackupDetail).toBe('function');
			expect(typeof result.current.changeBackupSchedulerDetail).toBe('function');
			expect(typeof result.current.t).toBe('function');
		});

		it('should set allowSetBackup to false when user lacks permissions', () => {
			const noPermissionRights = [
				{
					type: CONFIG,
					all: [
						{
							setAttrs: [{ all: false }]
						}
					]
				}
			];

			(useRightsStore as unknown as jest.Mock).mockImplementation((selector) => {
				const state = {
					rights: noPermissionRights
				};
				return selector(state);
			});

			const { result } = renderHook(() => useBackupConfig());

			expect(result.current.allowSetBackup).toBe(false);
		});

		it('should set allowSetBackup to false when config rights are not found', () => {
			const noConfigRights = [
				{
					type: 'other',
					all: [
						{
							setAttrs: [{ all: true }]
						}
					]
				}
			];

			(useRightsStore as unknown as jest.Mock).mockImplementation((selector) => {
				const state = {
					rights: noConfigRights
				};
				return selector(state);
			});

			const { result } = renderHook(() => useBackupConfig());

			expect(result.current.allowSetBackup).toBe(false);
		});
	});

	describe('isDirty state management', () => {
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

			// Then reset to original
			act(() => {
				result.current.setBackupDetail(mockGlobalConfig);
			});

			expect(result.current.isDirty).toBe(false);
		});
	});

	describe('onCancel', () => {
		it('should reset backupDetail to globalConfig', () => {
			const { result } = renderHook(() => useBackupConfig());

			// Modify the backup detail
			act(() => {
				result.current.setBackupDetail({
					...mockGlobalConfig,
					backupEnabled: false
				});
			});

			expect(result.current.backupDetail.backupEnabled).toBe(false);

			// Cancel changes
			act(() => {
				result.current.onCancel();
			});

			expect(result.current.backupDetail).toEqual(mockGlobalConfig);
			expect(result.current.isDirty).toBe(false);
		});
	});

	describe('changeSwitchOption', () => {
		it('should toggle boolean values correctly', () => {
			const { result } = renderHook(() => useBackupConfig());

			act(() => {
				result.current.changeSwitchOption('backupEnabled');
			});

			expect(result.current.backupDetail.backupEnabled).toBe(false);

			act(() => {
				result.current.changeSwitchOption('backupSelfUndeleteAllowed');
			});

			expect(result.current.backupDetail.backupSelfUndeleteAllowed).toBe(true);
		});
	});

	describe('changeBackupDetail', () => {
		it('should update backup detail with input values', () => {
			const { result } = renderHook(() => useBackupConfig());

			const mockEvent = {
				target: {
					name: 'abqMode',
					value: 'Strict'
				}
			} as React.ChangeEvent<HTMLInputElement>;

			act(() => {
				result.current.changeBackupDetail(mockEvent);
			});

			expect(result.current.backupDetail.abqMode).toBe('Strict');
		});
	});

	describe('changeBackupSchedulerDetail', () => {
		it('should update scheduler cron pattern', () => {
			const { result } = renderHook(() => useBackupConfig());

			const mockEvent = {
				target: {
					name: 'scheduler',
					value: '0 3 * * *'
				}
			} as React.ChangeEvent<HTMLInputElement>;

			act(() => {
				result.current.changeBackupSchedulerDetail(mockEvent);
			});

			expect(result.current.backupDetail.scheduler['cron-pattern']).toBe('0 3 * * *');
		});
	});

	describe('onSave', () => {
		it('should save changes successfully and show success snackbar', async () => {
			mockModifyBackupRequest.mockResolvedValue({ status: 200 });

			const { result } = renderHook(() => useBackupConfig());

			// Make changes
			act(() => {
				result.current.setBackupDetail({
					...mockGlobalConfig,
					backupEnabled: false
				});
			});

			// Save changes
			await act(async () => {
				result.current.onSave();
			});

			expect(mockModifyBackupRequest).toHaveBeenCalledWith({
				backupEnabled: false
			});
			expect(mockSetGlobalConfig).toHaveBeenCalledWith({
				...mockGlobalConfig,
				backupEnabled: false
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
			mockModifyBackupRequest.mockResolvedValue({});

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

			expect(mockSetGlobalConfig).toHaveBeenCalled();
			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'success'
				})
			);
		});

		it('should show error snackbar when save fails with error response', async () => {
			const errorResponse = {
				status: 400,
				errors: [{ error: 'Invalid configuration' }]
			};
			mockModifyBackupRequest.mockResolvedValue(errorResponse);

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

			expect(mockCreateSnackbar).toHaveBeenCalledWith({
				key: 'error',
				severity: 'error',
				label: 'Invalid configuration',
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			expect(mockSetGlobalConfig).not.toHaveBeenCalled();
		});

		it('should show error snackbar with statusText when no error message', async () => {
			const errorResponse = {
				status: 500,
				statusText: 'Internal Server Error'
			};
			mockModifyBackupRequest.mockResolvedValue(errorResponse);

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

			expect(mockCreateSnackbar).toHaveBeenCalledWith({
				key: 'error',
				severity: 'error',
				label: 'Internal Server Error',
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		});

		it('should handle request rejection and show error snackbar', async () => {
			const rejectionError = {
				errors: [{ error: 'Network error' }]
			};
			mockModifyBackupRequest.mockRejectedValue(rejectionError);

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

			expect(mockCreateSnackbar).toHaveBeenCalledWith({
				key: 'error',
				severity: 'error',
				label: 'Network error',
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		});

		it('should only send modified fields to the API', async () => {
			mockModifyBackupRequest.mockResolvedValue({ status: 200 });

			const { result } = renderHook(() => useBackupConfig());

			// Modify multiple fields
			act(() => {
				result.current.setBackupDetail({
					...mockGlobalConfig,
					backupEnabled: false,
					abqMode: 'Strict'
				});
			});

			await act(async () => {
				result.current.onSave();
			});

			expect(mockModifyBackupRequest).toHaveBeenCalledWith({
				backupEnabled: false,
				abqMode: 'Strict'
			});
		});

		it('should not call API when no changes are made', async () => {
			mockModifyBackupRequest.mockResolvedValue({ status: 200 });

			const { result } = renderHook(() => useBackupConfig());

			await act(async () => {
				result.current.onSave();
			});

			expect(mockModifyBackupRequest).toHaveBeenCalledWith({});
		});
	});

	describe('translation function', () => {
		it('should return translation function', () => {
			const { result } = renderHook(() => useBackupConfig());

			expect(typeof result.current.t).toBe('function');
			expect(result.current.t('test.key', 'fallback')).toBe('fallback');
		});
	});
});
