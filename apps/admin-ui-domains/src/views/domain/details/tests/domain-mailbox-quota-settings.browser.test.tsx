/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import {
    createBrowserSoapAPIInterceptor,
    getQueryClient,
    setupBrowserTest,
    worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import DomainMailboxQuotaSetting from '../domain-mailbox-quota-settings';

const DOMAIN_ID = 'test-domain-quota-id';
const DOMAIN_NAME = 'quota.example.com';

function buildDomainAttributes(
    overrides: Array<{ n: string; _content: string }> = [],
): Array<{ n: string; _content: string }> {
    const defaults: Array<{ n: string; _content: string }> = [
        { n: 'zimbraDomainName', _content: DOMAIN_NAME },
        { n: 'zimbraId', _content: DOMAIN_ID },
        { n: 'zimbraMailDomainQuota', _content: '10737418240' },
        { n: 'zimbraDomainAggregateQuotaWarnPercent', _content: '80' },
        { n: 'zimbraDomainAggregateQuotaWarnEmailRecipient', _content: 'admin@quota.example.com' },
        { n: 'zimbraDomainAggregateQuotaPolicy', _content: 'ALLOWSENDRECEIVE' },
    ];

    const overrideKeys = new Set(overrides.map((o) => o.n));
    const filtered = defaults.filter((d) => !overrideKeys.has(d.n));
    return [...filtered, ...overrides];
}

function setupDomainStore(
    attributeOverrides: Array<{ n: string; _content: string }> = [],
): ReturnType<typeof getQueryClient> {
    const domainAttributes = buildDomainAttributes(attributeOverrides);
    createBrowserSoapAPIInterceptor('GetDomain', {
        domain: [
            {
                name: DOMAIN_NAME,
                id: DOMAIN_ID,
                a: domainAttributes,
            },
        ],
    });
    const queryClient = getQueryClient();
    queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
        id: DOMAIN_ID,
        name: DOMAIN_NAME,
        a: domainAttributes,
    });
    return queryClient;
}

function interceptGetQuotaUsage(
    accounts: Array<{ name: string; id: string; mailsQuotaUsed: number; mailsQuotaLimit: number }> = [],
    searchTotal = 0,
): void {
    worker.use(
        http.post('/service/admin/soap/GetQuotaUsageRequest', () =>
            HttpResponse.json({
                Body: {
                    GetQuotaUsageResponse: {
                        account: accounts.map((acc) => ({
                            name: acc.name,
                            id: acc.id,
                            mailsQuotaUsed: acc.mailsQuotaUsed,
                            mailsQuotaLimit: acc.mailsQuotaLimit,
                        })),
                        searchTotal,
                    },
                },
            }),
        ),
    );
}

function buildMockAccounts(): Array<{
    name: string;
    id: string;
    mailsQuotaUsed: number;
    mailsQuotaLimit: number;
}> {
    return [
        {
            name: 'user1@quota.example.com',
            id: 'acc-1',
            mailsQuotaUsed: 536870912,
            mailsQuotaLimit: 1073741824,
        },
        {
            name: 'user2@quota.example.com',
            id: 'acc-2',
            mailsQuotaUsed: 268435456,
            mailsQuotaLimit: 1073741824,
        },
    ];
}

