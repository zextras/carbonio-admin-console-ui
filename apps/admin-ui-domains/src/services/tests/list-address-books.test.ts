/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it, vi } from 'vitest';

import { listAddressBooks, normalizeAddressBookFolders } from '../list-address-books';

const mockPostSoapFetchRequest = vi.hoisted(() => vi.fn());

vi.mock('@zextras/ui-shared', () => ({
  postSoapFetchRequest: mockPostSoapFetchRequest,
}));

type SoapResponse = {
  Body?: { response?: { content?: string }; Fault?: { Reason?: { Text?: string } } };
};

function makeSoapResponse(content: unknown): SoapResponse {
  return { Body: { response: { content: JSON.stringify(content) } } };
}

describe('list-address-books', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('normalizeAddressBookFolders', () => {
    it('should normalize explicit folder objects', () => {
      expect(
        normalizeAddressBookFolders('7', [
          { id: '7', name: '/Contacts/Work', isShared: true },
        ]),
      ).toEqual([{ id: '7', name: '/Contacts/Work', isShared: true }]);
    });

    it('should normalize folderIds string when folders are absent', () => {
      expect(normalizeAddressBookFolders('all,7')).toEqual([
        { id: 'all', name: 'all', isShared: false },
        { id: '7', name: '7', isShared: false },
      ]);
    });

    it('should return an empty array for missing folderIds and folders', () => {
      expect(normalizeAddressBookFolders(undefined, undefined)).toEqual([]);
    });
  });

  describe('listAddressBooks', () => {
    it('should return entries when server responds with address books', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(
        makeSoapResponse({
          ok: true,
          response: {
            'address books': [
              {
                account: 'alice@example.com',
                accountId: 'acc-1',
                folderIds: 'all',
              },
            ],
          },
        }),
      );

      const books = await listAddressBooks({ domain: 'example.com' });

      expect(books).toEqual([
        {
          account: 'alice@example.com',
          accountId: 'acc-1',
          folderIds: 'all',
          folders: [{ id: 'all', name: 'all', isShared: false }],
        },
      ]);
    });

    it('should return an empty array when response has no address books', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(
        makeSoapResponse({ ok: true, response: {} }),
      );

      const books = await listAddressBooks({ domain: 'example.com' });

      expect(books).toEqual([]);
    });

    it('should return an empty array when address books are not an array', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(
        makeSoapResponse({ ok: true, response: { 'address books': {} } }),
      );

      const books = await listAddressBooks({ domain: 'example.com' });

      expect(books).toEqual([]);
    });

    it('should call postSoapFetchRequest with the correct payload', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(
        makeSoapResponse({ ok: true, response: {} }),
      );

      await listAddressBooks({ domain: 'example.com' });

      expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
        '/service/admin/soap/zextras',
        expect.objectContaining({
          module: 'ZxAddressBook',
          action: 'ListAddressBookCommand',
          domain: 'example.com',
        }),
        'zextras',
      );
      expect(mockPostSoapFetchRequest.mock.calls[0][1]).not.toHaveProperty('targetServers');
    });
  });
});
