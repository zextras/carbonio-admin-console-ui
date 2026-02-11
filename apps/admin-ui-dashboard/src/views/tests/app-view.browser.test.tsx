/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
    createBrowserSoapAPIInterceptor,
    getGetInfoResponseMock,
    getQueryClient,
    grantUserConfigRights,
    setupBrowserTest
} from 'admin-ui-test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { DASHBOARD } from '../../constants';
import AppView from '../app-view';

describe('AppView', () => {
    let queryClient: ReturnType<typeof getQueryClient>;

    beforeEach(() => {
        queryClient = getQueryClient();
        grantUserConfigRights();
    });

    async function setupAppViewTest(initialRoute?: string) {
        // Setup API interceptors
        const getInfoInterceptor = createBrowserSoapAPIInterceptor(
            'GetInfo',
            getGetInfoResponseMock()
        );
        createBrowserSoapAPIInterceptor('GetAllEffectiveRights', {
            grantee: { id: 'test-id', name: 'admin@test.com' },
            target: []
        });
        createBrowserSoapAPIInterceptor('GetAllServers', {
            server: [
                {
                    id: 'server-1',
                    name: 'mailstore1.test.com',
                    a: [
                        { n: 'zimbraServiceHostname', _content: 'mailstore1.test.com' },
                        { n: 'description', _content: 'Primary mailstore' }
                    ]
                }
            ]
        });
        createBrowserSoapAPIInterceptor('GetDomain', {
            domain: {
                id: 'domain-1',
                name: 'test.com',
                a: [{ n: 'zimbraDomainName', _content: 'test.com' }]
            }
        });
        createBrowserSoapAPIInterceptor('GetVersionInfo', {
            info: { majorversion: '24', minorversion: '5', microversion: '0' }
        });
        createBrowserSoapAPIInterceptor('SearchDirectory', {});

        await setupBrowserTest(<AppView />, {
            initialRouterEntry: initialRoute || `/${DASHBOARD}`,
            queryClient
        });

        await getInfoInterceptor;
    }

    it('renders BreadCrumb with home icon', async () => {
        await setupAppViewTest();
        await expect.element(page.getByTestId('icon: HomeOutline')).toBeVisible();
    });

    it('renders Welcome section with username', async () => {
        await setupAppViewTest();
        await expect.element(page.getByText(/Welcome/i)).toBeVisible();
        await expect.element(page.getByText('test')).toBeVisible();
    });

    it('renders Quick Access section with all elements', async () => {
        await setupAppViewTest();
        // Section title and icon
        await expect.element(page.getByText(/Quick Access/i)).toBeVisible();
        await expect.element(page.getByTestId('icon: FlashOutline')).toBeVisible();

        // Accounts card
        await expect.element(page.getByText(/Accounts/i)).toBeVisible();
        await expect.element(page.getByTestId('icon: PersonOutline')).toBeVisible();

        // Distribution List card
        await expect.element(page.getByText(/Distribution List/i)).toBeVisible();
        await expect.element(page.getByTestId('icon: DistributionListOutline')).toBeVisible();

        // Domain labels (at least 1)
        const domainsElements = page.getByText(/Domains/i).all();
        expect(domainsElements.length).toBeGreaterThanOrEqual(1);

        // Open labels and chevron icons (at least 2 each)
        const openElements = page.getByText(/^Open$/i).all();
        expect(openElements.length).toBeGreaterThanOrEqual(2);

        const chevronIcons = page.getByTestId('icon: ChevronRightOutline').all();
        expect(chevronIcons.length).toBeGreaterThanOrEqual(2);
    });
});