/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';

import { setFilesConfigOverride } from '../set-files-config';

describe('setFilesConfigOverride', () => {
  it('should PUT the key/value override at the scope and return success', async () => {
    const apiInterceptor = createAPIInterceptor(
      'put',
      '/services/files/admin/config/raw/account/acc-1',
      () => new HttpResponse(null, { status: 204 }),
    );

    const result = await setFilesConfigOverride('account', 'acc-1', 'shares-enabled', 'false');

    expect(apiInterceptor.getCalledTimes()).toBe(1);
    const body = await apiInterceptor.getLastRequest().json();
    expect(body).toEqual({ key: 'shares-enabled', value: 'false' });
    expect(result).toEqual({ type: 'success' });
  });

  it('should PUT the global singleton override without a scope id', async () => {
    const apiInterceptor = createAPIInterceptor(
      'put',
      '/services/files/admin/config/raw/global',
      () => new HttpResponse(null, { status: 204 }),
    );

    const result = await setFilesConfigOverride('global', 'global', 'shares-enabled', 'true');

    expect(apiInterceptor.getCalledTimes()).toBe(1);
    const body = await apiInterceptor.getLastRequest().json();
    expect(body).toEqual({ key: 'shares-enabled', value: 'true' });
    expect(result).toEqual({ type: 'success' });
  });

  it('should return an error when the API request fails', async () => {
    createAPIInterceptor(
      'put',
      '/services/files/admin/config/raw/cos/cos-1',
      () => new HttpResponse(null, { status: 400, statusText: 'Bad Request' }),
    );

    const result = await setFilesConfigOverride('cos', 'cos-1', 'shares-enabled', 'true');

    expect(result).toEqual({ type: 'error', error: 'Bad Request' });
  });
});
