/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createAPIInterceptor } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';

import { getDomainQuotaReport, parseDomainQuotaReport } from '../domain-quota-report';

const HEADER =
  'Account, Mails Usage (Bytes), Files Usage (Bytes), Chats Usage (Bytes), Total Usage (Bytes), Total Limit (Bytes)';

describe('parseDomainQuotaReport', () => {
  it('should skip the header and map every row to its per-module usage', () => {
    const csv = [
      HEADER,
      'alice@example.com, 100, 200, 300, 600, 1000',
      'bob@example.com, 0, 0, 0, 0, unlimited',
      '',
    ].join('\n');

    expect(parseDomainQuotaReport(csv)).toEqual([
      {
        account: 'alice@example.com',
        mails: 100,
        files: 200,
        chats: 300,
        totalUsed: 600,
        totalLimit: 1000,
      },
      {
        account: 'bob@example.com',
        mails: 0,
        files: 0,
        chats: 0,
        totalUsed: 0,
        totalLimit: 'unlimited',
      },
    ]);
  });

  it('should return no accounts when the report only contains the header', () => {
    expect(parseDomainQuotaReport(`${HEADER}\n`)).toEqual([]);
  });

  it('should accept CRLF line endings', () => {
    const csv = `${HEADER}\r\nalice@example.com, 1, 2, 3, 6, 10\r\n`;

    expect(parseDomainQuotaReport(csv)).toHaveLength(1);
  });

  it('should reject rows with a non numeric usage', () => {
    const csv = `${HEADER}\nalice@example.com, x, 2, 3, 6, 10`;

    expect(() => parseDomainQuotaReport(csv)).toThrow('Malformed quota report row');
  });

  it('should reject rows with missing columns', () => {
    const csv = `${HEADER}\nalice@example.com, 1, 2`;

    expect(() => parseDomainQuotaReport(csv)).toThrow('Malformed quota report row');
  });
});

describe('getDomainQuotaReport', () => {
  it('should request the report of the given domain name and parse it', async () => {
    const apiInterceptor = createAPIInterceptor(
      'get',
      '/services/storages/admin/quota/domain/report/example.com',
      () =>
        new HttpResponse(`${HEADER}\nalice@example.com, 1, 2, 3, 6, 10\n`, {
          status: 200,
          headers: { 'Content-Type': 'text/csv' },
        }),
    );

    const result = await getDomainQuotaReport('example.com');

    expect(apiInterceptor.getCalledTimes()).toBe(1);
    expect(result).toEqual({
      type: 'success',
      accounts: [
        {
          account: 'alice@example.com',
          mails: 1,
          files: 2,
          chats: 3,
          totalUsed: 6,
          totalLimit: 10,
        },
      ],
    });
  });

  it('should return an error when the user is not authorized', async () => {
    createAPIInterceptor(
      'get',
      '/services/storages/admin/quota/domain/report/example.com',
      () => new HttpResponse(null, { status: 401, statusText: 'Unauthorized' }),
    );

    const result = await getDomainQuotaReport('example.com');

    expect(result).toEqual({ type: 'error', error: 'Unauthorized' });
  });
});
