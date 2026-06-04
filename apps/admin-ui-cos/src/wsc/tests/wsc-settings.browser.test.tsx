/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryClient } from '@tanstack/react-query';
import { useSelector } from '@tanstack/react-store';
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
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { useAppForm } from '../../form/form-hook';
import type { WscCosFormValues } from '../types';
import { WscSettings } from '../wsc-settings';

const defaultFeatures: WscCosFormValues = {
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

type WscSettingsWrapperProps = {
	featuresOverride?: Partial<WscCosFormValues>;
	readonlyFeatures?: boolean;
	onFormChange?: (values: WscCosFormValues) => void;
};

const WscSettingsWrapper = ({
	featuresOverride = {},
	readonlyFeatures = false,
	onFormChange,
}: WscSettingsWrapperProps) => {
	const form = useAppForm({
		defaultValues: { ...defaultFeatures, ...featuresOverride },
		onSubmit: vi.fn(),
	});

	const values = useSelector(form.store, (s) => s.values);
	const prevValuesRef = useRef<WscCosFormValues>(values);

	if (values !== prevValuesRef.current) {
		prevValuesRef.current = values;
		onFormChange?.(values);
	}

	return (
		<form.AppForm>
			<WscSettings form={form} readonlyFeatures={readonlyFeatures} />
		</form.AppForm>
	);
};

async function setupWscSettingsTest(
	featuresOverride: Partial<WscCosFormValues> = {},
	options: { useAdvanced?: boolean } = {},
): Promise<void> {
	const queryClient = seedQueryClient();

	mockCatalogServices();
	if (options.useAdvanced) {
		await advancedSupportedApiForBrowser.withAdvancedSupported();
	} else {
		await advancedSupportedApiForBrowser.withAdvancedNotSupported();
	}
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

	await setupBrowserTest(
		<WscSettingsWrapper featuresOverride={featuresOverride} />,
		{ queryClient },
	);
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

		it("should render Show users' online status toggle", async () => {
			await setupWscSettingsTest();

			await expect.element(page.getByText("Show users' online status")).toBeVisible();
		});

		it('should render Maximum number of group members input', async () => {
			await setupWscSettingsTest();

			await expect
				.element(page.getByPlaceholder('Maximum number of group members'))
				.toBeVisible();
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
			await setupWscSettingsTest({ carbonioFeatureWscEnabled: 'FALSE' });

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

			await setupBrowserTest(<WscSettingsWrapper readonlyFeatures />, { queryClient });

			await expect.element(page.getByText('Show read receipts')).toBeDisabled();
		});
	});

	describe('Interactions', () => {
		it('should toggle Enable Chat from TRUE to FALSE when clicked', async () => {
			const formChanges: Array<WscCosFormValues> = [];
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

			await setupBrowserTest(
				<WscSettingsWrapper
					onFormChange={(values) => formChanges.push({ ...values })}
				/>,
				{ queryClient },
			);

			await page.getByText('Enable Chat').click();

			expect(formChanges.length).toBeGreaterThan(0);
			const lastChange = formChanges[formChanges.length - 1];
			expect(lastChange.carbonioFeatureWscEnabled).toBe('FALSE');
		});

		it('should toggle Show read receipts when clicked', async () => {
			const formChanges: Array<WscCosFormValues> = [];
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

			await setupBrowserTest(
				<WscSettingsWrapper
					onFormChange={(values) => formChanges.push({ ...values })}
				/>,
				{ queryClient },
			);

			await page.getByText('Show read receipts').click();

			expect(formChanges.length).toBeGreaterThan(0);
			const lastChange = formChanges[formChanges.length - 1];
			expect(lastChange.carbonioWscShowMessageReads).toBe('FALSE');
			expect(lastChange.carbonioFeatureWscEnabled).toBe('TRUE');
		});
	});

	describe('Cascade disable', () => {
		it('should disable all dependent settings when Enable Chat is FALSE', async () => {
			await setupWscSettingsTest({ carbonioFeatureWscEnabled: 'FALSE' });

			await expect.element(page.getByText("Show users' online status")).toBeDisabled();
			await expect.element(page.getByText('Enable video calls')).toBeDisabled();
			await expect.element(page.getByText('Users can upload attachments')).toBeDisabled();
		});

		it('should disable Enable virtual background when Enable video calls is FALSE', async () => {
			await setupWscSettingsTest({ carbonioWscVideoCallEnabled: 'FALSE' });

			await expect.element(page.getByText('Enable virtual background')).toBeDisabled();
		});

		it('should disable Maximum attachment size when Users can upload attachments is FALSE', async () => {
			await setupWscSettingsTest({ carbonioWscAttachmentUpload: 'FALSE' });

			await expect
				.element(page.getByPlaceholder('Maximum attachment size in MB'))
				.toBeDisabled();
		});
	});

	describe('Advanced features', () => {
		it('should render Allow call recording toggle when advanced is supported', async () => {
			await setupWscSettingsTest({}, { useAdvanced: true });

			await expect.element(page.getByText('Allow call recording')).toBeVisible();
		});
	});
});
