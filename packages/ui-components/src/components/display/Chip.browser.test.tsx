/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { expect, test } from 'vitest';
import { page } from 'vitest/browser';

import { Chip } from './Chip';

test('Chip height should remain 20px when global box-sizing is border-box (Tailwind preflight)', async () => {
	const style = document.createElement('style');
	style.textContent = `
		*, *::before, *::after {
			box-sizing: border-box;
		}
	`;
	document.head.appendChild(style);

	await setupBrowserTest(
		<div style={{ padding: '20px' }}>
			<Chip label="Test Chip" size="small" hasAvatar={false} data-testid="chip1" />
			<Chip label="Test" size="small" hasAvatar={true} data-testid="chip2" />
		</div>,
	);

	const chip1 = page.getByTestId('chip1');
	const chip2 = page.getByTestId('chip2');

	await expect.element(chip1).toBeVisible();
	await expect.element(chip2).toBeVisible();

	const chip1Element = await chip1.element();
	const chip2Element = await chip2.element();

	const chip1Height = chip1Element.getBoundingClientRect().height;
	const chip2Height = chip2Element.getBoundingClientRect().height;

	expect(chip1Height).toBe(20);
	expect(chip2Height).toBe(20);

	expect(window.getComputedStyle(chip1Element).boxSizing).toBe('content-box');
	expect(window.getComputedStyle(chip2Element).boxSizing).toBe('content-box');

	const content1 = chip1Element.querySelector('[class*="content"]');
	const content2 = chip2Element.querySelector('[class*="content"]');

	if (content1) {
		expect(window.getComputedStyle(content1).boxSizing).toBe('content-box');
	}
	if (content2) {
		expect(window.getComputedStyle(content2).boxSizing).toBe('content-box');
	}

	document.head.removeChild(style);
});
