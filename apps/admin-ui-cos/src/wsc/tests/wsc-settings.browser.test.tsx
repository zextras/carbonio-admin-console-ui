/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import {
	createBrowserAPIInterceptor,
	createBrowserSoapAPIInterceptor,
	createBrowserZextrasActionInterceptor,
	getGetInfoResponseMock,
	getQueryClient,
	resetMockWorker,
	setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import type { WscCosFormApi, WscCosFormValues } from '../types';
import { WscSettings } from '../wsc-settings';

const ALL_ENABLED_VALUES: WscCosFormValues = {
	carbonioFeatureWscEnabled: 'TRUE',
	carbonioWscShowMessageReads: 'TRUE',
	carbonioWscShowUsersPresence: 'TRUE',
	carbonioWscMessageDeleteTimeLimit: '0m',
	carbonioWscMessageEditTimeLimit: '0m',
	carbonioWscPrivateChatCreation: 'TRUE',
	carbonioWscGroupChatCreation: 'TRUE',
	carbonioWscMaxGroupMembers: '100',
	carbonioWscMaxRoomPictureSize: '5',
	carbonioWscVideoCallEnabled: 'TRUE',
	carbonioWscRecordingEnabled: 'TRUE',
	carbonioWscVirtualBackgroundEnabled: 'TRUE',
	carbonioWscAttachmentUpload: 'TRUE',
	carbonioWscMaxAttachmentSize: '25',
};

const LICENSE_MOCK = {
	ok: true,
	response: {
		type: 'Purchased',
		features: [{ name: 'wsc_basic', enabled: true }],
	},
};

const UNLICENSED_MOCK = {
	ok: true,
	response: {
		type: 'Purchased',
		features: [{ name: 'wsc_basic', enabled: false }],
	},
};

type WscSettingsWrapperProps = {
	defaultValues?: WscCosFormValues;
	readonlyFeatures?: boolean;
	onSubmit?: (value: WscCosFormValues) => void;
};

const WscSettingsWrapper = ({
	defaultValues = ALL_ENABLED_VALUES,
	readonlyFeatures = false,
	onSubmit = vi.fn(),
}: WscSettingsWrapperProps) => {
	const form = useForm({
		defaultValues,
		onSubmit: ({ value }) => onSubmit(value),
	});

	return (
		<>
			<WscSettings form={form as WscCosFormApi} readonlyFeatures={readonlyFeatures} />
			<button type="button" onClick={() => form.handleSubmit()}>
				Submit
			</button>
		</>
	);
};

function seedQueryCache(
	queryClient: ReturnType<typeof getQueryClient>,
	opts: { advanced?: boolean; licensed?: boolean } = {},
): void {
	const { advanced = false, licensed = true } = opts;
	queryClient.setQueryData(['advanced-supported'], { supported: advanced });
	queryClient.setQueryData(['account', 'settings'], {
		prefs: {},
		attrs: { zimbraIsAdminAccount: 'TRUE' },
		props: [],
	});
	queryClient.setQueryData(
		['subscription', 'license'],
		licensed ? LICENSE_MOCK : UNLICENSED_MOCK,
	);
}

function setupApiFallbacks(licenseMock = LICENSE_MOCK): void {
	createBrowserAPIInterceptor('get', '/services/catalog/services', () =>
		HttpResponse.json({ items: [] }),
	);
	createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
	createBrowserZextrasActionInterceptor('getLicenseInfo', () =>
		HttpResponse.json({
			Body: { response: { content: JSON.stringify(licenseMock) } },
		}),
	);
}

async function setupWscSettingsTest(
	options?: WscSettingsWrapperProps,
): Promise<void> {
	const queryClient = getQueryClient();
	seedQueryCache(queryClient, { advanced: false, licensed: true });
	setupApiFallbacks();
	await setupBrowserTest(<WscSettingsWrapper {...options} />, { queryClient });
	await expect.element(page.getByText('General Settings')).toBeVisible();
}

async function setupWscSettingsAdvancedTest(
	options?: WscSettingsWrapperProps,
): Promise<void> {
	const queryClient = getQueryClient();
	seedQueryCache(queryClient, { advanced: true, licensed: true });
	setupApiFallbacks();
	await setupBrowserTest(<WscSettingsWrapper {...options} />, { queryClient });
	await expect.element(page.getByText('General Settings')).toBeVisible();
}

async function setupWscSettingsUnlicensedTest(
	options?: WscSettingsWrapperProps,
): Promise<void> {
	const queryClient = getQueryClient();
	seedQueryCache(queryClient, { advanced: true, licensed: false });
	setupApiFallbacks(UNLICENSED_MOCK);
	await setupBrowserTest(<WscSettingsWrapper {...options} />, { queryClient });
}

describe('WscSettings', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	afterEach(() => {
		resetMockWorker();
	});

	describe('Rendering (non-advanced mode)', () => {
		it('renders all five section titles', async () => {
			await setupWscSettingsTest();

			await expect.element(page.getByText('General Settings')).toBeVisible();
			await expect.element(page.getByText('Messaging & Presence')).toBeVisible();
			await expect.element(page.getByText('Private and Group Chats')).toBeVisible();
			await expect.element(
				page.getByText('Video calls', { exact: true }),
			).toBeVisible();
			await expect.element(page.getByText('Sharing & Attachments')).toBeVisible();
		});

		it('renders all section descriptions', async () => {
			await setupWscSettingsTest();

			await expect.element(
				page.getByText('Manage the activation of core features and applications.'),
			).toBeVisible();
			await expect.element(
				page.getByText('Manage the visibility of chats and user status.'),
			).toBeVisible();
			await expect.element(
				page.getByText('Manage Chats creation and Group settings.'),
			).toBeVisible();
			await expect.element(
				page.getByText(
					'Configure video calls, recording, and virtual backgrounds.',
				),
			).toBeVisible();
			await expect.element(
				page.getByText('Manage file sharing and attachment limits.'),
			).toBeVisible();
		});

		it('renders all switches checked when values are TRUE', async () => {
			await setupWscSettingsTest();

			await expect.element(
				page.getByRole('switch', { name: 'Enable Chat' }),
			).toBeChecked();
			await expect.element(
				page.getByRole('switch', { name: 'Show read receipts' }),
			).toBeChecked();
			await expect.element(
				page.getByRole('switch', { name: "Show users' online status" }),
			).toBeChecked();
			await expect.element(
				page.getByRole('switch', { name: 'Users can start new private chats' }),
			).toBeChecked();
			await expect.element(
				page.getByRole('switch', { name: 'Users can create group chats' }),
			).toBeChecked();
			await expect.element(
				page.getByRole('switch', { name: 'Enable video calls' }),
			).toBeChecked();
			await expect.element(
				page.getByRole('switch', { name: 'Enable virtual background' }),
			).toBeChecked();
			await expect.element(
				page.getByRole('switch', { name: 'Users can upload attachments' }),
			).toBeChecked();
		});

		it('renders numeric inputs with initial values', async () => {
			await setupWscSettingsTest();

			await expect.element(
				page.getByLabelText('Maximum number of group members'),
			).toHaveValue(100);
			await expect.element(
				page.getByLabelText('Maximum group picture size in MB'),
			).toHaveValue(5);
			await expect.element(
				page.getByLabelText('Maximum attachment size in MB'),
			).toHaveValue(25);
		});

		it('does not render Allow call recording switch', async () => {
			await setupWscSettingsTest();

			await expect.element(
				page.getByRole('switch', { name: 'Allow call recording' }),
			).not.toBeInTheDocument();
		});

		it('renders switches unchecked when default values are FALSE', async () => {
			const allDisabled: WscCosFormValues = {
				carbonioFeatureWscEnabled: 'FALSE',
				carbonioWscShowMessageReads: 'FALSE',
				carbonioWscShowUsersPresence: 'FALSE',
				carbonioWscMessageDeleteTimeLimit: '0m',
				carbonioWscMessageEditTimeLimit: '0m',
				carbonioWscPrivateChatCreation: 'FALSE',
				carbonioWscGroupChatCreation: 'FALSE',
				carbonioWscMaxGroupMembers: '0',
				carbonioWscMaxRoomPictureSize: '0',
				carbonioWscVideoCallEnabled: 'FALSE',
				carbonioWscRecordingEnabled: 'FALSE',
				carbonioWscVirtualBackgroundEnabled: 'FALSE',
				carbonioWscAttachmentUpload: 'FALSE',
				carbonioWscMaxAttachmentSize: '0',
			};
			await setupWscSettingsTest({ defaultValues: allDisabled });

			await expect.element(
				page.getByRole('switch', { name: 'Enable Chat' }),
			).not.toBeChecked();
		}, 20_000);
	});

	describe('Rendering (advanced mode)', () => {
		it('renders Allow call recording switch checked', async () => {
			await setupWscSettingsAdvancedTest();

			const recordingSwitch = page.getByRole('switch', {
				name: 'Allow call recording',
			});
			await expect.element(recordingSwitch).toBeVisible();
			await expect.element(recordingSwitch).toBeChecked();
		});

		it('renders all other sections and switches', async () => {
			await setupWscSettingsAdvancedTest();

			await expect.element(page.getByText('General Settings')).toBeVisible();
			await expect.element(
				page.getByText('Video calls', { exact: true }),
			).toBeVisible();
			await expect.element(
				page.getByRole('switch', { name: 'Enable Chat' }),
			).toBeChecked();
			await expect.element(
				page.getByRole('switch', { name: 'Enable virtual background' }),
			).toBeChecked();
		});
	});

	describe('Switch toggle interactions', () => {
		it('toggles Enable Chat from checked to unchecked', async () => {
			await setupWscSettingsTest();

			const enableChatSwitch = page.getByRole('switch', { name: 'Enable Chat' });
			await expect.element(enableChatSwitch).toBeChecked();
			await enableChatSwitch.click();
			await expect.element(enableChatSwitch).not.toBeChecked();
		});

		it('round-trips Messaging switches TRUE→FALSE→TRUE', async () => {
			await setupWscSettingsTest();

			const labels = ['Show read receipts', "Show users' online status"];
			for (const label of labels) {
				const switchEl = page.getByRole('switch', { name: label });
				await expect.element(switchEl).toBeChecked();
				await switchEl.click();
				await expect.element(switchEl).not.toBeChecked();
				await switchEl.click();
				await expect.element(switchEl).toBeChecked();
			}
		});

		it('round-trips Chat switches TRUE→FALSE→TRUE', async () => {
			await setupWscSettingsTest();

			const labels = [
				'Users can start new private chats',
				'Users can create group chats',
			];
			for (const label of labels) {
				const switchEl = page.getByRole('switch', { name: label });
				await expect.element(switchEl).toBeChecked();
				await switchEl.click();
				await expect.element(switchEl).not.toBeChecked();
				await switchEl.click();
				await expect.element(switchEl).toBeChecked();
			}
		});

		it('round-trips Video call and Attachment switches TRUE→FALSE→TRUE', async () => {
			await setupWscSettingsTest();

			const labels = [
				'Enable video calls',
				'Enable virtual background',
				'Users can upload attachments',
			];
			for (const label of labels) {
				const switchEl = page.getByRole('switch', { name: label });
				await expect.element(switchEl).toBeChecked();
				await switchEl.click();
				await expect.element(switchEl).not.toBeChecked();
				await switchEl.click();
				await expect.element(switchEl).toBeChecked();
			}
		}, 20_000);

		it('toggles Allow call recording switch (advanced mode)', async () => {
			await setupWscSettingsAdvancedTest();

			const recordingSwitch = page.getByRole('switch', {
				name: 'Allow call recording',
			});
			await expect.element(recordingSwitch).toBeChecked();
			await recordingSwitch.click();
			await expect.element(recordingSwitch).not.toBeChecked();
		});
	});

	describe('Select interactions', () => {
		it('changes message deletion time limit to 5 minutes', async () => {
			await setupWscSettingsTest();

			await page.getByText('Message deletion time limit').click();
			await page.getByText('5 minute time limit').click();

			await expect.element(page.getByText('5 minute time limit')).toBeVisible();
		}, 20_000);

		it('changes message editing time limit to 10 minutes', async () => {
			await setupWscSettingsTest();

			await page.getByText('Message editing time limit').click();
			await page.getByText('10 minute time limit').click();

			await expect.element(page.getByText('10 minute time limit')).toBeVisible();
		}, 20_000);

		it('captures changed select values on submit', async () => {
			const onSubmit = vi.fn();
			await setupWscSettingsTest({ onSubmit });

			await page.getByText('Message deletion time limit').click();
			await page.getByText('30 minute time limit').click();

			await page.getByRole('button', { name: 'Submit' }).click();

			expect(onSubmit).toHaveBeenCalledTimes(1);
			expect(onSubmit.mock.calls[0][0].carbonioWscMessageDeleteTimeLimit).toBe(
				'30m',
			);
		}, 20_000);
	});

	describe('Input interactions', () => {
		it('updates max group members value', async () => {
			await setupWscSettingsTest();

			const input = page.getByLabelText('Maximum number of group members');
			await input.clear();
			await input.fill('50');
			await expect.element(input).toHaveValue(50);
		});

		it('updates max group picture size value', async () => {
			await setupWscSettingsTest();

			const input = page.getByLabelText('Maximum group picture size in MB');
			await input.clear();
			await input.fill('10');
			await expect.element(input).toHaveValue(10);
		});

		it('updates max attachment size value', async () => {
			await setupWscSettingsTest();

			const input = page.getByLabelText('Maximum attachment size in MB');
			await input.clear();
			await input.fill('100');
			await expect.element(input).toHaveValue(100);
		});

		it('defaults to 0 when input is cleared', async () => {
			const onSubmit = vi.fn();
			await setupWscSettingsTest({ onSubmit });

			const input = page.getByLabelText('Maximum number of group members');
			await input.clear();

			await page.getByRole('button', { name: 'Submit' }).click();

			expect(onSubmit).toHaveBeenCalledTimes(1);
			expect(onSubmit.mock.calls[0][0].carbonioWscMaxGroupMembers).toBe('0');
		});
	});

	describe('Cross-field disabling', () => {
		it('disables dependent settings when Enable Chat is FALSE', async () => {
			await setupWscSettingsTest({
				defaultValues: {
					...ALL_ENABLED_VALUES,
					carbonioFeatureWscEnabled: 'FALSE',
				},
			});

			await expect.element(
				page.getByRole('switch', { name: 'Enable Chat' }),
			).not.toBeDisabled();
			await expect.element(
				page.getByRole('switch', { name: 'Show read receipts' }),
			).toBeDisabled();
			await expect.element(
				page.getByRole('switch', { name: "Show users' online status" }),
			).toBeDisabled();
			await expect.element(
				page.getByRole('switch', { name: 'Users can start new private chats' }),
			).toBeDisabled();
			await expect.element(
				page.getByRole('switch', { name: 'Enable video calls' }),
			).toBeDisabled();
			await expect.element(
				page.getByRole('switch', { name: 'Users can upload attachments' }),
			).toBeDisabled();
			await expect.element(
				page.getByLabelText('Maximum number of group members'),
			).toBeDisabled();
			await expect.element(
				page.getByLabelText('Maximum attachment size in MB'),
			).toBeDisabled();
		}, 20_000);

		it('disables recording and virtual background when video calls are FALSE (advanced)', async () => {
			await setupWscSettingsAdvancedTest({
				defaultValues: {
					...ALL_ENABLED_VALUES,
					carbonioWscVideoCallEnabled: 'FALSE',
				},
			});

			await expect.element(
				page.getByRole('switch', { name: 'Enable video calls' }),
			).not.toBeDisabled();
			await expect.element(
				page.getByRole('switch', { name: 'Allow call recording' }),
			).toBeDisabled();
			await expect.element(
				page.getByRole('switch', { name: 'Enable virtual background' }),
			).toBeDisabled();
		}, 20_000);

		it('disables max attachment size when attachments are FALSE', async () => {
			await setupWscSettingsTest({
				defaultValues: {
					...ALL_ENABLED_VALUES,
					carbonioWscAttachmentUpload: 'FALSE',
				},
			});

			await expect.element(
				page.getByRole('switch', { name: 'Users can upload attachments' }),
			).not.toBeDisabled();
			await expect.element(
				page.getByLabelText('Maximum attachment size in MB'),
			).toBeDisabled();
		});
	});

	describe('Readonly mode', () => {
		it('disables dependent settings but not Enable Chat when readonlyFeatures is true', async () => {
			await setupWscSettingsTest({ readonlyFeatures: true });

			await expect.element(
				page.getByRole('switch', { name: 'Enable Chat' }),
			).not.toBeDisabled();
			await expect.element(
				page.getByRole('switch', { name: 'Show read receipts' }),
			).toBeDisabled();
			await expect.element(
				page.getByRole('switch', { name: 'Enable video calls' }),
			).toBeDisabled();
			await expect.element(
				page.getByRole('switch', { name: 'Users can upload attachments' }),
			).toBeDisabled();
			await expect.element(
				page.getByLabelText('Maximum number of group members'),
			).toBeDisabled();
		}, 20_000);
	});

	describe('License gating (advanced + unlicensed)', () => {
		it('shows warning banner when unlicensed', async () => {
			await setupWscSettingsUnlicensedTest();

			await expect.element(
				page.getByText(
					"These settings can't be changed because your Chats license is not valid.",
				),
			).toBeVisible();
		});

		it('disables all settings including Enable Chat when unlicensed', async () => {
			await setupWscSettingsUnlicensedTest();

			await expect.element(
				page.getByRole('switch', { name: 'Enable Chat' }),
			).toBeDisabled();
			await expect.element(
				page.getByRole('switch', { name: 'Show read receipts' }),
			).toBeDisabled();
			await expect.element(
				page.getByRole('switch', { name: 'Enable video calls' }),
			).toBeDisabled();
			await expect.element(
				page.getByRole('switch', { name: 'Users can upload attachments' }),
			).toBeDisabled();
		}, 20_000);
	});

	describe('Form submission', () => {
		it('captures multiple field changes on submit', async () => {
			const onSubmit = vi.fn();
			await setupWscSettingsTest({ onSubmit });

			await page.getByRole('switch', { name: 'Show read receipts' }).click();
			await page.getByRole('switch', { name: 'Enable video calls' }).click();

			const groupMembersInput = page.getByLabelText(
				'Maximum number of group members',
			);
			await groupMembersInput.clear();
			await groupMembersInput.fill('200');

			await page.getByText('Message deletion time limit').click();
			await page.getByText('5 minute time limit').click();

			await page.getByRole('button', { name: 'Submit' }).click();

			expect(onSubmit).toHaveBeenCalledTimes(1);
			const values = onSubmit.mock.calls[0][0];
			expect(values.carbonioWscShowMessageReads).toBe('FALSE');
			expect(values.carbonioWscVideoCallEnabled).toBe('FALSE');
			expect(values.carbonioWscMaxGroupMembers).toBe('200');
			expect(values.carbonioWscMessageDeleteTimeLimit).toBe('5m');
		}, 20_000);
	});
});
