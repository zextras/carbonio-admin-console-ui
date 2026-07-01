/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { setPasswordRequest } from '../set-password';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('setPasswordRequest (account)', () => {
  it('should call soapFetch with SetPassword and the given id and newPassword', async () => {
    vi.mocked(soapFetch).mockResolvedValue({});

    const result = await setPasswordRequest('acc-1', 'new-pwd');

    expect(soapFetch).toHaveBeenCalledWith('SetPassword', {
      _jsns: 'urn:zimbraAdmin',
      id: 'acc-1',
      newPassword: 'new-pwd',
    });
    expect(result).toEqual({});
  });

  it('should propagate errors from soapFetch', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    await expect(setPasswordRequest('acc-1', 'x')).rejects.toThrow('SOAP fault');
  });
});
