/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setupBrowserTest } from 'admin-ui-test-utils';
import { Outlet, Route, Routes, useNavigate } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { RouteLeavingGuard } from '../nav-guard';

function NavigationTrigger({ label }: { label: string }): React.ReactElement {
	const navigate = useNavigate();
	return (
		<button type="button" onClick={(): void => navigate('/other')}>
			{label}
		</button>
	);
}

function Layout({
	when,
	children,
}: {
	when: boolean;
	children: React.ReactNode;
}): React.ReactElement {
	return (
		<>
			<RouteLeavingGuard when={when} onSave={onSave}>
				{children}
			</RouteLeavingGuard>
			<Outlet />
		</>
	);
}

const onSave = vi.fn();

const guardChildren = (
	<>
		<p>Unsaved line 1</p>
		<p>Unsaved line 2</p>
	</>
);

async function setupGuardTest(when = true): Promise<void> {
	await setupBrowserTest(
		<Routes>
			<Route element={<Layout when={when}>{guardChildren}</Layout>}>
				<Route
					path="/"
					element={
						<>
							<span>Home Page</span>
							<NavigationTrigger label="Go Away" />
						</>
					}
				/>
				<Route path="/other" element={<span>Other Page</span>} />
			</Route>
		</Routes>,
		{ initialRouterEntry: '/' },
	);
	await expect.element(page.getByText('Home Page')).toBeVisible();
}

describe('RouteLeavingGuard', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('when unsaved changes exist', () => {
		it('should show modal when navigating away', async () => {
			await setupGuardTest(true);

			await page.getByRole('button', { name: 'Go Away' }).click();

			await expect
				.element(page.getByText('You have unsaved changes'))
				.toBeVisible();
			await expect.element(page.getByText('Unsaved line 1')).toBeVisible();
			await expect.element(page.getByText('Unsaved line 2')).toBeVisible();
		});

		it('should render Leave anyway and Save and leave buttons', async () => {
			await setupGuardTest(true);

			await page.getByRole('button', { name: 'Go Away' }).click();

			await expect
				.element(page.getByRole('button', { name: 'Leave anyway' }))
				.toBeVisible();
			await expect
				.element(page.getByRole('button', { name: 'Save and leave' }))
				.toBeVisible();
		});

		it('should navigate away when Leave anyway is clicked', async () => {
			await setupGuardTest(true);

			await page.getByRole('button', { name: 'Go Away' }).click();
			await page.getByRole('button', { name: 'Leave anyway' }).click();

			await expect.element(page.getByText('Other Page')).toBeVisible();
		});

		it('should call onSave and navigate when Save and leave is clicked', async () => {
			await setupGuardTest(true);

			await page.getByRole('button', { name: 'Go Away' }).click();
			await page.getByRole('button', { name: 'Save and leave' }).click();

			expect(onSave).toHaveBeenCalledOnce();
			await expect.element(page.getByText('Other Page')).toBeVisible();
		});

		it('should not show modal initially', async () => {
			await setupGuardTest(true);

			await expect
				.element(page.getByText('You have unsaved changes'))
				.not.toBeInTheDocument();
		});
	});

	describe('when no unsaved changes', () => {
		it('should not show modal when navigating', async () => {
			await setupGuardTest(false);

			await page.getByRole('button', { name: 'Go Away' }).click();

			await expect
				.element(page.getByText('You have unsaved changes'))
				.not.toBeInTheDocument();
			await expect.element(page.getByText('Other Page')).toBeVisible();
		});
	});
});
