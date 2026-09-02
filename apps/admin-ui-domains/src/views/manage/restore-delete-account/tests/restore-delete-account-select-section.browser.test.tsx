/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import { getQueryClient, setupBrowserTest as _setupBrowserTest, worker } from 'admin-ui-test-utils';
import { noop } from 'lodash-es';
import { http, HttpResponse } from 'msw';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { RestoreDeleteAccountContext } from '../restore-delete-account-context';
import { RestoreDeleteInheritedSelectSection } from '../restore-delete-account-select-section';

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

type BackupAccount = {
    id: string;
    name: string;
    serverName: string;
    status: string;
    creationTimestamp: number;
    deletedTimestamp?: number;
};

const ACCOUNTS: Array<BackupAccount> = [
    {
        id: 'acc-1',
        name: 'alice@example.com',
        serverName: 'mail1.example.com',
        status: 'Active',
        creationTimestamp: new Date('2025-06-15').getTime(),
    },
    {
        id: 'acc-2',
        name: 'bob@example.com',
        serverName: 'mail2.example.com',
        status: 'Deleted',
        creationTimestamp: new Date('2025-03-10').getTime(),
        deletedTimestamp: new Date('2026-01-20').getTime(),
    },
    {
        id: 'acc-3',
        name: 'carol@example.com',
        serverName: 'mail1.example.com',
        status: 'Active',
        creationTimestamp: new Date('2025-11-01').getTime(),
    },
];

function buildGetBackupAccountsResponse(accounts: Array<BackupAccount>): object {
    return {
        accounts,
        maxPage: Math.max(1, Math.ceil(accounts.length / 10)),
    };
}

function setupGetBackupAccountsInterceptor(
    accounts: Array<BackupAccount> = ACCOUNTS,
): void {
    worker.use(
        http.get(/\/service\/extension\/zextras_admin\/backup\/getBackupAccounts/, () =>
            HttpResponse.json(buildGetBackupAccountsResponse(accounts)),
        ),
    );
}

function renderWithContext(): ReturnType<typeof _setupBrowserTest> {
    const queryClient = getQueryClient();
    queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
        id: DOMAIN_ID,
        name: DOMAIN_NAME,
        a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
    });
    return _setupBrowserTest(
        <RestoreDeleteAccountContext.Provider
            value={{ restoreAccountDetail: null, setRestoreAccountDetail: noop }}
        >
            <RestoreDeleteInheritedSelectSection />
        </RestoreDeleteAccountContext.Provider>,
        {
            queryClient,
            withDomainIdRoute: true,
            initialRouterEntry: `/${DOMAIN_ID}`,
        },
    );
}

const SelectSectionHarness = () => {
    const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
    return (
        <RestoreDeleteAccountContext.Provider
            value={{ restoreAccountDetail: detail, setRestoreAccountDetail: setDetail }}
        >
            <RestoreDeleteInheritedSelectSection />
            <ds-text as="p">Selected: {(detail?.copyAccount as string) ?? ''}</ds-text>
        </RestoreDeleteAccountContext.Provider>
    );
};

