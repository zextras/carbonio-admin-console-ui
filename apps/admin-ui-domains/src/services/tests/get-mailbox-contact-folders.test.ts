/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it, vi } from 'vitest';

import { getMailboxContactFolders } from '../get-mailbox-contact-folders';

const mockPostSoapFetchRequest = vi.hoisted(() => vi.fn());

vi.mock('@zextras/ui-shared', () => ({
  postSoapFetchRequest: mockPostSoapFetchRequest,
}));

function makeSoapResponse(content: unknown) {
  return { Body: { response: { content: JSON.stringify(content) } } };
}

describe('get-mailbox-contact-folders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return normalized folders when folder list is present', async () => {
    mockPostSoapFetchRequest.mockResolvedValue(
      makeSoapResponse({
        ok: true,
        response: { folders: [{ id: '7', name: 'Work', isShared: true }] },
      }),
    );

    const result = await getMailboxContactFolders({ account: 'alice@example.com' });

    expect(result).toEqual([{ id: '7', name: 'Work', isShared: true }]);
  });

  it('should normalize flat GetMailboxContactFolders payload with numeric ids and mounted', async () => {
    mockPostSoapFetchRequest.mockResolvedValue(
      makeSoapResponse({
        ok: true,
        response: {
          folders: [
            { id: 258, name: '/MyAddressbook of dhaval', mounted: true },
            { id: 259, name: '/Contacts/Sales', mounted: false },
            { id: 7, name: '/Contacts', mounted: false },
          ],
        },
      }),
    );

    const result = await getMailboxContactFolders({ account: 'manan@demo.zextras.io' });

    expect(result).toEqual([
      { id: 258, name: '/MyAddressbook of dhaval', isShared: true },
      { id: 259, name: '/Contacts/Sales', isShared: false },
      { id: 7, name: '/Contacts', isShared: false },
    ]);
  });

  it('should return empty array when folders are absent', async () => {
    mockPostSoapFetchRequest.mockResolvedValue(
      makeSoapResponse({ ok: true, response: {} }),
    );

    const result = await getMailboxContactFolders({ account: 'alice@example.com' });

    expect(result).toEqual([]);
  });

  it('should call postSoapFetchRequest with correct request payload', async () => {
    mockPostSoapFetchRequest.mockResolvedValue(
      makeSoapResponse({ ok: true, response: {} }),
    );

    await getMailboxContactFolders({ account: 'alice@example.com' });

    expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
      '/service/admin/soap/zextras',
      expect.objectContaining({
        module: 'ZxAddressBook',
        action: 'GetMailboxContactFoldersCommand',
        account: 'alice@example.com',
      }),
      'zextras',
    );
    expect(mockPostSoapFetchRequest.mock.calls[0][1]).not.toHaveProperty('targetServers');
  });
});
