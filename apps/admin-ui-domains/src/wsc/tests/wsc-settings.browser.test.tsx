/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { type LicenseV1Info, licenseV1QueryKeys, useLoginConfigStore } from '@zextras/ui-shared';
import {
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  getGetInfoResponseMock,
  getQueryClient,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import type { AccountDetail } from '../../views/manage/accounts/account-detail-types';
import { WscSettings } from '../wsc-settings';

const LICENSE_WARNING = "These settings can't be changed because your Chats license is not valid.";

const CHATS_LICENSE: LicenseV1Info = {
  licenseType: 'metered',
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
  lastValidationCheck: '2026-11-16T10:30:00.000Z',
  nextValidationDeadline: '2026-12-16T10:30:00.000Z',
  renewTimeLeft: 30,
  maxTotalSeats: 100,
  addOns: [],
  bundles: [{ name: 'Chats', assignedSeats: 12 }],
};

const NO_CHATS_LICENSE: LicenseV1Info = { ...CHATS_LICENSE, bundles: [] };

const FEATURES_DETAIL = { carbonioFeatureWscEnabled: 'TRUE' } as AccountDetail;

const WscSettingsHarness = () => {
  const [featuresDetail, setFeaturesDetail] = useState<AccountDetail>(FEATURES_DETAIL);
  return <WscSettings featuresDetail={featuresDetail} setFeaturesDetail={setFeaturesDetail} />;
};

async function setupWscSettingsTest({
  subscriptionFlag,
  license,
}: {
  subscriptionFlag: boolean;
  license: LicenseV1Info;
}): Promise<void> {
  useLoginConfigStore.setState({
    featureFlags: { enforceSubscriptionRequirements: subscriptionFlag },
  });
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: true });
  queryClient.setQueryData(['account', 'settings'], {
    prefs: {},
    attrs: { zimbraIsAdminAccount: 'TRUE' },
    props: [],
  });
  queryClient.setQueryData(licenseV1QueryKeys.all, license);
  createBrowserAPIInterceptor('get', '/services/catalog/services', () =>
    HttpResponse.json({ items: [] }),
  );
  createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
  createBrowserAPIInterceptor('get', '/services/license/v1/info', () => HttpResponse.json(license));
  await setupBrowserTest(<WscSettingsHarness />, { queryClient });
  await expect.element(page.getByText('General Settings')).toBeVisible();
}

describe('WscSettings (account) license gating in advanced mode', () => {
  afterEach(() => {
    resetMockWorker();
    useLoginConfigStore.setState({ featureFlags: null });
  });

  it('disables the settings and shows the warning when the flag is on and the license has no Chats', async () => {
    await setupWscSettingsTest({ subscriptionFlag: true, license: NO_CHATS_LICENSE });

    await expect.element(page.getByText(LICENSE_WARNING)).toBeVisible();
    await expect.element(page.getByRole('switch', { name: 'Enable Chat' })).toBeDisabled();
  });

  it('enables the settings when the flag is on and the license allows Chats', async () => {
    await setupWscSettingsTest({ subscriptionFlag: true, license: CHATS_LICENSE });

    await expect.element(page.getByRole('switch', { name: 'Enable Chat' })).not.toBeDisabled();
    expect(page.getByText(LICENSE_WARNING).elements()).toHaveLength(0);
  });

  it('ignores the license when the flag is off', async () => {
    await setupWscSettingsTest({ subscriptionFlag: false, license: NO_CHATS_LICENSE });

    await expect.element(page.getByRole('switch', { name: 'Enable Chat' })).not.toBeDisabled();
    expect(page.getByText(LICENSE_WARNING).elements()).toHaveLength(0);
  });
});
