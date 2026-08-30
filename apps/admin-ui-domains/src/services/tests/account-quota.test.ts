/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';

import {
  getAccountQuota,
  GetAccountQuotaRawResponse,
  LimitedComputedLimit,
  setAccountQuota,
  unsetAccountQuota,
} from '../account-quota';

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
        computedLimit: { type: 'limited', value: 1000000000, source: 'account' },
        status: 'UNDERQUOTA',
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
    const totalComputedLimit = { ...apiResponse.total.computedLimit, source: undefined };

    expect(result).toEqual({
      type: 'success',
      totalComputedLimit,
      totalLimitSource: apiResponse.total.computedLimit.source,
      totalStatus: apiResponse.total.status,
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

describe('setAccountQuota', () => {
  const newQuotaLimit = { type: 'limited', value: 2000000000 } satisfies LimitedComputedLimit;

  it('should call the API with the correct version header', async () => {
    const accountId = '12345';

    const apiInterceptor = createAPIInterceptor(
      'put',
      `/services/storages/admin/quota/config/accounts/${accountId}`,
      () => {
        return HttpResponse.json({}, { status: 200 });
      },
    );

    await setAccountQuota(accountId, newQuotaLimit);

    expect(apiInterceptor.getCalledTimes()).toBe(1);
    expect(apiInterceptor.getLastRequest().headers.get('X-API-Version')).toBe('2');
  });

  it('should call the API to set the account quota limit correctly', async () => {
    const accountId = '12345';

    const apiInterceptor = createAPIInterceptor(
      'put',
      `/services/storages/admin/quota/config/accounts/${accountId}`,
      () => {
        return HttpResponse.json({}, { status: 200 });
      },
    );

    await setAccountQuota(accountId, newQuotaLimit);

    expect(apiInterceptor.getCalledTimes()).toBe(1);
    const lastRequest = apiInterceptor.getLastRequest();
    const body = await lastRequest.json();
    expect(body).toEqual({ limit: newQuotaLimit });
  });

  it('should return success response if the API request is successful', async () => {
    const accountId = '12345';

    createAPIInterceptor(
      'put',
      `/services/storages/admin/quota/config/accounts/${accountId}`,
      () => {
        return HttpResponse.json({}, { status: 200 });
      },
    );

    const result = await setAccountQuota(accountId, newQuotaLimit);

    expect(result).toEqual({
      type: 'success',
    });
  });

  it('should return an error if the API request fails', async () => {
    const accountId = '12345';

    createAPIInterceptor(
      'put',
      `/services/storages/admin/quota/config/accounts/${accountId}`,
      () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      },
    );

    const result = await setAccountQuota(accountId, newQuotaLimit);

    expect(result).toEqual({
      type: 'error',
      error: 'Internal Server Error',
    });
  });
});

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
