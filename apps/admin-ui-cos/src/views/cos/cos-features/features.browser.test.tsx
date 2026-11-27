/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type LicenseV1Info, licenseV1QueryKeys, useLoginConfigStore } from '@zextras/ui-shared';
import {
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { type Attribute } from '../../../../types/attribute';
import { cosQueryKeys } from '../../../services/cos-query-keys';
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

const MOCK_COS_DETAIL = {
  cos: [
    {
      id: COS_ID,
      name: 'default',
      _attrs: { edition: 'workspace' },
    },
  ],
};

const FILES_LICENSE: LicenseV1Info = {
  licenseType: 'regular',
  status: 'valid',
  companyName: 'Acme Corp',
  partner: 'Zextras Partner',
  orderId: 'ORD-123',
  carbonioVersion: '25.1.2',
  activationToken: 'activation-token',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2027-01-01T00:00:00.000Z',
  totalActiveAccountsNumber: 42,
  lastSyncTime: null,
  editions: [
    { name: 'Workspace', status: 'green', assignedSeats: 0, totalSeats: 100 },
    { name: 'Email', status: 'green', assignedSeats: 5, totalSeats: 100 },
  ],
  addOns: [],
};

const NO_FILES_LICENSE: LicenseV1Info = {
  ...FILES_LICENSE,
  editions: [{ name: 'Email', status: 'green', assignedSeats: 5, totalSeats: 100 }],
};

const MAIL_EDITION_COS_DETAIL = {
  ...MOCK_COS_DETAIL,
  cos: [{ ...MOCK_COS_DETAIL.cos[0], _attrs: { edition: 'mail' } }],
};

function mockLicense(license: LicenseV1Info): void {
  createBrowserAPIInterceptor('get', '/services/license/v1/info', () =>
    HttpResponse.json(license),
  );
}

/**
 * Seeds the COS edition and the license before the first render, so an absent Files switch is
 * the result of the gating and not of data that has not arrived yet.
 */
async function setupSeededTest(cosDetail: typeof MOCK_COS_DETAIL, license: LicenseV1Info) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(cosQueryKeys.detail(COS_ID), cosDetail);
  queryClient.setQueryData(licenseV1QueryKeys.all, license);
  mockLicense(license);
  createBrowserSoapAPIInterceptor('GetCos', cosDetail);
  createBrowserSoapAPIInterceptor('ModifyCos', {});
  createBrowserSoapAPIInterceptor('FlushCache', {});
  createBrowserAPIInterceptor('post', '/service/extension/zextras_admin/core/attributes/get', () =>
    HttpResponse.json(MOCK_MOBILE_ATTRIBUTES),
  );

  await setupBrowserTest(
    <Routes>
      <Route path="/:cosId/:operation" element={<TestWrapper />} />
    </Routes>,
    { initialRouterEntry: `/${COS_ID}/features`, queryClient },
  );
  await expect
    .element(page.getByRole('switch', { name: 'Allow access to Tasks' }))
    .toBeVisible();
}

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

