/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';

import { unsetDomainQuota } from '../unset-domain-quota';

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
