/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-shared', () => ({
  fetchExternalSoap: vi.fn(),
}));

import { fetchExternalSoap } from '@zextras/ui-shared';

import { MIGRATE_VOLUME_URL } from '../../constants';
import { migrateVolume } from '../migrate-volume';

describe('migrateVolume', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls fetchExternalSoap with the migrate URL and body', async () => {
    vi.mocked(fetchExternalSoap).mockResolvedValue({ ok: true } as never);

    const body = { storeType: 'S3', volumeRootPath: '/tmp', targetServers: ['srv-1'] };
    await migrateVolume(body);

    expect(fetchExternalSoap).toHaveBeenCalledWith(MIGRATE_VOLUME_URL, body);
  });

  it('returns the response from fetchExternalSoap', async () => {
    const mockResponse = { ok: true, serverId: 'server-1' };
    vi.mocked(fetchExternalSoap).mockResolvedValue(mockResponse as never);

    const result = await migrateVolume({ targetServers: ['srv-1'] });

    expect(result).toEqual(mockResponse);
  });
});
