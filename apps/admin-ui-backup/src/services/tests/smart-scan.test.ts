/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-shared', () => ({
  fetchExternalSoap: vi.fn(),
}));

import { fetchExternalSoap } from '@zextras/ui-shared';

import { SMART_SCAN_URL } from '../../constants';
import { triggerSmartScan } from '../smart-scan';

describe('triggerSmartScan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls fetchExternalSoap with the smart scan URL and server', async () => {
    vi.mocked(fetchExternalSoap).mockResolvedValue({ ok: true } as never);

    await triggerSmartScan('mail.example.com');

    expect(fetchExternalSoap).toHaveBeenCalledWith(
      SMART_SCAN_URL,
      { targetServers: ['mail.example.com'] },
    );
  });

  it('returns the response from fetchExternalSoap', async () => {
    const mockResponse = { ok: true, serverId: 'server-1' };
    vi.mocked(fetchExternalSoap).mockResolvedValue(mockResponse as never);

    const result = await triggerSmartScan('mail.example.com');

    expect(result).toEqual(mockResponse);
  });
});
