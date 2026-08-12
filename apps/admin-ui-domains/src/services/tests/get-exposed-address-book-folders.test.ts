/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it, vi } from 'vitest';

const mockPostSoapFetchRequest = vi.hoisted(() => vi.fn());

vi.mock('@zextras/ui-shared', () => ({
  postSoapFetchRequest: mockPostSoapFetchRequest,
}));

import {
  getAddressBookFolders,
  getExposedAddressBookFolders,
  getUnexposedAddressBookFolders,
  parseAddressBookFolders,
} from '../get-exposed-address-book-folders';

function makeSoapResponse(content: unknown) {
  return { Body: { response: { content: JSON.stringify(content) } } };
}

describe('get-exposed-address-book-folders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseAddressBookFolders', () => {
    it('should parse folders for the matching account from nested payload', () => {
      expect(
        parseAddressBookFolders(
          {
            folders: [
              {
                account: 'soner@test.com',
                accountId: 'acc-1',
                folders: [{ id: 'all', name: 'all', mounted: false }],
              },
            ],
          },
          'soner@test.com',
        ),
      ).toEqual([{ id: 'all', name: 'all', isShared: false }]);
    });

    it('should parse flat folder arrays', () => {
      expect(
        parseAddressBookFolders(
          {
            folders: [
              { id: 7, name: '/Contacts/Work', mounted: false },
              { id: 258, name: '/MyAddressbook of dhaval', mounted: true },
            ],
          },
          'alice@example.com',
        ),
      ).toEqual([
        { id: 7, name: '/Contacts/Work', isShared: false },
        { id: 258, name: '/MyAddressbook of dhaval', isShared: true },
      ]);
    });

    it('should return an empty array when account folders are missing', () => {
      expect(parseAddressBookFolders({ folders: [] }, 'alice@example.com')).toEqual([]);
    });
  });

  it('should call GetAddressBookCommand with exposed true', async () => {
    mockPostSoapFetchRequest.mockResolvedValue(
      makeSoapResponse({
        ok: true,
        nested: true,
        response: {
          'mail1.example.com': {
            ok: true,
            response: {
              folders: [
                {
                  account: 'alice@example.com',
                  accountId: 'acc-1',
                  folders: [{ id: '7', name: '/Contacts/Work', mounted: false }],
                },
              ],
            },
          },
        },
      }),
    );

    const folders = await getExposedAddressBookFolders({
      domain: 'example.com',
      account: 'alice@example.com',
    });

    expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
      '/service/admin/soap/zextras',
      expect.objectContaining({
        module: 'ZxAddressBook',
        action: 'GetAddressBookCommand',
        class: 'domain',
        domain: 'example.com',
        account: 'alice@example.com',
        exposed: true,
      }),
      'zextras',
    );
    expect(folders).toEqual([{ id: '7', name: '/Contacts/Work', isShared: false }]);
  });

  it('should call GetAddressBookCommand with exposed false for unexposed folders', async () => {
    mockPostSoapFetchRequest.mockResolvedValue(
      makeSoapResponse({
        ok: true,
        nested: true,
        response: {
          'dt1-single-srv1.demo.zextras.io': {
            ok: true,
            response: {
              folders: [
                {
                  account: 'soner@test.com',
                  accountId: '9b191b15-9ee5-4a0e-a8ea-a066f74736e4',
                  folders: [
                    { id: 7, name: '/Contacts', mounted: false },
                    { id: 13, name: '/Emailed Contacts', mounted: false },
                  ],
                },
              ],
            },
          },
        },
      }),
    );

    const folders = await getUnexposedAddressBookFolders({
      domain: 'demo.zextras.io',
      account: 'soner@test.com',
    });

    expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
      '/service/admin/soap/zextras',
      expect.objectContaining({
        module: 'ZxAddressBook',
        action: 'GetAddressBookCommand',
        class: 'domain',
        domain: 'demo.zextras.io',
        account: 'soner@test.com',
        exposed: false,
      }),
      'zextras',
    );
    expect(folders).toEqual([
      { id: 7, name: '/Contacts', isShared: false },
      { id: 13, name: '/Emailed Contacts', isShared: false },
    ]);
  });

  it('should pass exposed flag through getAddressBookFolders', async () => {
    mockPostSoapFetchRequest.mockResolvedValue(
      makeSoapResponse({
        ok: true,
        response: { folders: [] },
      }),
    );

    await getAddressBookFolders({
      domain: 'example.com',
      account: 'alice@example.com',
      exposed: false,
    });

    expect(mockPostSoapFetchRequest.mock.calls[0][1]).toMatchObject({ exposed: false });
  });

  it('should parse flat GetAddressBookCommand response', async () => {
    mockPostSoapFetchRequest.mockResolvedValue(
      makeSoapResponse({
        ok: true,
        response: {
          folders: [{ id: 7, name: '/Contacts/Work', mounted: false }],
        },
      }),
    );

    const folders = await getExposedAddressBookFolders({
      domain: 'example.com',
      account: 'alice@example.com',
    });

    expect(folders).toEqual([{ id: 7, name: '/Contacts/Work', isShared: false }]);
  });

  it('should return empty array for flat response with empty folders', async () => {
    mockPostSoapFetchRequest.mockResolvedValue(
      makeSoapResponse({
        ok: true,
        response: { folders: [] },
      }),
    );

    const folders = await getExposedAddressBookFolders({
      domain: 'example.com',
      account: 'alice@example.com',
    });

    expect(folders).toEqual([]);
  });

  it('should throw when nested server ok is false', async () => {
    mockPostSoapFetchRequest.mockResolvedValue(
      makeSoapResponse({
        ok: true,
        nested: true,
        response: {
          'mail1.example.com': {
            ok: false,
            message: 'Get failed',
          },
        },
      }),
    );

    await expect(
      getExposedAddressBookFolders({
        domain: 'example.com',
        account: 'alice@example.com',
      }),
    ).rejects.toThrow('Get failed');
  });
});
