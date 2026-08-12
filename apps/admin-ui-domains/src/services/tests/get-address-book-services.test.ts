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

  it('should parse running status from inheritedValue when isInherited is true', () => {
    const response = makeSoapResponse({
      ok: true,
      response: {
        values: [
          {
            attribute: 'addressBookServiceEnabled',
            inheritedValue: true,
            inheritedFrom: 'default',
            isInherited: true,
            modules: ['ZxAddressBook'],
          },
        ],
      },
    });

    expect(parseAddressBookServiceStatus(response)).toEqual({
      running: true,
      couldStart: false,
      couldStop: true,
    });
  });

  it('should parse stopped status from inheritedValue when isInherited is true', () => {
    const response = makeSoapResponse({
      ok: true,
      response: {
        values: [
          {
            attribute: 'addressBookServiceEnabled',
            inheritedValue: false,
            isInherited: true,
          },
        ],
      },
    });

    expect(parseAddressBookServiceStatus(response)).toEqual({
      running: false,
      couldStart: true,
      couldStop: false,
    });
  });

  it('should parse running status from value when isInherited is false', () => {
    const response = makeSoapResponse({
      ok: true,
      response: {
        values: [
          {
            attribute: 'addressBookServiceEnabled',
            value: true,
            isInherited: false,
            modules: ['ZxAddressBook'],
          },
        ],
      },
    });

    expect(parseAddressBookServiceStatus(response)).toEqual({
      running: true,
      couldStart: false,
      couldStop: true,
    });
  });

  it('should parse stopped status from value when isInherited is false', () => {
    const response = makeSoapResponse({
      ok: true,
      response: {
        values: [
          {
            attribute: 'addressBookServiceEnabled',
            value: false,
            isInherited: false,
          },
        ],
      },
    });

    expect(parseAddressBookServiceStatus(response)).toEqual({
      running: false,
      couldStart: true,
      couldStop: false,
    });
  });

  it('should return false flags for missing content', async () => {
    mockPostSoapFetchRequest.mockResolvedValue({ Body: {} });

    const result = await getAddressBookServices();

    expect(result).toEqual({ running: false, couldStart: true, couldStop: false });
  });

  it('should forward SOAP fault as an error', async () => {
    mockPostSoapFetchRequest.mockResolvedValue({
      Body: {
        Fault: { Reason: { Text: 'Service error' } },
      },
    });

    await expect(getAddressBookServices()).rejects.toThrow('Service error');
  });

  it('should call postSoapFetchRequest with addressBookServiceEnabled get payload', async () => {
    mockPostSoapFetchRequest.mockResolvedValue(
      makeSoapResponse({
        ok: true,
        response: {
          values: [
            {
              attribute: 'addressBookServiceEnabled',
              value: true,
              isInherited: false,
            },
          ],
        },
      }),
    );

    await getAddressBookServices();

    expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
      '/service/admin/soap/zextras',
      expect.objectContaining({
        module: 'ZxConfig',
        action: 'global',
        command: 'get',
        attribute: 'addressBookServiceEnabled',
      }),
      'zextras',
    );
  });
});
