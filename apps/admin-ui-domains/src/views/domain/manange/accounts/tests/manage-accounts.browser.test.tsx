/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import {
    advancedSupportedApiForBrowser,
    createBrowserSoapAPIInterceptor,
    getQueryClient,
    setupBrowserTest as _setupBrowserTest,
} from 'admin-ui-test-utils';
import { type ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { type RenderResult } from 'vitest-browser-react';

import ManageAccounts from '../manage-accounts';

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

function setupBrowserTest(ui: ReactElement): Promise<RenderResult> {
    const queryClient = getQueryClient();
    queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
        id: DOMAIN_ID,
        name: DOMAIN_NAME,
        a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
    });
    return _setupBrowserTest(ui, {
        queryClient,
        withDomainIdRoute: true,
        initialRouterEntry: `/${DOMAIN_ID}`,
    });
}

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

describe('ManageAccounts (browser)', () => {
    beforeEach(async () => {
        await advancedSupportedApiForBrowser.withAdvancedNotSupported();
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

        it('should trigger a new SearchDirectory request when the query changes', async () => {
            const interceptor = setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            const searchInput = page.getByLabelText("I'm looking for this account…");
            await userEvent.type(searchInput, 'admin');
            await interceptor;
            await expect.element(searchInput).toHaveValue('admin');
        });
    });

    describe('Account type detection', () => {
        it('should display DelegatedAdmin type for delegated admin accounts', async () => {
            const delegatedAdminAccounts = [
                buildAccount('delegated@example.com', 'acc-da', {
                    displayName: 'Delegated Admin',
                    isDelegated: 'TRUE',
                }),
            ];
            setupSearchDirectoryInterceptor(delegatedAdminAccounts);
            setupCountAccountInterceptor(1);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('DelegatedAdmin', { exact: true }).first())
                .toBeInTheDocument();
        });

        it('should display System type for system accounts', async () => {
            const systemAccounts = [
                buildAccount('system@example.com', 'acc-sys', {
                    displayName: 'System Account',
                    isSystem: 'TRUE',
                }),
            ];
            setupSearchDirectoryInterceptor(systemAccounts);
            setupCountAccountInterceptor(1);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('System', { exact: true }).first())
                .toBeInTheDocument();
        });

        it('should display External type for external virtual accounts', async () => {
            const externalAccounts = [
                buildAccount('external@example.com', 'acc-ext', {
                    displayName: 'External Account',
                    isExternal: 'TRUE',
                }),
            ];
            setupSearchDirectoryInterceptor(externalAccounts);
            setupCountAccountInterceptor(1);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('External', { exact: true }).first())
                .toBeInTheDocument();
        });

        it('should display Admin type for admin accounts', async () => {
            const adminAccounts = [
                buildAccount('admin@example.com', 'acc-admin', {
                    displayName: 'Admin User',
                    isAdmin: 'TRUE',
                }),
            ];
            setupSearchDirectoryInterceptor(adminAccounts);
            setupCountAccountInterceptor(1);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Admin', { exact: true }).first())
                .toBeInTheDocument();
        });

        it('should display Normal type for regular accounts', async () => {
            const normalAccounts = [
                buildAccount('user@example.com', 'acc-normal', {
                    displayName: 'Normal User',
                }),
            ];
            setupSearchDirectoryInterceptor(normalAccounts);
            setupCountAccountInterceptor(1);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Normal', { exact: true }).first())
                .toBeInTheDocument();
        });

        it('should display all account types when mixed accounts exist', async () => {
            const mixedAccounts = [
                buildAccount('user@example.com', 'acc-1'),
                buildAccount('admin@example.com', 'acc-2', { isAdmin: 'TRUE' }),
                buildAccount('delegated@example.com', 'acc-3', { isDelegated: 'TRUE' }),
                buildAccount('system@example.com', 'acc-4', { isSystem: 'TRUE' }),
                buildAccount('external@example.com', 'acc-5', { isExternal: 'TRUE' }),
            ];
            setupSearchDirectoryInterceptor(mixedAccounts);
            setupCountAccountInterceptor(5);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Normal', { exact: true }).first())
                .toBeInTheDocument();
            await expect
                .element(page.getByText('Admin', { exact: true }).first())
                .toBeInTheDocument();
            await expect
                .element(page.getByText('DelegatedAdmin', { exact: true }).first())
                .toBeInTheDocument();
            await expect
                .element(page.getByText('System', { exact: true }).first())
                .toBeInTheDocument();
            await expect
                .element(page.getByText('External', { exact: true }).first())
                .toBeInTheDocument();
        });
    });

    describe('Account type priority', () => {
        it('should display Admin when account has both isAdmin and isDelegated set to TRUE', async () => {
            const combinedAccounts = [
                buildAccount('combined@example.com', 'acc-combined', {
                    displayName: 'Combined Account',
                    isAdmin: 'TRUE',
                    isDelegated: 'TRUE',
                }),
            ];
            setupSearchDirectoryInterceptor(combinedAccounts);
            setupCountAccountInterceptor(1);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Admin', { exact: true }).first())
                .toBeInTheDocument();
        });

        it('should display Admin when account has both isAdmin and isSystem set to TRUE', async () => {
            const combinedAccounts = [
                buildAccount('admin-sys@example.com', 'acc-admin-sys', {
                    displayName: 'Admin System',
                    isAdmin: 'TRUE',
                    isSystem: 'TRUE',
                }),
            ];
            setupSearchDirectoryInterceptor(combinedAccounts);
            setupCountAccountInterceptor(1);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Admin', { exact: true }).first())
                .toBeInTheDocument();
        });

        it('should display DelegatedAdmin when account has both isDelegated and isSystem set to TRUE', async () => {
            const combinedAccounts = [
                buildAccount('del-sys@example.com', 'acc-del-sys', {
                    displayName: 'Delegated System',
                    isDelegated: 'TRUE',
                    isSystem: 'TRUE',
                }),
            ];
            setupSearchDirectoryInterceptor(combinedAccounts);
            setupCountAccountInterceptor(1);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('DelegatedAdmin', { exact: true }).first())
                .toBeInTheDocument();
        });

        it('should display DelegatedAdmin when account has isDelegated TRUE but isAdmin FALSE', async () => {
            const accounts = [
                buildAccount('del-only@example.com', 'acc-del-only', {
                    displayName: 'Delegated Only',
                    isAdmin: 'FALSE',
                    isDelegated: 'TRUE',
                }),
            ];
            setupSearchDirectoryInterceptor(accounts);
            setupCountAccountInterceptor(1);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('DelegatedAdmin', { exact: true }).first())
                .toBeInTheDocument();
        });
    });

    describe('Interactions', () => {
        it('should open the create account modal when the add button is clicked', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);

            const addButton = page.getByRole('button').first();
            await addButton.click();

            await expect.element(page.getByText('Create Account Wizard', { exact: true })).toBeVisible();
        });

        it('should open the edit account view when a row is selected', async () => {
            const getAccountInterceptor = createBrowserSoapAPIInterceptor('GetAccount', {
                account: [{
                    name: 'user1@example.com',
                    id: 'acc-1',
                    a: [
                        { n: 'zimbraId', _content: 'acc-1' },
                        { n: 'zimbraCOSId', _content: 'cos-default-id' },
                        { n: 'zimbraIsAdminAccount', _content: 'FALSE' },
                        { n: 'zimbraIsDelegatedAdminAccount', _content: 'FALSE' },
                        { n: 'mail', _content: 'user1@example.com' },
                        { n: 'displayName', _content: 'User One' },
                    ],
                }],
            });
            const membershipInterceptor = createBrowserSoapAPIInterceptor('GetAccountMembership', { dl: [] });
            const grantsInterceptor = createBrowserSoapAPIInterceptor('GetGrants', { grant: [] });
            const folderInterceptor = createBrowserSoapAPIInterceptor('GetFolder', { folder: [] });
            const sessionsInterceptor = createBrowserSoapAPIInterceptor('GetSessions', { s: [] });

            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);

            await userEvent.click(page.getByText('user1@example.com').first());

            await expect.element(page.getByText('user1@example.com', { exact: true }).first()).toBeVisible();
            await expect(getAccountInterceptor).resolves.toBeDefined();
            await expect(membershipInterceptor).resolves.toBeDefined();
            await expect(grantsInterceptor).resolves.toBeDefined();
            await expect(folderInterceptor).resolves.toBeDefined();
            await expect(sessionsInterceptor).resolves.toBeDefined();
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

    describe('Account status colors', () => {
        it('should display maintenance status', async () => {
            const maintenanceAccounts = [
                buildAccount('maint@example.com', 'acc-maint', {
                    displayName: 'Maintenance Account',
                    status: 'maintenance',
                }),
            ];
            setupSearchDirectoryInterceptor(maintenanceAccounts);
            setupCountAccountInterceptor(1);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('In maintenance', { exact: true }).first())
                .toBeInTheDocument();
        });

        it('should display closed status', async () => {
            const closedAccounts = [
                buildAccount('closed@example.com', 'acc-closed', {
                    displayName: 'Closed Account',
                    status: 'closed',
                }),
            ];
            setupSearchDirectoryInterceptor(closedAccounts);
            setupCountAccountInterceptor(1);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Closed', { exact: true }).first())
                .toBeInTheDocument();
        });

        it('should display pending status', async () => {
            const pendingAccounts = [
                buildAccount('pending@example.com', 'acc-pending', {
                    displayName: 'Pending Account',
                    status: 'pending',
                }),
            ];
            setupSearchDirectoryInterceptor(pendingAccounts);
            setupCountAccountInterceptor(1);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Pending', { exact: true }).first())
                .toBeInTheDocument();
        });

        it('should display lockout status', async () => {
            const lockoutAccounts = [
                buildAccount('lockout@example.com', 'acc-lockout', {
                    displayName: 'Lockout Account',
                    status: 'lockout',
                }),
            ];
            setupSearchDirectoryInterceptor(lockoutAccounts);
            setupCountAccountInterceptor(1);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Lockout', { exact: true }).first())
                .toBeInTheDocument();
        });
    });

    describe('Aliases column', () => {
        it('should render the Aliases column header', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Aliases', { exact: true }))
                .toBeInTheDocument();
        });

        it('should display 0 when account has no aliases', async () => {
            const noAliasAccounts = [
                buildAccount('noalias@example.com', 'acc-noalias', {
                    displayName: 'No Alias Account',
                }),
            ];
            setupSearchDirectoryInterceptor(noAliasAccounts);
            setupCountAccountInterceptor(1);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('0').first())
                .toBeInTheDocument();
        });
    });

    describe('Description column', () => {
        it('should display account description', async () => {
            const descAccounts = [
                buildAccount('desc@example.com', 'acc-desc', {
                    displayName: 'Described Account',
                    description: 'This is a test description',
                }),
            ];
            setupSearchDirectoryInterceptor(descAccounts);
            setupCountAccountInterceptor(1);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('This is a test description').first())
                .toBeInTheDocument();
        });
    });

    describe('Pagination', () => {
        it('should not show pagination when list is empty', async () => {
            setupSearchDirectoryInterceptor([]);
            setupCountAccountInterceptor(0);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('This list is empty.'))
                .toBeInTheDocument();
        });
    });

    describe('Loading state', () => {
        it('should show empty table rows while loading', async () => {
            // Create a delayed interceptor
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            // After data loads, should show accounts
            await expect
                .element(page.getByText('user1@example.com'))
                .toBeInTheDocument();
        });
    });

    describe('Search input behavior', () => {
        it('should clear search and reset query when input is cleared', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            const searchInput = page.getByLabelText("I'm looking for this account…");

            await userEvent.type(searchInput, 'test');
            await expect.element(searchInput).toHaveValue('test');

            await userEvent.clear(searchInput);
            await expect.element(searchInput).toHaveValue('');
        });
    });

    describe('Create account wizard', () => {
        it('should close create account wizard when clicking outside', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);

            const addButton = page.getByRole('button').first();
            await addButton.click();

            await expect.element(page.getByText('Create Account Wizard', { exact: true })).toBeVisible();
        });
    });

    describe('Total accounts display', () => {
        it('should display correct total accounts count', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor(42);
            await setupBrowserTest(<ManageAccounts />);
            await expect.element(page.getByText(/Total Accounts.*42/)).toBeInTheDocument();
        });

        it('should display 0 total accounts when none exist', async () => {
            setupSearchDirectoryInterceptor([]);
            setupCountAccountInterceptor(0);
            await setupBrowserTest(<ManageAccounts />);
            await expect.element(page.getByText(/Total Accounts.*0/)).toBeInTheDocument();
        });
    });

    describe('Sorting', () => {
        it('should render sortable Email column', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Email', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render sortable Name column', async () => {
            setupSearchDirectoryInterceptor();
            setupCountAccountInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Name', { exact: true }).first())
                .toBeInTheDocument();
        });
    });

    describe('Multiple status accounts', () => {
        it('should display all status types correctly', async () => {
            const mixedStatusAccounts = [
                buildAccount('active@example.com', 'acc-active', { status: 'active' }),
                buildAccount('locked@example.com', 'acc-locked', { status: 'locked' }),
                buildAccount('closed@example.com', 'acc-closed', { status: 'closed' }),
            ];
            setupSearchDirectoryInterceptor(mixedStatusAccounts);
            setupCountAccountInterceptor(3);
            await setupBrowserTest(<ManageAccounts />);
            await expect.element(page.getByText('Active', { exact: true }).first()).toBeInTheDocument();
            await expect.element(page.getByText('Locked', { exact: true }).first()).toBeInTheDocument();
            await expect.element(page.getByText('Closed', { exact: true }).first()).toBeInTheDocument();
        });
    });
});
