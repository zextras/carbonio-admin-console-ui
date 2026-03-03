/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useDomainStore } from '@zextras/ui-shared';
import {
    advancedSupportedApiForBrowser,
    createBrowserSoapAPIInterceptor,
    setupBrowserTest,
} from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import ManageAccounts from '../manage-accounts';

const DOMAIN_NAME = 'example.com';

type AccountEntry = {
    name: string;
    id: string;
    a: Array<{ n: string; _content: string }>;
};

function buildAccount(
    email: string,
    id: string,
    overrides: {
        displayName?: string;
        status?: string;
        isAdmin?: string;
        isDelegated?: string;
        isSystem?: string;
        isExternal?: string;
        description?: string;
    } = {},
): AccountEntry {
    const {
        displayName = email.split('@')[0],
        status = 'active',
        isAdmin = 'FALSE',
        isDelegated = 'FALSE',
        isSystem = 'FALSE',
        isExternal = 'FALSE',
        description = '',
    } = overrides;
    return {
        name: email,
        id,
        a: [
            { n: 'mail', _content: email },
            { n: 'displayName', _content: displayName },
            { n: 'zimbraAccountStatus', _content: status },
            { n: 'zimbraIsAdminAccount', _content: isAdmin },
            { n: 'zimbraIsDelegatedAdminAccount', _content: isDelegated },
            { n: 'zimbraIsSystemAccount', _content: isSystem },
            { n: 'zimbraIsExternalVirtualAccount', _content: isExternal },
            { n: 'description', _content: description },
            { n: 'zimbraId', _content: id },
            { n: 'zimbraCOSId', _content: 'cos-default-id' },
        ],
    };
}

const ACCOUNTS: Array<AccountEntry> = [
    buildAccount('user1@example.com', 'acc-1', { displayName: 'User One' }),
    buildAccount('user2@example.com', 'acc-2', {
        displayName: 'User Two',
        status: 'locked',
    }),
    buildAccount('admin@example.com', 'acc-3', {
        displayName: 'Admin User',
        isAdmin: 'TRUE',
    }),
];

function setupSearchDirectoryInterceptor(
    accounts: Array<AccountEntry> = ACCOUNTS,
): Promise<unknown> {
    return createBrowserSoapAPIInterceptor('SearchDirectory', {
        account: accounts,
        searchTotal: accounts.length,
        more: false,
    });
}

function setupCountAccountInterceptor(totalAccounts = 3): Promise<unknown> {
    return createBrowserSoapAPIInterceptor('CountAccount', {
        cos: [
            { id: 'cos-default-id', name: 'default', _content: String(totalAccounts) },
        ],
    });
}

function setupDomainStore(): void {
    useDomainStore.setState({
        domain: {
            name: DOMAIN_NAME,
            id: 'test-domain-id',
            a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
        },
    });
}

describe('ManageAccounts (browser)', () => {
    beforeEach(async () => {
        setupDomainStore();
        await advancedSupportedApiForBrowser.withAdvancedNotSupported();
    });

    afterEach(() => {
        useDomainStore.setState({});
    });

    describe('Rendering', () => {
        it('should render the Accounts List title', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Accounts List', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Total Accounts count', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor(5);
            await setupBrowserTest(<ManageAccounts />);
            await expect.element(page.getByText(/Total Accounts/)).toBeInTheDocument();
        });

        it('should render the create account button (+)', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            // The + button uses the Plus icon
            const buttons = page.getByRole('button');
            await expect.element(buttons.first()).toBeInTheDocument();
        });

        it('should render the search input', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByLabelText("I'm looking for this account…"))
                .toBeInTheDocument();
        });
    });

    describe('Table headers', () => {
        it('should render the Email column header', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Email', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Name column header', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Name', { exact: true }).first())
                .toBeInTheDocument();
        });

        it('should render the Type column header', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Type', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Status column header', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Status', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Description column header', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Description', { exact: true }).first())
                .toBeInTheDocument();
        });
    });

    describe('Account list with data', () => {
        it('should display account emails', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect.element(page.getByText('user1@example.com')).toBeInTheDocument();
            await expect.element(page.getByText('user2@example.com')).toBeInTheDocument();
            await expect.element(page.getByText('admin@example.com')).toBeInTheDocument();
        });

        it('should display account display names', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect.element(page.getByText('User One')).toBeInTheDocument();
            await expect.element(page.getByText('User Two')).toBeInTheDocument();
            await expect.element(page.getByText('Admin User')).toBeInTheDocument();
        });

        it('should display account types', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect.element(page.getByText('Normal').first()).toBeInTheDocument();
            await expect.element(page.getByText('Admin', { exact: true }).first()).toBeInTheDocument();
        });

        it('should display account status with correct labels', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect.element(page.getByText('Active', { exact: true }).first()).toBeInTheDocument();
            await expect.element(page.getByText('Locked', { exact: true }).first()).toBeInTheDocument();
        });
    });

    describe('Empty state', () => {
        it('should show empty list message when no accounts exist', async () => {
            setupSearchDirectoryInterceptor([]);
            setupCountAccountInterceptor(0);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('This list is empty.'))
                .toBeInTheDocument();
        });

        it('should disable search input when list is empty', async () => {
            setupSearchDirectoryInterceptor([]);
            setupCountAccountInterceptor(0);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('This list is empty.'))
                .toBeInTheDocument();
            const searchInput = page.getByLabelText("I'm looking for this account…");
            await expect.element(searchInput).toHaveAttribute('disabled');
        });
    });

    describe('Search', () => {
        it('should enable search input when accounts are present', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            const searchInput = page.getByLabelText("I'm looking for this account…");
            await expect.element(page.getByText('user1@example.com')).toBeInTheDocument();
            await expect.element(searchInput).not.toHaveAttribute('disabled');
        });

        it('should allow typing in the search input', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            const searchInput = page.getByLabelText("I'm looking for this account…");
            await expect.element(page.getByText('user1@example.com')).toBeInTheDocument();
            await userEvent.type(searchInput, 'admin');
            await expect.element(searchInput).toHaveValue('admin');
        });
    });

    describe('API interaction', () => {
        it('should send SearchDirectory request with accounts type', async () => {
            const interceptor = setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            const params = await interceptor;
            expect(params).toHaveProperty('types', 'accounts');
        });

        it('should send CountAccount request with domain name', async () => {
            setupSearchDirectoryInterceptor();
            const countInterceptor = setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            const params = await countInterceptor;
            expect(params).toHaveProperty('domain');
        });
    });
});
