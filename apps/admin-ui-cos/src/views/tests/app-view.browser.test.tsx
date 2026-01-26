/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
    createBrowserSoapAPIInterceptor,
    getQueryClient,
    grantUserConfigRights,
    resetMockWorker,
    setupBrowserTest
} from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { COS_ROUTE_ID, MANAGE_APP_ID } from '../../constants';
import { useCosStore } from '../../store/cos/store';
import AppView from '../app-view';

describe('AppView', () => {
    let queryClient: ReturnType<typeof getQueryClient>;

    beforeEach(async () => {
        queryClient = getQueryClient();
        queryClient.setQueryData(['all-config'], [
            { n: 'carbonioSendAnalytics', _content: 'FALSE' }
        ]);
        grantUserConfigRights(queryClient);

        // Mock user settings for BreadCrumb
        queryClient.setQueryData(['account', 'settings'], {
            prefs: {},
            attrs: { zimbraId: 'test-user-id' },
            props: []
        });

        // Mock last login timestamp
        queryClient.setQueryData(['lastLoginTimestamp', 'test-user-id'], {
            lastLogonTimestamp: Date.now()
        });

        useCosStore.getState().reset();
    });

    afterEach(() => {
        resetMockWorker();
        useCosStore.getState().reset();
    });

    it('should render BreadCrumb component', async () => {
        createBrowserSoapAPIInterceptor('SearchDirectory', {});
        createBrowserSoapAPIInterceptor('GetAccount', {});

        setupBrowserTest(<AppView />, {
            initialRouterEntry: `/manage/cos/cos_list`,
            queryClient
        });

        // BreadCrumb should show the home icon
        await expect.element(page.getByTestId('icon: HomeOutline')).toBeVisible();
    });

    it('should render main container structure', async () => {
        createBrowserSoapAPIInterceptor('SearchDirectory', {});
        createBrowserSoapAPIInterceptor('GetAccount', {});

        setupBrowserTest(<AppView />, {
            initialRouterEntry: `/manage/cos`,
            queryClient
        });

        // BreadCrumb is rendered
        await expect.element(page.getByTestId('icon: HomeOutline')).toBeVisible();
    });

    it('should render BreadCrumb on different routes', async () => {
        createBrowserSoapAPIInterceptor('SearchDirectory', {});
        createBrowserSoapAPIInterceptor('GetAccount', {});

        setupBrowserTest(<AppView />, {
            initialRouterEntry: '/different/route',
            queryClient
        });

        // BreadCrumb should always be visible regardless of route
        await expect.element(page.getByTestId('icon: HomeOutline')).toBeVisible();
    });

    it.only('should render CosListPanel on matching route', async () => {
        createBrowserSoapAPIInterceptor('SearchDirectory', {});
        createBrowserSoapAPIInterceptor('GetAccount', {});

        setupBrowserTest(<AppView />, {
            initialRouterEntry: `/manage/cos`,
            queryClient
        });

        await expect.element(page.getByText('General')).toBeVisible();
        await expect.element(page.getByText('Details')).toBeVisible();
    });
});
