/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { AppRouteDescriptor, useAppStore } from '@zextras/ui-shared';
import {
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  grantUserConfigRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { COS_ROUTE_ID, GENERAL_INFORMATION, MANAGE_APP_ID } from '../../src/constants';
import { cosQueryKeys } from '../../src/services/cos-query-keys';
import { CosListPanel } from '../../src/views/cos/cos-list-panel';

const FIRST_COS_ID = 'e00428a1-0c00-11d9-836a-000d93afea2a';
const SECOND_COS_ID = 'f27456a8-0c00-11d9-280a-286d93afea2g';

const mockApiResponse = {
  cos: [
    {
      name: 'firstCOS',
      id: FIRST_COS_ID,
      isDefaultCos: true,
    },
    {
      name: 'secondCOS',
      id: SECOND_COS_ID,
      isDefaultCos: true,
    },
  ],
  searchTotal: 2,
  more: false,
};

const mockCosDetail = {
  cos: [
    {
      id: FIRST_COS_ID,
      name: 'firstCOS',
      a: [{ n: 'zimbraId', _content: FIRST_COS_ID }],
    },
  ],
};

describe('CosListPanel', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  async function setupListPanelTest(
    searchDirectoryResponse = {},
    options?: { initialRouterEntry?: string; seedCosDetail?: boolean },
  ) {
    createBrowserSoapAPIInterceptor('SearchDirectory', searchDirectoryResponse);
    createBrowserSoapAPIInterceptor('GetCos', mockCosDetail);

    if (options?.seedCosDetail) {
      queryClient.setQueryData(cosQueryKeys.detail(FIRST_COS_ID), mockCosDetail);
    }

    await setupBrowserTest(<CosListPanel />, {
      initialRouterEntry: options?.initialRouterEntry ?? '/manage/cos/cos_list',
      queryClient,
    });
    await expect.element(page.getByText('General')).toBeVisible();
  }

  beforeEach(async () => {
    vi.resetAllMocks();
    queryClient = getQueryClient();
    queryClient.setQueryData(['all-config'], [{ n: 'carbonioSendAnalytics', _content: 'FALSE' }]);
    await grantUserConfigRights(queryClient);
  });

  afterEach(() => {
    resetMockWorker();
  });

  it('should render all parts of the component', async () => {
    await setupListPanelTest();

    await expect.element(page.getByText('COS List')).toBeVisible();
    await expect.element(page.getByText('Select a Class of Service')).toBeVisible();
    await expect.element(page.getByText('Details')).toBeVisible();
    await expect.element(page.getByText('General Information')).toBeVisible();
    await expect.element(page.getByText('Features')).toBeVisible();
    await expect.element(page.getByText('Chat')).toBeVisible();
    await expect.element(page.getByText('Preferences')).toBeVisible();
    await expect.element(page.getByText('Server Pools')).toBeVisible();
    await expect.element(page.getByText('Advanced')).toBeVisible();
  });

  it('should show details grayed out when no COS is selected', async () => {
    await setupListPanelTest();

    await expect.element(page.getByText('General Information')).toHaveStyle({ opacity: '0.5' });
    await expect.element(page.getByText('Features')).toHaveStyle({ opacity: '0.5' });
    await expect.element(page.getByText('Chat')).toHaveStyle({ opacity: '0.5' });
    await expect.element(page.getByText('Preferences')).toHaveStyle({ opacity: '0.5' });
    await expect.element(page.getByText('Server Pools')).toHaveStyle({ opacity: '0.5' });
    await expect.element(page.getByText('Advanced')).toHaveStyle({ opacity: '0.5' });
  });

  it('should show clickable details when COS is selected', async () => {
    await setupListPanelTest(mockApiResponse, {
      initialRouterEntry: `/${MANAGE_APP_ID}/cos/${FIRST_COS_ID}/${GENERAL_INFORMATION}`,
      seedCosDetail: true,
    });

    await expect.element(page.getByText('General Information')).toHaveStyle({ opacity: '1' });
  });

  it('should hide details when the details button is pressed', async () => {
    await setupListPanelTest(mockApiResponse, {
      initialRouterEntry: `/${MANAGE_APP_ID}/cos/${FIRST_COS_ID}/${GENERAL_INFORMATION}`,
      seedCosDetail: true,
    });

    await expect.element(page.getByText('General Information')).toBeVisible();
    await page.getByText('Details').click();
    expect(page.getByText('General Information').elements()).toHaveLength(0);
  });

  it('should show detail options in bold when selected after selecting a COS', async () => {
    await setupListPanelTest(mockApiResponse, {
      initialRouterEntry: `/${MANAGE_APP_ID}/cos/${FIRST_COS_ID}/${GENERAL_INFORMATION}`,
      seedCosDetail: true,
    });

    await expect.element(page.getByText('General Information')).toHaveStyle({ opacity: '1' });
    await page.getByText('Details').click();
    await expect.element(page.getByText('Details')).toBeVisible();
    const allDsTexts = document.querySelectorAll('ds-text');
    const detailsDsText = Array.from(allDsTexts).find((el) => el.textContent?.includes('Details'));
    expect(detailsDsText).toBeTruthy();
    expect(detailsDsText?.getAttribute('weight')).toBe('bold');
  });

  it('should expose the expanded state on the Details toggle', async () => {
    await setupListPanelTest(mockApiResponse, {
      initialRouterEntry: `/${MANAGE_APP_ID}/cos/${FIRST_COS_ID}/${GENERAL_INFORMATION}`,
      seedCosDetail: true,
    });

    await expect.element(page.getByText('General Information')).toBeVisible();

    await expect
      .element(page.getByRole('button', { name: 'Details' }))
      .toHaveAttribute('aria-expanded', 'true');

    await page.getByRole('button', { name: 'Details' }).click();
    await expect
      .element(page.getByRole('button', { name: 'Details' }))
      .toHaveAttribute('aria-expanded', 'false');
  });

  it('should show all COS items in dropdown after selecting a COS when no cos is selected', async () => {
    await setupListPanelTest(mockApiResponse, {
      initialRouterEntry: `/${MANAGE_APP_ID}/cos/${FIRST_COS_ID}/${GENERAL_INFORMATION}`,
      seedCosDetail: true,
    });

    await page.getByPlaceholder('I want to see this COS').click();

    await expect.element(page.getByText('firstCOS')).toBeVisible();
    await expect.element(page.getByText('secondCOS')).toBeVisible();
  });

  it('should show all COS items in dropdown after selecting a COS when a cos is already selected', async () => {
    useAppStore.getState().setters.addRoute({
      id: COS_ROUTE_ID,
      route: `${MANAGE_APP_ID}/${COS_ROUTE_ID}`,
      app: MANAGE_APP_ID,
    } as AppRouteDescriptor);
    await setupListPanelTest(mockApiResponse, {
      initialRouterEntry: `/${MANAGE_APP_ID}/cos/`,
      seedCosDetail: true,
    });

    await page.getByPlaceholder('Select a class of service').click();
    await expect.element(page.getByText('firstCOS')).toBeVisible();
    await page.getByText('firstCOS').click();

    await expect.element(page.getByPlaceholder('I want to see this COS')).toBeVisible();
    await page.getByPlaceholder('I want to see this COS').click();
    await expect.element(page.getByText('secondCOS')).toBeVisible();
  });

  it('should change General icon when its section is toggled', async () => {
    await setupListPanelTest();

    await expect.element(page.getByText('General')).toBeVisible();
    const buttonBeforeClick = page.getByRole('button').first().element();
    expect(buttonBeforeClick.innerHTML).toContain('ChevronUpOutline');

    await page.getByText('General', { exact: true }).click();
    const buttonAfterClick = page.getByRole('button').first().element();
    expect(buttonAfterClick.innerHTML).toContain('ChevronDownOutline');
  });
});
