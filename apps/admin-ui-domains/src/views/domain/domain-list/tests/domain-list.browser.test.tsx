/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createBrowserSoapAPIInterceptor, setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import DomainList from '../domain-list';

type DomainEntry = {
    name: string;
    id: string;
    a: Array<{ n: string; _content: string }>;
};

function buildDomain(name: string, id: string, status = 'active'): DomainEntry {
    return {
        name,
        id,
        a: [
            { n: 'zimbraDomainName', _content: name },
            { n: 'zimbraDomainStatus', _content: status },
            { n: 'zimbraDomainType', _content: 'local' },
            { n: 'zimbraId', _content: id },
        ],
    };
}

const DOMAINS: Array<DomainEntry> = [
    buildDomain('example.com', 'domain-1'),
    buildDomain('corp.org', 'domain-2'),
    buildDomain('test.net', 'domain-3', 'locked'),
];

function setupSearchDirectoryInterceptor(
    domains: Array<DomainEntry> = DOMAINS,
): Promise<unknown> {
    return createBrowserSoapAPIInterceptor('SearchDirectory', {
        domain: domains,
        searchTotal: domains.length,
        more: false,
    });
}

describe('DomainList (browser)', () => {
    describe('Rendering', () => {
        it('should render the Domains List header', async () => {
            setupSearchDirectoryInterceptor();

            setupBrowserTest(<DomainList />);

            await expect.element(page.getByText('Domains List')).toBeVisible();
        });

        it('should render table headers', async () => {
            setupSearchDirectoryInterceptor();

            setupBrowserTest(<DomainList />);

            await expect
                .element(page.getByText('Domain Name', { exact: true }))
                .toBeVisible();
            await expect
                .element(page.getByText('Status', { exact: true }))
                .toBeVisible();
        });

        it('should render the search input', async () => {
            setupSearchDirectoryInterceptor();

            setupBrowserTest(<DomainList />);

            await expect
                .element(page.getByText("I'm looking for this domain…"))
                .toBeVisible();
        });
    });

    describe('Domain list with data', () => {
        it('should display domain names after loading', async () => {
            setupSearchDirectoryInterceptor();

            setupBrowserTest(<DomainList />);

            await expect.element(page.getByText('example.com')).toBeVisible();
            await expect.element(page.getByText('corp.org')).toBeVisible();
            await expect.element(page.getByText('test.net')).toBeVisible();
        });

        it('should show Active status for active domains', async () => {
            setupSearchDirectoryInterceptor();

            setupBrowserTest(<DomainList />);

            await expect
                .element(page.getByText('Active', { exact: true }).first())
                .toBeVisible();
        });

        it('should show Locked status for locked domains', async () => {
            setupSearchDirectoryInterceptor();

            setupBrowserTest(<DomainList />);

            await expect
                .element(page.getByText('Locked', { exact: true }))
                .toBeVisible();
        });

        it('should render a single domain correctly', async () => {
            const singleDomain = [buildDomain('only.com', 'domain-single')];
            setupSearchDirectoryInterceptor(singleDomain);

            setupBrowserTest(<DomainList />);

            await expect.element(page.getByText('only.com')).toBeVisible();
            await expect
                .element(page.getByText('Active', { exact: true }))
                .toBeVisible();
        });

        it('should show different statuses correctly', async () => {
            const domains = [
                buildDomain('active.com', 'd-1', 'active'),
                buildDomain('closed.com', 'd-2', 'closed'),
                buildDomain('suspended.com', 'd-3', 'suspended'),
                buildDomain('maintenance.com', 'd-4', 'maintenance'),
            ];
            setupSearchDirectoryInterceptor(domains);

            setupBrowserTest(<DomainList />);

            await expect
                .element(page.getByText('Active', { exact: true }))
                .toBeVisible();
            await expect
                .element(page.getByText('Closed', { exact: true }))
                .toBeVisible();
            await expect
                .element(page.getByText('Suspended', { exact: true }))
                .toBeVisible();
            await expect
                .element(page.getByText('In maintenance', { exact: true }))
                .toBeVisible();
        });
    });

    describe('Empty state', () => {
        it('should show empty state when no domains exist', async () => {
            setupSearchDirectoryInterceptor([]);

            setupBrowserTest(<DomainList />);

            await expect
                .element(page.getByText('This list is empty.'))
                .toBeVisible();
        });

        it('should show help text in empty state', async () => {
            setupSearchDirectoryInterceptor([]);

            setupBrowserTest(<DomainList />);

            await expect
                .element(page.getByText(/You can create a new Domain/))
                .toBeVisible();
        });

        it('should disable search input when list is empty and no search text', async () => {
            setupSearchDirectoryInterceptor([]);

            setupBrowserTest(<DomainList />);

            await expect
                .element(page.getByText('This list is empty.'))
                .toBeVisible();

            const searchInput = page.getByRole('textbox');
            await expect.element(searchInput).toBeDisabled();
        });
    });

    describe('Search', () => {
        it('should enable search input when domains are present', async () => {
            setupSearchDirectoryInterceptor();

            setupBrowserTest(<DomainList />);

            await expect.element(page.getByText('example.com')).toBeVisible();

            const searchInput = page.getByRole('textbox');
            await expect.element(searchInput).toBeEnabled();
        });

        it('should allow typing in the search input', async () => {
            setupSearchDirectoryInterceptor();

            setupBrowserTest(<DomainList />);

            await expect.element(page.getByText('example.com')).toBeVisible();

            const searchInput = page.getByRole('textbox');
            await userEvent.fill(searchInput, 'test');
            await expect.element(searchInput).toHaveValue('test');
        });
    });

    describe('API interaction', () => {
        it('should send SearchDirectory request with domains type', async () => {
            const interceptor = setupSearchDirectoryInterceptor();

            setupBrowserTest(<DomainList />);

            const requestParams = (await interceptor) as any;
            expect(requestParams.types).toBe('domains');
            expect(requestParams.offset).toBe(0);
            expect(requestParams.limit).toBe(10);
        });

        it('should request correct sorting parameters', async () => {
            const interceptor = setupSearchDirectoryInterceptor();

            setupBrowserTest(<DomainList />);

            const requestParams = (await interceptor) as any;
            expect(requestParams.sortBy).toBe('zimbraDomainName');
            expect(requestParams.sortAscending).toBe('1');
        });
    });
});
