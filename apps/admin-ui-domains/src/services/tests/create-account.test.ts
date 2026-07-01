/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAccountRequest } from '../create-account';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('createAccountRequest', () => {
  beforeEach(() => {
    vi.mocked(soapFetch).mockReset();
  });

  it('should call soapFetch with CreateAccount, the name, password and attribute list', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [] });

    await createAccountRequest(
      { displayName: 'John', zimbraIsAdminAccount: 'FALSE' },
      'john@example.com',
      'secret',
    );

    expect(soapFetch).toHaveBeenCalledWith('CreateAccount', {
      _jsns: 'urn:zimbraAdmin',
      name: 'john@example.com',
      password: 'secret',
      a: [
        { n: 'displayName', _content: 'John' },
        { n: 'zimbraIsAdminAccount', _content: 'FALSE' },
      ],
    });
  });

  it('should stringify non-string attribute values', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [] });

    await createAccountRequest({ zimbraMailQuota: 1024 }, 'a@b.com', 'pwd');

    expect(soapFetch).toHaveBeenCalledWith(
      'CreateAccount',
      expect.objectContaining({
        a: [{ n: 'zimbraMailQuota', _content: '1024' }],
      }),
    );
  });

  it('should omit the password field when password is empty', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [] });

    await createAccountRequest({}, 'nopwd@example.com', '');

    const [, payload] = vi.mocked(soapFetch).mock.calls[0];
    expect(payload).not.toHaveProperty('password');
    expect(payload).toMatchObject({
      _jsns: 'urn:zimbraAdmin',
      name: 'nopwd@example.com',
      a: [],
    });
  });

  it('should return the account response from soapFetch', async () => {
    const response = { account: [{ id: 'new-1', name: 'a@b.com' }] };
    vi.mocked(soapFetch).mockResolvedValue(response);

    const result = await createAccountRequest({}, 'a@b.com', 'x');

    expect(result).toEqual(response);
  });

  it('should propagate errors from soapFetch', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    await expect(createAccountRequest({}, 'a@b.com', 'x')).rejects.toThrow('SOAP fault');
  });
});
