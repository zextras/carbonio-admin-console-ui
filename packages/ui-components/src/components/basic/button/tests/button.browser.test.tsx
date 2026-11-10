/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import '../../../../web-components/ds-icon';
import { Button } from '../Button';

describe('Button a11y', () => {
	it('names the secondary action via ariaLabel', async () => {
		await render(
			<Button
				label="Save"
				size="large"
				onClick={() => {}}
				secondaryAction={{ icon: 'ChevronDown', ariaLabel: 'More options', onClick: () => {} }}
			/>,
		);

		await expect.element(page.getByRole('button', { name: 'More options' })).toBeVisible();
	});

	it('hides decorative icons from the accessibility tree', async () => {
		await render(<Button label="Save" icon="CheckmarkSquareOutline" onClick={() => {}} />);

		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
		await expect.element(page.getByRole('img')).not.toBeInTheDocument();
	});
});
