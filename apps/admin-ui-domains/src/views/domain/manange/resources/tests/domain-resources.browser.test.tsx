/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useDomainStore } from '@zextras/ui-shared';
import { createBrowserSoapAPIInterceptor, setupBrowserTest } from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import DomainResources from '../domain-resources';

const DOMAIN_NAME = 'example.com';

type ResourceAttribute = { n: string; _content: string };

type ResourceEntry = {
    name: string;
    id: string;
    a: Array<ResourceAttribute>;
};

function buildResource(
    email: string,
    id: string,
    overrides: {
        displayName?: string;
        status?: string;
        lastLogon?: string;
        description?: string;
    } = {},
): ResourceEntry {
    const {
        displayName = email.split('@')[0],
        status = 'active',
        lastLogon = '',
        description = '',
    } = overrides;

    const attrs: Array<ResourceAttribute> = [
        { n: 'displayName', _content: displayName },
        { n: 'zimbraAccountStatus', _content: status },
        { n: 'description', _content: description },
        { n: 'zimbraId', _content: id },
    ];

    if (lastLogon) {
        attrs.push({ n: 'zimbraLastLogonTimestamp', _content: lastLogon });
    }

    return { name: email, id, a: attrs };
}

const RESOURCES: Array<ResourceEntry> = [
    buildResource('room1@example.com', 'res-1', {
        displayName: 'Conference Room A',
        status: 'active',
        description: 'Main conference room',
    }),
    buildResource('projector@example.com', 'res-2', {
        displayName: 'Projector',
        status: 'closed',
        description: 'Portable projector',
    }),
    buildResource('car@example.com', 'res-3', {
        displayName: 'Company Car',
        status: 'active',
        lastLogon: '20260215143000.000Z',
        description: 'Fleet vehicle',
    }),
];

function setupSearchDirectoryInterceptor(
    resources: Array<ResourceEntry> = RESOURCES,
): Promise<unknown> {
    return createBrowserSoapAPIInterceptor('SearchDirectory', {
        calresource: resources,
        searchTotal: resources.length,
        more: false,
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

describe('DomainResources (browser)', () => {
    beforeEach(() => {
        setupDomainStore();
    });

    afterEach(() => {
        useDomainStore.setState({});
    });

    describe('Rendering', () => {
        it('should render the Resources title', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<DomainResources />);
            await expect
                .element(page.getByText('Resources', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the add button (+)', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<DomainResources />);
            const buttons = page.getByRole('button');
            await expect.element(buttons.first()).toBeInTheDocument();
        });

        it('should render the search input', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<DomainResources />);
            await expect.element(page.getByText('Conference Room A')).toBeInTheDocument();
            await expect.element(page.getByLabelText('Search…')).toBeInTheDocument();
        });
    });

    describe('Table headers', () => {
        it('should render the Resource column header', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<DomainResources />);
            await expect
                .element(page.getByText('Resource', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Email column header', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<DomainResources />);
            await expect
                .element(page.getByText('Email', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Status column header', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<DomainResources />);
            await expect
                .element(page.getByText('Status', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Last Access column header', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<DomainResources />);
            await expect
                .element(page.getByText('Last Access', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Description column header', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<DomainResources />);
            await expect
                .element(page.getByText('Description', { exact: true }).first())
                .toBeInTheDocument();
        });
    });

    describe('List with data', () => {
        it('should display resource display names', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<DomainResources />);
            await expect.element(page.getByText('Conference Room A')).toBeInTheDocument();
            await expect
                .element(page.getByText('Projector', { exact: true }))
                .toBeInTheDocument();
            await expect.element(page.getByText('Company Car')).toBeInTheDocument();
        });

        it('should display resource email addresses', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<DomainResources />);
            await expect.element(page.getByText('room1@example.com')).toBeInTheDocument();
            await expect.element(page.getByText('projector@example.com')).toBeInTheDocument();
            await expect.element(page.getByText('car@example.com')).toBeInTheDocument();
        });

        it('should display resource statuses', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<DomainResources />);
            await expect
                .element(page.getByText('active', { exact: true }).first())
                .toBeInTheDocument();
            await expect
                .element(page.getByText('closed', { exact: true }).first())
                .toBeInTheDocument();
        });

        it('should display Never logged In for resources without last logon', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<DomainResources />);
            await expect
                .element(page.getByText('Never logged In', { exact: true }).first())
                .toBeInTheDocument();
        });

        it('should display descriptions', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<DomainResources />);
            await expect.element(page.getByText('Main conference room')).toBeInTheDocument();
            await expect.element(page.getByText('Portable projector')).toBeInTheDocument();
            await expect.element(page.getByText('Fleet vehicle')).toBeInTheDocument();
        });
    });

    describe('Empty state', () => {
        it('should show empty list message when no resources exist', async () => {
            setupSearchDirectoryInterceptor([]);
            await setupBrowserTest(<DomainResources />);
            await expect
                .element(page.getByText('This list is empty.'))
                .toBeInTheDocument();
        });

        it('should show suggestion text to create a resource', async () => {
            setupSearchDirectoryInterceptor([]);
            await setupBrowserTest(<DomainResources />);
            await expect.element(page.getByText(/resource/)).toBeInTheDocument();
        });
    });

    describe('Search', () => {
        it('should allow typing in the search input', async () => {
            setupSearchDirectoryInterceptor();
            await setupBrowserTest(<DomainResources />);
            await expect.element(page.getByText('Conference Room A')).toBeInTheDocument();
            const searchInput = page.getByLabelText('Search…');
            await userEvent.type(searchInput, 'room');
            await expect.element(searchInput).toHaveValue('room');
        });

        it('should disable search input when list is empty', async () => {
            setupSearchDirectoryInterceptor([]);
            await setupBrowserTest(<DomainResources />);
            await expect
                .element(page.getByText('This list is empty.'))
                .toBeInTheDocument();
            const searchInput = page.getByLabelText('Search…');
            await expect.element(searchInput).toHaveAttribute('disabled');
        });
    });

    describe('API interaction', () => {
        it('should send SearchDirectory request with resources type', async () => {
            const interceptor = setupSearchDirectoryInterceptor();
            await setupBrowserTest(<DomainResources />);
            const params = await interceptor;
            expect(params).toHaveProperty('types', 'resources');
        });

        it('should send SearchDirectory request with domain name', async () => {
            const interceptor = setupSearchDirectoryInterceptor();
            await setupBrowserTest(<DomainResources />);
            const params = await interceptor;
            expect(params).toHaveProperty('domain', DOMAIN_NAME);
        });

        it('should exclude system accounts from the query', async () => {
            const interceptor = setupSearchDirectoryInterceptor();
            await setupBrowserTest(<DomainResources />);
            const params = await interceptor;
            expect((params as { query: string }).query).toContain('!(zimbraIsSystemAccount=TRUE)');
        });
    });
});
