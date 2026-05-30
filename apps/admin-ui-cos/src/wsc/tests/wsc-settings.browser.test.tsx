/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient } from '@tanstack/react-query';
import {
  advancedSupportedApiForBrowser,
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  createBrowserZextrasActionInterceptor,
  getGetInfoResponseMock,
  getQueryClient,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import type { AccountType } from '../../../types/account';
import { WscSettings } from '../wsc-settings';

const defaultFeatures: AccountType = {
  carbonioFeatureWscEnabled: 'TRUE',
  carbonioWscShowMessageReads: 'TRUE',
  carbonioWscShowUsersPresence: 'TRUE',
  carbonioWscVideoCallEnabled: 'TRUE',
  carbonioWscRecordingEnabled: 'TRUE',
  carbonioWscVirtualBackgroundEnabled: 'TRUE',
  carbonioWscPrivateChatCreation: 'TRUE',
  carbonioWscGroupChatCreation: 'TRUE',
  carbonioWscAttachmentUpload: 'TRUE',
  carbonioWscMessageDeleteTimeLimit: '0m',
  carbonioWscMessageEditTimeLimit: '0m',
  carbonioWscMaxGroupMembers: '100',
  carbonioWscMaxRoomPictureSize: '5',
  carbonioWscMaxAttachmentSize: '25',
};

const defaultProps = {
  featuresDetail: defaultFeatures,
  setFeaturesDetail: vi.fn(),
  readonlyFeatures: false,
};

function seedQueryClient(): QueryClient {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['account', 'settings'], {
    prefs: {},
    attrs: { zimbraIsAdminAccount: 'TRUE' },
    props: [],
  });
  queryClient.setQueryData(['account', 'info'], {
    id: 'test-user-id',
    name: 'test@example.com',
    displayName: '',
    signatures: { signature: [] },
    identities: undefined,
    rights: { targets: [] },
  });
  queryClient.setQueryData(['subscription', 'license'], {
    ok: true,
    response: {
      type: 'Purchased',
      features: [{ name: 'wsc_basic', enabled: true }],
    },
  });
  return queryClient;
}

function mockCatalogServices(): void {
  createBrowserAPIInterceptor('get', '/services/catalog/services', () =>
    HttpResponse.json({ items: [] }),
  );
}

async function setupWscSettingsTest(): Promise<void> {
  await advancedSupportedApiForBrowser.withAdvancedNotSupported();
  const queryClient = seedQueryClient();

  mockCatalogServices();
  createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
  createBrowserZextrasActionInterceptor('getLicenseInfo', () =>
    HttpResponse.json({
      Body: {
        response: {
          content: JSON.stringify({
            ok: true,
            response: {
              type: 'Purchased',
              features: [{ name: 'wsc_basic', enabled: true }],
            },
          }),
        },
      },
    }),
  );

  await setupBrowserTest(<WscSettings {...defaultProps} />, { queryClient });
}

async function setupWscSettingsTestWithFeatures(
  featuresOverride: Partial<AccountType> = {},
  options?: { useAdvanced?: boolean },
): Promise<void> {
  mockCatalogServices();
  if (options?.useAdvanced) {
    await advancedSupportedApiForBrowser.withAdvancedSupported();
  } else {
    await advancedSupportedApiForBrowser.withAdvancedNotSupported();
  }
  const queryClient = seedQueryClient();

  createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
  createBrowserZextrasActionInterceptor('getLicenseInfo', () =>
    HttpResponse.json({
      Body: {
        response: {
          content: JSON.stringify({
            ok: true,
            response: {
              type: 'Purchased',
              features: [{ name: 'wsc_basic', enabled: true }],
            },
          }),
        },
      },
    }),
  );

  const props = {
    ...defaultProps,
    featuresDetail: { ...defaultFeatures, ...featuresOverride },
  };
  await setupBrowserTest(<WscSettings {...props} />, { queryClient });
}