describe('DomainMailboxQuotaSetting (browser)', () => {
    let queryClient: ReturnType<typeof getQueryClient>;

    beforeEach(() => {
        queryClient = setupDomainStore();
        interceptGetQuotaUsage(buildMockAccounts(), 2);
    });

    describe('Rendering', () => {
        it('should render the Mailbox Quota header', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            await expect.element(page.getByText('Mailbox Quota', { exact: true })).toBeVisible();
        });

        it('should render the Domain Quota Settings section', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            await expect.element(page.getByText('Domain Quota Settings')).toBeVisible();
        });

        it('should render the Max mailbox quota input', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            await expect
                .element(page.getByText('Max mailbox quota for the Mails (GB)'))
                .toBeVisible();
        });

        it('should render the Mail Space Quota threshold input', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            await expect
                .element(page.getByText('Mail Space Quota threshold (%) warning'))
                .toBeVisible();
        });

        it('should render the Mail Over-quota Criteria select', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            await expect
                .element(page.getByText('Allow Send/Receive'))
                .toBeVisible();
        });

        it('should render the Receiver of Quota warning input', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            await expect
                .element(page.getByText('Receiver of Quota warning (email)'))
                .toBeVisible();
        });

        it('should render the Accounts section', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            await expect.element(page.getByText('Accounts')).toBeVisible();
        });

        it('should render the Download Quota Report button', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            await expect
                .element(page.getByRole('button', { name: /download quota report/i }))
                .toBeVisible();
        });

        it('should render table headers', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            await expect.element(page.getByText('Account', { exact: true })).toBeVisible();
            await expect.element(page.getByText('Mails', { exact: true })).toBeVisible();
        });

        it('should not show Save and Cancel buttons when no changes are made', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            await expect.element(page.getByText('Mailbox Quota', { exact: true })).toBeVisible();
            await expect
                .element(page.getByRole('button', { name: /save/i }))
                .not.toBeInTheDocument();
            await expect
                .element(page.getByRole('button', { name: /cancel/i }))
                .not.toBeInTheDocument();
        });
    });

    describe('Pre-populated fields', () => {
        it('should display the converted quota value in GB', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            // 10737418240 bytes = 10.00 GB
            const quotaInput = page.getByLabelText('Max mailbox quota for the Mails (GB)');
            await expect.element(quotaInput).toHaveValue('10.00');
        });

        it('should display the quota threshold percentage', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            const thresholdInput = page.getByLabelText('Mail Space Quota threshold (%) warning');
            await expect.element(thresholdInput).toHaveValue(80);
        });

        it('should display the quota warning email recipient', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            const emailInput = page.getByLabelText('Receiver of Quota warning (email)');
            await expect.element(emailInput).toHaveValue('admin@quota.example.com');
        });

        it('should show Allow Send/Receive as default policy', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            await expect.element(page.getByText('Allow Send/Receive')).toBeVisible();
        });
    });

    describe('Quota table', () => {
        it('should display account names in the table', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            await expect
                .element(page.getByText('user1@quota.example.com'))
                .toBeVisible();
            await expect
                .element(page.getByText('user2@quota.example.com'))
                .toBeVisible();
        });

        it('should show quota usage data', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            // user1: 536870912 bytes used = 0.50 GB
            await expect.element(page.getByText('user1@quota.example.com')).toBeVisible();
            await expect.element(page.getByText(/0\.50 GB/)).toBeVisible();
        });

        it('should show quota percentage', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            // user1: 536870912/1073741824 = 50%
            await expect.element(page.getByText('user1@quota.example.com')).toBeVisible();
            await expect.element(page.getByText('50%')).toBeVisible();
        });

        it('should show empty table when no accounts', async () => {
            interceptGetQuotaUsage([], 0);
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            await expect.element(page.getByText('Account', { exact: true })).toBeVisible();
            await expect
                .element(page.getByText('user1@quota.example.com'))
                .not.toBeInTheDocument();
        });
    });

    describe('Editing fields', () => {
        it('should show Save and Cancel when quota warning email is changed', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            const emailInput = page.getByLabelText('Receiver of Quota warning (email)');
            await userEvent.clear(emailInput);
            await userEvent.type(emailInput, 'new-admin@quota.example.com');

            await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();
            await expect.element(page.getByRole('button', { name: /cancel/i })).toBeVisible();
        });

        it('should show Save and Cancel when threshold is changed', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            const thresholdInput = page.getByLabelText('Mail Space Quota threshold (%) warning');
            await userEvent.clear(thresholdInput);
            await userEvent.type(thresholdInput, '90');

            await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();
        });

        it('should revert changes when Cancel is clicked', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            const emailInput = page.getByLabelText('Receiver of Quota warning (email)');
            await userEvent.clear(emailInput);
            await userEvent.type(emailInput, 'changed@example.com');

            await expect.element(page.getByRole('button', { name: /cancel/i })).toBeVisible();
            const cancelButton = page.getByRole('button', { name: /cancel/i });
            await cancelButton.click();

            await expect
                .element(page.getByRole('button', { name: /save/i }))
                .not.toBeInTheDocument();
        });

        it('should show error when threshold is empty', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            const thresholdInput = page.getByLabelText('Mail Space Quota threshold (%) warning');
            await userEvent.clear(thresholdInput);

            await expect
                .element(
                    page.getByText('Mail space quota threshold should be between 0 to 100'),
                )
                .toBeVisible();
        });
    });

    describe('Save', () => {
        it('should call ModifyDomain when Save is clicked', async () => {
            const modifyDomainInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
                domain: [
                    {
                        name: DOMAIN_NAME,
                        id: DOMAIN_ID,
                        a: buildDomainAttributes(),
                    },
                ],
            });

            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            const emailInput = page.getByLabelText('Receiver of Quota warning (email)');
            await userEvent.clear(emailInput);
            await userEvent.type(emailInput, 'new@quota.example.com');

            const saveButton = page.getByRole('button', { name: /save/i });
            await saveButton.click();

            const requestParams = (await modifyDomainInterceptor) as any;
            expect(requestParams.id).toBe(DOMAIN_ID);
            expect(requestParams.a).toBeDefined();

            const emailAttr = requestParams.a.find(
                (attr: any) => attr.n === 'zimbraDomainAggregateQuotaWarnEmailRecipient',
            );
            expect(emailAttr._content).toBe('new@quota.example.com');
        });

        it('should show success snackbar after save', async () => {
            createBrowserSoapAPIInterceptor('ModifyDomain', {
                domain: [
                    {
                        name: DOMAIN_NAME,
                        id: DOMAIN_ID,
                        a: buildDomainAttributes(),
                    },
                ],
            });

            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            const emailInput = page.getByLabelText('Receiver of Quota warning (email)');
            await userEvent.clear(emailInput);
            await userEvent.type(emailInput, 'updated@example.com');

            const saveButton = page.getByRole('button', { name: /save/i });
            await saveButton.click();

            await expect
                .element(page.getByText('The change has been saved successfully'))
                .toBeVisible();
        });

        it('should show error snackbar when save fails', async () => {
            worker.use(
                http.post('/service/admin/soap/ModifyDomainRequest', () =>
                    HttpResponse.json(
                        { Body: { Fault: { Reason: { Text: 'Save failed' } } } },
                        { status: 500 },
                    ),
                ),
            );

            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            const emailInput = page.getByLabelText('Receiver of Quota warning (email)');
            await userEvent.clear(emailInput);
            await userEvent.type(emailInput, 'fail@example.com');

            const saveButton = page.getByRole('button', { name: /save/i });
            await saveButton.click();

            await expect.element(page.getByText('Save failed')).toBeVisible();
        });

        it('should disable Save when threshold has error', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            const thresholdInput = page.getByLabelText('Mail Space Quota threshold (%) warning');
            await userEvent.clear(thresholdInput);

            // Threshold empty → hasError = true → Save disabled
            const emailInput = page.getByLabelText('Receiver of Quota warning (email)');
            await userEvent.clear(emailInput);
            await userEvent.type(emailInput, 'trigger-dirty@example.com');

            const saveButton = page.getByRole('button', { name: /save/i });
            await expect.element(saveButton).toBeDisabled();
        });
    });

    describe('Different policy selections', () => {
        it('should render with Block Send policy', async () => {
            setupDomainStore([
                { n: 'zimbraDomainAggregateQuotaPolicy', _content: 'BLOCKSEND' },
            ]);
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            await expect.element(page.getByText('Block Send')).toBeVisible();
        });

        it('should render with Block Send/Receive policy', async () => {
            setupDomainStore([
                { n: 'zimbraDomainAggregateQuotaPolicy', _content: 'BLOCKSENDRECEIVE' },
            ]);
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            await expect.element(page.getByText('Block Send/Receive')).toBeVisible();
        });
    });

    describe('Empty quota', () => {
        it('should show empty input when domain quota is not set', async () => {
            setupDomainStore([{ n: 'zimbraMailDomainQuota', _content: '' }]);
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            const quotaInput = page.getByLabelText('Max mailbox quota for the Mails (GB)');
            await expect.element(quotaInput).toHaveValue('');
        });
    });

    describe('Download Quota Report', () => {
        it('should disable download button when no accounts exist', async () => {
            interceptGetQuotaUsage([], 0);
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            await expect.element(page.getByText('Account', { exact: true })).toBeVisible();

            const downloadBtn = page.getByRole('button', { name: /download quota report/i });
            await expect.element(downloadBtn).toBeDisabled();
        });

        it('should enable download button when accounts exist', async () => {
            setupBrowserTest(<DomainMailboxQuotaSetting />, { initialRouterEntry: `/${DOMAIN_ID}/general-settings` });

            await expect
                .element(page.getByText('user1@quota.example.com'))
                .toBeVisible();

            const downloadBtn = page.getByRole('button', { name: /download quota report/i });
            await expect.element(downloadBtn).not.toBeDisabled();
        });
    });
});
