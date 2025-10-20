/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { page } from '@vitest/browser/context';
import { createSoapAPIInterceptor, resetMockWorker, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { Route } from 'react-router-dom';
import { it, expect, describe, beforeEach, afterEach } from 'vitest';

import { useCosStore } from '../../src/store/cos/store';
import { CosDetailPanel } from '../../src/views/cos/cos-detail-panel';
import CosGeneralInformation from '../../src/views/cos/cos-general-information';

//do a mock that returns more than two COS items
const mockApiResponse = {
    cos: [
        {
            name: 'firstCOS',
            id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
            isDefaultCos: true
        },
        {
            name: 'secondCOS',
            id: 'f27456a8-0c00-11d9-280a-286d93afea2g',
            isDefaultCos: false
        }
    ],
    searchTotal: 2,
    more: false
};
describe('', () => {
    beforeEach(() => {
        useCosStore.getState().reset();
    });

    // Also reset after each test for extra safety
    afterEach(() => {
        resetMockWorker();
        useCosStore.getState().reset();
    });

    it('should render all main elements of cos-general-information', async () => {
        createSoapAPIInterceptor('SearchDirectory', {});
        setupBrowserTest(<CosGeneralInformation />,);

        await expect.element(page.getByText('General Information')).toBeVisible();
        await expect.element(page.getByLabelText('Name')).toBeVisible();
        await expect.element(page.getByLabelText('ID')).toBeVisible();
        await expect.element(page.getByLabelText('Creation Date')).toBeVisible();
        await expect.element(page.getByLabelText('Domains that use this CoS as default')).toBeVisible();
        await expect.element(page.getByLabelText('Description')).toBeVisible();
        await expect.element(page.getByLabelText('Notes')).toBeVisible();
        await expect.element(page.getByText('Domains that use this COS', { exact: true })).toBeVisible();
        expect(page.getByText('Accounts that use this COS').elements()).toHaveLength(2);
        await expect.element(page.getByLabelText('Search for a domain')).toBeVisible();
        await expect.element(page.getByLabelText('Search for an account')).toBeVisible();
        await expect.element(page.getByRole('button', { name: /DELETE/i })).toBeVisible();
    });
});
