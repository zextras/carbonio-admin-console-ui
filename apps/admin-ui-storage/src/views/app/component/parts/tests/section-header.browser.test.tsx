/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, test, vi } from 'vitest';
import { page } from 'vitest/browser';

import { SectionHeader } from '../section-header';

describe('SectionHeader', () => {
	const onCloseMock = vi.fn();
	const title = 'Test Title';
	it('renders title correctly', () => {
		setupBrowserTest(<SectionHeader title={title} onClose={onCloseMock} />);
		const titleElement = page.getByText(title).element();
		expect(titleElement).toBeTruthy();
		expect(titleElement).toBeInstanceOf(HTMLElement);
	});

	test('renders close button when showClose is true', async () => {
		setupBrowserTest(<SectionHeader showClose title={title} onClose={onCloseMock} />);
		const closeButton = page.getByTestId('close-button');
		await closeButton.click();
		expect(onCloseMock).toHaveBeenCalled();
	});
});
