/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { unsetCosQuota } from '../unset-cos-quota';

describe('unsetCosQuota', () => {
  it('should return success when unsetting the quota', async () => {
    createAPIInterceptor('delete', '/services/storages/admin/quota/config/cos/cos-123', () =>
      new HttpResponse(null, { status: 200 }),
    );

    const result = await unsetCosQuota('cos-123');

    expect(result).toEqual({ type: 'success' });
  });

  it('should return error when the response is not ok', async () => {
    createAPIInterceptor('delete', '/services/storages/admin/quota/config/cos/cos-err', () =>
      new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' }),
    );

    const result = await unsetCosQuota('cos-err');

    expect(result).toEqual({
      type: 'error',
      error: 'Internal Server Error',
    });
  });

  it('should send the correct headers', async () => {
    const interceptor = createAPIInterceptor(
      'delete',
      '/services/storages/admin/quota/config/cos/cos-hdr',
      () => new HttpResponse(null, { status: 200 }),
    );

    await unsetCosQuota('cos-hdr');

    const lastRequest = interceptor.getLastRequest();
    expect(lastRequest.headers.get('X-API-Version')).toBe('2');
    expect(lastRequest.headers.get('Content-Type')).toBe('application/json');
  });
});
