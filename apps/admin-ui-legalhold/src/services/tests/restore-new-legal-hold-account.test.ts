/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it, vi } from 'vitest';

import { doRestoreOnNewLegalHoldAccount } from '../restore-new-legal-hold-account';

vi.mock('@zextras/ui-shared', () => ({
  fetchExternalSoap: vi.fn(),
}));

const { fetchExternalSoap } = await import('@zextras/ui-shared');

describe('doRestoreOnNewLegalHoldAccount', () => {
  it('should call fetchExternalSoap with the restore URL and body', async () => {
    vi.mocked(fetchExternalSoap).mockResolvedValue({ operationId: 'op-1' });

    await doRestoreOnNewLegalHoldAccount(
      'src-id',
      'prefix_admin@test.com',
      1700000000000,
      null,
      false,
      'mailstore1.test.com',
    );

    expect(fetchExternalSoap).toHaveBeenCalledWith(
      '/service/extension/zextras_admin/backup/doRestoreOnNewAccount?targetServers=mailstore1.test.com',
      {
        srcAccountName: 'src-id',
        dstAccountName: 'prefix_admin@test.com',
        date: 1700000000000,
        undelete: false,
        undeleteStartDate: null,
      },
    );
  });

  it('should return success with the operation id', async () => {
    vi.mocked(fetchExternalSoap).mockResolvedValue({ operationId: 'op-1' });

    const result = await doRestoreOnNewLegalHoldAccount(
      'src-id',
      'dst',
      1,
      null,
      false,
      'server',
    );

    expect(result).toEqual({ type: 'success', operationId: 'op-1' });
  });

  it('should return error when the raw response contains an error', async () => {
    vi.mocked(fetchExternalSoap).mockResolvedValue({ error: { message: 'Restore failed' } });

    const result = await doRestoreOnNewLegalHoldAccount(
      'src-id',
      'dst',
      1,
      null,
      false,
      'server',
    );

    expect(result).toEqual({ type: 'error', error: 'Restore failed' });
  });

  it('should parse a nested body response for the operation id', async () => {
    vi.mocked(fetchExternalSoap).mockResolvedValue({
      Body: { response: { content: JSON.stringify({ response: { operationId: 'op-nested' } }) } },
    });

    const result = await doRestoreOnNewLegalHoldAccount(
      'src-id',
      'dst',
      1,
      null,
      false,
      'server',
    );

    expect(result).toEqual({ type: 'success', operationId: 'op-nested' });
  });

  it('should return error when no operation id is present', async () => {
    vi.mocked(fetchExternalSoap).mockResolvedValue({});

    const result = await doRestoreOnNewLegalHoldAccount(
      'src-id',
      'dst',
      1,
      null,
      false,
      'server',
    );

    expect(result).toEqual({ type: 'error', error: 'No operationId returned' });
  });

  it('should return error when fetchExternalSoap rejects', async () => {
    vi.mocked(fetchExternalSoap).mockRejectedValue(new Error('Network error'));

    const result = await doRestoreOnNewLegalHoldAccount(
      'src-id',
      'dst',
      1,
      null,
      false,
      'server',
    );

    expect(result).toEqual({ type: 'error', error: 'Network error' });
  });
});
