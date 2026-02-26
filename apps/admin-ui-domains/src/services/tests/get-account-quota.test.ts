/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';

import { getAccountQuota, GetAccountQuotaRawResponse } from '../get-account-quota';

describe('getAccountQuota', () => {
  it('should call the correct API endpoint with the correct version header', async () => {
    const accountId = '12345';

    const apiInterceptor = createAPIInterceptor(
      'get',
      `/services/storages/admin/quota/accounts/${accountId}`,
      () => {
        return HttpResponse.json({}, { status: 200 });
      },
    );

    await getAccountQuota(accountId);

    expect(apiInterceptor.getCalledTimes()).toBe(1);
    expect(apiInterceptor.getLastRequest().headers.get('X-API-Version')).toBe('2');
  });

  it('should return total quota for an account if the API request is successful', async () => {
    const accountId = '12345';
    const apiResponse: GetAccountQuotaRawResponse = {
      total: {
        used: 500000000,
        computedLimit: { type: 'set', value: 1000000000 },
      },
      modules: {
        mailbox: { used: 0 },
        files: { used: 0 },
        wsc: { used: 0 },
      },
    };

    createAPIInterceptor('get', `/services/storages/admin/quota/accounts/${accountId}`, () => {
      return HttpResponse.json(apiResponse, { status: 200 });
    });

    const result = await getAccountQuota(accountId);

    expect(result).toEqual({
      type: 'success',
      totalComputedLimit: apiResponse.total.computedLimit,
      totalUsed: apiResponse.total.used,
      usedByModules: {
        mailbox: apiResponse.modules.mailbox.used,
        files: apiResponse.modules.files.used,
        wsc: apiResponse.modules.wsc.used,
      },
    } satisfies Awaited<ReturnType<typeof getAccountQuota>>);
  });

  it('should return an error if the API request fails', async () => {
    const accountId = '12345';

    const apiInterceptor = createAPIInterceptor(
      'get',
      `/services/storages/admin/quota/accounts/${accountId}`,
      () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      },
    );

    const result = await getAccountQuota(accountId);

    expect(result).toEqual({
      type: 'error',
      error: 'Internal Server Error',
    });
    expect(apiInterceptor.getCalledTimes()).toBe(1);
  });
});
