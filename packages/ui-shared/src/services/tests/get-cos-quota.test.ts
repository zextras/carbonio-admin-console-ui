/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getCosQuota } from '../get-cos-quota';

describe('getCosQuota', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('should return success with a limited computed limit', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(
					JSON.stringify({
						computedLimit: { type: 'limited', value: 10737418240, source: 'cos' },
					}),
					{ status: 200 },
				),
			),
		);

		const result = await getCosQuota('cos-123');

		expect(result).toEqual({
			type: 'success',
			totalComputedLimit: { type: 'limited', value: 10737418240 },
			totalQuotaSource: 'cos',
		});
	});

	it('should return success with an unlimited computed limit', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ computedLimit: { type: 'unlimited', source: 'global' } }), {
					status: 200,
				}),
			),
		);

		const result = await getCosQuota('cos-456');

		expect(result).toEqual({
			type: 'success',
			totalComputedLimit: { type: 'unlimited' },
			totalQuotaSource: 'global',
		});
	});

	it('should return error when the response is not ok', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(new Response(null, { status: 500, statusText: 'Internal Server Error' })),
		);

		const result = await getCosQuota('cos-err');

		expect(result).toEqual({
			type: 'error',
			error: 'Internal Server Error',
		});
	});

	it('should send the correct url and headers', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ computedLimit: { type: 'unlimited', source: 'global' } }), {
				status: 200,
			}),
		);
		vi.stubGlobal('fetch', fetchMock);

		await getCosQuota('cos-hdr');

		expect(fetchMock).toHaveBeenCalledWith('/services/storages/admin/quota/cos/cos-hdr', {
			headers: {
				'Content-Type': 'application/json',
				'X-API-Version': '2',
			},
		});
	});
});
