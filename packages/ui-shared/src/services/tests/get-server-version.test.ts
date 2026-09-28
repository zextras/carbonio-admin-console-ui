/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';

import { getServerVersion } from '../get-server-version';

describe('getServerVersion', () => {
  it('should return success with the trimmed version string', async () => {
    createAPIInterceptor('get', '/.version', () =>
      HttpResponse.text('  25.1.0  \n', { status: 200 }),
    );

    const result = await getServerVersion();

    expect(result).toEqual({ type: 'success', version: '25.1.0' });
  });

  it('should return an error on HTTP failure', async () => {
    createAPIInterceptor('get', '/.version', () =>
      HttpResponse.text('Internal Server Error', { status: 500 }),
    );

    const result = await getServerVersion();

    expect(result.type).toBe('error');
  });

  it('should return an error on network failure', async () => {
    createAPIInterceptor('get', '/.version', () => HttpResponse.error());

    const result = await getServerVersion();

    expect(result.type).toBe('error');
  });
});
