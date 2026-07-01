/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { DISPLAYNAME } from '../../constants';
import { getAccountMembershipRequest } from '../get-account-membership';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('getAccountMembershipRequest', () => {
  it('should call soapFetch with GetAccountMembership and the given id with the default attrs', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ dl: [] });

    const result = await getAccountMembershipRequest('acc-1');

    expect(soapFetch).toHaveBeenCalledWith('GetAccountMembership', {
      _jsns: 'urn:zimbraAdmin',
      attrs: DISPLAYNAME,
      account: [{ _content: 'acc-1', by: 'id' }],
    });
    expect(result).toEqual({ dl: [] });
  });

  it('should use the given attrs when provided', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ dl: [] });

    await getAccountMembershipRequest('acc-1', 'displayName,zimbraId');

    expect(soapFetch).toHaveBeenCalledWith(
      'GetAccountMembership',
      expect.objectContaining({ attrs: 'displayName,zimbraId' }),
    );
  });

  it('should propagate errors from soapFetch', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    await expect(getAccountMembershipRequest('acc-1')).rejects.toThrow('SOAP fault');
  });
});
