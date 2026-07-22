/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest, worker } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { useEffect, useRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { Connection } from '../connection';

vi.mock('../parts/verify/verify-progress', () => ({
	VerifyProgress: ({
		isPending,
		onComplete,
	}: {
		isPending: boolean;
		onComplete?: () => void;
	}) => {
		const wasPending = useRef(isPending);

		useEffect(() => {
			if (wasPending.current && !isPending) {
				onComplete?.();
			}
			wasPending.current = isPending;
		}, [isPending, onComplete]);

		return <div>{isPending ? 'verify-pending' : 'verify-idle'}</div>;
	},
}));

const REGIONS = [
	{ id: 'us-east-1', description: 'US East 1' },
	{ id: 'eu-central-1', description: 'EU Central 1' },
];

function buildZextrasContent(payload: unknown): string {
	return JSON.stringify(payload);
}

function setupZextrasInterceptor(options: {
	regions?: typeof REGIONS;
	createResponse?: unknown;
}): void {
	const {
		regions = REGIONS,
		createResponse = { ok: true },
	} = options;

	worker.use(
		http.post('/service/admin/soap/zextras', async ({ request }) => {
			const body = (await request.json()) as {
				Body?: { zextras?: { action?: string } };
			};
			const action = body?.Body?.zextras?.action;

			if (action === 'listS3Regions') {
				return HttpResponse.json({
					Body: {
						response: {
							content: buildZextrasContent({
								ok: true,
								response: { values: regions },
							}),
						},
					},
				});
			}

			if (action === 'createS3Connector') {
				return HttpResponse.json({
					Body: {
						response: {
							content: buildZextrasContent(createResponse),
						},
					},
				});
			}

			return HttpResponse.json({ Body: {} });
		}),
	);
}

function renderConnection(onCancel: () => void = vi.fn()): React.ReactElement {
	return <Connection onCancel={onCancel} />;
}

async function fillRequiredFields(): Promise<void> {
	await page.getByLabelText('Descriptive name*').fill('Main bucket');
	await page.getByLabelText('Bucket name*').fill('main-bucket');
	await page.getByLabelText('Access Key ID*').fill('AKIA_TEST');
	await page.getByLabelText('Secret Access Key*').fill('SECRET_TEST');
	await page.getByLabelText('Endpoint URL*').fill('https://s3.example.test');
}

describe('Connection (browser)', () => {
	beforeEach(() => {
		setupZextrasInterceptor({});
	});

	it('should render connection form fields', async () => {
		await setupBrowserTest(renderConnection());

		await expect.element(page.getByLabelText('Descriptive name*')).toBeVisible();
		await expect.element(page.getByLabelText('Bucket name*')).toBeVisible();
		await expect.element(page.getByLabelText('Access Key ID*')).toBeVisible();
		await expect.element(page.getByLabelText('Secret Access Key*')).toBeVisible();
		await expect.element(page.getByLabelText('Endpoint URL*')).toBeVisible();
		await expect.element(page.getByLabelText('Prefix')).toBeVisible();
		await expect
			.element(page.getByRole('button', { name: /cancel/i }))
			.toBeVisible();
		await expect
			.element(
				page.getByRole('button', { name: /verify & create connector/i }),
			)
			.toBeVisible();
	});

	it('should show validation errors when submitting with empty fields', async () => {
		await setupBrowserTest(renderConnection());

		await page.getByRole('button', { name: /verify & create connector/i }).click();

		await expect
			.element(page.getByText('This field is mandatory'))
			.toBeVisible();
		await expect
			.element(page.getByText("This field can't be blank or have white space").first())
			.toBeVisible();
	});

	it('should fill required fields and create connector successfully', async () => {
		await setupBrowserTest(renderConnection());

		await fillRequiredFields();
		await page.getByRole('button', { name: /verify & create connector/i }).click();

		await expect
			.element(page.getByText('Connectors verified and created'))
			.toBeVisible();
	});

	it('should show error popover when connector creation fails', async () => {
		setupZextrasInterceptor({
			createResponse: { ok: false, error: 'Connector verification failed' },
		});

		await setupBrowserTest(renderConnection());

		await fillRequiredFields();
		await page.getByRole('button', { name: /verify & create connector/i }).click();

		await expect
			.element(
				page.getByText('Something went wrong with the information you provide'),
			)
			.toBeVisible();
	});

	it('should call onCancel when CANCEL is clicked', async () => {
		const onCancel = vi.fn();
		await setupBrowserTest(renderConnection(onCancel));

		await page.getByRole('button', { name: /^cancel$/i }).click();

		expect(onCancel).toHaveBeenCalledTimes(1);
	});
});
