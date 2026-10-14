/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';

import { getFilesConfigRaw } from '../get-files-config-raw';

describe('getFilesConfigRaw', () => {
  it('should return the sparse overrides map set at the account scope', async () => {
    createAPIInterceptor('get', '/services/files/admin/config/raw/account/acc-1', () =>
      HttpResponse.json({ 'shares-enabled': 'false' }),
    );

    const result = await getFilesConfigRaw('account', 'acc-1');

    expect(result).toEqual({ type: 'success', overrides: { 'shares-enabled': 'false' } });
  });

  it('should return the sparse overrides map set at the cos scope', async () => {
    createAPIInterceptor('get', '/services/files/admin/config/raw/cos/cos-1', () =>
      HttpResponse.json({ 'shares-enabled': 'true' }),
    );

    const result = await getFilesConfigRaw('cos', 'cos-1');

    expect(result).toEqual({ type: 'success', overrides: { 'shares-enabled': 'true' } });
  });

  it('should return an empty overrides map when nothing is overridden', async () => {
    createAPIInterceptor('get', '/services/files/admin/config/raw/account/acc-2', () =>
      HttpResponse.json({}),
    );

    const result = await getFilesConfigRaw('account', 'acc-2');

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
});
