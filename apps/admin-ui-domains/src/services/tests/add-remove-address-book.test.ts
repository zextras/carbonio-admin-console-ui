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

import { addAddressBook } from '../add-address-book';
import { removeAddressBook } from '../remove-address-book';

function makeSoapResponse(content: unknown) {
  return { Body: { response: { content: JSON.stringify(content) } } };
}

describe('address book mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call addAddressBook with correct SOAP payload', async () => {
    mockPostSoapFetchRequest.mockResolvedValue(makeSoapResponse({ ok: true, response: {} }));

    await addAddressBook({
      domain: 'example.com',
      account: 'alice@example.com',
      folder: 'all',
    });

    expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
      '/service/admin/soap/zextras',
      expect.objectContaining({
        module: 'ZxAddressBook',
        action: 'AddAddressBookCommand',
        domain: 'example.com',
        account: 'alice@example.com',
        folder: 'all',
      }),
      'zextras',
    );
    expect(mockPostSoapFetchRequest.mock.calls[0][1]).not.toHaveProperty('targetServers');
  });

  it('should call removeAddressBook with correct SOAP payload', async () => {
    mockPostSoapFetchRequest.mockResolvedValue(makeSoapResponse({ ok: true, response: {} }));

    await removeAddressBook({
      domain: 'example.com',
      account: 'alice@example.com',
      folder: '7',
    });

    expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
      '/service/admin/soap/zextras',
      expect.objectContaining({
        module: 'ZxAddressBook',
        action: 'RemoveAddressBookCommand',
        domain: 'example.com',
        account: 'alice@example.com',
        folder: '7',
      }),
      'zextras',
    );
    expect(mockPostSoapFetchRequest.mock.calls[0][1]).not.toHaveProperty('targetServers');
  });

  it('should throw when addAddressBook response is not ok', async () => {
    mockPostSoapFetchRequest.mockResolvedValue(
      makeSoapResponse({ ok: false, message: 'Add failed' }),
    );

    await expect(
      addAddressBook({
        domain: 'example.com',
        account: 'alice@example.com',
        folder: 'all',
      }),
    ).rejects.toThrow('Add failed');
  });

  it('should throw when removeAddressBook response is not ok', async () => {
    mockPostSoapFetchRequest.mockResolvedValue(
      makeSoapResponse({ ok: false, message: 'Remove failed' }),
    );

    await expect(
      removeAddressBook({
        domain: 'example.com',
        account: 'alice@example.com',
        folder: '7',
      }),
    ).rejects.toThrow('Remove failed');
  });
});
