/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import { getQueryClient, setupBrowserTest, worker } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { DomainQuota } from '../domain-quota';

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';
const GB = 1024 ** 3;

const HEADER =
  'Account, Mails Usage (Bytes), Files Usage (Bytes), Chats Usage (Bytes), Total Usage (Bytes), Total Limit (Bytes)';

function buildReport(rows: Array<string>): string {
  return [HEADER, ...rows].join('\n');
}

function mockReport(csv: string): void {
  worker.use(
    http.get(
      `/services/storages/admin/quota/domain/report/${DOMAIN_NAME}`,
      () => new HttpResponse(csv, { headers: { 'Content-Type': 'text/csv' } }),
    ),
  );
}

function accountOrder(): Array<string | null> {
  return page
    .getByText(/@example\.com$/)
    .elements()
    .map((el) => el.textContent);
}

function renderQuota() {
  const queryClient = getQueryClient();
  queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
    id: DOMAIN_ID,
    name: DOMAIN_NAME,
    a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
  });
  return setupBrowserTest(<DomainQuota />, {
    queryClient,
    withDomainIdRoute: true,
    initialRouterEntry: `/${DOMAIN_ID}`,
  });
}

describe('DomainQuota (browser)', () => {
  beforeEach(() => {
    getQueryClient().clear();
  });

  it('should show mails, files and chats usage and the total percentage of every account', async () => {
    mockReport(
      buildReport([
        `alice@${DOMAIN_NAME}, ${GB}, ${2 * GB}, ${GB}, ${4 * GB}, ${8 * GB}`,
        `bob@${DOMAIN_NAME}, 0, 0, 0, 0, unlimited`,
      ]),
    );

    await renderQuota();

    await expect.element(page.getByText(`alice@${DOMAIN_NAME}`)).toBeVisible();
    await expect.element(page.getByText('2 GB')).toBeVisible();
    await expect.element(page.getByText('50%')).toBeVisible();
    await expect.element(page.getByText(`bob@${DOMAIN_NAME}`)).toBeVisible();
    await expect.element(page.getByText('Unlimited')).toBeVisible();
    await expect
      .element(page.getByRole('button', { name: /download quota report/i }))
      .toBeVisible();
  });

  it('should sort accounts by total used percentage when the column header is clicked', async () => {
    mockReport(
      buildReport([
        `low@${DOMAIN_NAME}, 0, 0, 0, ${GB}, ${10 * GB}`,
        `high@${DOMAIN_NAME}, 0, 0, 0, ${9 * GB}, ${10 * GB}`,
        `mid@${DOMAIN_NAME}, 0, 0, 0, ${5 * GB}, ${10 * GB}`,
      ]),
    );

    await renderQuota();
    await expect.element(page.getByText(`low@${DOMAIN_NAME}`)).toBeVisible();

    const percentageHeader = page.getByText('Total used (%)');
    await percentageHeader.click();

    await expect
      .poll(accountOrder)
      .toEqual([`low@${DOMAIN_NAME}`, `mid@${DOMAIN_NAME}`, `high@${DOMAIN_NAME}`]);

    await percentageHeader.click();

    await expect
      .poll(accountOrder)
      .toEqual([`high@${DOMAIN_NAME}`, `mid@${DOMAIN_NAME}`, `low@${DOMAIN_NAME}`]);
  });

  it('should paginate the accounts client side', async () => {
    const rows = Array.from(
      { length: 12 },
      (_, index) => `user${String(index).padStart(2, '0')}@${DOMAIN_NAME}, 0, 0, 0, 0, ${GB}`,
    );
    mockReport(buildReport(rows));

    await renderQuota();

    await expect.element(page.getByText(`user00@${DOMAIN_NAME}`)).toBeVisible();
    await expect.element(page.getByText(`user09@${DOMAIN_NAME}`)).toBeVisible();
    await expect.element(page.getByText(`user10@${DOMAIN_NAME}`)).not.toBeInTheDocument();
  });

  it('should show the empty state when the domain has no accounts', async () => {
    mockReport(buildReport([]));

    await renderQuota();

    await expect.element(page.getByText('This list is empty.')).toBeVisible();
  });
});
