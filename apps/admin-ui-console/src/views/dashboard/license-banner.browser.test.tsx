/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { page } from '@vitest/browser/context';
import { setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import LicenseBanner from './license-banner';

describe('LicenseBanner', () => {

    const maintenanceEndDate = 1750272000000;

    it('renders expiring message', async () => {
        setupBrowserTest(
            <LicenseBanner
                maintenanceEndDate={maintenanceEndDate}
                maintenanceStatus="expiring"
                setLicenseBannerOpen={() => { }}
            />
        );
        await expect.element(page.getByText(/will expire on 18 Jun 2025/i)).toBeVisible();
    });

    it('renders expired message', async () => {
        setupBrowserTest(
            <LicenseBanner
                maintenanceEndDate={maintenanceEndDate}
                maintenanceStatus="expired"
                setLicenseBannerOpen={() => { }}
            />
        );
        await expect.element(page.getByText(/expired on 18 Jun 2025/i)).toBeVisible();
    });

    it('shows redirect button when redirectButtonHasToAppear is true', async () => {
        setupBrowserTest(
            <LicenseBanner
                maintenanceEndDate={maintenanceEndDate}
                maintenanceStatus="expired"
                setLicenseBannerOpen={() => { }}
                redirectButtonHasToAppear
            />
        );
        await expect.element(page.getByText(/View Subscription Details/i)).toBeVisible();
    });

    it('does not show redirect button when redirectButtonHasToAppear is false', async () => {
        setupBrowserTest(
            <LicenseBanner
                maintenanceEndDate={maintenanceEndDate}
                maintenanceStatus="expired"
                setLicenseBannerOpen={() => { }}
            />
        );
        expect(page.getByText('View Subscription Details').elements()).toHaveLength(0);
    });
});

