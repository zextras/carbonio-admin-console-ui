/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import '../../../../web-components/ds-icon';
import '../../../../web-components/ds-spinner';
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

	it('does not fire onClick while loading (mouse)', async () => {
		const onClick = vi.fn();
		await render(<Button label="Save" loading onClick={onClick} />);

		// force: aria-disabled makes the locator wait for "enabled" forever; we are
		// asserting the component's own click guard, not the browser's default.
		await page.getByRole('button', { name: 'Save' }).click({ force: true });

		expect(onClick).not.toHaveBeenCalled();
	});

	it('does not fire onClick while loading (keyboard Enter)', async () => {
		const onClick = vi.fn();
		await render(<Button label="Save" loading onClick={onClick} />);

		const button = await page.getByRole('button', { name: 'Save' }).element();
		button.focus();
		await userEvent.keyboard('{Enter}');

		expect(onClick).not.toHaveBeenCalled();
	});

	it('does not fire secondaryAction onClick while loading', async () => {
		const onSecondary = vi.fn();
		await render(
			<Button
				label="Save"
				size="large"
				loading
				onClick={() => {}}
				secondaryAction={{ icon: 'ChevronDown', ariaLabel: 'More options', onClick: onSecondary }}
			/>,
		);

		await page.getByRole('button', { name: 'More options' }).click();

		expect(onSecondary).not.toHaveBeenCalled();
	});

	it('exposes loading state to AT', async () => {
		await render(<Button label="Save" loading onClick={() => {}} />);

		const btn = page.getByRole('button', { name: 'Save' });
		await expect.element(btn).toHaveAttribute('aria-busy', 'true');
		await expect.element(btn).toHaveAttribute('aria-disabled', 'true');
	});
});
