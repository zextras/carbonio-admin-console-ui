/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	deleteQuotaNotificationContent,
	deleteQuotaNotificationInterval,
	getQuotaNotificationConfig,
	putQuotaNotificationContent,
	putQuotaNotificationInterval,
	QuotaNotificationApiError,
} from '../quota-notification-service';

const BASE = '/service/extension/zextras_admin/powerstore/quota/notification/configs';

function jsonResponse(body: unknown, init: ResponseInit = { status: 200 }): Response {
	return new Response(JSON.stringify(body), init);
}

describe('quota notification service', () => {
	const fetchMock = vi.fn();

	beforeEach(() => {
		vi.stubGlobal('fetch', fetchMock);
	});

	afterEach(() => {
		fetchMock.mockReset();
		vi.unstubAllGlobals();
	});

	it('GETs the configuration of an account by id', async () => {
		const config = { content: {}, interval: {} };
		fetchMock.mockResolvedValue(jsonResponse(config));

		await expect(getQuotaNotificationConfig('accounts', 'acc-1')).resolves.toEqual(config);

		expect(fetchMock).toHaveBeenCalledWith(`${BASE}/accounts/acc-1`, expect.any(Object));
	});

	it('GETs the configuration of a COS by id', async () => {
		fetchMock.mockResolvedValue(jsonResponse({}));

		await getQuotaNotificationConfig('cos', 'cos-1');

		expect(fetchMock).toHaveBeenCalledWith(`${BASE}/cos/cos-1`, expect.any(Object));
	});

	it('PUTs subject and body to the content sub-resource', async () => {
		fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

		await putQuotaNotificationContent('cos', 'cos-1', { subject: 'S', body: 'B' });

		expect(fetchMock).toHaveBeenCalledWith(
			`${BASE}/cos/cos-1/content`,
			expect.objectContaining({ method: 'PUT', body: JSON.stringify({ subject: 'S', body: 'B' }) }),
		);
	});

	it('DELETEs the content override', async () => {
		fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

		await deleteQuotaNotificationContent('accounts', 'acc-1');

		expect(fetchMock).toHaveBeenCalledWith(
			`${BASE}/accounts/acc-1/content`,
			expect.objectContaining({ method: 'DELETE' }),
		);
	});

	it('PUTs the number of days to the interval sub-resource', async () => {
		fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

		await putQuotaNotificationInterval('accounts', 'acc-1', 14);

		expect(fetchMock).toHaveBeenCalledWith(
			`${BASE}/accounts/acc-1/interval`,
			expect.objectContaining({ method: 'PUT', body: JSON.stringify({ days: 14 }) }),
		);
	});

	it('DELETEs the interval override', async () => {
		fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

		await deleteQuotaNotificationInterval('cos', 'cos-1');

		expect(fetchMock).toHaveBeenCalledWith(
			`${BASE}/cos/cos-1/interval`,
			expect.objectContaining({ method: 'DELETE' }),
		);
	});

	it('url-encodes the id', async () => {
		fetchMock.mockResolvedValue(jsonResponse({}));

		await getQuotaNotificationConfig('cos', 'a/b');

		expect(fetchMock).toHaveBeenCalledWith(`${BASE}/cos/a%2Fb`, expect.any(Object));
	});

	it('throws an error carrying the field errors of a 400', async () => {
		const errors = [{ field: 'content.subject', code: 'FORBIDDEN_CHARACTER', detail: 'U+000A' }];
		fetchMock.mockResolvedValue(jsonResponse({ errors }, { status: 400 }));

		const error = await putQuotaNotificationContent('cos', 'cos-1', {
			subject: 'S',
			body: 'B',
		}).catch((e) => e);

		expect(error).toBeInstanceOf(QuotaNotificationApiError);
		expect(error.status).toBe(400);
		expect(error.errors).toEqual(errors);
	});

	it.each([403, 404, 500])('throws with status %i and no field errors', async (status) => {
		fetchMock.mockResolvedValue(new Response(null, { status }));

		const error = await getQuotaNotificationConfig('accounts', 'acc-1').catch((e) => e);

		expect(error).toBeInstanceOf(QuotaNotificationApiError);
		expect(error.status).toBe(status);
		expect(error.errors).toEqual([]);
	});

	it('tolerates a 400 without a JSON body', async () => {
		fetchMock.mockResolvedValue(new Response('not json', { status: 400 }));

		const error = await putQuotaNotificationInterval('cos', 'cos-1', 7).catch((e) => e);

		expect(error.errors).toEqual([]);
	});
});
