/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserSoapAPIInterceptor,
  getAllConfigResponseMock,
  getAllConfigRightsResponseMock,
  getGetInfoResponseMock,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { CARBONIO_SEND_ANALYTICS } from '../../constants';
import { AppView } from '../app-view';

describe('Privacy AppView', () => {
  it('renders the breadcrumb and the privacy view content', async () => {
    const getInfoInterceptor = createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
    const getAllConfigInterceptor = createBrowserSoapAPIInterceptor(
      'GetAllConfig',
      getAllConfigResponseMock({ [CARBONIO_SEND_ANALYTICS]: 'FALSE' }),
    );
    const getAllConfigRightsInterceptor = createBrowserSoapAPIInterceptor(
      'GetAllEffectiveRights',
      getAllConfigRightsResponseMock(),
    );

    setupBrowserTest(<AppView />);

    await getInfoInterceptor;
    await getAllConfigInterceptor;
    await getAllConfigRightsInterceptor;

    // Breadcrumb renders
    await expect.element(page.getByText('Home')).toBeVisible();

    // Privacy view content renders inside AppView
    await expect.element(page.getByText('Privacy')).toBeVisible();
    await expect.element(page.getByText('Allow data analytics')).toBeVisible();
  });
});
