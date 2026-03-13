/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';

import { unsetAccountQuota } from '../unset-account-quota';

describe('unsetAccountQuota', () => {
  it('should call the API with the correct version header', async () => {
    const accountId = '12345';

    const apiInterceptor = createAPIInterceptor(
      'delete',
      `/services/storages/admin/quota/config/accounts/${accountId}`,
      () => {
        return HttpResponse.json({}, { status: 200 });
      },
    );

    await unsetAccountQuota(accountId);

    expect(apiInterceptor.getCalledTimes()).toBe(1);
    expect(apiInterceptor.getLastRequest().headers.get('X-API-Version')).toBe('2');
  });

  it('should call the API to unset the account quota limit correctly', async () => {
    const accountId = '12345';

    const apiInterceptor = createAPIInterceptor(
      'delete',
      `/services/storages/admin/quota/config/accounts/${accountId}`,
      () => {
        return HttpResponse.json({}, { status: 200 });
      },
    );

    await unsetAccountQuota(accountId);

    expect(apiInterceptor.getCalledTimes()).toBe(1);
  });

  it('should return success response if the API request is successful', async () => {
    const accountId = '12345';

    createAPIInterceptor(
      'delete',
      `/services/storages/admin/quota/config/accounts/${accountId}`,
      () => {
        return HttpResponse.json({}, { status: 200 });
      },
    );

    const result = await unsetAccountQuota(accountId);

    expect(result).toEqual({
      type: 'success',
    });
  });

  it('should return an error if the API request fails', async () => {
    const accountId = '12345';

    createAPIInterceptor(
      'delete',
      `/services/storages/admin/quota/config/accounts/${accountId}`,
      () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      },
    );

    const result = await unsetAccountQuota(accountId);

    expect(result).toEqual({
      type: 'error',
      error: 'Internal Server Error',
    });
  });
});
