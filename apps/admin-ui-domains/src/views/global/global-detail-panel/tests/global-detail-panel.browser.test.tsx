/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	createBrowserAPIInterceptor,
	resetMockWorker,
	setupBrowserTest,
	worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { GlobalDetailPanel } from '../global-detail-panel';

const SENDER = 'notifications@test.com';
const RECIPIENT_1 = 'admin@test.com';
const RECIPIENT_2 = 'ops@test.com';

const SWITCH_LABELS = {
	mandatoryDisclaimer: 'Mandatory disclaimer for all domains',
	outboundDisclaimers: 'Only allow outbound disclaimers',
	searchAllDomains: `Allow searching users' information in all domains`,
} as const;

type ConfigAttr = { n: string; _content: string };

type ModifyConfigParams = {
	_jsns: string;
	a: Array<ConfigAttr>;
};

function initialConfigState(): Array<ConfigAttr> {
	return [
		{ n: 'carbonioNotificationFrom', _content: SENDER },
		{ n: 'carbonioNotificationRecipients', _content: RECIPIENT_1 },
		{ n: 'carbonioNotificationRecipients', _content: RECIPIENT_2 },
		{ n: 'zimbraDomainMandatoryMailSignatureEnabled', _content: 'TRUE' },
		{ n: 'zimbraAmavisOutboundDisclaimersOnly', _content: 'FALSE' },
		{ n: 'carbonioSearchAllDomainsByFeature', _content: 'TRUE' },
	];
}

/**
 * Registers a stateful GetAllConfig/ModifyConfig pair: ModifyConfig requests are
 * captured and applied to the config state, so a post-save refetch (query
 * invalidation) returns the persisted values. This mirrors the real server and
 * lets the form recompute its default values after save.
 */
function setupConfigInterceptors(): { capturedModifyConfigs: Array<ModifyConfigParams> } {
	let currentConfig = initialConfigState();
	const capturedModifyConfigs: Array<ModifyConfigParams> = [];

	worker.use(
		http.post('/service/admin/soap/GetAllConfigRequest', () =>
			HttpResponse.json({ Body: { GetAllConfigResponse: { a: currentConfig } } }),
		),
		http.post('/service/admin/soap/ModifyConfigRequest', async ({ request }) => {
			const body = (await request.json()) as {
				Body?: { ModifyConfigRequest?: ModifyConfigParams };
			};
			const params = body?.Body?.ModifyConfigRequest;
			if (params?.a) {
				capturedModifyConfigs.push(params);
				const modifiedNames = new Set(params.a.map((attr) => attr.n));
				currentConfig = [
					...currentConfig.filter((attr) => !modifiedNames.has(attr.n)),
					...params.a,
				];
			}
			return HttpResponse.json({ Body: { ModifyConfigResponse: {} } });
		}),
	);

	return { capturedModifyConfigs };
}

async function setupGlobalSettingsPanel(): Promise<{
	capturedModifyConfigs: Array<ModifyConfigParams>;
}> {
	const { capturedModifyConfigs } = setupConfigInterceptors();

	setupBrowserTest(<GlobalDetailPanel />);

	await expect.element(page.getByPlaceholder('Notification Sender')).toBeVisible();

	return { capturedModifyConfigs };
}

describe('GlobalDetailPanel', { timeout: 20_000 }, () => {
	afterEach(() => {
		resetMockWorker();
	});

	it('renders fields from GetAllConfig', async () => {
		await setupGlobalSettingsPanel();

		await expect.element(page.getByPlaceholder('Notification Sender')).toHaveValue(SENDER);
		await expect.element(page.getByText(RECIPIENT_1)).toBeVisible();
		await expect.element(page.getByText(RECIPIENT_2)).toBeVisible();
		await expect
			.element(page.getByRole('switch', { name: SWITCH_LABELS.mandatoryDisclaimer }))
			.toBeChecked();
		await expect
			.element(page.getByRole('switch', { name: SWITCH_LABELS.outboundDisclaimers }))
			.not.toBeChecked();
		await expect
			.element(page.getByRole('switch', { name: SWITCH_LABELS.searchAllDomains }))
			.toBeChecked();
	});

	it('shows no save/cancel buttons until dirty, and hides them after cancel', async () => {
		await setupGlobalSettingsPanel();

		await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();

		await page.getByRole('switch', { name: SWITCH_LABELS.mandatoryDisclaimer }).click();

		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

		await page.getByRole('button', { name: 'Cancel' }).click();

		await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
		await expect
			.element(page.getByRole('switch', { name: SWITCH_LABELS.mandatoryDisclaimer }))
			.toBeChecked();
	});

	it('shows an inline error and blocks save when sender email is invalid', async () => {
		const { capturedModifyConfigs } = await setupGlobalSettingsPanel();

		const senderInput = page.getByPlaceholder('Notification Sender');
		await userEvent.fill(senderInput, 'not-an-email');
		await page.getByRole('switch', { name: SWITCH_LABELS.searchAllDomains }).click();

		await expect.element(page.getByText('Enter a valid email address.')).toBeVisible();

		await page.getByRole('button', { name: 'Save' }).click();

		await expect.element(page.getByText('Enter a valid email address.')).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
		await expect.poll(() => capturedModifyConfigs.length).toBe(0);
	});

	it('saves the expected ModifyConfig payload and clears dirty state', async () => {
		const { capturedModifyConfigs } = await setupGlobalSettingsPanel();

		await page.getByRole('switch', { name: SWITCH_LABELS.mandatoryDisclaimer }).click();
		await page.getByRole('switch', { name: SWITCH_LABELS.outboundDisclaimers }).click();

		await page.getByRole('button', { name: 'Save' }).click();

		await expect.poll(() => capturedModifyConfigs.length).toBe(1);
		expect(capturedModifyConfigs[0]).toMatchObject({
			_jsns: 'urn:zimbraAdmin',
			a: [
				{ n: 'carbonioNotificationFrom', _content: SENDER },
				{ n: 'carbonioNotificationRecipients', _content: RECIPIENT_1 },
				{ n: 'carbonioNotificationRecipients', _content: RECIPIENT_2 },
				{ n: 'zimbraDomainMandatoryMailSignatureEnabled', _content: 'FALSE' },
				{ n: 'zimbraAmavisOutboundDisclaimersOnly', _content: 'TRUE' },
				{ n: 'carbonioSearchAllDomainsByFeature', _content: 'TRUE' },
			],
		});

		await expect.element(page.getByText('The change has been saved successfully')).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
	});

	it('shows an error snackbar and stays dirty when save fails', async () => {
		await setupGlobalSettingsPanel();

		createBrowserAPIInterceptor('post', '/service/admin/soap/ModifyConfigRequest', () =>
			HttpResponse.json(
				{
					Body: {
						Fault: {
							Reason: { Text: 'unknown document: ModifyConfigRequest' },
						},
					},
				},
				{ status: 500 },
			),
		);

		await page.getByRole('switch', { name: SWITCH_LABELS.searchAllDomains }).click();
		await page.getByRole('button', { name: 'Save' }).click();

		await expect
			.element(page.getByText('unknown document: ModifyConfigRequest'))
			.toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
	});
});
