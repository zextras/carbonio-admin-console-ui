/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
    createBrowserSoapAPIInterceptor,
    resetMockWorker,
    setupBrowserTest,
    worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import type { BackupAccountItem, DomainItem } from '../../../../types';
import { LegalHoldPanel } from '../legal-hold-panel';

const MOCK_BACKUP_ACCOUNTS: Array<BackupAccountItem> = [
    {
        id: 'acc-1',
        name: 'admin@test.com',
        status: 'active',
        legalHold: 'false',
        serverName: 'mailstore1.test.com',
        creationTimestamp: 1700000000000,
        deletedTimestamp: undefined,
    },
    {
        id: 'acc-2',
        name: 'user@test.com',
        status: 'active',
        legalHold: 'true',
        serverName: 'mailstore1.test.com',
        creationTimestamp: 1700100000000,
        deletedTimestamp: undefined,
    },
    {
        id: 'acc-3',
        name: 'deleted@test.com',
        status: 'deleted',
        legalHold: 'false',
        serverName: 'mailstore2.test.com',
        creationTimestamp: 1700200000000,
        deletedTimestamp: 1742774400000,
    },
];

function setupDomainInformationInterceptor(domainName = 'test.com'): void {
    createBrowserSoapAPIInterceptor('GetDomain', {
        domain: [
            {
                id: 'domain-1',
                name: domainName,
                a: [{ n: 'zimbraDomainName', _content: domainName }],
            },
        ],
    });
}

function setupGetBackupAccountsInterceptor(
    accounts: Array<BackupAccountItem> = MOCK_BACKUP_ACCOUNTS,
    maxPage = 0,
): void {
    worker.use(
        http.get('/service/extension/zextras_admin/backup/getBackupAccounts', () =>
            HttpResponse.json({
                accounts,
                maxPage,
            }),
        ),
    );
}

function setupSearchDirectoryInterceptor(domains: Array<DomainItem> = []): void {
    createBrowserSoapAPIInterceptor('SearchDirectory', {
        domain: domains,
        searchTotal: domains.length,
        more: false,
    });
}

function setupGetInfoInterceptor(): void {
    createBrowserSoapAPIInterceptor('GetInfo', {
        name: 'admin@test.com',
        id: 'admin-id',
        attrs: { _attrs: {} },
        prefs: { _attrs: {} },
        props: { prop: [] },
    });
}

