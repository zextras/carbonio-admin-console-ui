/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { doRestoreDeleteAccount } from '../restore-delete-account-service';

vi.mock('@zextras/ui-shared', () => ({
  fetchExternalSoap: vi.fn(),
}));

const { fetchExternalSoap } = await import('@zextras/ui-shared');

describe('doRestoreDeleteAccount', () => {
  it('should call fetchExternalSoap with the correct URL and spread the data payload', async () => {
    vi.mocked(fetchExternalSoap).mockResolvedValue({ operationId: 'op-1', status: 200 });

    const payload = { accountId: 'acc-1', newName: 'restored@example.com' };
    const result = await doRestoreDeleteAccount(payload, 'server-a,server-b');

    expect(fetchExternalSoap).toHaveBeenCalledWith(
      '/service/extension/zextras_admin/backup/doRestoreOnNewAccount?targetServers=server-a%2Cserver-b',
      payload,
    );
    expect(result).toEqual({ operationId: 'op-1', status: 200 });
  });

  it('should URL-encode the targetServers query param', async () => {
    vi.mocked(fetchExternalSoap).mockResolvedValue({});

    await doRestoreDeleteAccount({}, 'server one');

    expect(fetchExternalSoap).toHaveBeenCalledWith(
      '/service/extension/zextras_admin/backup/doRestoreOnNewAccount?targetServers=server%20one',
      expect.anything(),
    );
  });

  it('should propagate errors from fetchExternalSoap', async () => {
    vi.mocked(fetchExternalSoap).mockRejectedValue(new Error('REST fault'));

    await expect(doRestoreDeleteAccount({}, 'srv')).rejects.toThrow('REST fault');
  });
});
