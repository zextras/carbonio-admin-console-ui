/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { setPasswordRequest } from '../set-password-service';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('setPasswordRequest (resource)', () => {
  it('should call soapFetch with SetPassword and the given resource id and password', async () => {
    vi.mocked(soapFetch).mockResolvedValue({});

    const result = await setPasswordRequest('res-1', 'new-pwd');

    expect(soapFetch).toHaveBeenCalledWith('SetPassword', {
      _jsns: 'urn:zimbraAdmin',
      id: 'res-1',
      newPassword: 'new-pwd',
    });
    expect(result).toEqual({});
  });

  it('should send an undefined newPassword when omitted by the caller', async () => {
    vi.mocked(soapFetch).mockResolvedValue({});

    await setPasswordRequest('res-1');

    expect(soapFetch).toHaveBeenCalledWith('SetPassword', {
      _jsns: 'urn:zimbraAdmin',
      id: 'res-1',
      newPassword: undefined,
    });
  });

  it('should propagate errors from soapFetch', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    await expect(setPasswordRequest('res-1', 'x')).rejects.toThrow('SOAP fault');
  });
});
