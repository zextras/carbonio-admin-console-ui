/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';

import { fetchLicenseV1Capability } from '../license-capability-service';

const CAPABILITY_URL = '/services/license/v1/capabilities/allowed?capability=BACKUP';

describe('fetchLicenseV1Capability', () => {
  it('should return success with allowed true', async () => {
    createAPIInterceptor('get', CAPABILITY_URL, () => HttpResponse.json({ allowed: true }));

    await expect(fetchLicenseV1Capability('BACKUP')).resolves.toEqual({
      type: 'success',
      allowed: true,
    });
  });

  it('should return success with allowed false', async () => {
    createAPIInterceptor('get', CAPABILITY_URL, () => HttpResponse.json({ allowed: false }));

    await expect(fetchLicenseV1Capability('BACKUP')).resolves.toEqual({
      type: 'success',
      allowed: false,
    });
  });

  it('should pass the accountId when provided', async () => {
    const interceptor = createAPIInterceptor(
      'get',
      '/services/license/v1/capabilities/allowed?capability=BACKUP&accountId=acc-1',
      () => HttpResponse.json({ allowed: true }),
    );

    await fetchLicenseV1Capability('BACKUP', 'acc-1');

    expect(interceptor.getCalledTimes()).toBe(1);
  });

  it('should return an error on 400 for an unknown capability', async () => {
    createAPIInterceptor('get', CAPABILITY_URL, () =>
      HttpResponse.json({}, { status: 400 }),
    );

    const result = await fetchLicenseV1Capability('BACKUP');

    expect(result.type).toBe('error');
  });

  it('should return an error on server failure', async () => {
    createAPIInterceptor('get', CAPABILITY_URL, () =>
      HttpResponse.json({}, { status: 500 }),
    );

    const result = await fetchLicenseV1Capability('BACKUP');

    expect(result.type).toBe('error');
  });

  it('should return an error when the body is not the allowed envelope', async () => {
    createAPIInterceptor('get', CAPABILITY_URL, () =>
      HttpResponse.json({ something: 'else' }),
    );

    const result = await fetchLicenseV1Capability('BACKUP');

    expect(result.type).toBe('error');
  });
});
