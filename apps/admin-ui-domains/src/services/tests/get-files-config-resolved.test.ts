/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';

import { getFilesConfigResolved } from '../get-files-config-resolved';

describe('getFilesConfigResolved', () => {
  it('should return the resolved config with its winning source per key', async () => {
    createAPIInterceptor('get', '/services/files/admin/config', () =>
      HttpResponse.json({ 'shares-enabled': { value: 'false', source: 'account' } }),
    );

    const result = await getFilesConfigResolved('acc-1');

    expect(result).toEqual({
      type: 'success',
      config: { 'shares-enabled': { value: 'false', source: 'account' } },
    });
  });

  it('should return an inherited source when the account does not override the key', async () => {
    createAPIInterceptor('get', '/services/files/admin/config', () =>
      HttpResponse.json({ 'shares-enabled': { value: 'true', source: 'domain' } }),
    );

    const result = await getFilesConfigResolved('acc-2');

    expect(result).toEqual({
      type: 'success',
      config: { 'shares-enabled': { value: 'true', source: 'domain' } },
    });
  });

  it('should return error when the user is unknown', async () => {
    createAPIInterceptor(
      'get',
      '/services/files/admin/config',
      () => new HttpResponse(null, { status: 404, statusText: 'Not Found' }),
    );

    const result = await getFilesConfigResolved('missing');

    expect(result).toEqual({ type: 'error', error: 'Not Found' });
  });

  it('should send a same-origin JSON request without a version header', async () => {
    const interceptor = createAPIInterceptor('get', '/services/files/admin/config', () =>
      HttpResponse.json({}),
    );

    await getFilesConfigResolved('acc-1');

    const lastRequest = interceptor.getLastRequest();
    expect(lastRequest.headers.get('Content-Type')).toBe('application/json');
    expect(lastRequest.headers.get('X-API-Version')).toBeNull();
  });
});
