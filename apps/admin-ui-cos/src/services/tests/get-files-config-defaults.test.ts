/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { getFilesConfigDefaults } from '../get-files-config-defaults';

describe('getFilesConfigDefaults', () => {
  it('should return the complete default map', async () => {
    createAPIInterceptor('get', '/services/files/admin/config/raw/default', () =>
      HttpResponse.json({ 'shares-enabled': 'true' }),
    );

    const result = await getFilesConfigDefaults();

    expect(result).toEqual({ type: 'success', defaults: { 'shares-enabled': 'true' } });
  });

  it('should preserve a null default value', async () => {
    createAPIInterceptor('get', '/services/files/admin/config/raw/default', () =>
      HttpResponse.json({ 'shares-enabled': null }),
    );

    const result = await getFilesConfigDefaults();

    expect(result).toEqual({ type: 'success', defaults: { 'shares-enabled': null } });
  });

  it('should return error when the response is not ok', async () => {
    createAPIInterceptor(
      'get',
      '/services/files/admin/config/raw/default',
      () => new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' }),
    );

    const result = await getFilesConfigDefaults();

    expect(result).toEqual({ type: 'error', error: 'Internal Server Error' });
  });
});
