/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	isSameOriginUrlOutsideProxyAllowlist,
	PROXY_EMBEDDED_RESOURCE_ALLOWLIST_PREFIXES,
} from '../proxy-asset-allowlist';

const HOST = 'mail.example.com';

describe('isSameOriginUrlOutsideProxyAllowlist', () => {
	it('returns true for https same-host URL outside the allowlist', () => {
		expect(isSameOriginUrlOutsideProxyAllowlist('https://mail.example.com/logo.ico', HOST)).toBe(
			true,
		);
	});

	it('ignores the port when comparing hosts', () => {
		expect(isSameOriginUrlOutsideProxyAllowlist('https://mail.example.com:6071/logo.png', HOST)).toBe(
			true,
		);
	});

	it('returns false for same-host URLs under an allowlist prefix', () => {
		expect(
			isSameOriginUrlOutsideProxyAllowlist('https://mail.example.com/static/iris/logo.png', HOST),
		).toBe(false);
		expect(
			isSameOriginUrlOutsideProxyAllowlist(
				'https://mail.example.com/service/home/~/?auth=co&id=1&part=2',
				HOST,
			),
		).toBe(false);
	});

	it('returns false for external hosts', () => {
		expect(isSameOriginUrlOutsideProxyAllowlist('https://cdn.example.com/logo.png', HOST)).toBe(
			false,
		);
	});

	it('returns false for http scheme even on same host', () => {
		expect(isSameOriginUrlOutsideProxyAllowlist('http://mail.example.com/logo.png', HOST)).toBe(
			false,
		);
	});

	it('returns false for empty and whitespace-only strings', () => {
		expect(isSameOriginUrlOutsideProxyAllowlist('', HOST)).toBe(false);
		expect(isSameOriginUrlOutsideProxyAllowlist('   ', HOST)).toBe(false);
	});

	it('returns false for unparseable URLs without throwing', () => {
		expect(isSameOriginUrlOutsideProxyAllowlist('not-a-url', HOST)).toBe(false);
	});

	it('ignores the query string when matching the pathname', () => {
		expect(
			isSameOriginUrlOutsideProxyAllowlist('https://mail.example.com/img.png?v=1&x=/static/', HOST),
		).toBe(true);
	});
});

describe('PROXY_EMBEDDED_RESOURCE_ALLOWLIST_PREFIXES', () => {
	it('contains the merged carbonio-proxy allowlist', () => {
		expect(PROXY_EMBEDDED_RESOURCE_ALLOWLIST_PREFIXES).toEqual([
			'/static/',
			'/service/home/~/',
			'/service/preview/',
			'/services/files/preview/',
			'/services/docs/editor/',
			'/services/chats/preview/',
			'/services/chats/attachments/',
			'/services/chats/rooms/',
			'/meeting/',
			'/files/public/link/access/assets/',
		]);
	});
});
