/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it, vi } from 'vitest';

import { getAccount } from '../get-account';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('getAccount', () => {
  it('should call soapFetch with GetAccount by name', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [] });

    await getAccount('prefix_admin@test.com');

    expect(soapFetch).toHaveBeenCalledWith('GetAccount', {
      _jsns: 'urn:zimbraAdmin',
      account: { by: 'name', _content: 'prefix_admin@test.com' },
    });
  });

  it('should return the first account on success', async () => {
    const account = { id: 'acc-1', name: 'prefix_admin@test.com', a: [] };
    vi.mocked(soapFetch).mockResolvedValue({ account: [account] });

    const result = await getAccount('prefix_admin@test.com');

    expect(result).toEqual({ type: 'success', account });
  });

  it('should return a null account when none is present', async () => {
    vi.mocked(soapFetch).mockResolvedValue({});

    const result = await getAccount('missing@test.com');

    expect(result).toEqual({ type: 'success', account: null });
  });

  it('should return error when soapFetch rejects', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('Not found'));

    const result = await getAccount('missing@test.com');

    expect(result).toEqual({ type: 'error', error: 'Not found' });
  });
});
