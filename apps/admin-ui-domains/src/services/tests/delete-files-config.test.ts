/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';

import { deleteFilesConfigOverride } from '../delete-files-config';

describe('deleteFilesConfigOverride', () => {
  it('should DELETE the override at the scope and return success', async () => {
    const apiInterceptor = createAPIInterceptor(
      'delete',
      '/services/files/admin/config/raw/cos/cos-1/shares-enabled',
      () => new HttpResponse(null, { status: 204 }),
    );

    const result = await deleteFilesConfigOverride('cos', 'cos-1', 'shares-enabled');

    expect(apiInterceptor.getCalledTimes()).toBe(1);
    expect(result).toEqual({ type: 'success' });
  });

  it('should return an error when the API request fails', async () => {
    createAPIInterceptor(
      'delete',
      '/services/files/admin/config/raw/account/acc-err/shares-enabled',
      () => new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' }),
    );

    const result = await deleteFilesConfigOverride('account', 'acc-err', 'shares-enabled');

    expect(result).toEqual({ type: 'error', error: 'Internal Server Error' });
  });
});
