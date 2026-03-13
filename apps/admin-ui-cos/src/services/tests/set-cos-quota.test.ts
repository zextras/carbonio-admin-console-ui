/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { setCosQuota } from '../set-cos-quota';

describe('setCosQuota', () => {
  it('should return success when setting a limited quota', async () => {
    createAPIInterceptor('put', '/services/storages/admin/quota/config/cos/cos-123', () =>
      new HttpResponse(null, { status: 200 }),
    );

    const result = await setCosQuota('cos-123', { type: 'limited', value: 10737418240 });

    expect(result).toEqual({ type: 'success' });
  });

  it('should return success when setting an unlimited quota', async () => {
    createAPIInterceptor('put', '/services/storages/admin/quota/config/cos/cos-456', () =>
      new HttpResponse(null, { status: 200 }),
    );

    const result = await setCosQuota('cos-456', { type: 'unlimited' });

    expect(result).toEqual({ type: 'success' });
  });

  it('should return error when the response is not ok', async () => {
    createAPIInterceptor('put', '/services/storages/admin/quota/config/cos/cos-err', () =>
      new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' }),
    );

    const result = await setCosQuota('cos-err', { type: 'limited', value: 1024 });

    expect(result).toEqual({
      type: 'error',
      error: 'Internal Server Error',
    });
  });

  it('should send the correct body and headers', async () => {
    const interceptor = createAPIInterceptor(
      'put',
      '/services/storages/admin/quota/config/cos/cos-body',
      () => new HttpResponse(null, { status: 200 }),
    );

    await setCosQuota('cos-body', { type: 'limited', value: 5368709120 });

    const lastRequest = interceptor.getLastRequest();
    expect(lastRequest.headers.get('X-API-Version')).toBe('2');
    expect(lastRequest.headers.get('Content-Type')).toBe('application/json');

    const body = await lastRequest.json();
    expect(body).toEqual({
      limit: { type: 'limited', value: 5368709120 },
    });
  });
});
