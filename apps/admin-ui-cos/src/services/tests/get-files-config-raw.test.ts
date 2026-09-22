/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { getFilesConfigRaw } from '../get-files-config-raw';

describe('getFilesConfigRaw', () => {
  it('should return the sparse overrides map set at the scope', async () => {
    createAPIInterceptor('get', '/services/files/admin/config/raw/cos/cos-123', () =>
      HttpResponse.json({ 'shares-enabled': 'false' }),
    );

    const result = await getFilesConfigRaw('cos', 'cos-123');

    expect(result).toEqual({
      type: 'success',
      overrides: { 'shares-enabled': 'false' },
    });
  });

  it('should return an empty overrides map when nothing is overridden at the scope', async () => {
    createAPIInterceptor('get', '/services/files/admin/config/raw/domain/dom-1', () =>
      HttpResponse.json({}),
    );

    const result = await getFilesConfigRaw('domain', 'dom-1');

    expect(result).toEqual({ type: 'success', overrides: {} });
  });

  it('should return error when the response is not ok', async () => {
    createAPIInterceptor(
      'get',
      '/services/files/admin/config/raw/cos/cos-err',
      () => new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' }),
    );

    const result = await getFilesConfigRaw('cos', 'cos-err');

    expect(result).toEqual({ type: 'error', error: 'Internal Server Error' });
  });

  it('should send a same-origin JSON request without a version header', async () => {
    const interceptor = createAPIInterceptor('get', '/services/files/admin/config/raw/cos/cos-hdr', () =>
      HttpResponse.json({}),
    );

    await getFilesConfigRaw('cos', 'cos-hdr');

    const lastRequest = interceptor.getLastRequest();
    expect(lastRequest.headers.get('Content-Type')).toBe('application/json');
    expect(lastRequest.headers.get('X-API-Version')).toBeNull();
  });
});
