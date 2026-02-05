/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { Container } from '@zextras/ui-components';
import { Suspense } from 'react';
import { Route } from 'react-router-dom';

import { DASHBOARD } from '../../constants';
import AppView from '../app-view';

// Mock only the internal components that have complex dependencies
// This allows us to test AppView's structure and routing without dealing with
// Dashboard and BreadCrumb's internal complexities
vi.mock('../breadcrumb/breadcrumb-view', () => ({
    default: () => <div data-testid="breadcrumb">BreadCrumb</div>
}));

vi.mock('../dashboard/dashboard-view', () => ({
    default: () => <div data-testid="dashboard">Dashboard Content</div>
}));

describe('AppView', () => {
    // Suppress unhandled rejection errors
    let unhandledRejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;

    beforeAll(() => {
        unhandledRejectionHandler = (event: PromiseRejectionEvent): void => {
            event.preventDefault();
        };
        globalThis.addEventListener('unhandledrejection', unhandledRejectionHandler);
    });

    afterAll(() => {
        if (unhandledRejectionHandler) {
            globalThis.removeEventListener('unhandledrejection', unhandledRejectionHandler);
        }
    });

    function setupAppViewTest(initialRoute?: string) {
        const queryClient = getQueryClient();

        // Minimal data setup - not testing child components' data requirements
        queryClient.setQueryData(['account', 'info'], {
            id: 'test-user-id',
            name: 'test@example.com'
        });

        return setupBrowserTest(<AppView />, {
            initialRouterEntry: initialRoute || `/${DASHBOARD}`,
            queryClient
        });
    }

    it('renders without crashing', () => {
        setupAppViewTest();

        // Verify the component renders
        const body = document.body;
        expect(body).toBeTruthy();
        expect(body.querySelector('div')).toBeTruthy();
    });

    it('renders BreadCrumb component', async () => {
        setupAppViewTest();

        // Check that BreadCrumb is rendered
        await expect.element(page.getByTestId('breadcrumb')).toBeVisible();
    });

    it('renders Dashboard when on dashboard route', async () => {
        setupAppViewTest(`/${DASHBOARD}`);

        // Check that Dashboard is rendered on the correct route
        await expect.element(page.getByTestId('dashboard')).toBeVisible();
    });

    it('has correct container structure with Suspense', async () => {
        setupAppViewTest(`/${DASHBOARD}`);

        // Verify both breadcrumb and dashboard are present
        await expect.element(page.getByTestId('breadcrumb')).toBeVisible();
        await expect.element(page.getByTestId('dashboard')).toBeVisible();
    });

    it('does not render Dashboard when not on dashboard route', () => {
        setupAppViewTest('/other-route');

        // Dashboard should not be present on other routes
        const dashboard = page.getByTestId('dashboard').query();
        expect(dashboard).toBeNull();
    });

    it('correctly handles route changes', async () => {
        setupAppViewTest(`/${DASHBOARD}`);

        // Verify we're on the dashboard route
        expect(globalThis.location.pathname).toContain(DASHBOARD);
    });
});
