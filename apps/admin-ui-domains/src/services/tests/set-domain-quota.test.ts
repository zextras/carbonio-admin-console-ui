/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';

import { setDomainQuota } from '../set-domain-quota';

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
