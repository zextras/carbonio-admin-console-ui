/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { queryClient, useDomainStore } from '@zextras/ui-shared';
import {
    advancedSupportedApiForBrowser,
    setupBrowserTest,
    worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import ManageDelegates from '../manage-delegates';

const DOMAIN_NAME = 'example.com';

type AccountEntry = {
    name: string;
    id: string;
    a: Array<{ n: string; _content: string }>;
};

type DlEntry = {
    name: string;
    id: string;
    a: Array<{ n: string; _content: string }>;
};

function buildDelegateAccount(
    email: string,
    id: string,
    overrides: {
        displayName?: string;
        isAdmin?: string;
        isDelegated?: string;
    } = {},
): AccountEntry {
    const {
        displayName = email.split('@')[0],
        isAdmin = 'FALSE',
        isDelegated = 'TRUE',
    } = overrides;
    return {
        name: email,
        id,
        a: [
            { n: 'mail', _content: email },
            { n: 'displayName', _content: displayName },
            { n: 'zimbraAccountStatus', _content: 'active' },
            { n: 'zimbraIsAdminAccount', _content: isAdmin },
            { n: 'zimbraIsDelegatedAdminAccount', _content: isDelegated },
            { n: 'zimbraIsSystemAccount', _content: 'FALSE' },
            { n: 'zimbraIsExternalVirtualAccount', _content: 'FALSE' },
            { n: 'description', _content: '' },
            { n: 'zimbraId', _content: id },
            { n: 'zimbraCOSId', _content: 'cos-default-id' },
        ],
    };
}

function buildDistributionList(name: string, id: string, isAdminGroup = false): DlEntry {
    return {
        name,
        id,
        a: [
            { n: 'description', _content: `DL ${name}` },
            { n: 'zimbraIsAdminGroup', _content: isAdminGroup ? 'TRUE' : 'FALSE' },
        ],
    };
}

const DELEGATE_ACCOUNTS: Array<AccountEntry> = [
    buildDelegateAccount('delegated1@example.com', 'del-1', { displayName: 'Delegate One' }),
    buildDelegateAccount('delegated2@example.com', 'del-2', {
        displayName: 'Delegate Two',
        isDelegated: 'TRUE',
    }),
    buildDelegateAccount('globaladmin@example.com', 'del-3', {
        displayName: 'Global Admin',
        isAdmin: 'TRUE',
        isDelegated: 'FALSE',
    }),
];

type SearchDirectoryBody = {
    Body: {
        SearchDirectoryRequest: {
            types: string;
            query?: string;
            domain?: string;
            [key: string]: unknown;
        };
    };
};

/**
 * Setup MSW handler for all SearchDirectory calls.
 * Routes responses based on `types` and `query` parameters in the request body.
 */
function setupSearchDirectoryHandler(
    accounts: Array<AccountEntry> = DELEGATE_ACCOUNTS,
    options: {
        hasAdminGroup?: boolean;
    } = {},
): void {
    const { hasAdminGroup = false } = options;

    worker.use(
        http.post<never, SearchDirectoryBody>(
            '/service/admin/soap/SearchDirectoryRequest',
            async ({ request }) => {
                const body = await request.json();
                const params = body?.Body?.SearchDirectoryRequest;

                // Distribution list queries (types = 'distributionlists,dynamicgroups')
                if (params?.types?.includes('distributionlists')) {
                    const query = params?.query ?? '';

                    // Admin group check: query contains zimbraIsAdminGroup=TRUE
                    if (query.includes('zimbraIsAdminGroup=TRUE')) {
                        const dlList = hasAdminGroup
                            ? [buildDistributionList(`__helpdesk_admins@${DOMAIN_NAME}`, 'dl-admin-1', true)]
                            : [];
                        return HttpResponse.json({
                            Body: {
                                SearchDirectoryResponse: {
                                    dl: dlList,
                                    searchTotal: dlList.length,
                                    more: false,
                                },
                            },
                        });
                    }

                    // System account filter: regular distribution lists
                    return HttpResponse.json({
                        Body: {
                            SearchDirectoryResponse: {
                                dl: [],
                                searchTotal: 0,
                                more: false,
                            },
                        },
                    });
                }

                // Account list query (types = 'accounts')
                if (params?.types === 'accounts') {
                    return HttpResponse.json({
                        Body: {
                            SearchDirectoryResponse: {
                                account: accounts,
                                searchTotal: accounts.length,
                                more: false,
                            },
                        },
                    });
                }

                // Fallback
                return HttpResponse.json({
                    Body: {
                        SearchDirectoryResponse: {
                            searchTotal: 0,
                            more: false,
                        },
                    },
                });
            },
        ),
    );
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

function setupGlobalAdminSettings(): void {
    queryClient.setQueryData(['account', 'settings'], {
        prefs: {},
        attrs: { zimbraIsAdminAccount: 'TRUE' },
        props: [],
    });
}

describe('ManageDelegates (browser)', () => {
    beforeEach(async () => {
        setupDomainStore();
        await advancedSupportedApiForBrowser.withAdvancedNotSupported();
    });

    afterEach(() => {
        useDomainStore.setState({});
    });

    describe('Rendering', () => {
        it('should render the Delegated Domain Admins title', async () => {
            setupSearchDirectoryHandler();
            await setupBrowserTest(<ManageDelegates />);
            await expect
                .element(page.getByText('Delegated Domain Admins', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Administration Rights subtitle', async () => {
            setupSearchDirectoryHandler();
            await setupBrowserTest(<ManageDelegates />);
            await expect
                .element(page.getByText('Administration Rights', { exact: true }))
                .toBeInTheDocument();
        });
    });

    describe('Table', () => {
        it('should render the Account column header', async () => {
            setupSearchDirectoryHandler();
            await setupBrowserTest(<ManageDelegates />);
            await expect
                .element(page.getByText('Account', { exact: true }))
                .toBeInTheDocument();
        });

        it('should display delegate account names in the table', async () => {
            setupSearchDirectoryHandler();
            await setupBrowserTest(<ManageDelegates />);
            await expect
                .element(page.getByText('delegated1@example.com'))
                .toBeInTheDocument();
            await expect
                .element(page.getByText('delegated2@example.com'))
                .toBeInTheDocument();
            await expect
                .element(page.getByText('globaladmin@example.com'))
                .toBeInTheDocument();
        });

        it('should display all three accounts in the table', async () => {
            setupSearchDirectoryHandler();
            await setupBrowserTest(<ManageDelegates />);
            await expect
                .element(page.getByText('delegated1@example.com'))
                .toBeInTheDocument();
            await expect
                .element(page.getByText('delegated2@example.com'))
                .toBeInTheDocument();
            await expect
                .element(page.getByText('globaladmin@example.com'))
                .toBeInTheDocument();
        });
    });

    describe('Empty state', () => {
        it('should show empty list message when no delegate accounts exist', async () => {
            setupSearchDirectoryHandler([]);
            await setupBrowserTest(<ManageDelegates />);
            await expect
                .element(page.getByText('This list is empty.'))
                .toBeInTheDocument();
        });

        it('should show suggestion text to create account when list is empty', async () => {
            setupSearchDirectoryHandler([]);
            await setupBrowserTest(<ManageDelegates />);
            await expect
                .element(page.getByText(/Create/))
                .toBeInTheDocument();
        });
    });

    describe('Pagination', () => {
        it('should show pagination when accounts are present', async () => {
            setupSearchDirectoryHandler();
            await setupBrowserTest(<ManageDelegates />);
            await expect
                .element(page.getByText('delegated1@example.com'))
                .toBeInTheDocument();
            // Paging component renders page numbers
            await expect
                .element(page.getByText('1', { exact: true }).first())
                .toBeInTheDocument();
        });

        it('should not show pagination when no accounts exist', async () => {
            setupSearchDirectoryHandler([]);
            await setupBrowserTest(<ManageDelegates />);
            await expect
                .element(page.getByText('This list is empty.'))
                .toBeInTheDocument();
        });
    });

    describe('Global Admin features', () => {
        it('should not show INIT DOMAIN button for non-admin users', async () => {
            setupSearchDirectoryHandler();
            await setupBrowserTest(<ManageDelegates />);
            await expect
                .element(page.getByText('delegated1@example.com'))
                .toBeInTheDocument();
            await expect
                .element(page.getByText('INIT DOMAIN', { exact: true }))
                .not.toBeInTheDocument();
        });

        it('should show INIT DOMAIN button for global admin users', async () => {
            setupSearchDirectoryHandler(DELEGATE_ACCOUNTS, { hasAdminGroup: false });
            setupGlobalAdminSettings();
            await setupBrowserTest(<ManageDelegates />);
            await expect
                .element(page.getByText('INIT DOMAIN', { exact: true }))
                .toBeInTheDocument();
        });

        it('should show RE-INIT DOMAIN button when domain is already initialized', async () => {
            setupSearchDirectoryHandler(DELEGATE_ACCOUNTS, { hasAdminGroup: true });
            setupGlobalAdminSettings();
            await setupBrowserTest(<ManageDelegates />);
            await expect
                .element(page.getByText('RE-INIT DOMAIN', { exact: true }))
                .toBeInTheDocument();
        });
    });

    describe('API interaction', () => {
        it('should request accounts with admin/delegated admin query', async () => {
            let capturedAccountsQuery = '';
            worker.use(
                http.post<never, SearchDirectoryBody>(
                    '/service/admin/soap/SearchDirectoryRequest',
                    async ({ request }) => {
                        const body = await request.json();
                        const params = body?.Body?.SearchDirectoryRequest;
                        if (params?.types === 'accounts') {
                            capturedAccountsQuery = params?.query as string;
                        }
                        return HttpResponse.json({
                            Body: {
                                SearchDirectoryResponse: {
                                    account: [],
                                    dl: [],
                                    searchTotal: 0,
                                    more: false,
                                },
                            },
                        });
                    },
                ),
            );
            await setupBrowserTest(<ManageDelegates />);
            await expect
                .element(page.getByText('This list is empty.'))
                .toBeInTheDocument();
            expect(capturedAccountsQuery).toContain('zimbraIsAdminAccount=TRUE');
            expect(capturedAccountsQuery).toContain('zimbraIsDelegatedAdminAccount=TRUE');
        });

        it('should request distribution lists with admin group query', async () => {
            let capturedDlQuery = '';
            worker.use(
                http.post<never, SearchDirectoryBody>(
                    '/service/admin/soap/SearchDirectoryRequest',
                    async ({ request }) => {
                        const body = await request.json();
                        const params = body?.Body?.SearchDirectoryRequest;
                        if (
                            params?.types?.includes('distributionlists') &&
                            (params?.query as string)?.includes('zimbraIsAdminGroup')
                        ) {
                            capturedDlQuery = params?.query as string;
                        }
                        return HttpResponse.json({
                            Body: {
                                SearchDirectoryResponse: {
                                    account: [],
                                    dl: [],
                                    searchTotal: 0,
                                    more: false,
                                },
                            },
                        });
                    },
                ),
            );
            await setupBrowserTest(<ManageDelegates />);
            await expect
                .element(page.getByText('This list is empty.'))
                .toBeInTheDocument();
            expect(capturedDlQuery).toContain('zimbraIsAdminGroup=TRUE');
        });
    });
});
