/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-shared', () => ({
  postSoapFetchRequest: vi.fn(),
}));

import { postSoapFetchRequest } from '@zextras/ui-shared';

import { ZIMBRA_ADMIN_URN } from '../../constants';
import { listBuckets } from '../list-buckets';

describe('listBuckets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls postSoapFetchRequest with the listS3Connector SOAP request', async () => {
    const content = JSON.stringify({ ok: true, response: { values: [] } });
    vi.mocked(postSoapFetchRequest).mockResolvedValue({
      Body: { response: { content } },
    } as never);

    await listBuckets('mail.example.com');

    expect(postSoapFetchRequest).toHaveBeenCalledWith(
      '/service/admin/soap/zextras',
      {
        _jsns: ZIMBRA_ADMIN_URN,
        module: 'ZxPowerstore',
        action: 'listS3Connector',
        targetServer: 'mail.example.com',
        showSecrets: true,
      },
      'zextras',
    );
  });

  it('parses and returns the JSON content from the SOAP response', async () => {
    const buckets = {
      ok: true,
      response: { values: [{ label: 'S3', bucketName: 'b1', uuid: 'u1' }] },
    };
    vi.mocked(postSoapFetchRequest).mockResolvedValue({
      Body: { response: { content: JSON.stringify(buckets) } },
    } as never);

    const result = await listBuckets('srv-1');

    expect(result).toEqual(buckets);
  });
});
