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

import { PURGE_BACKUP_URL } from '../../constants';
import { triggerBackupPurge } from '../purge-backup';

describe('triggerBackupPurge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls fetchExternalSoap with the purge URL and server', async () => {
    vi.mocked(fetchExternalSoap).mockResolvedValue({ ok: true } as never);

    await triggerBackupPurge('mail.example.com');

    expect(fetchExternalSoap).toHaveBeenCalledWith(
      PURGE_BACKUP_URL,
      { targetServers: ['mail.example.com'] },
    );
  });

  it('returns the response from fetchExternalSoap', async () => {
    const mockResponse = { ok: true };
    vi.mocked(fetchExternalSoap).mockResolvedValue(mockResponse as never);

    const result = await triggerBackupPurge('mail.example.com');

    expect(result).toEqual(mockResponse);
  });
});
