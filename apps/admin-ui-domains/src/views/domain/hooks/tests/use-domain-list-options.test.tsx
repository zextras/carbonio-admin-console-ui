/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, Mock, vi } from 'vitest';

vi.mock('@zextras/ui-shared', () => ({
  getAllRights: vi.fn(),
  useAllConfig: vi.fn(() => ({ data: [] })),
  useBackupServers: vi.fn(() => ({ data: undefined })),
  useCurrentUserRights: vi.fn(() => ({ data: [] })),
  useIsAdvanced: vi.fn(() => false),
}));

import {
  getAllRights,
  useAllConfig,
  useBackupServers,
  useCurrentUserRights,
  useIsAdvanced,
} from '@zextras/ui-shared';

import { useDomainListOptions } from '../use-domain-list-options';

const useIsAdvancedMock = useIsAdvanced as unknown as Mock;
const useBackupServersMock = useBackupServers as unknown as Mock;
const useCurrentUserRightsMock = useCurrentUserRights as unknown as Mock;
const useAllConfigMock = useAllConfig as unknown as Mock;
const getAllRightsMock = getAllRights as unknown as Mock;

function renderOptionsHook({
  isDomainSelect = true,
  domainInformation = undefined,
}: {
  isDomainSelect?: boolean;
  domainInformation?: object;
} = {}) {
  const { result } = renderHook(() =>
    useDomainListOptions({ isDomainSelect, domainInformation: domainInformation as never }),
  );
  return result.current;
}

const RIGHTS_WITH_GLOBAL_CONFIG = [
  {
    type: 'config',
    all: [{ getAttrs: [{ all: true }] }],
  },
];

describe('useDomainListOptions', () => {
  describe('isAdvanced filtering', () => {
    it('should exclude advanced-only manage items when isAdvanced is false', () => {
      useIsAdvancedMock.mockReturnValue(false);
      useBackupServersMock.mockReturnValue({ data: undefined });
      useAllConfigMock.mockReturnValue({ data: [] });
      useCurrentUserRightsMock.mockReturnValue({ data: [] });
      getAllRightsMock.mockReturnValue([]);

      const { manageOptions } = renderOptionsHook();

      const ids = manageOptions.map((i) => i.id);
      expect(ids).not.toContain('active_sync');
      expect(ids).not.toContain('restore_account');
      expect(ids).not.toContain('delegates_domain_admins');
      expect(ids).not.toContain('address_book');
    });

    it('should include all manage items when isAdvanced is true', () => {
      useIsAdvancedMock.mockReturnValue(true);
      useBackupServersMock.mockReturnValue({ data: undefined });
      useAllConfigMock.mockReturnValue({ data: [] });
      useCurrentUserRightsMock.mockReturnValue({ data: [] });
      getAllRightsMock.mockReturnValue([]);

      const { manageOptions } = renderOptionsHook();

      const ids = manageOptions.map((i) => i.id);
      expect(ids).toContain('active_sync');
      expect(ids).toContain('address_book');
      expect(ids).toContain('restore_account');
      expect(ids).toContain('delegates_domain_admins');
    });

    it('should exclude advanced-only detail items when isAdvanced is false', () => {
      useIsAdvancedMock.mockReturnValue(false);
      useBackupServersMock.mockReturnValue({ data: undefined });
      useAllConfigMock.mockReturnValue({ data: [] });
      useCurrentUserRightsMock.mockReturnValue({ data: [] });
      getAllRightsMock.mockReturnValue([]);

      const { detailItems } = renderOptionsHook();

      const ids = detailItems.map((i) => i.id);
      expect(ids).not.toContain('whitelabel_settings');
      expect(ids).not.toContain('saml');
      expect(ids).not.toContain('2-factor-authentication');
    });

    it('should exclude advanced-only global items when isAdvanced is false', () => {
      useIsAdvancedMock.mockReturnValue(false);
      useBackupServersMock.mockReturnValue({ data: undefined });
      useAllConfigMock.mockReturnValue({ data: [] });
      useCurrentUserRightsMock.mockReturnValue({ data: [] });
      getAllRightsMock.mockReturnValue([]);

      const { globalOptionsItems } = renderOptionsHook();

      const ids = globalOptionsItems.map((i) => i.id);
      expect(ids).not.toContain('global/whitelabel_settings');
      expect(ids).not.toContain('global/2fa');
      expect(ids).not.toContain('global/active_sync');
      expect(ids).not.toContain('global/address_book');
    });
  });

  describe('backup gating', () => {
    it('should exclude restore_account from manage when backup module is disabled', () => {
      useIsAdvancedMock.mockReturnValue(true);
      useBackupServersMock.mockReturnValue({
        data: { backupModuleEnable: false, isBackupModuleLicensed: false },
      });
      useAllConfigMock.mockReturnValue({ data: [] });
      useCurrentUserRightsMock.mockReturnValue({ data: [] });
      getAllRightsMock.mockReturnValue([]);

      const { manageOptions } = renderOptionsHook();

      expect(manageOptions.map((i) => i.id)).not.toContain('restore_account');
    });

    it('should include restore_account in manage when backup module is enabled', () => {
      useIsAdvancedMock.mockReturnValue(true);
      useBackupServersMock.mockReturnValue({
        data: { backupModuleEnable: true, isBackupModuleLicensed: true },
      });
      useAllConfigMock.mockReturnValue({ data: [] });
      useCurrentUserRightsMock.mockReturnValue({ data: [] });
      getAllRightsMock.mockReturnValue([]);

      const { manageOptions } = renderOptionsHook();

      expect(manageOptions.map((i) => i.id)).toContain('restore_account');
    });
  });

  describe('isShowGlobalConfig', () => {
    it('should return true when rights include getAttrs with all=true', () => {
      useIsAdvancedMock.mockReturnValue(false);
      useBackupServersMock.mockReturnValue({ data: undefined });
      useAllConfigMock.mockReturnValue({ data: [] });
      useCurrentUserRightsMock.mockReturnValue({ data: RIGHTS_WITH_GLOBAL_CONFIG });
      getAllRightsMock.mockReturnValue(RIGHTS_WITH_GLOBAL_CONFIG);

      const { isShowGlobalConfig } = renderOptionsHook();

      expect(isShowGlobalConfig).toBe(true);
    });

    it('should return false when there are no rights', () => {
      useIsAdvancedMock.mockReturnValue(false);
      useBackupServersMock.mockReturnValue({ data: undefined });
      useAllConfigMock.mockReturnValue({ data: [] });
      useCurrentUserRightsMock.mockReturnValue({ data: [] });
      getAllRightsMock.mockReturnValue([]);

      const { isShowGlobalConfig } = renderOptionsHook();

      expect(isShowGlobalConfig).toBe(false);
    });
  });

  describe('isDomainSelect', () => {
    it('should set isSelected=true on manage items when a domain is selected', () => {
      useIsAdvancedMock.mockReturnValue(true);
      useBackupServersMock.mockReturnValue({ data: undefined });
      useAllConfigMock.mockReturnValue({ data: [] });
      useCurrentUserRightsMock.mockReturnValue({ data: [] });
      getAllRightsMock.mockReturnValue([]);

      const { manageOptions } = renderOptionsHook({ isDomainSelect: true });

      expect(manageOptions.every((i) => i.isSelected)).toBe(true);
    });
  });
});
