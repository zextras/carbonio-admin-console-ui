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

type DirectoryMock = {
  coses: Array<{ id: string; name: string }>;
  accounts: Array<{ name: string; zimbraCOSId?: string }>;
};

function mockDirectory({ coses, accounts }: DirectoryMock): void {
  worker.use(
    http.post('/service/admin/soap/SearchDirectoryRequest', async ({ request }) => {
      const body = (await request.json()) as {
        Body: { SearchDirectoryRequest: { types: string } };
      };
      const response =
        body.Body.SearchDirectoryRequest.types === 'coses'
          ? { cos: coses }
          : {
              account: accounts.map(({ name, zimbraCOSId }) => ({
                id: name,
                name,
                a: zimbraCOSId ? [{ n: 'zimbraCOSId', _content: zimbraCOSId }] : [],
              })),
            };
      return HttpResponse.json({ Body: { SearchDirectoryResponse: response } });
    }),
  );
}

function accountOrder(): Array<string | null> {
  return page
    .getByText(/@example\.com$/)
    .elements()
    .map((el) => el.textContent);
}

function mockCountAccount(coses: Array<{ id: string; name: string; count: number }>): void {
  worker.use(
    http.post('/service/admin/soap/CountAccountRequest', () =>
      HttpResponse.json({
        Body: {
          CountAccountResponse: {
            cos: coses.map(({ id, name, count }) => ({ id, name, _content: String(count) })),
          },
        },
      }),
    ),
  );
}

function renderQuota(attributes: Array<{ n: string; _content: string }> = []) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
    id: DOMAIN_ID,
    name: DOMAIN_NAME,
    a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }, ...attributes],
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
    mockDirectory({ coses: [], accounts: [] });
    mockCountAccount([]);
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

  it('should color in red only the rows that exceed their quota', async () => {
    mockReport(
      buildReport([
        `over@${DOMAIN_NAME}, 0, 0, 0, ${11 * GB}, ${10 * GB}`,
        `full@${DOMAIN_NAME}, 0, 0, 0, ${10 * GB}, ${10 * GB}`,
        `okone@${DOMAIN_NAME}, 0, 0, 0, ${5 * GB}, ${10 * GB}`,
        `oktwo@${DOMAIN_NAME}, 0, 0, 0, ${4 * GB}, ${10 * GB}`,
      ]),
    );

    await renderQuota();

    // rows are sorted by usage (desc), so over/okone are odd rows and full/oktwo are even rows
    const background = (name: string): string =>
      getComputedStyle(page.getByRole('row', { name: new RegExp(name) }).element()).backgroundColor;

    await expect.poll(() => background('over@') === background('okone@')).toBe(false);
    expect(background('full@')).toBe(background('oktwo@'));
  });

  it('should sort accounts by total used percentage descending by default and toggle on click', async () => {
    mockReport(
      buildReport([
        `low@${DOMAIN_NAME}, 0, 0, 0, ${GB}, ${10 * GB}`,
        `high@${DOMAIN_NAME}, 0, 0, 0, ${9 * GB}, ${10 * GB}`,
        `mid@${DOMAIN_NAME}, 0, 0, 0, ${5 * GB}, ${10 * GB}`,
      ]),
    );

    await renderQuota();
    await expect
      .poll(accountOrder)
      .toEqual([`high@${DOMAIN_NAME}`, `mid@${DOMAIN_NAME}`, `low@${DOMAIN_NAME}`]);

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

  it('should show the COS of every account, falling back to the default COS', async () => {
    mockReport(
      buildReport([
        `gold@${DOMAIN_NAME}, 0, 0, 0, 0, ${GB}`,
        `plain@${DOMAIN_NAME}, 0, 0, 0, 0, ${GB}`,
        `unknown@${DOMAIN_NAME}, 0, 0, 0, 0, ${GB}`,
      ]),
    );
    mockDirectory({
      coses: [
        { id: 'cos-default', name: 'default' },
        { id: 'cos-gold', name: 'Gold' },
      ],
      accounts: [
        { name: `gold@${DOMAIN_NAME}`, zimbraCOSId: 'cos-gold' },
        { name: `plain@${DOMAIN_NAME}` },
        { name: `unknown@${DOMAIN_NAME}`, zimbraCOSId: 'cos-not-visible' },
      ],
    });

    await renderQuota();

    await expect.element(page.getByText('COS')).toBeVisible();
    await expect.element(page.getByText('Gold', { exact: true })).toBeVisible();
    await expect.element(page.getByText('default', { exact: true })).toBeVisible();
    await expect.element(page.getByText('-', { exact: true })).toBeVisible();
  });

  it('should open the account modal when a row is clicked', async () => {
    mockReport(buildReport([`alice@${DOMAIN_NAME}, 0, 0, 0, 0, ${GB}`]));
    mockDirectory({
      coses: [{ id: 'cos-default', name: 'default' }],
      accounts: [{ name: `alice@${DOMAIN_NAME}` }],
    });
    worker.use(
      http.post('/service/admin/soap/CheckRightRequest', () =>
        HttpResponse.json({ Body: { CheckRightResponse: { allow: true } } }),
      ),
    );

    await renderQuota();
    await page.getByText(`alice@${DOMAIN_NAME}`).click();

    await expect.element(page.getByRole('heading', { name: `alice@${DOMAIN_NAME}` })).toBeVisible();
  });

  it('should show the empty state when the domain has no accounts', async () => {
    mockReport(buildReport([]));

    await renderQuota();

    await expect.element(page.getByText('This list is empty.')).toBeVisible();
  });
});

describe('DomainQuota COS limits (browser)', () => {
  beforeEach(() => {
    getQueryClient().clear();
  });

  it('should list the linked COSes united with the COSes in use, with used accounts and max limit', async () => {
    mockReport(buildReport([]));
    mockDirectory({
      coses: [
        { id: 'cos-default', name: 'default' },
        { id: 'cos-gold', name: 'Gold' },
        { id: 'cos-silver', name: 'Silver' },
      ],
      accounts: [],
    });
    mockCountAccount([
      { id: 'cos-default', name: 'default', count: 4 },
      { id: 'cos-gold', name: 'Gold', count: 12 },
      { id: 'cos-silver', name: 'Silver', count: 0 },
    ]);

    await renderQuota([{ n: 'zimbraDomainCOSMaxAccounts', _content: 'cos-gold:50' }]);

    await expect.element(page.getByText('COS name')).toBeVisible();
    await expect.element(page.getByText('Used COS')).toBeVisible();
    await expect.element(page.getByText('COS max limit')).toBeVisible();
    await expect.element(page.getByRole('row', { name: /default.*4.*-/ })).toBeVisible();
    await expect.element(page.getByRole('row', { name: /Gold.*12.*50/ })).toBeVisible();
    await expect.element(page.getByRole('row', { name: /Silver/ })).not.toBeInTheDocument();
  });

  it('should show unlimited for a COS linked with -1 accounts', async () => {
    mockReport(buildReport([]));
    mockDirectory({ coses: [{ id: 'cos-gold', name: 'Gold' }], accounts: [] });
    mockCountAccount([{ id: 'cos-gold', name: 'Gold', count: 1 }]);

    await renderQuota([{ n: 'zimbraDomainCOSMaxAccounts', _content: 'cos-gold:-1' }]);

    await expect.element(page.getByRole('row', { name: /Gold.*1.*Unlimited/ })).toBeVisible();
  });
});
