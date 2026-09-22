/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';

import { getFilesConfigResolved } from '../get-files-config-resolved';

describe('getFilesConfigResolved', () => {
  it('should return the effective value and the account source when overridden there', async () => {
    createAPIInterceptor('get', '/services/files/admin/config', () =>
      HttpResponse.json({ 'shares-enabled': { value: 'false', source: 'account' } }),
    );

    const result = await getFilesConfigResolved('acc-1');

    expect(result).toEqual({
      type: 'success',
      config: { 'shares-enabled': { value: 'false', source: 'account' } },
    });
  });

  it('should surface the cos source when inherited from the class of service', async () => {
    createAPIInterceptor('get', '/services/files/admin/config', () =>
      HttpResponse.json({ 'shares-enabled': { value: 'true', source: 'cos' } }),
    );

    const result = await getFilesConfigResolved('acc-2');

    expect(result).toEqual({
      type: 'success',
      config: { 'shares-enabled': { value: 'true', source: 'cos' } },
    });
  });

  it('should surface the default source when nothing overrides the key', async () => {
    createAPIInterceptor('get', '/services/files/admin/config', () =>
      HttpResponse.json({ 'shares-enabled': { value: 'true', source: 'default' } }),
    );

    const result = await getFilesConfigResolved('acc-3');

    expect(result).toEqual({
      type: 'success',
      config: { 'shares-enabled': { value: 'true', source: 'default' } },
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
});
