/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey, useContextBridge } from '@zextras/ui-shared';
import {
    advancedSupportedApiForBrowser,
    createBrowserSoapAPIInterceptor,
    getQueryClient,
    setupBrowserTest as _setupBrowserTest,
} from 'admin-ui-test-utils';
import { type ReactElement } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { type RenderResult } from 'vitest-browser-react';

import { ManageAccounts } from '../manage-accounts';

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

const DOMAIN_B_ID = 'test-domain-b-id';
const DOMAIN_B_NAME = 'other.example.com';

function setupBrowserTest(
    ui: ReactElement,
    domainId: string = DOMAIN_ID,
    domainName: string = DOMAIN_NAME,
): Promise<RenderResult> {
    const queryClient = getQueryClient();
    const domains: Array<[string, string]> = [
        [domainId, domainName],
        [DOMAIN_B_ID, DOMAIN_B_NAME],
    ];
    domains.forEach(([id, name]) => {
        queryClient.setQueryData(domainByIdKey(id, 1), {
            id,
            name,
            a: [{ n: 'zimbraDomainName', _content: name }],
        });
    });
    return _setupBrowserTest(ui, {
        queryClient,
        withDomainIdRoute: true,
        initialRouterEntry: `/${domainId}`,
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
    searchTotal?: number,
): Promise<{ query?: string; offset?: number } & Record<string, unknown>> {
    return createBrowserSoapAPIInterceptor<
        { query?: string; offset?: number } & Record<string, unknown>,
        Record<string, unknown>
    >('SearchDirectory', {
        account: accounts,
        searchTotal: searchTotal ?? accounts.length,
        more: false,
    });
}

type ExtendedAccountEntry = Omit<AccountEntry, 'a'> & {
    a: Array<{ n: string; _content: string; pd?: boolean }>;
};

function buildAccountWithAliases(
    email: string,
    id: string,
    aliases: Array<string>,
): ExtendedAccountEntry {
    const base = buildAccount(email, id, { displayName: 'Aliased User' });
    const mailAttrs = [email, ...aliases].map((address) => ({ n: 'mail', _content: address }));
    return {
        ...base,
        a: [...mailAttrs, ...base.a.filter((attr) => attr.n !== 'mail')],
    };
}

function buildPdFlagAdminAccount(email: string, id: string): ExtendedAccountEntry {
    const base = buildAccount(email, id, { displayName: 'Pd Admin User' });
    return {
        ...base,
        a: base.a.map((attr) =>
            attr.n === 'zimbraIsAdminAccount' ? { ...attr, _content: '', pd: true } : attr,
        ),
    };
}

describe('ManageAccounts (browser)', () => {
    beforeEach(async () => {
        await advancedSupportedApiForBrowser.withAdvancedNotSupported();
    });

    describe('Rendering', () => {
        it('should render the Accounts List title', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Accounts List', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the create account button (+)', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            // The + button uses the Plus icon
            const buttons = page.getByRole('button');
            await expect.element(buttons.first()).toBeInTheDocument();
        });

        it('should render the search input', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByLabelText("I'm looking for this account…"))
                .toBeInTheDocument();
        });
    });

    describe('Table headers', () => {
        it('should render the Email column header', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Email', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Name column header', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Name', { exact: true }).first())
                .toBeInTheDocument();
        });

        it('should render the Type column header', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Type', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Status column header', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Status', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Description column header', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('Description', { exact: true }).first())
                .toBeInTheDocument();
        });
    });

    describe('Account list with data', () => {
        it('should display account emails', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect.element(page.getByText('user1@example.com')).toBeInTheDocument();
            await expect.element(page.getByText('user2@example.com')).toBeInTheDocument();
            await expect.element(page.getByText('admin@example.com')).toBeInTheDocument();
        });

        it('should display account display names', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect.element(page.getByText('User One')).toBeInTheDocument();
            await expect.element(page.getByText('User Two')).toBeInTheDocument();
            await expect.element(page.getByText('Admin User')).toBeInTheDocument();
        });

        it('should display account types', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect.element(page.getByText('Normal').first()).toBeInTheDocument();
            await expect.element(page.getByText('Admin', { exact: true }).first()).toBeInTheDocument();
        });

        it('should display account status with correct labels', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await expect.element(page.getByText('Active', { exact: true }).first()).toBeInTheDocument();
            await expect.element(page.getByText('Locked', { exact: true }).first()).toBeInTheDocument();
        });
    });

    describe('Empty state', () => {
        it('should show empty list message when no accounts exist', async () => {
            setupSearchDirectoryInterceptor([]);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('This list is empty.'))
                .toBeInTheDocument();
        });

        it('should keep the search input available when the list is empty', async () => {
            setupSearchDirectoryInterceptor([]);
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('This list is empty.'))
                .toBeInTheDocument();
            const searchInput = page.getByLabelText("I'm looking for this account…");
            await expect.element(searchInput).toBeVisible();
            await expect.element(searchInput).not.toHaveAttribute('disabled');
        });
    });

    describe('Search', () => {
        it('should enable search input when accounts are present', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            const searchInput = page.getByLabelText("I'm looking for this account…");
            await expect.element(page.getByText('user1@example.com')).toBeInTheDocument();
            await expect.element(searchInput).toBeVisible();
            await expect.element(searchInput).not.toHaveAttribute('disabled');
        });

        it('should allow typing in the search input', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            const searchInput = page.getByLabelText("I'm looking for this account…");
            await expect.element(page.getByText('user1@example.com')).toBeInTheDocument();
            await userEvent.type(searchInput, 'admin');
            await expect.element(searchInput).toHaveValue('admin');
        });

        it('should not refetch while the debounce window is still running', async () => {
            const initialRequest = setupSearchDirectoryInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await initialRequest;
            await expect.element(page.getByText('user1@example.com')).toBeInTheDocument();

            const nextRequest = setupSearchDirectoryInterceptor([
                buildAccount('filtered@example.com', 'acc-filtered'),
            ]);
            const searchInput = page.getByLabelText("I'm looking for this account…");
            await searchInput.fill('filtered');

            let requestFired = false;
            void nextRequest.then(() => {
                requestFired = true;
            });
            await new Promise((resolve) => {
                setTimeout(resolve, 300);
            });
            expect(requestFired).toBe(false);
        });

        it('should send the debounced search filter and reset pagination', async () => {
            const initialRequest = setupSearchDirectoryInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await initialRequest;
            await expect.element(page.getByText('user1@example.com')).toBeInTheDocument();

            const nextRequest = setupSearchDirectoryInterceptor([
                buildAccount('filtered@example.com', 'acc-filtered'),
            ]);
            const searchInput = page.getByLabelText("I'm looking for this account…");
            await searchInput.fill('filtered');

            const params = await nextRequest;
            expect(String(params.query)).toContain('filtered');
            expect(params.offset).toBe(0);
            await expect
                .element(page.getByText('filtered@example.com'))
                .toBeInTheDocument();
        });

        it('should keep the previous rows visible until the next search resolves', async () => {
            const initialRequest = setupSearchDirectoryInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            await initialRequest;
            await expect.element(page.getByText('user1@example.com')).toBeInTheDocument();

            setupSearchDirectoryInterceptor([
                buildAccount('filtered@example.com', 'acc-filtered'),
            ]);
            const searchInput = page.getByLabelText("I'm looking for this account…");
            await searchInput.fill('filtered');

            await expect.element(page.getByText('user1@example.com')).toBeInTheDocument();
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
            await setupBrowserTest(<ManageAccounts />);
            await expect
                .element(page.getByText('DelegatedAdmin', { exact: true }).first())
                .toBeInTheDocument();
        });
    });

    describe('API interaction', () => {
        it('should send SearchDirectory request with accounts type', async () => {
            const interceptor = setupSearchDirectoryInterceptor();
            await setupBrowserTest(<ManageAccounts />);
            const params = await interceptor;
            expect(params).toHaveProperty('types', 'accounts');
        });
    });

    describe('Aliases', () => {
        it('should display the alias count for accounts with aliases', async () => {
            const aliasedAccounts = [
                buildAccountWithAliases('user@example.com', 'acc-aliases', [
                    'alias1@example.com',
                    'alias2@example.com',
                ]),
            ];
            setupSearchDirectoryInterceptor(aliasedAccounts);
            await setupBrowserTest(<ManageAccounts />);

            await expect.element(page.getByText('user@example.com')).toBeInTheDocument();
            await expect.element(page.getByText('2', { exact: true })).toBeVisible();
        });

        it('should show the alias addresses in a tooltip when hovering the alias count', async () => {
            const aliasedAccounts = [
                buildAccountWithAliases('user@example.com', 'acc-aliases', [
                    'alias1@example.com',
                    'alias2@example.com',
                ]),
            ];
            setupSearchDirectoryInterceptor(aliasedAccounts);
            await setupBrowserTest(<ManageAccounts />);

            await page.getByText('2', { exact: true }).hover();

            await expect.element(page.getByText('alias1@example.com')).toBeVisible();
            await expect.element(page.getByText('alias2@example.com')).toBeVisible();
        });
    });

    describe('Attribute flattening', () => {
        it('should display Admin type when zimbraIsAdminAccount has pd set to true', async () => {
            const pdAdminAccounts = [buildPdFlagAdminAccount('pd-admin@example.com', 'acc-pd')];
            setupSearchDirectoryInterceptor(pdAdminAccounts);
            await setupBrowserTest(<ManageAccounts />);

            await expect
                .element(page.getByText('Admin', { exact: true }).first())
                .toBeInTheDocument();
        });
    });

    describe('Domain switch', () => {
        it('resets page, search and selection when navigating to another domain', async () => {
            const domainAPage1 = Array.from({ length: 10 }, (_, i) =>
                buildAccount(`a-user-${i + 1}@${DOMAIN_NAME}`, `a-acc-${i + 1}`, {
                    displayName: `A User ${i + 1}`,
                }),
            );
            const domainAPage2 = Array.from({ length: 5 }, (_, i) =>
                buildAccount(`a-user-${i + 11}@${DOMAIN_NAME}`, `a-acc-${i + 11}`, {
                    displayName: `A User ${i + 11}`,
                }),
            );
            const domainBAccounts = Array.from({ length: 12 }, (_, i) =>
                buildAccount(`b-user-${i + 1}@${DOMAIN_B_NAME}`, `b-acc-${i + 1}`, {
                    displayName: `B User ${i + 1}`,
                }),
            );

            const initialRequest = setupSearchDirectoryInterceptor(domainAPage1, 15);
            await setupBrowserTest(<ManageAccounts />);
            await initialRequest;
            await expect.element(page.getByText('a-user-1@example.com')).toBeInTheDocument();

            // Narrow with a search (the server-side query is mocked static).
            const searchRequest = setupSearchDirectoryInterceptor(domainAPage1, 15);
            const searchInput = page.getByLabelText("I'm looking for this account…");
            await searchInput.fill('a-user');
            await searchRequest;

            // Paginate to the second page of the domain.
            const pageTwoRequest = setupSearchDirectoryInterceptor(domainAPage2, 15);
            await page.getByRole('button', { name: 'Page 2' }).click();
            await pageTwoRequest;
            await expect.element(page.getByText('a-user-11@example.com')).toBeInTheDocument();
            await expect.element(page.getByText('11–15 of 15')).toBeInTheDocument();

            // Switching the domain resets the whole table state. The
            // bridge history drives the memory router (replaceHistory's
            // string form prefixes the registered app route, which the
            // test wrapper does not register).
            createBrowserSoapAPIInterceptor('GetDomain', {
                domain: [
                    {
                        id: DOMAIN_B_ID,
                        name: DOMAIN_B_NAME,
                        a: [{ n: 'zimbraDomainName', _content: DOMAIN_B_NAME }],
                    },
                ],
            });
            const domainBRequest = setupSearchDirectoryInterceptor(domainBAccounts);
            useContextBridge.getState().functions.getHistory?.()?.push(`/${DOMAIN_B_ID}`);
            await domainBRequest;

            await expect
                .element(page.getByText('b-user-1@other.example.com'))
                .toBeInTheDocument();
            await expect.element(searchInput).toHaveValue('');
            await expect.element(page.getByText('1–10 of 12')).toBeInTheDocument();
        }, 20_000);
    });

    describe('Row interactions', () => {
        function setupEditAccountInterceptors(): void {
            createBrowserSoapAPIInterceptor('GetAccount', {
                account: [
                    {
                        id: 'acc-1',
                        name: 'user1@example.com',
                        a: [
                            { n: 'mail', _content: 'user1@example.com' },
                            { n: 'displayName', _content: 'User One' },
                            { n: 'zimbraAccountStatus', _content: 'active' },
                            { n: 'zimbraId', _content: 'acc-1' },
                            { n: 'zimbraCOSId', _content: 'cos-default-id' },
                            { n: 'zimbraIsAdminAccount', _content: 'FALSE' },
                            { n: 'zimbraIsDelegatedAdminAccount', _content: 'FALSE' },
                            { n: 'zimbraIsSystemAccount', _content: 'FALSE' },
                            { n: 'zimbraIsExternalVirtualAccount', _content: 'FALSE' },
                            { n: 'description', _content: 'Primary mailbox for User One' },
                        ],
                    },
                ],
            });
            createBrowserSoapAPIInterceptor('GetAccountMembership', { dl: [] });
            createBrowserSoapAPIInterceptor('GetGrants', {});
            createBrowserSoapAPIInterceptor('GetFolder', {});
        }

        it('should open the account edit view from peek Edit account', async () => {
            setupEditAccountInterceptors();
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<ManageAccounts />);

            await expect.element(page.getByText('user1@example.com')).toBeInTheDocument();
            await page.getByText('user1@example.com').click();
            await expect
                .element(page.getByRole('complementary', { name: 'Details: user1@example.com' }))
                .toBeVisible();
            await page.getByRole('button', { name: 'Edit account' }).click();

            await expect
                .element(page.getByRole('heading', { name: 'user1@example.com' }))
                .toBeVisible();
        });

        it('should open the account edit view from row actions', async () => {
            setupEditAccountInterceptors();
            const describedAccounts = [
                buildAccount('user1@example.com', 'acc-1', {
                    displayName: 'User One',
                    description: 'Primary mailbox for User One',
                }),
            ];
            setupSearchDirectoryInterceptor(describedAccounts);
            await setupBrowserTest(<ManageAccounts />);

            await expect
                .element(page.getByText('Primary mailbox for User One'))
                .toBeInTheDocument();
            await page.getByRole('button', { name: /Actions for user1@example.com/ }).click();
            await page.getByRole('menuitem', { name: 'Edit account' }).click();

            await expect
                .element(page.getByRole('heading', { name: 'user1@example.com' }))
                .toBeVisible();
        });
    });

    describe('Inline display name edit', () => {
        it('saves the display name via ModifyAccount and refreshes the list', async () => {
            setupSearchDirectoryInterceptor([
                buildAccount('user1@example.com', 'acc-1', { displayName: 'User One' }),
            ]);
            await setupBrowserTest(<ManageAccounts />);

            await expect.element(page.getByText('User One')).toBeInTheDocument();

            const modifyAccountParams = createBrowserSoapAPIInterceptor<
                { id?: string; a?: Array<{ n: string; _content: string }> },
                unknown
            >('ModifyAccount', { account: [{}] });
            setupSearchDirectoryInterceptor([
                buildAccount('user1@example.com', 'acc-1', { displayName: 'Renamed User' }),
            ]);

            await userEvent.hover(page.getByText('User One'));
            await userEvent.click(
                page.getByRole('button', { name: /Edit name for user1@example.com/ }).first(),
            );
            const input = page.getByRole('textbox', { name: 'Name' });
            await userEvent.clear(input);
            await userEvent.fill(input, 'Renamed User');
            await userEvent.keyboard('{Enter}');

            const params = await modifyAccountParams;
            expect(params.id).toBe('acc-1');
            expect(params.a).toContainEqual({ n: 'displayName', _content: 'Renamed User' });

            await expect.element(page.getByText('Display name saved: Renamed User')).toBeVisible();
            await expect.element(page.getByText('Renamed User')).toBeVisible();
        });
    });
});
