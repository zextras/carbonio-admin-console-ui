/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import {
  advancedSupportedApiForBrowser,
  createBrowserAPIInterceptor,
  getQueryClient,
  setupBrowserTest,
  worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { domainQueryKeys } from '../../../../services/domain-query-keys';
import { AccountQuotaModal } from '../account-quota-modal';

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';
const ACCOUNT = { id: 'acc-1', email: `alice@${DOMAIN_NAME}`, cosId: 'cos-default' };
const GB = 1024 ** 3;

const COSES = [
  { id: 'cos-default', name: 'default' },
  { id: 'cos-gold', name: 'Gold' },
  { id: 'cos-silver', name: 'Silver' },
];

type ModifyAccountBody = { id: string; a: Array<{ n: string; _content: string }> };

function mockSoap(action: string, response: unknown): void {
  worker.use(
    http.post(`/service/admin/soap/${action}Request`, () =>
      HttpResponse.json({ Body: { [`${action}Response`]: response } }),
    ),
  );
}

function mockSearchDirectory(): void {
  mockSoap('SearchDirectory', { cos: COSES });
}

/** Records the ModifyAccount requests. */
function mockModifyAccount(): Array<ModifyAccountBody> {
  const calls: Array<ModifyAccountBody> = [];
  worker.use(
    http.post('/service/admin/soap/ModifyAccountRequest', async ({ request }) => {
      const body = (await request.json()) as { Body: { ModifyAccountRequest: ModifyAccountBody } };
      calls.push(body.Body.ModifyAccountRequest);
      return HttpResponse.json({
        Body: { ModifyAccountResponse: { account: [{ id: ACCOUNT.id }] } },
      });
    }),
  );
  return calls;
}

/** Only the COSes listed in `allowed` have the `assignCos` right. */
function mockCheckRight(allowed: Array<string>): void {
  worker.use(
    http.post('/service/admin/soap/CheckRightRequest', async ({ request }) => {
      const body = (await request.json()) as {
        Body: { CheckRightRequest: { target: { _content: string } } };
      };
      return HttpResponse.json({
        Body: {
          CheckRightResponse: {
            allow: allowed.includes(body.Body.CheckRightRequest.target._content),
          },
        },
      });
    }),
  );
}

async function mockStorages(source: 'cos' | 'account' = 'cos', getLimit = () => 10 * GB) {
  await createBrowserAPIInterceptor(
    'get',
    `/services/storages/admin/quota/accounts/${ACCOUNT.id}`,
    () =>
      HttpResponse.json({
        total: {
          used: GB,
          computedLimit: { type: 'limited', value: getLimit(), source },
          status: 'UNDERQUOTA',
        },
        modules: { mailbox: { used: GB }, files: { used: 0 }, wsc: { used: 0 } },
      }),
  );
  await createBrowserAPIInterceptor(
    'get',
    `/services/storages/admin/quota/config/domains/${DOMAIN_ID}`,
    () => new HttpResponse(null, { status: 404 }),
  );
  worker.use(
    http.get('/services/storages/admin/quota/cos/:cosId', () =>
      HttpResponse.json({ computedLimit: { type: 'limited', value: 10 * GB, source: 'cos' } }),
    ),
  );
  return createBrowserAPIInterceptor(
    'put',
    `/services/storages/admin/quota/config/accounts/${ACCOUNT.id}`,
    () => new HttpResponse(null, { status: 204 }),
  );
}

function renderModal({
  isGlobalAdmin,
  account = ACCOUNT,
}: {
  isGlobalAdmin: boolean;
  account?: typeof ACCOUNT;
}) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: true });
  queryClient.setQueryData(['account', 'settings'], {
    prefs: {},
    attrs: { zimbraIsAdminAccount: isGlobalAdmin ? 'TRUE' : 'FALSE' },
    props: [],
  });
  queryClient.setQueryData(['account', 'info'], { id: 'admin-id', name: `admin@${DOMAIN_NAME}` });
  queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
    id: DOMAIN_ID,
    name: DOMAIN_NAME,
    a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
  });
  const onClose = vi.fn();
  return {
    onClose,
    queryClient,
    rendered: setupBrowserTest(
      <AccountQuotaModal account={account} domainName={DOMAIN_NAME} onClose={onClose} />,
      { queryClient, withDomainIdRoute: true, initialRouterEntry: `/${DOMAIN_ID}` },
    ),
  };
}

async function openCosSelect(): Promise<void> {
  await page.getByText('Class of Service', { exact: true }).last().click();
}

async function selectCos(name: string): Promise<void> {
  await openCosSelect();
  await page.getByText(name, { exact: true }).click();
}

