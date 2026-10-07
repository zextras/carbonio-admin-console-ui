/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { buildDocumentationUrl } from '../build-documentation-url';

const DEFAULT_URL_WITH_MODULE = 'https://docs.zextras.com/help-carbonio/?m=Domain';

describe('buildDocumentationUrl', () => {
	it('appends v, m and c as query params when all are provided', () => {
		const url = buildDocumentationUrl('https://docs.zextras.com/landing', {
			v: '26.9.0',
			m: 'Domain',
			c: 'GAL',
		});
		expect(url).toBe('https://docs.zextras.com/landing/?v=26.9.0&m=Domain&c=GAL');
	});

	it('omits params that are undefined', () => {
		const url = buildDocumentationUrl('https://docs.zextras.com/landing', {
			v: undefined,
			m: 'Domain',
			c: undefined,
		});
		expect(url).toBe('https://docs.zextras.com/landing/?m=Domain');
	});

	it('omits params that are empty strings', () => {
		const url = buildDocumentationUrl('https://docs.zextras.com/landing', {
			v: '',
			m: 'Domain',
			c: '',
		});
		expect(url).toBe('https://docs.zextras.com/landing/?m=Domain');
	});

	it('returns the base URL unchanged when no params are provided', () => {
		const url = buildDocumentationUrl('https://docs.zextras.com/landing', {});
		expect(url).toBe('https://docs.zextras.com/landing');
	});

	it('appends to a base URL that already has query params', () => {
		const url = buildDocumentationUrl('https://docs.zextras.com/landing?foo=bar', {
			m: 'Domain',
		});
		expect(url).toBe('https://docs.zextras.com/landing/?foo=bar&m=Domain');
	});

	it('should fall back to the default documentation URL when the base URL is not a valid absolute URL', () => {
		const url = buildDocumentationUrl('not-a-url', { m: 'Domain' });
		expect(url).toBe(DEFAULT_URL_WITH_MODULE);
	});

	it.each([
		['javascript:alert(1)'],
		['data:text/html,<script>alert(1)</script>'],
		['file:///etc/passwd'],
		['https://docs.zextras.com\\@evil.com'],
	])('should fall back to the default documentation URL when the base URL is unsafe (%s)', (baseUrl) => {
		const url = buildDocumentationUrl(baseUrl, { m: 'Domain' });
		expect(url).toBe(DEFAULT_URL_WITH_MODULE);
	});

	it('should accept an http base URL', () => {
		const url = buildDocumentationUrl('http://docs.example.com/landing', { m: 'Domain' });
		expect(url).toBe('http://docs.example.com/landing/?m=Domain');
	});
});