describe('WscSettings (browser)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render General Settings section', async () => {
      await setupWscSettingsTest();

      await expect.element(page.getByText('General Settings')).toBeVisible();
    });

    it('should render Messaging & Presence section', async () => {
      await setupWscSettingsTest();

      await expect.element(page.getByText('Messaging & Presence')).toBeVisible();
    });

    it('should render Private and Group Chats section', async () => {
      await setupWscSettingsTest();

      await expect.element(page.getByText('Private and Group Chats')).toBeVisible();
    });

    it('should render Video calls section', async () => {
      await setupWscSettingsTest();

      await expect.element(page.getByText('Video calls', { exact: true })).toBeVisible();
    });

    it('should render Sharing & Attachments section', async () => {
      await setupWscSettingsTest();

      await expect.element(page.getByText('Sharing & Attachments')).toBeVisible();
    });

    it('should render Enable Chat toggle', async () => {
      await setupWscSettingsTest();

      await expect.element(page.getByText('Enable Chat')).toBeVisible();
    });

    it('should render Show read receipts toggle', async () => {
      await setupWscSettingsTest();

      await expect.element(page.getByText('Show read receipts')).toBeVisible();
    });

    it('should render Show users online status toggle', async () => {
      await setupWscSettingsTest();

      await expect.element(page.getByText("Show users' online status")).toBeVisible();
    });

    it('should render Users can start new private chats toggle', async () => {
      await setupWscSettingsTest();

      await expect.element(page.getByText('Users can start new private chats')).toBeVisible();
    });

    it('should render Users can create group chats toggle', async () => {
      await setupWscSettingsTest();

      await expect.element(page.getByText('Users can create group chats')).toBeVisible();
    });

    it('should render Enable video calls toggle', async () => {
      await setupWscSettingsTest();

      await expect.element(page.getByText('Enable video calls')).toBeVisible();
    });

    it('should render Enable virtual background toggle', async () => {
      await setupWscSettingsTest();

      await expect.element(page.getByText('Enable virtual background')).toBeVisible();
    });

    it('should render Users can upload attachments toggle', async () => {
      await setupWscSettingsTest();

      await expect.element(page.getByText('Users can upload attachments')).toBeVisible();
    });

    it('should render Message deletion time limit select', async () => {
      await setupWscSettingsTest();

      await expect.element(page.getByText('Message deletion time limit')).toBeVisible();
    });

    it('should render Message editing time limit select', async () => {
      await setupWscSettingsTest();

      await expect.element(page.getByText('Message editing time limit')).toBeVisible();
    });

    it('should render Maximum number of group members input', async () => {
      await setupWscSettingsTest();

      await expect.element(page.getByText('Maximum number of group members')).toBeVisible();
    });

    it('should render Maximum group picture size input', async () => {
      await setupWscSettingsTest();

      await expect.element(page.getByText('Maximum group picture size in MB')).toBeVisible();
    });

    it('should render Maximum attachment size input', async () => {
      await setupWscSettingsTest();

      await expect.element(page.getByText('Maximum attachment size in MB')).toBeVisible();
    });
  });

  describe('Disabled state', () => {
    it('should disable dependent settings when WSC is FALSE', async () => {
      await advancedSupportedApiForBrowser.withAdvancedNotSupported();
      const queryClient = seedQueryClient();

      mockCatalogServices();
      createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
      createBrowserZextrasActionInterceptor('getLicenseInfo', () =>
        HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({
                ok: true,
                response: {
                  type: 'Purchased',
                  features: [{ name: 'wsc_basic', enabled: true }],
                },
              }),
            },
          },
        }),
      );

      const props = {
        ...defaultProps,
        featuresDetail: { ...defaultFeatures, carbonioFeatureWscEnabled: 'FALSE' },
      };
      await setupBrowserTest(<WscSettings {...props} />, { queryClient });

      await expect.element(page.getByText('Show read receipts')).toBeDisabled();
    });

    it('should disable settings when readonlyFeatures is true', async () => {
      await advancedSupportedApiForBrowser.withAdvancedNotSupported();
      const queryClient = seedQueryClient();

      mockCatalogServices();
      createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
      createBrowserZextrasActionInterceptor('getLicenseInfo', () =>
        HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({
                ok: true,
                response: {
                  type: 'Purchased',
                  features: [{ name: 'wsc_basic', enabled: true }],
                },
              }),
            },
          },
        }),
      );

      await setupBrowserTest(<WscSettings {...defaultProps} readonlyFeatures />, {
        queryClient,
      });

      await expect.element(page.getByText('Show read receipts')).toBeDisabled();
    });
  });

  describe('Interactions', () => {
    it('should call setFeaturesDetail with correct key when Enable Chat is clicked', async () => {
      await setupWscSettingsTest();

      await page.getByText('Enable Chat').click();

      expect(defaultProps.setFeaturesDetail).toHaveBeenCalledTimes(1);
      const updater = defaultProps.setFeaturesDetail.mock.calls[0][0];
      const newState = updater(defaultFeatures);
      expect(newState.carbonioFeatureWscEnabled).toBe('FALSE');
      expect(newState.carbonioWscShowMessageReads).toBe('TRUE');
    });

    it('should call setFeaturesDetail with toggled value when a switch is clicked', async () => {
      await setupWscSettingsTest();

      await page.getByText('Show read receipts').click();

      expect(defaultProps.setFeaturesDetail).toHaveBeenCalledTimes(1);
      const updater = defaultProps.setFeaturesDetail.mock.calls[0][0];
      const newState = updater(defaultFeatures);
      expect(newState.carbonioWscShowMessageReads).toBe('FALSE');
      expect(newState.carbonioFeatureWscEnabled).toBe('TRUE');
    });
  });

  describe('Cascade disable', () => {
    it('should disable all dependent settings when Enable Chat is FALSE', async () => {
      await setupWscSettingsTestWithFeatures({ carbonioFeatureWscEnabled: 'FALSE' });

      await expect.element(page.getByText("Show users' online status")).toBeDisabled();
      await expect.element(page.getByText('Enable video calls')).toBeDisabled();
      await expect.element(page.getByText('Users can upload attachments')).toBeDisabled();
    });

    it('should disable Enable virtual background when Enable video calls is FALSE', async () => {
      await setupWscSettingsTestWithFeatures({ carbonioWscVideoCallEnabled: 'FALSE' });

      await expect.element(page.getByText('Enable virtual background')).toBeDisabled();
    });

    it('should disable Maximum attachment size when Users can upload attachments is FALSE', async () => {
      await setupWscSettingsTestWithFeatures({ carbonioWscAttachmentUpload: 'FALSE' });

      await expect
        .element(page.getByPlaceholder('Maximum attachment size in MB'))
        .toBeDisabled();
    });
  });

  describe('Advanced features', () => {
    it('should render Allow call recording toggle when advanced is supported', async () => {
      await setupWscSettingsTestWithFeatures({}, { useAdvanced: true });

      await expect.element(page.getByText('Allow call recording')).toBeVisible();
    });
  });
});
