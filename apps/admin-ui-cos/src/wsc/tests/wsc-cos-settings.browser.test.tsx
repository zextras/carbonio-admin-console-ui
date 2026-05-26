/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  advancedSupportedApiForBrowser,
  createBrowserSoapAPIInterceptor,
  delayedSoapApiForBrowser,
  getQueryClient,
  grantUserCosRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { type ModifyCosBody } from '../../services/modify-cos-service';
import { WscCosSettings } from '../wsc-cos-settings';

const COS_ID = 'e00428a1-0c00-11d9-836a-000d93afea2a';

const mockCosData = {
  cos: [
    {
      id: COS_ID,
      name: 'testcos',
      a: [
        { n: 'zimbraId', _content: COS_ID },
        { n: 'carbonioFeatureWscEnabled', _content: 'TRUE' },
        { n: 'carbonioWscShowMessageReads', _content: 'TRUE' },
        { n: 'carbonioWscShowUsersPresence', _content: 'TRUE' },
        { n: 'carbonioWscVideoCallEnabled', _content: 'TRUE' },
        { n: 'carbonioWscRecordingEnabled', _content: 'TRUE' },
        { n: 'carbonioWscVirtualBackgroundEnabled', _content: 'TRUE' },
        { n: 'carbonioWscPrivateChatCreation', _content: 'TRUE' },
        { n: 'carbonioWscGroupChatCreation', _content: 'TRUE' },
        { n: 'carbonioWscAttachmentUpload', _content: 'TRUE' },
        { n: 'carbonioWscMessageDeleteTimeLimit', _content: '0m' },
        { n: 'carbonioWscMessageEditTimeLimit', _content: '0m' },
        { n: 'carbonioWscMaxGroupMembers', _content: '100' },
        { n: 'carbonioWscMaxRoomPictureSize', _content: '5' },
        { n: 'carbonioWscMaxAttachmentSize', _content: '25' },
      ],
    },
  ],
};

const mockCosDataWscDisabled = {
  cos: [
    {
      id: COS_ID,
      name: 'testcos',
      a: [
        { n: 'zimbraId', _content: COS_ID },
        { n: 'carbonioFeatureWscEnabled', _content: 'FALSE' },
        { n: 'carbonioWscShowMessageReads', _content: 'TRUE' },
      ],
    },
  ],
};

function seedLicenseAndAdminSettings(): void {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['account', 'settings'], {
    prefs: {},
    attrs: { zimbraIsAdminAccount: 'TRUE' },
    props: [],
  });
  queryClient.setQueryData(['subscription', 'license'], {
    ok: true,
    response: {
      type: 'Purchased',
      features: [{ name: 'wsc_basic', enabled: true }],
    },
  });
}

async function setupWscCosSettingsTest(cosData = mockCosData): Promise<void> {
  await advancedSupportedApiForBrowser.withAdvancedNotSupported();
  const queryClient = getQueryClient();
  await grantUserCosRights(queryClient);
  seedLicenseAndAdminSettings();

  createBrowserSoapAPIInterceptor('GetCos', cosData);
  createBrowserSoapAPIInterceptor('ModifyCos', {});
  createBrowserSoapAPIInterceptor('FlushCache', {});

  await setupBrowserTest(
    <Routes>
      <Route path="/:cosId/:operation" element={<WscCosSettings />} />
    </Routes>,
    { initialRouterEntry: `/${COS_ID}/wsc`, queryClient },
  );
}

describe('WscCosSettings', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    resetMockWorker();
  });

  describe('Loading', () => {
    it('should show spinner while loading', async () => {
      await advancedSupportedApiForBrowser.withAdvancedNotSupported();
      const queryClient = getQueryClient();
      await grantUserCosRights(queryClient);
      seedLicenseAndAdminSettings();

      delayedSoapApiForBrowser('GetCos', mockCosData, 5000);
      createBrowserSoapAPIInterceptor('ModifyCos', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});

      await setupBrowserTest(
        <Routes>
          <Route path="/:cosId/:operation" element={<WscCosSettings />} />
        </Routes>,
        { initialRouterEntry: `/${COS_ID}/wsc`, queryClient },
      );

      await expect.element(page.getByRole('status')).toBeVisible();
    });
  });

  describe('Rendering', () => {
    it('should render Chats title', async () => {
      await setupWscCosSettingsTest();

      const title = page.getByText('Chats').first();
      await expect.element(title).toBeVisible();
    });

    it('should render General Settings section', async () => {
      await setupWscCosSettingsTest();

      await expect.element(page.getByText('General Settings')).toBeVisible();
    });

    it('should render Enable Chat toggle', async () => {
      await setupWscCosSettingsTest();

      await expect.element(page.getByText('Enable Chat')).toBeVisible();
    });

    it('should render Messaging & Presence section', async () => {
      await setupWscCosSettingsTest();

      await expect.element(page.getByText('Messaging & Presence')).toBeVisible();
    });

    it('should not show Save and Cancel initially', async () => {
      await setupWscCosSettingsTest();

      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });
  });

  describe('Dirty state', () => {
    it('should show Save and Cancel when a setting is changed', async () => {
      await setupWscCosSettingsTest();

      const toggle = page.getByText('Show read receipts');
      await toggle.click();

      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });

    it('should revert changes when Cancel is clicked', async () => {
      await setupWscCosSettingsTest();

      const toggle = page.getByText('Show read receipts');
      await toggle.click();

      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

      await page.getByRole('button', { name: 'Cancel' }).click();

      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });
  });

  describe('Save', () => {
    it('should send ModifyCos when Save is clicked', async () => {
      await advancedSupportedApiForBrowser.withAdvancedNotSupported();
      const modifyCosPromise = createBrowserSoapAPIInterceptor('ModifyCos', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});

      const queryClient = getQueryClient();
      await grantUserCosRights(queryClient);
      seedLicenseAndAdminSettings();

      createBrowserSoapAPIInterceptor('GetCos', mockCosData);

      await setupBrowserTest(
        <Routes>
          <Route path="/:cosId/:operation" element={<WscCosSettings />} />
        </Routes>,
        { initialRouterEntry: `/${COS_ID}/wsc`, queryClient },
      );

      const toggle = page.getByText('Show read receipts');
      await toggle.click();

      await page.getByRole('button', { name: 'Save' }).click();

      const body = (await modifyCosPromise) as ModifyCosBody;
      expect(body._jsns).toBe('urn:zimbraAdmin');
      expect(body.id._content).toBe(COS_ID);

      const attrNames = body.a.map((a: { n: string }) => a.n);
      expect(attrNames).toContain('carbonioWscShowMessageReads');
    });
  });

  describe('WSC disabled', () => {
    it('should disable dependent settings when WSC is FALSE', async () => {
      await setupWscCosSettingsTest(mockCosDataWscDisabled);

      await expect.element(page.getByText('Show read receipts')).toBeDisabled();
    });
  });
});
