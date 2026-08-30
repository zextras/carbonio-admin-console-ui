/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';

import {
  getDomainQuota,
  GetDomainQuotaRawResponse,
  setDomainQuota,
  unsetDomainQuota,
} from '../domain-quota';

describe('getDomainQuota', () => {
  it('should call the correct API endpoint', async () => {
    const domainId = '12345';

    const apiInterceptor = createAPIInterceptor(
      'get',
      `/services/storages/admin/quota/config/domains/${domainId}`,
      () => {
        return HttpResponse.json({}, { status: 200 });
      },
    );

    await getDomainQuota(domainId);

    expect(apiInterceptor.getCalledTimes()).toBe(1);
  });

  it('should return the quota limit for a domain if the API request is successful', async () => {
    const domainId = '12345';
    const apiResponse: GetDomainQuotaRawResponse = {
      limit: 1000000000,
    };

    createAPIInterceptor('get', `/services/storages/admin/quota/config/domains/${domainId}`, () => {
      return HttpResponse.json(apiResponse, { status: 200 });
    });

    const result = await getDomainQuota(domainId);

    expect(result).toEqual({
      type: 'success',
      limit: apiResponse.limit,
    } satisfies Awaited<ReturnType<typeof getDomainQuota>>);
  });

  it('should return not-set if the API returns 404', async () => {
    const domainId = '12345';

    createAPIInterceptor('get', `/services/storages/admin/quota/config/domains/${domainId}`, () => {
      return HttpResponse.json({}, { status: 404 });
    });

    const result = await getDomainQuota(domainId);

    expect(result).toEqual({
      type: 'not-set',
    });
  });

  it('should return an error if the API request fails', async () => {
    const domainId = '12345';

    const apiInterceptor = createAPIInterceptor(
      'get',
      `/services/storages/admin/quota/config/domains/${domainId}`,
      () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      },
    );

    const result = await getDomainQuota(domainId);

    expect(result).toEqual({
      type: 'error',
      error: 'Internal Server Error',
    });
    expect(apiInterceptor.getCalledTimes()).toBe(1);
  });
});

describe('setDomainQuota', () => {
  const newQuotaLimit = 2000000000;

  it('should call the correct API endpoint', async () => {
    const domainId = '12345';

    const apiInterceptor = createAPIInterceptor(
      'put',
      `/services/storages/admin/quota/config/domains/${domainId}`,
      () => {
        return HttpResponse.json({}, { status: 200 });
      },
    );

    await setDomainQuota(domainId, newQuotaLimit);

    expect(apiInterceptor.getCalledTimes()).toBe(1);
  });

  it('should call the API to set the domain quota limit correctly', async () => {
    const domainId = '12345';

    const apiInterceptor = createAPIInterceptor(
      'put',
      `/services/storages/admin/quota/config/domains/${domainId}`,
      () => {
        return HttpResponse.json({}, { status: 200 });
      },
    );

    await setDomainQuota(domainId, newQuotaLimit);

    expect(apiInterceptor.getCalledTimes()).toBe(1);
    const lastRequest = apiInterceptor.getLastRequest();
    const body = await lastRequest.json();
    expect(body).toEqual({ limit: newQuotaLimit });
  });

  it('should return success response if the API request is successful', async () => {
    const domainId = '12345';

    createAPIInterceptor(
      'put',
      `/services/storages/admin/quota/config/domains/${domainId}`,
      () => {
        return HttpResponse.json({}, { status: 200 });
      },
    );

    const result = await setDomainQuota(domainId, newQuotaLimit);

    expect(result).toEqual({
      type: 'success',
    });
  });

  it('should return an error if the API request fails', async () => {
    const domainId = '12345';

    createAPIInterceptor(
      'put',
      `/services/storages/admin/quota/config/domains/${domainId}`,
      () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      },
    );

    const result = await setDomainQuota(domainId, newQuotaLimit);

    expect(result).toEqual({
      type: 'error',
      error: 'Internal Server Error',
    });
  });
});

describe('unsetDomainQuota', () => {
  it('should call the correct API endpoint', async () => {
    const domainId = '12345';

    const apiInterceptor = createAPIInterceptor(
      'delete',
      `/services/storages/admin/quota/config/domains/${domainId}`,
      () => {
        return HttpResponse.json({}, { status: 200 });
      },
    );

    await unsetDomainQuota(domainId);

    expect(apiInterceptor.getCalledTimes()).toBe(1);
  });

  it('should call the API to unset the domain quota limit correctly', async () => {
    const domainId = '12345';

    const apiInterceptor = createAPIInterceptor(
      'delete',
      `/services/storages/admin/quota/config/domains/${domainId}`,
      () => {
        return HttpResponse.json({}, { status: 200 });
      },
    );

    await unsetDomainQuota(domainId);

    expect(apiInterceptor.getCalledTimes()).toBe(1);
  });

  it('should return success response if the API request is successful', async () => {
    const domainId = '12345';

    createAPIInterceptor(
      'delete',
      `/services/storages/admin/quota/config/domains/${domainId}`,
      () => {
        return HttpResponse.json({}, { status: 200 });
      },
    );

    const result = await unsetDomainQuota(domainId);

    expect(result).toEqual({
      type: 'success',
    });
  });

  it('should return an error if the API request fails', async () => {
    const domainId = '12345';

    createAPIInterceptor(
      'delete',
      `/services/storages/admin/quota/config/domains/${domainId}`,
      () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      },
    );

    const result = await unsetDomainQuota(domainId);

    expect(result).toEqual({
      type: 'error',
      error: 'Internal Server Error',
    });
  });
});
