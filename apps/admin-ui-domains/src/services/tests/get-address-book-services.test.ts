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

import { getAddressBookServices, parseAddressBookServiceStatus } from '../get-address-book-services';

function makeSoapResponse(content: unknown) {
  return { Body: { response: { content: JSON.stringify(content) } } };
}

describe('get-address-book-services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse service status from SOAP response', () => {
    const response = makeSoapResponse({
      ok: true,
      response: {
        services: {
          'ldap-address-book': {
            running: true,
            could_start: false,
            could_stop: true,
          },
        },
      },
    });

    expect(parseAddressBookServiceStatus(response as any)).toEqual({
      running: true,
      couldStart: false,
      couldStop: true,
    });
  });

  it('should return false for missing content', async () => {
    mockPostSoapFetchRequest.mockResolvedValue({ Body: {} });

    const result = await getAddressBookServices();

    expect(result).toEqual({ running: false, couldStart: false, couldStop: false });
  });

  it('should forward SOAP fault as an error', async () => {
    mockPostSoapFetchRequest.mockResolvedValue({
      Body: {
        Fault: { Reason: { Text: 'Service error' } },
      },
    });

    await expect(getAddressBookServices()).rejects.toThrow('Service error');
  });

  it('should call postSoapFetchRequest with correct getServices payload', async () => {
    mockPostSoapFetchRequest.mockResolvedValue(
      makeSoapResponse({ ok: true, response: { services: {} } }),
    );

    await getAddressBookServices();

    expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
      '/service/admin/soap/zextras',
      expect.objectContaining({
        module: 'ZxAddressBook',
        action: 'getServices',
      }),
      'zextras',
    );
    expect(mockPostSoapFetchRequest.mock.calls[0][1]).not.toHaveProperty('targetServers');
  });
});
