/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { endSession } from '../end-session';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('endSession', () => {
  it('should call soapFetch with EndSession and the session logoff payload', async () => {
    vi.mocked(soapFetch).mockResolvedValue({});

    const result = await endSession('session-1', 'user@example.com', 'auth-token');

    expect(soapFetch).toHaveBeenCalledWith(
      'EndSession',
      {
        _jsns: 'urn:zimbraAccount',
        sessionId: 'session-1',
        logoff: 1,
        all: 0,
        excludeCurrent: 0,
      },
      {
        otherAccount: 'user@example.com',
        authToken: 'auth-token',
        noSession: true,
      },
    );
    expect(result).toEqual({});
  });

  it('should propagate errors from soapFetch', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    await expect(endSession('s', 'a@b.com', 't')).rejects.toThrow('SOAP fault');
  });
});
