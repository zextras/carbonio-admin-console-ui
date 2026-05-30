/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { type Attribute } from '../../../types/attribute';
import { FeaturesForm } from './features-form';

const COS_ID = 'e00428a1-0c00-11d9-836a-000d93afea2a';

const MOCK_COS_INFORMATION: Array<Attribute> = [
  { n: 'zimbraId', _content: COS_ID },
  { n: 'carbonioFeatureMailsAppEnabled', _content: 'TRUE' },
  { n: 'zimbraFeatureOutOfOfficeReplyEnabled', _content: 'TRUE' },
  { n: 'zimbraFeatureSignaturesEnabled', _content: 'TRUE' },
  { n: 'zimbraFeatureContactsEnabled', _content: 'TRUE' },
  { n: 'zimbraFeatureCalendarEnabled', _content: 'TRUE' },
  { n: 'carbonioFeatureFilesEnabled', _content: 'TRUE' },
  { n: 'carbonioFeatureFilesAppEnabled', _content: 'TRUE' },
  { n: 'carbonioFeatureTasksEnabled', _content: 'TRUE' },
  { n: 'zimbraFeatureOptionsEnabled', _content: 'TRUE' },
  { n: 'carbonioOtpWizardFromUntrusted', _content: 'FALSE' },
  { n: 'carbonioFeatureOTPMgmtEnabled', _content: 'TRUE' },
  { n: 'carbonioOtpGracePeriodEnabled', _content: 'FALSE' },
  { n: 'carbonioOtpGracePeriodEndingTime', _content: '' },
];

const MOCK_MOBILE_ATTRIBUTES = {
  attributes: {
    mobileContactFeatureSync: [{ value: 'disabled' }],
    mobileCalendarFeatureSync: [{ value: 'disabled' }],
  },
};

const TestWrapper = ({
  cosInformation = MOCK_COS_INFORMATION,
  mobileAttributesData = MOCK_MOBILE_ATTRIBUTES,
  readonlyCOS = false,
  isAdvanced = false,
}: {
  cosInformation?: Array<Attribute>;
  mobileAttributesData?: typeof MOCK_MOBILE_ATTRIBUTES;
  readonlyCOS?: boolean;
  isAdvanced?: boolean;
}) => (
  <FeaturesForm
    cosInformation={cosInformation}
    cosName="default"
    mobileAttributesData={mobileAttributesData}
    readonlyCOS={readonlyCOS}
    isAdvanced={isAdvanced}
  />
);

async function setupTest(wrapper: React.ReactElement = <TestWrapper />) {
  createBrowserSoapAPIInterceptor('ModifyCos', {});
  createBrowserSoapAPIInterceptor('FlushCache', {});
  createBrowserAPIInterceptor('post', '/service/extension/zextras_admin/core/attributes/get', () =>
    HttpResponse.json(MOCK_MOBILE_ATTRIBUTES),
  );

  await setupBrowserTest(
    <Routes>
      <Route path="/:cosId/:operation" element={wrapper} />
    </Routes>,
    { initialRouterEntry: `/${COS_ID}/features` },
  );
}

// NOTE: These tests are very poor because of a div soup situation.
// The Switch.tsx component renders a <div> with a ds-icon that toggles between ToggleRight and ToggleLeftOutline.
// There's no native <input type="checkbox"> or role="switch", so .toBeChecked() won't work.
describe('FeaturesForm (browser)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    resetMockWorker();
  });

  it('should render 2FA section', async () => {
    await setupTest();
    await expect.element(page.getByText('Two-Factor authenticator')).toBeVisible();
    await expect.element(page.getByText('Allow users to configure 2FA')).toBeVisible();
    await expect
      .element(
        page.getByText(
          'Users will be able to set up and manage their One-Time Password (OTP) from their profile settings.',
        ),
      )
      .toBeVisible();
  });

  it('should toggle 2FA switch', async () => {
    await setupTest();
    const switchLabel = page.getByText('Allow users to configure 2FA');
    await userEvent.click(switchLabel);
    await expect.element(switchLabel).toBeVisible();
  });

  it('should render Mobile App switch in Mail section and be clickable', async () => {
    await setupTest();
    await expect.element(page.getByText('Mail', { exact: true })).toBeVisible();
    const mobileAppSwitch = page.getByText('Mobile App').first();
    await userEvent.click(mobileAppSwitch);
  });

  it('should render Contacts Web Feature switch and be clickable', async () => {
    await setupTest();
    const webFeatureSwitch = page.getByText('Web Feature').nth(0);
    await expect.element(webFeatureSwitch).toBeVisible();
    await userEvent.click(webFeatureSwitch);
  });

  it('should render Calendar Web Feature switch and be clickable', async () => {
    await setupTest();
    const webFeatureSwitch = page.getByText('Web Feature').nth(1);
    await expect.element(webFeatureSwitch).toBeVisible();
    await userEvent.click(webFeatureSwitch);
  });

  it('should render Files Web Feature switch and be clickable', async () => {
    await setupTest();
    const webFeatureSwitch = page.getByText('Web Feature').nth(2);
    await expect.element(webFeatureSwitch).toBeVisible();
    await userEvent.click(webFeatureSwitch);
  });

  it('should render Tasks Web Feature switch and be clickable', async () => {
    await setupTest();
    const webFeatureSwitch = page.getByText('Web Feature').nth(3);
    await expect.element(webFeatureSwitch).toBeVisible();
    await userEvent.click(webFeatureSwitch);
  });

  it('should disable Files Mobile App when Files Web Feature is FALSE', async () => {
    await setupTest(
      <TestWrapper
        cosInformation={MOCK_COS_INFORMATION.map((a) =>
          a.n === 'carbonioFeatureFilesEnabled' ? { ...a, _content: 'FALSE' } : a,
        )}
      />,
    );
    const filesMobileApp = page.getByText('Mobile App').nth(1);
    await expect.element(filesMobileApp).toBeVisible();
    await userEvent.click(filesMobileApp);
  });

  it('should render General section with Can access Settings', async () => {
    await setupTest();
    await expect.element(page.getByText('General')).toBeVisible();
    await expect.element(page.getByText('Can access Settings')).toBeVisible();
  });

  it('should render all feature sections', async () => {
    await setupTest();
    await expect.element(page.getByText('Mail', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Contacts', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Calendar', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Files', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Tasks', { exact: true })).toBeVisible();
  });
});
