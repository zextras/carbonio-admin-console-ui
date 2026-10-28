/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { DashboardBanner } from '../dashboard-banner';

const DESCRIPTION = 'Maintenance expires on 18 Jun 2025.';
const DETAIL = 'Renew to continue receiving updates.';

function BannerHarness({
	onClose,
	action,
	detail = DETAIL,
}: {
	onClose?: () => void;
	action?: { label: string; onClick: () => void };
	detail?: string;
}) {
	const [open, setOpen] = useState(true);

	return open ? (
		<DashboardBanner
			description={DESCRIPTION}
			detail={detail}
			onClose={
				onClose ??
				(() => {
					setOpen(false);
				})
			}
			closeLabel="Close"
			action={action}
		/>
	) : null;
}

describe('DashboardBanner', () => {
	it('renders description and detail texts', async () => {
		await setupBrowserTest(<DashboardBanner description={DESCRIPTION} detail={DETAIL} />);

		await expect.element(page.getByText(DESCRIPTION)).toBeVisible();
		await expect.element(page.getByText(DETAIL)).toBeVisible();
	});

	it('renders without a detail text when omitted', async () => {
		await setupBrowserTest(<DashboardBanner description={DESCRIPTION} />);

		await expect.element(page.getByText(DESCRIPTION)).toBeVisible();
	});

	it('hides the banner when the close button is clicked', async () => {
		await setupBrowserTest(<BannerHarness />);

		const closeButton = page.getByRole('button', { name: 'Close' });
		await expect.element(closeButton).toBeVisible();
		await closeButton.click();

		await expect.element(page.getByText(DESCRIPTION)).not.toBeInTheDocument();
	});

	it('does not render a close button when onClose is not provided', async () => {
		await setupBrowserTest(<DashboardBanner description={DESCRIPTION} />);

		expect(page.getByRole('button', { name: 'Close' }).elements()).toHaveLength(0);
	});

	it('renders the action button and fires its onClick', async () => {
		const onClick = vi.fn();
		await setupBrowserTest(
			<BannerHarness action={{ label: 'View Subscription Details', onClick }} />,
		);

		const actionButton = page.getByRole('button', { name: 'View Subscription Details' });
		await expect.element(actionButton).toBeVisible();
		await actionButton.click();

		expect(onClick).toHaveBeenCalledOnce();
	});
});
