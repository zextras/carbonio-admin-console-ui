/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it, vi } from 'vitest';

import { setUnsetLegalHold } from '../set-unset-legalhold';

vi.mock('@zextras/ui-shared', () => ({
  fetchExternalSoap: vi.fn(),
}));

const { fetchExternalSoap } = await import('@zextras/ui-shared');

describe('setUnsetLegalHold', () => {
  it('should call fetchExternalSoap with the legal hold URL and body', async () => {
    vi.mocked(fetchExternalSoap).mockResolvedValue({ accounts: [] });

    await setUnsetLegalHold('set', 'acc-1', 'mailstore1.test.com');

    expect(fetchExternalSoap).toHaveBeenCalledWith(
      '/service/extension/zextras_admin/backup/legalHold?targetServers=mailstore1.test.com',
      {
        ui: true,
        command: 'set',
        accounts: 'acc-1',
      },
    );
  });

  it('should return success with extracted accounts', async () => {
    const accounts = [
      {
        id: 'acc-1',
        name: 'admin@test.com',
        status: 'active',
        legalHold: 'true',
        serverName: 'mailstore1.test.com',
        creationTimestamp: 1,
      },
    ];
    vi.mocked(fetchExternalSoap).mockResolvedValue({ accounts });

    const result = await setUnsetLegalHold('set', 'acc-1', 'mailstore1.test.com');

    expect(result).toEqual({ type: 'success', accounts });
  });

  it('should return error when fetchExternalSoap rejects', async () => {
    vi.mocked(fetchExternalSoap).mockRejectedValue(new Error('SOAP fault'));

    const result = await setUnsetLegalHold('unset', 'acc-1', 'mailstore1.test.com');

    expect(result).toEqual({ type: 'error', error: 'SOAP fault' });
  });
});
