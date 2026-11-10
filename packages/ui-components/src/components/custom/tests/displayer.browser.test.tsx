/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../../../web-components/ds-icon';

import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Displayer } from '../displayer';

describe('Displayer a11y', () => {
	it('names left icon-only buttons with the pin tooltip text', async () => {
		await render(
			<Displayer pinIcon buttons={[{ align: 'left', icon: 'Pin3Outline', onClick: () => {} }]} />,
		);

		await expect.element(
			page.getByRole('button', { name: 'Click to make the button bar scroll with the page' }),
		).toBeVisible();
	});

	it('names right icon-only buttons with tooltiplabel', async () => {
		await render(
			<Displayer
				pinIcon={false}
				buttons={[{ align: 'right', icon: 'RefreshOutline', tooltiplabel: 'Refresh', onClick: () => {} }]}
			/>,
		);

		await expect.element(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
	});

	it('renders right buttons with a label as labeled buttons', async () => {
		await render(
			<Displayer
				pinIcon={false}
				buttons={[{ align: 'right', icon: 'CheckmarkSquareOutline', label: 'Save', onClick: () => {} }]}
			/>,
		);

		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
	});
});