describe('AccountQuotaModal (browser)', () => {
  beforeEach(async () => {
    getQueryClient().clear();
    mockSearchDirectory();
    await advancedSupportedApiForBrowser.withAdvancedSupported();
  });

  it('should keep Save disabled until a value is changed', async () => {
    await mockStorages();
    await renderModal({ isGlobalAdmin: true }).rendered;

    await expect.element(page.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('should label the COS and quota sections and render no dividers', async () => {
    await mockStorages();
    await renderModal({ isGlobalAdmin: true }).rendered;

    await expect.element(page.getByRole('heading', { name: 'Class of Service' })).toBeVisible();
    await expect.element(page.getByRole('heading', { name: 'Quota' })).toBeVisible();
    expect(document.querySelectorAll('[class*="modalContent"] > ds-divider')).toHaveLength(0);
  });

  it('should separate the COS and quota sections and align the quota controls with their label', async () => {
    await mockStorages();
    await renderModal({ isGlobalAdmin: true }).rendered;

    const quotaHeading = page.getByRole('heading', { name: 'Quota' });
    await expect.element(quotaHeading).toBeVisible();
    const root = quotaHeading.element().getRootNode();
    const headingHost = root instanceof ShadowRoot ? root.host : quotaHeading.element();
    expect(headingHost.closest('.gap-sm')?.previousElementSibling?.tagName).toBe('DS-DIVIDER');

    const headingLeft = quotaHeading.element().getBoundingClientRect().left;
    const switchLeft = page
      .getByRole('switch', { name: 'Unlimited quota' })
      .element()
      .getBoundingClientRect().left;
    expect(Math.abs(switchLeft - headingLeft)).toBeLessThanOrEqual(2);
  });

  it('should change only the COS when only the COS is edited', async () => {
    const modifyCalls = mockModifyAccount();
    const putQuota = await mockStorages();
    const { onClose } = renderModal({ isGlobalAdmin: true });

    await selectCos('Gold');
    await page.getByRole('button', { name: 'Save' }).click();

    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(modifyCalls).toEqual([
      expect.objectContaining({ id: ACCOUNT.id, a: [{ n: 'zimbraCOSId', _content: 'cos-gold' }] }),
    ]);
    expect(putQuota.getCalledTimes()).toBe(0);
  });

  it('should set a custom quota and change the COS in one save', async () => {
    const modifyCalls = mockModifyAccount();
    const putQuota = await mockStorages();
    const { onClose } = renderModal({ isGlobalAdmin: true });

    await selectCos('Silver');
    const quotaInput = page.getByRole('textbox', { name: 'Total quota(GB)' });
    await userEvent.clear(quotaInput);
    await userEvent.type(quotaInput, '20');
    await page.getByRole('button', { name: 'Save' }).click();

    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(modifyCalls).toHaveLength(1);
    await expect.poll(() => putQuota.getCalledTimes()).toBe(1);
    expect(await putQuota.getLastRequest().json()).toEqual({
      limit: { type: 'limited', value: 20 * GB },
    });
  });

  it('should set an unlimited quota without touching the COS', async () => {
    const modifyCalls = mockModifyAccount();
    const putQuota = await mockStorages();
    const { onClose } = renderModal({ isGlobalAdmin: true });

    await page.getByRole('switch', { name: 'Unlimited quota' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(modifyCalls).toHaveLength(0);
    expect(await putQuota.getLastRequest().json()).toEqual({ limit: { type: 'unlimited' } });
  });

  it('should let a delegated admin choose only the COSes they can assign and hide the quota', async () => {
    mockCheckRight(['cos-gold']);
    const modifyCalls = mockModifyAccount();
    const { onClose } = renderModal({ isGlobalAdmin: false });

    await expect.element(page.getByRole('heading', { name: 'Class of Service' })).toBeVisible();
    await expect.element(page.getByRole('heading', { name: 'Quota' })).not.toBeInTheDocument();
    await openCosSelect();

    await expect.element(page.getByText('Gold', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Silver', { exact: true })).not.toBeInTheDocument();
    await expect
      .element(page.getByRole('textbox', { name: 'Total quota(GB)' }))
      .not.toBeInTheDocument();

    await page.getByText('Gold', { exact: true }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(modifyCalls).toHaveLength(1);
  });

  it('should revert an explicit COS to the inherited one', async () => {
    const modifyCalls = mockModifyAccount();
    const putQuota = await mockStorages();
    const { onClose } = renderModal({
      isGlobalAdmin: true,
      account: { ...ACCOUNT, cosId: 'cos-gold' },
    });

    await page.getByTestId('icon: RefreshOutline').first().click();
    await page.getByRole('button', { name: 'Save' }).click();

    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(modifyCalls).toEqual([
      expect.objectContaining({ id: ACCOUNT.id, a: [{ n: 'zimbraCOSId', _content: '' }] }),
    ]);
    expect(putQuota.getCalledTimes()).toBe(0);
  });
});

describe('AccountQuotaModal cache (browser)', () => {
  beforeEach(async () => {
    getQueryClient().clear();
    mockSearchDirectory();
    await advancedSupportedApiForBrowser.withAdvancedSupported();
  });

  it('should refresh the account quota after the COS is changed, so a reopened modal is up to date', async () => {
    const modifyCalls = mockModifyAccount();
    // the new COS has a bigger limit: the account limit changes only after the COS is modified
    await mockStorages('cos', () => (modifyCalls.length > 0 ? 20 * GB : 10 * GB));
    const { onClose, queryClient } = renderModal({ isGlobalAdmin: true });

    await selectCos('Gold');
    await page.getByRole('button', { name: 'Save' }).click();

    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
    const cached = queryClient.getQueryData<{ totalComputedLimit: { value: number } }>(
      domainQueryKeys.accountQuota(ACCOUNT.id),
    );
    expect(cached?.totalComputedLimit.value).toBe(20 * GB);
  });
});
