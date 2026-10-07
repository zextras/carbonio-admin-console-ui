/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { soapFetch } from '../fetch';

describe('soapFetch', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('should return the SOAP response body for a successful request', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ Body: { NoOpResponse: { ok: true } } }), { status: 200 }),
			),
		);

		const response = await soapFetch('NoOp', {});

		expect(response).toEqual({ ok: true });
	});

	it('should throw a controlled error when the response body is empty', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 200 })));

		await expect(soapFetch('NoOp', {})).rejects.toThrow('Empty response from NoOpRequest');
	});

	it('should throw a controlled error when the response body is only whitespace', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('   ', { status: 200 })));

		await expect(soapFetch('NoOp', {})).rejects.toThrow('Empty response from NoOpRequest');
	});
});
