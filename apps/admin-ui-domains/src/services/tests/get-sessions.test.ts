/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getSessions } from '../get-sessions';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('getSessions', () => {
  beforeEach(() => {
    vi.mocked(soapFetch).mockReset();
  });

  it('should call soapFetch with GetSessions passing the session type and default offset', async () => {
    vi.mocked(soapFetch).mockResolvedValue({});

    await getSessions('soap', 'user@example.com');

    expect(soapFetch).toHaveBeenCalledWith(
      'GetSessions',
      {
        _jsns: 'urn:zimbraAdmin',
        type: 'soap',
        offset: 0,
        sortBy: 'nameAsc',
        refresh: 1,
      },
      { otherAccount: 'user@example.com' },
    );
  });

  it('should propagate the offset when provided', async () => {
    vi.mocked(soapFetch).mockResolvedValue({});

    await getSessions('imap', 'user@example.com', 50);

    expect(soapFetch).toHaveBeenCalledWith(
      'GetSessions',
      expect.objectContaining({ type: 'imap', offset: 50 }),
      expect.anything(),
    );
  });

  it('should propagate errors from soapFetch', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    await expect(getSessions('soap', 'a@b.com')).rejects.toThrow('SOAP fault');
  });
});