describe('RestoreDeleteAccountSelectSection (browser)', () => {
    describe('Rendering', () => {
        it('should render the description text about restoring an account', async () => {
            setupGetBackupAccountsInterceptor();
            await renderWithContext();
            await expect
                .element(
                    page.getByText(
                        /you'll be able to restore an entire account from the backup into a new account/,
                    ),
                )
                .toBeInTheDocument();
        });

        it('should render the Note text about restored data', async () => {
            setupGetBackupAccountsInterceptor();
            await renderWithContext();
            await expect
                .element(
                    page.getByText(
                        /all the mails, appointments, contacts, and settings of the account will be restored/,
                    ),
                )
                .toBeInTheDocument();
        });

        it('should render the filter input', async () => {
            setupGetBackupAccountsInterceptor();
            await renderWithContext();
            await expect
                .element(page.getByLabelText('Filter Account List'))
                .toBeInTheDocument();
        });
    });

    describe('Table headers', () => {
        it('should render the Account column header', async () => {
            setupGetBackupAccountsInterceptor();
            await renderWithContext();
            await expect
                .element(page.getByText('Account', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Server Name column header', async () => {
            setupGetBackupAccountsInterceptor();
            await renderWithContext();
            await expect
                .element(page.getByText('Server Name', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Has Backup column header', async () => {
            setupGetBackupAccountsInterceptor();
            await renderWithContext();
            await expect
                .element(page.getByText('Has Backup', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Creation Date column header', async () => {
            setupGetBackupAccountsInterceptor();
            await renderWithContext();
            await expect
                .element(page.getByText('Creation Date', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Deletion Date column header', async () => {
            setupGetBackupAccountsInterceptor();
            await renderWithContext();
            await expect
                .element(page.getByText('Deletion Date', { exact: true }))
                .toBeInTheDocument();
        });
    });

    describe('List with data', () => {
        it('should display account names', async () => {
            setupGetBackupAccountsInterceptor();
            await renderWithContext();
            await expect.element(page.getByText('alice@example.com')).toBeInTheDocument();
            await expect.element(page.getByText('bob@example.com')).toBeInTheDocument();
            await expect.element(page.getByText('carol@example.com')).toBeInTheDocument();
        });

        it('should display server names', async () => {
            setupGetBackupAccountsInterceptor();
            await renderWithContext();
            await expect
                .element(page.getByText('mail1.example.com').first())
                .toBeInTheDocument();
            await expect.element(page.getByText('mail2.example.com')).toBeInTheDocument();
        });

        it('should display Yes for Active status and No for others', async () => {
            setupGetBackupAccountsInterceptor();
            await renderWithContext();
            await expect
                .element(page.getByText('Yes', { exact: true }).first())
                .toBeInTheDocument();
            await expect
                .element(page.getByText('No', { exact: true }).first())
                .toBeInTheDocument();
        });

        it('should display creation dates in M/D/YYYY format', async () => {
            setupGetBackupAccountsInterceptor();
            await renderWithContext();
            // 2025-06-15 → 6/15/2025
            await expect.element(page.getByText('6/15/2025')).toBeInTheDocument();
            // 2025-03-10 → 3/10/2025
            await expect.element(page.getByText('3/10/2025')).toBeInTheDocument();
            // 2025-11-01 → 11/1/2025
            await expect.element(page.getByText('11/1/2025')).toBeInTheDocument();
        });

        it('should display deletion date when present', async () => {
            setupGetBackupAccountsInterceptor();
            await renderWithContext();
            // 2026-01-20 → 1/20/2026
            await expect.element(page.getByText('1/20/2026')).toBeInTheDocument();
        });
    });

    describe('Empty state', () => {
        it('should render empty table when no accounts exist', async () => {
            setupGetBackupAccountsInterceptor([]);
            await renderWithContext();
            // Still see the headers
            await expect
                .element(page.getByText('Account', { exact: true }))
                .toBeInTheDocument();
            // No emails rendered
            await expect
                .element(page.getByText('alice@example.com'))
                .not.toBeInTheDocument();
        });

        it('should disable filter input when list is empty', async () => {
            setupGetBackupAccountsInterceptor([]);
            await renderWithContext();
            const filterInput = page.getByLabelText('Filter Account List');
            await expect.element(filterInput).toHaveAttribute('disabled');
        });
    });

    describe('Filter', () => {
        it('should allow typing in the filter input', async () => {
            setupGetBackupAccountsInterceptor();
            await renderWithContext();
            await expect.element(page.getByText('alice@example.com')).toBeInTheDocument();
            const filterInput = page.getByLabelText('Filter Account List');
            await userEvent.type(filterInput, 'bob');
            await expect.element(filterInput).toHaveValue('bob');
        });
    });

    describe('Selection', () => {
        it('should seed copyAccount from the selected backup account', async () => {
            setupGetBackupAccountsInterceptor();
            const queryClient = getQueryClient();
            queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
                id: DOMAIN_ID,
                name: DOMAIN_NAME,
                a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
            });
            await _setupBrowserTest(<SelectSectionHarness />, {
                queryClient,
                withDomainIdRoute: true,
                initialRouterEntry: `/${DOMAIN_ID}`,
            });

            await page.getByText('alice@example.com').first().click();

            await expect
                .element(page.getByText('Selected: alice@example.com', { exact: true }))
                .toBeInTheDocument();
        });
    });
});
