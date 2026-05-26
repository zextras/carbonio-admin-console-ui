/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	advancedSupportedApiForBrowser,
	getQueryClient,
	setupBrowserTest,
} from 'admin-ui-test-utils';
import { QueryClient } from '@tanstack/react-query';
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

async function setupWscSettingsTest(): Promise<void> {
	await advancedSupportedApiForBrowser.withAdvancedNotSupported();
	const queryClient = seedQueryClient();
	await setupBrowserTest(<WscSettings {...defaultProps} />, { queryClient });
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

			await expect
				.element(page.getByText('Video calls', { exact: true }))
				.toBeVisible();
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

			await setupBrowserTest(<WscSettings {...defaultProps} readonlyFeatures />, {
				queryClient,
			});

			await expect.element(page.getByText('Show read receipts')).toBeDisabled();
		});
	});
});
