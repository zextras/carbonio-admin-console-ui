/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it, vi } from 'vitest';

import { grantFolderPermission, grantFolderPermissions } from '../grant-folder-permission';

vi.mock('@zextras/ui-shared', () => ({
  postSoapFetchRequest: vi.fn(),
}));

const { postSoapFetchRequest } = await import('@zextras/ui-shared');

const account = { id: 'usr-1', name: 'lawyer@test.com', a: [], type: 'usr' };

describe('grantFolderPermission', () => {
  it('should call postSoapFetchRequest with a folder grant on the target account', async () => {
    vi.mocked(postSoapFetchRequest).mockResolvedValue({});

    const result = await grantFolderPermission(account, 'restored-id');

    expect(postSoapFetchRequest).toHaveBeenCalledWith(
      '/service/admin/soap/FolderActionRequest',
      {
        _jsns: 'urn:zimbraMail',
        action: {
          op: 'grant',
          id: '1',
          grant: {
            perm: 'r',
            gt: 'usr',
            d: 'lawyer@test.com',
            pw: '',
          },
        },
      },
      'FolderActionRequest',
      'restored-id',
    );
    expect(result).toEqual({ type: 'success' });
  });

  it('should default the grant type to usr when the account has no type', async () => {
    vi.mocked(postSoapFetchRequest).mockResolvedValue({});

    await grantFolderPermission({ id: 'a', name: 'a@test.com', a: [] }, 'target');

    expect(postSoapFetchRequest).toHaveBeenCalledWith(
      '/service/admin/soap/FolderActionRequest',
      expect.objectContaining({
        action: expect.objectContaining({
          grant: expect.objectContaining({ gt: 'usr' }),
        }),
      }),
      'FolderActionRequest',
      'target',
    );
  });

  it('should return error when postSoapFetchRequest rejects', async () => {
    vi.mocked(postSoapFetchRequest).mockRejectedValue(new Error('Grant failed'));

    const result = await grantFolderPermission(account, 'restored-id');

    expect(result).toEqual({ type: 'error', error: 'Grant failed' });
  });
});

describe('grantFolderPermissions', () => {
  it('should grant permission for each account', async () => {
    vi.mocked(postSoapFetchRequest).mockResolvedValue({});
    const second = { id: 'dl-1', name: 'team@test.com', a: [], type: 'grp' };

    const result = await grantFolderPermissions([account, second], 'restored-id');

    expect(postSoapFetchRequest).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ type: 'success' });
  });

  it('should return the first error when any grant fails', async () => {
    vi.mocked(postSoapFetchRequest)
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('Second grant failed'));

    const result = await grantFolderPermissions(
      [account, { id: 'dl-1', name: 'team@test.com', a: [], type: 'grp' }],
      'restored-id',
    );

    expect(result).toEqual({ type: 'error', error: 'Second grant failed' });
  });
});
