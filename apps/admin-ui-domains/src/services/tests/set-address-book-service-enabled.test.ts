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

import { setAddressBookServiceEnabled } from '../set-address-book-service-enabled';

function makeSoapResponse(content: unknown) {
  return { Body: { response: { content: JSON.stringify(content) } } };
}

describe('set-address-book-service-enabled', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call postSoapFetchRequest with set true payload', async () => {
    mockPostSoapFetchRequest.mockResolvedValue(makeSoapResponse({ ok: true, message: 'ok' }));

    await setAddressBookServiceEnabled(true);

    expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
      '/service/admin/soap/zextras',
      expect.objectContaining({
        module: 'ZxConfig',
        action: 'global',
        command: 'set',
        attribute: 'addressBookServiceEnabled',
        value: true,
      }),
      'zextras',
    );
  });

  it('should call postSoapFetchRequest with set false payload', async () => {
    mockPostSoapFetchRequest.mockResolvedValue(makeSoapResponse({ ok: true, message: 'ok' }));

    await setAddressBookServiceEnabled(false);

    expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
      '/service/admin/soap/zextras',
      expect.objectContaining({
        module: 'ZxConfig',
        action: 'global',
        command: 'set',
        attribute: 'addressBookServiceEnabled',
        value: false,
      }),
      'zextras',
    );
  });

  it('should throw when response ok is false', async () => {
    mockPostSoapFetchRequest.mockResolvedValue(
      makeSoapResponse({ ok: false, message: 'set failed' }),
    );

    await expect(setAddressBookServiceEnabled(true)).rejects.toThrow('set failed');
  });
});
