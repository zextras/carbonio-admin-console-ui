/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { getCosQuota } from '../get-cos-quota';

describe('getCosQuota', () => {
  it('should return success with a limited computed limit', async () => {
    createAPIInterceptor('get', '/services/storages/admin/quota/cos/cos-123', () =>
      HttpResponse.json({
        computedLimit: { type: 'limited', value: 10737418240, source: 'cos' },
      }),
    );

    const result = await getCosQuota('cos-123');

    expect(result).toEqual({
      type: 'success',
      totalComputedLimit: { type: 'limited', value: 10737418240, source: 'cos' },
    });
  });

  it('should return success with an unlimited computed limit', async () => {
    createAPIInterceptor('get', '/services/storages/admin/quota/cos/cos-456', () =>
      HttpResponse.json({
        computedLimit: { type: 'unlimited', source: 'global' },
      }),
    );

    const result = await getCosQuota('cos-456');

    expect(result).toEqual({
      type: 'success',
      totalComputedLimit: { type: 'unlimited', source: 'global' },
    });
  });

  it('should return error when the response is not ok', async () => {
    createAPIInterceptor(
      'get',
      '/services/storages/admin/quota/cos/cos-err',
      () => new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' }),
    );

    const result = await getCosQuota('cos-err');

    expect(result).toEqual({
      type: 'error',
      error: 'Internal Server Error',
    });
  });

  it('should send the correct headers', async () => {
    const interceptor = createAPIInterceptor(
      'get',
      '/services/storages/admin/quota/cos/cos-hdr',
      () =>
        HttpResponse.json({
          total: {
            computedLimit: { type: 'unlimited' },
          },
        }),
    );

    await getCosQuota('cos-hdr');

    const lastRequest = interceptor.getLastRequest();
    expect(lastRequest.headers.get('X-API-Version')).toBe('2');
    expect(lastRequest.headers.get('Content-Type')).toBe('application/json');
  });
});
