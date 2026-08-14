/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-shared', () => ({
  getSoapFetchRequest: vi.fn(),
}));

import { getSoapFetchRequest } from '@zextras/ui-shared';

import { GET_SERVER_BACKUP_URL } from '../../constants';
import { getServerConfig } from '../get-server-config';

describe('getServerConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls getSoapFetchRequest with the correct URL for the given serverId', async () => {
    const mockResponse = { attributes: {}, services: {}, properties: {} };
    vi.mocked(getSoapFetchRequest).mockResolvedValue(mockResponse as never);

    await getServerConfig('server-123');

    expect(getSoapFetchRequest).toHaveBeenCalledWith(
      `${GET_SERVER_BACKUP_URL}/server-123?module=zxbackup`,
    );
  });

  it('returns the response from getSoapFetchRequest', async () => {
    const mockResponse = {
      attributes: { ZxBackup_ModuleEnabledAtStartup: { value: true } },
    };
    vi.mocked(getSoapFetchRequest).mockResolvedValue(mockResponse as never);

    const result = await getServerConfig('server-1');

    expect(result).toEqual(mockResponse);
  });
});