async function setupTest(
  wrapper: React.ReactElement = <TestWrapper />,
  cosDetail: typeof MOCK_COS_DETAIL = MOCK_COS_DETAIL,
) {
  createBrowserSoapAPIInterceptor('GetCos', cosDetail);
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

describe('FeaturesForm (browser)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    resetMockWorker();
    useLoginConfigStore.setState({ featureFlags: null });
  });

  it('should render Contacts switch and be clickable', async () => {
    await setupTest();
    const webFeatureSwitch = page.getByRole('switch', { name: 'Allow access to Contacts' });
    await expect.element(webFeatureSwitch).toBeChecked();
    await userEvent.click(webFeatureSwitch);
    await expect.element(webFeatureSwitch).not.toBeChecked();
  });

  it('should render Calendar switch and be clickable', async () => {
    await setupTest();
    const webFeatureSwitch = page.getByRole('switch', { name: 'Allow access to Calendars' });
    await expect.element(webFeatureSwitch).toBeChecked();
    await userEvent.click(webFeatureSwitch);
    await expect.element(webFeatureSwitch).not.toBeChecked();
  });

  it('should render Files switch and be clickable', async () => {
    await setupTest();
    const webFeatureSwitch = page.getByRole('switch', { name: 'Allow access to Files' });
    await expect.element(webFeatureSwitch).toBeChecked();
    await userEvent.click(webFeatureSwitch);
    await expect.element(webFeatureSwitch).not.toBeChecked();
  });

  it('should render the Files switch when the new-subscriptions flag is disabled and the COS edition is mail', async () => {
    useLoginConfigStore.setState({ featureFlags: null });
    mockLicense(NO_FILES_LICENSE);
    await setupTest(<TestWrapper />, MAIL_EDITION_COS_DETAIL);

    await expect
      .element(page.getByRole('switch', { name: 'Allow access to Files' }))
      .toBeVisible();
  });

  describe('Files switch with the new-subscriptions flag enabled', () => {
    beforeEach(() => {
      useLoginConfigStore.setState({ featureFlags: { enforceSubscriptionRequirements: true } });
    });

    it('should render the Files switch when the COS edition is workspace and the license allows Files', async () => {
      await setupSeededTest(MOCK_COS_DETAIL, FILES_LICENSE);

      await expect
        .element(page.getByRole('switch', { name: 'Allow access to Files' }))
        .toBeVisible();
    });

    it('should not render the Files switch when the license does not allow Files, even on a workspace COS', async () => {
      await setupSeededTest(MOCK_COS_DETAIL, NO_FILES_LICENSE);

      expect(page.getByRole('switch', { name: 'Allow access to Files' }).elements()).toHaveLength(
        0,
      );
    });

    it('should not render the Files switch when the COS edition is mail, even if the license allows Files', async () => {
      await setupSeededTest(MAIL_EDITION_COS_DETAIL, FILES_LICENSE);

      expect(page.getByRole('switch', { name: 'Allow access to Files' }).elements()).toHaveLength(
        0,
      );
    });
  });

  it('should render Tasks switch and be clickable', async () => {
    await setupTest();
    const webFeatureSwitch = page.getByRole('switch', { name: 'Allow access to Tasks' });
    await expect.element(webFeatureSwitch).toBeChecked();
    await userEvent.click(webFeatureSwitch);
    await expect.element(webFeatureSwitch).not.toBeChecked();
  });

  it('should render General section with Can access Settings', async () => {
    await setupTest();
    await expect.element(page.getByText('General')).toBeVisible();
    await expect.element(page.getByRole('switch', { name: 'Can access Settings' })).toBeVisible();
  });

  it('should render General section with Active Sync Access', async () => {
    await setupTest(<TestWrapper isAdvanced />);
    await expect.element(page.getByText('General')).toBeVisible();
    await expect.element(page.getByRole('switch', { name: 'Active Sync Access' })).toBeVisible();
  });

  describe('Advanced 2FA enforcement (isAdvanced)', () => {
    const ADVANCED_COS_INFO: Array<Attribute> = MOCK_COS_INFORMATION.map((a) =>
      a.n === 'carbonioOtpWizardFromUntrusted' ? { ...a, _content: 'TRUE' } : a,
    );

    it('should render setup enforcement section when isAdvanced', async () => {
      await setupTest(<TestWrapper cosInformation={ADVANCED_COS_INFO} isAdvanced />);
      await expect
        .element(page.getByText('Two-Factor authenticator setup enforcement'))
        .toBeVisible();
    });

    it('should render Untrusted Network switch', async () => {
      await setupTest(<TestWrapper cosInformation={ADVANCED_COS_INFO} isAdvanced />);
      await expect
        .element(page.getByRole('switch', { name: 'Allow 2FA setup from untrusted networks' }))
        .toBeVisible();
    });

    it('should toggle Untrusted Network switch', async () => {
      await setupTest(<TestWrapper cosInformation={ADVANCED_COS_INFO} isAdvanced />);
      const sw = page.getByRole('switch', { name: 'Allow 2FA setup from untrusted networks' });
      await expect.element(sw).toBeChecked();
      await userEvent.click(sw);
      await expect.element(sw).not.toBeChecked();
    });

    it('should disable Untrusted Network switch when 2FA mgmt is FALSE', async () => {
      const twoFADisabled = ADVANCED_COS_INFO.map((a) =>
        a.n === 'carbonioFeatureOTPMgmtEnabled' ? { ...a, _content: 'FALSE' } : a,
      );
      await setupTest(<TestWrapper cosInformation={twoFADisabled} isAdvanced />);
      await expect
        .element(page.getByRole('switch', { name: 'Allow 2FA setup from untrusted networks' }))
        .toBeDisabled();
    });

    it('should render Grace Period switch', async () => {
      await setupTest(<TestWrapper cosInformation={ADVANCED_COS_INFO} isAdvanced />);
      await expect
        .element(page.getByRole('switch', { name: 'Allow setup deferral during grace period' }))
        .toBeVisible();
    });

    it('should toggle Grace Period switch', async () => {
      await setupTest(<TestWrapper cosInformation={ADVANCED_COS_INFO} isAdvanced />);
      const sw = page.getByRole('switch', { name: 'Allow setup deferral during grace period' });
      await expect.element(sw).not.toBeChecked();
      await userEvent.click(sw);
      await expect.element(sw).toBeChecked();
    });

    it('should disable Grace Period switch when untrusted wizard is FALSE', async () => {
      const wizardDisabled = ADVANCED_COS_INFO.map((a) =>
        a.n === 'carbonioOtpWizardFromUntrusted' ? { ...a, _content: 'FALSE' } : a,
      );
      await setupTest(<TestWrapper cosInformation={wizardDisabled} isAdvanced />);
      await expect
        .element(page.getByRole('switch', { name: 'Allow setup deferral during grace period' }))
        .toBeDisabled();
    });

    it('should render grace period expiration date picker', async () => {
      await setupTest(<TestWrapper cosInformation={ADVANCED_COS_INFO} isAdvanced />);
      await expect.element(page.getByText('Set grace period expiration date')).toBeVisible();
    });

    it('should disable date picker when grace period is FALSE', async () => {
      await setupTest(<TestWrapper cosInformation={ADVANCED_COS_INFO} isAdvanced />);
      const picker = page.getByRole('textbox', { name: 'Set grace period expiration date' });
      await expect.element(picker).toBeDisabled();
    });

    it('should enable date picker when grace period is TRUE', async () => {
      const graceEnabled = ADVANCED_COS_INFO.map((a) =>
        a.n === 'carbonioOtpGracePeriodEnabled' ? { ...a, _content: 'TRUE' } : a,
      );
      await setupTest(<TestWrapper cosInformation={graceEnabled} isAdvanced />);
      const picker = page.getByRole('textbox', { name: 'Set grace period expiration date' });
      await expect.element(picker).not.toBeDisabled();
    });

    it('should toggle Untrusted Network switch FALSE→TRUE (round-trip)', async () => {
      await setupTest(<TestWrapper cosInformation={ADVANCED_COS_INFO} isAdvanced />);
      const sw = page.getByRole('switch', { name: 'Allow 2FA setup from untrusted networks' });
      await expect.element(sw).toBeChecked();
      await userEvent.click(sw);
      await expect.element(sw).not.toBeChecked();
      await userEvent.click(sw);
      await expect.element(sw).toBeChecked();
    });

    it('should toggle Grace Period switch TRUE→FALSE (round-trip)', async () => {
      const graceEnabled = ADVANCED_COS_INFO.map((a) =>
        a.n === 'carbonioOtpGracePeriodEnabled' ? { ...a, _content: 'TRUE' } : a,
      );
      await setupTest(<TestWrapper cosInformation={graceEnabled} isAdvanced />);
      const sw = page.getByRole('switch', { name: 'Allow setup deferral during grace period' });
      await expect.element(sw).toBeChecked();
      await userEvent.click(sw);
      await expect.element(sw).not.toBeChecked();
      await userEvent.click(sw);
      await expect.element(sw).toBeChecked();
    });

    it('should parse valid gentime and display date in date picker', async () => {
      const withGentime = ADVANCED_COS_INFO.map((a) =>
        a.n === 'carbonioOtpGracePeriodEndingTime'
          ? { ...a, _content: '20260115120000Z' }
          : a.n === 'carbonioOtpGracePeriodEnabled'
          ? { ...a, _content: 'TRUE' }
          : a,
      );
      await setupTest(<TestWrapper cosInformation={withGentime} isAdvanced />);
      const picker = page.getByRole('textbox', { name: 'Set grace period expiration date' });
      await expect.element(picker).not.toBeDisabled();
      await expect.element(picker).toHaveValue('15/01/2026');
    });

    it('should handle invalid gentime gracefully in date picker', async () => {
      const withInvalid = ADVANCED_COS_INFO.map((a) =>
        a.n === 'carbonioOtpGracePeriodEndingTime'
          ? { ...a, _content: 'invalid' }
          : a.n === 'carbonioOtpGracePeriodEnabled'
          ? { ...a, _content: 'TRUE' }
          : a,
      );
      await setupTest(<TestWrapper cosInformation={withInvalid} isAdvanced />);
      const picker = page.getByRole('textbox', { name: 'Set grace period expiration date' });
      await expect.element(picker).not.toBeDisabled();
      await expect.element(picker).toHaveValue('');
    });
  });
});
