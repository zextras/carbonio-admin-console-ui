/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { createCos } from '../create-cos';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('createCos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should call soapFetch with CreateCos and name only', async () => {
    const mockResponse = {
      cos: [{ id: 'cos-1', name: 'test-cos' }],
    };
    vi.mocked(soapFetch).mockResolvedValue(mockResponse);

    const result = await createCos('test-cos');

    expect(soapFetch).toHaveBeenCalledWith('CreateCos', {
      _jsns: 'urn:zimbraAdmin',
      name: { _content: 'test-cos' },
    });
    expect(result).toEqual(mockResponse);
  });

  it('should call soapFetch with name and attributes', async () => {
    const mockResponse = {
      cos: [{ id: 'cos-2', name: 'my-cos' }],
    };
    const attributes = [
      { n: 'zimbraPrefLocale', _content: 'en_US' },
      { n: 'zimbraPrefTimeZoneId', _content: 'America/New_York' },
    ];
    vi.mocked(soapFetch).mockResolvedValue(mockResponse);

    const result = await createCos('my-cos', attributes);

    expect(soapFetch).toHaveBeenCalledWith('CreateCos', {
      _jsns: 'urn:zimbraAdmin',
      name: { _content: 'my-cos' },
      a: attributes,
    });
    expect(result).toEqual(mockResponse);
  });

  it('should include attributes with the c flag', async () => {
    const mockResponse = {
      cos: [{ id: 'cos-3', name: 'flagged-cos' }],
    };
    const attributes = [{ n: 'zimbraFeatureMailForwardingEnabled', _content: 'TRUE', c: true }];
    vi.mocked(soapFetch).mockResolvedValue(mockResponse);

    const result = await createCos('flagged-cos', attributes);

    expect(soapFetch).toHaveBeenCalledWith('CreateCos', {
      _jsns: 'urn:zimbraAdmin',
      name: { _content: 'flagged-cos' },
      a: attributes,
    });
    expect(result).toEqual(mockResponse);
  });

  it('should omit name from request when name is empty string', async () => {
    const mockResponse = { cos: [] };
    vi.mocked(soapFetch).mockResolvedValue(mockResponse);

    const result = await createCos('');

    expect(soapFetch).toHaveBeenCalledWith('CreateCos', {
      _jsns: 'urn:zimbraAdmin',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should omit a from request when attributes are not provided', async () => {
    const mockResponse = {
      cos: [{ id: 'cos-4', name: 'no-attrs' }],
    };
    vi.mocked(soapFetch).mockResolvedValue(mockResponse);

    const result = await createCos('no-attrs');

    expect(soapFetch).toHaveBeenCalledWith('CreateCos', {
      _jsns: 'urn:zimbraAdmin',
      name: { _content: 'no-attrs' },
    });
    expect(result).toEqual(mockResponse);
  });

  it('should include a in request when attributes is an empty array', async () => {
    const mockResponse = { cos: [] };
    vi.mocked(soapFetch).mockResolvedValue(mockResponse);

    const result = await createCos('empty-attrs', []);

    expect(soapFetch).toHaveBeenCalledWith('CreateCos', {
      _jsns: 'urn:zimbraAdmin',
      name: { _content: 'empty-attrs' },
      a: [],
    });
    expect(result).toEqual(mockResponse);
  });

  it('should call soapFetch exactly once per invocation', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

    await createCos('once');

    expect(soapFetch).toHaveBeenCalledTimes(1);
  });

  it('should propagate errors from soapFetch', async () => {
    const error = new Error('SOAP fault');
    vi.mocked(soapFetch).mockRejectedValue(error);

    await expect(createCos('error-cos')).rejects.toThrow('SOAP fault');
  });
});