describe('LegalHoldPanel', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDomainInformationInterceptor();
        setupGetBackupAccountsInterceptor();
        setupSearchDirectoryInterceptor();
        setupGetInfoInterceptor();
    });

    afterEach(() => {
        resetMockWorker();
    });

    it('should render the Legal Hold heading', async () => {
        await setupBrowserTest(<LegalHoldPanel />);
        await expect.element(page.getByText('Legal Hold', { exact: true })).toBeVisible();
    });

    it('should render the "Show only accounts on Legal Hold" switch', async () => {
        await setupBrowserTest(<LegalHoldPanel />);
        await expect.element(page.getByText('Show only accounts on Legal Hold')).toBeVisible();
    });

    it('should render the Set legal hold and Restore buttons', async () => {
        await setupBrowserTest(<LegalHoldPanel />);
        await expect.element(page.getByText('Set legal hold')).toBeVisible();
        await expect.element(page.getByText('Restore')).toBeVisible();
    });

    it('should render the search account input', async () => {
        await setupBrowserTest(<LegalHoldPanel />);
        await expect.element(page.getByLabelText('Search an Account')).toBeVisible();
    });

    it('should render table headers when accounts are loaded', async () => {
        await setupBrowserTest(<LegalHoldPanel />);
        await expect.element(page.getByText('Email')).toBeVisible();
        await expect.element(page.getByText('Account Id')).toBeVisible();
        await expect.element(page.getByText('Server Name')).toBeVisible();
        await expect.element(page.getByText('Created Date')).toBeVisible();
        await expect.element(page.getByText('Deleted Date')).toBeVisible();
        await expect.element(page.getByText('Account Status')).toBeVisible();
        await expect.element(page.getByText('Legal Hold Status', { exact: true })).toBeVisible();
    });

    it('should render account data in the table', async () => {
        await setupBrowserTest(<LegalHoldPanel />);
        await expect.element(page.getByText('admin@test.com')).toBeVisible();
        await expect.element(page.getByText('user@test.com')).toBeVisible();
        await expect.element(page.getByText('deleted@test.com')).toBeVisible();
    });

    it('should show legal hold status Yes for accounts with legalHold true', async () => {
        await setupBrowserTest(<LegalHoldPanel />);
        await expect.element(page.getByText('user@test.com')).toBeVisible();
        const userRow = page.getByRole('row').filter({ hasText: 'user@test.com' });
        await expect.element(userRow.getByText('Yes')).toBeVisible();
        const adminRow = page.getByRole('row').filter({ hasText: 'admin@test.com' });
        await expect.element(adminRow.getByText('No')).toBeVisible();
    });

    it('should show empty state when no accounts are returned', async () => {
        setupGetBackupAccountsInterceptor([], 0);
        await setupBrowserTest(<LegalHoldPanel />);
        await expect.element(page.getByText('This list is empty.')).toBeVisible();
    });

    it('should have the Set legal hold button disabled when no account is selected', async () => {
        await setupBrowserTest(<LegalHoldPanel />);
        await expect.element(page.getByText('admin@test.com')).toBeVisible();
        const button = page.getByRole('button', { name: 'Set legal hold' });
        await expect.element(button).toBeDisabled();
    });

    it('should have the Restore button disabled when no account is selected', async () => {
        await setupBrowserTest(<LegalHoldPanel />);
        await expect.element(page.getByText('admin@test.com')).toBeVisible();
        const button = page.getByRole('button', { name: 'Restore' });
        await expect.element(button).toBeDisabled();
    });

    it('should enable buttons when an account row is clicked', async () => {
        await setupBrowserTest(<LegalHoldPanel />);
        await expect.element(page.getByText('admin@test.com')).toBeVisible();
        const adminRow = page.getByRole('row').filter({ hasText: 'admin@test.com' });
        await adminRow.click();
        const restoreButton = page.getByRole('button', { name: 'Restore' });
        await expect.element(restoreButton).toBeEnabled();
    });

    it('should change button label to "Unset legal hold" when account with legalHold=true is clicked', async () => {
        await setupBrowserTest(<LegalHoldPanel />);
        await expect.element(page.getByText('user@test.com')).toBeVisible();
        await page.getByText('user@test.com').click();
        await expect.element(page.getByText('Unset legal hold')).toBeVisible();
    });

    it('should render domain dropdown input', async () => {
        await setupBrowserTest(<LegalHoldPanel />);
        await expect.element(page.getByText('Type the exact domain name')).toBeVisible();
    });

    it('should toggle legal hold and clear the selection', async () => {
        worker.use(
            http.post('*/service/extension/zextras_admin/backup/legalHold*', () =>
                HttpResponse.json({ accounts: [MOCK_BACKUP_ACCOUNTS[0]] }),
            ),
        );

        await setupBrowserTest(<LegalHoldPanel />);
        await expect.element(page.getByText('admin@test.com')).toBeVisible();
        await page.getByText('admin@test.com').click();

        const setButton = page.getByRole('button', { name: 'Set legal hold' });
        await expect.element(setButton).toBeEnabled();
        await setButton.click();

        await expect.element(page.getByRole('button', { name: 'Set legal hold' })).toBeDisabled();
    });

    it('should open the restore panel from the restore route', async () => {
        await setupBrowserTest(<LegalHoldPanel />, { initialRouterEntry: '/restore/acc-2' });
        await expect.element(page.getByText('Restore - user@test.com')).toBeVisible();
        await expect.element(page.getByRole('button', { name: 'Close' })).toBeVisible();
    });
});
