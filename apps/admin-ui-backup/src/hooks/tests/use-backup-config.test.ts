/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act, renderHook } from '@testing-library/react';
import { ChangeEvent } from 'react';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';

vi.mock('@zextras/ui-shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@zextras/ui-shared')>();
  return {
    ...actual,
    useCurrentUserRights: vi.fn(),
    useUserAccounts: vi.fn(),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback || key, { i18n: {} }],
}));

vi.mock('../../services/use-global-config', () => ({
  useGlobalConfig: vi.fn(),
}));

const mockMutate = vi.fn();
vi.mock('../../services/use-modify-backup-config', () => ({
  useModifyBackupConfig: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

import { useCurrentUserRights, useUserAccounts } from '@zextras/ui-shared';

import type { CronScheduler } from '../../../types';
import { useGlobalConfig } from '../../services/use-global-config';
import { useBackupConfig } from '../use-backup-config';

describe('useBackupConfig', () => {
  const mockGlobalConfig = {
    backupEnabled: true,
    backupPath: '/backup',
    backupInterval: '24h',
    scheduler1: {
      'cron-pattern': '0 0 * * *',
      'cron-enabled': true,
    },
    scheduler2: {
      'cron-pattern': '0 12 * * *',
      'cron-enabled': false,
    },
  };

  const mockRights = [
    {
      type: 'config',
      all: [
        {
          setAttrs: [{ all: true }],
        },
      ],
    },
  ];

  beforeEach(() => {
    mockMutate.mockClear();

    (useGlobalConfig as unknown as Mock).mockReturnValue({ data: mockGlobalConfig });

    (useUserAccounts as Mock).mockReturnValue([{ name: 'testuser@example.com' }]);
    (useCurrentUserRights as Mock).mockReturnValue({
      data: mockRights,
      isLoading: false,
      isSuccess: true,
      isError: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useBackupConfig());

      expect(result.current.isDirty).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.backupDetail).toEqual(mockGlobalConfig);
      expect(result.current.allowSetBackup).toBe(true);
      expect(typeof result.current.t).toBe('function');
    });

    it('should handle missing rights configuration', () => {
      (useCurrentUserRights as Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isSuccess: true,
        isError: false,
      });

      const { result } = renderHook(() => useBackupConfig());
      expect(result.current.allowSetBackup).toBe(false);
    });

    it('should handle rights without setAttrs', () => {
      (useCurrentUserRights as unknown as Mock).mockReturnValue({
        data: [{ type: 'config', all: [] }],
        isLoading: false,
        isSuccess: true,
        isError: false,
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
          backupEnabled: false,
        });
      });

      expect(result.current.isDirty).toBe(true);
    });

    it('should set isDirty to false when backupDetail matches globalConfig', () => {
      const { result } = renderHook(() => useBackupConfig());

      act(() => {
        result.current.setBackupDetail({
          ...mockGlobalConfig,
          backupEnabled: false,
        });
      });

      expect(result.current.isDirty).toBe(true);

      act(() => {
        result.current.setBackupDetail(mockGlobalConfig);
      });

      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('onCancel', () => {
    it('should reset backupDetail to globalConfig', () => {
      const { result } = renderHook(() => useBackupConfig());

      act(() => {
        result.current.setBackupDetail({
          ...mockGlobalConfig,
          backupEnabled: false,
          backupPath: '/new-path',
        });
      });

      expect(result.current.backupDetail.backupEnabled).toBe(false);
      expect(result.current.backupDetail.backupPath).toBe('/new-path');

      act(() => {
        result.current.onCancel();
      });

      expect(result.current.backupDetail).toEqual(mockGlobalConfig);
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('onSave', () => {
    it('should call mutate with only modified fields', () => {
      const { result } = renderHook(() => useBackupConfig());

      act(() => {
        result.current.setBackupDetail({
          ...mockGlobalConfig,
          backupEnabled: false,
          backupPath: '/new-backup',
        });
      });

      act(() => {
        result.current.onSave();
      });

      expect(mockMutate).toHaveBeenCalledWith({
        backupEnabled: false,
        backupPath: '/new-backup',
      });
    });

    it('should call mutate with empty object when no changes made', () => {
      const { result } = renderHook(() => useBackupConfig());

      act(() => {
        result.current.onSave();
      });

      expect(mockMutate).toHaveBeenCalledWith({});
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
          value: '/updated/path',
        },
      } as ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.changeBackupDetail(event);
      });

      expect(result.current.backupDetail.backupPath).toBe('/updated/path');
    });

    it('should update multiple fields independently', () => {
      const { result } = renderHook(() => useBackupConfig());

      const event1 = {
        target: { name: 'backupPath', value: '/path1' },
      } as ChangeEvent<HTMLInputElement>;

      const event2 = {
        target: { name: 'backupInterval', value: '48h' },
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
          value: '0 6 * * *',
        },
      } as ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.changeBackupSchedulerInput(event);
      });

      expect(
        (result.current.backupDetail.scheduler1 as CronScheduler)['cron-pattern'],
      ).toBe('0 6 * * *');
      expect(
        (result.current.backupDetail.scheduler1 as CronScheduler)['cron-enabled'],
      ).toBe(true);
    });

    it('should handle scheduler that was initially disabled', () => {
      const { result } = renderHook(() => useBackupConfig());

      const event = {
        target: {
          name: 'scheduler2',
          value: '0 18 * * *',
        },
      } as ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.changeBackupSchedulerInput(event);
      });

      expect(
        (result.current.backupDetail.scheduler2 as CronScheduler)['cron-pattern'],
      ).toBe('0 18 * * *');
      expect(
        (result.current.backupDetail.scheduler2 as CronScheduler)['cron-enabled'],
      ).toBe(false);
    });
  });

  describe('changeBackupSchedulerSwitch', () => {
    it('should toggle cron-enabled while preserving cron-pattern', () => {
      const { result } = renderHook(() => useBackupConfig());

      act(() => {
        result.current.changeBackupSchedulerSwitch('scheduler1');
      });

      expect(
        (result.current.backupDetail.scheduler1 as CronScheduler)['cron-enabled'],
      ).toBe(false);
      expect(
        (result.current.backupDetail.scheduler1 as CronScheduler)['cron-pattern'],
      ).toBe('0 0 * * *');
    });

    it('should toggle back to true', () => {
      const { result } = renderHook(() => useBackupConfig());

      act(() => {
        result.current.changeBackupSchedulerSwitch('scheduler2');
      });

      expect(
        (result.current.backupDetail.scheduler2 as CronScheduler)['cron-enabled'],
      ).toBe(true);
      expect(
        (result.current.backupDetail.scheduler2 as CronScheduler)['cron-pattern'],
      ).toBe('0 12 * * *');
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
          target: { name: 'backupPath', value: '/new' },
        } as ChangeEvent<HTMLInputElement>);
        result.current.changeBackupSchedulerSwitch('scheduler1');
      });

      expect(result.current.backupDetail.backupEnabled).toBe(false);
      expect(result.current.backupDetail.backupPath).toBe('/new');
      expect(
        (result.current.backupDetail.scheduler1 as CronScheduler)['cron-enabled'],
      ).toBe(false);
      expect(result.current.isDirty).toBe(true);
    });

    it('should call mutate on save after multiple changes', () => {
      const { result } = renderHook(() => useBackupConfig());

      act(() => {
        result.current.setBackupDetail({
          ...mockGlobalConfig,
          backupEnabled: false,
          backupPath: '/new',
        });
        result.current.changeBackupSchedulerSwitch('scheduler1');
      });

      act(() => {
        result.current.onSave();
      });

      expect(mockMutate).toHaveBeenCalled();
      expect(result.current.isDirty).toBe(true);
    });
  });
});
