/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { domainByIdKey } from '@zextras/ui-shared';
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { DomainDetailPanel } from '../domain-detail-panel';

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

type Attr = { n: string; _content: string };

function buildDomainAttributes(
	status = 'closed',
	extra: Attr[] = [],
): Attr[] {
	return [{ n: 'zimbraDomainStatus', _content: status }, ...extra];
}

function setup(
	ui: ReactElement,
	attributes: Attr[] = buildDomainAttributes(),
): ReturnType<typeof setupBrowserTest> {
	const queryClient = getQueryClient();
	queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
		id: DOMAIN_ID,
		name: DOMAIN_NAME,
		a: attributes,
	});
	return setupBrowserTest(ui, {
		queryClient,
		withDomainIdRoute: true,
		initialRouterEntry: `/${DOMAIN_ID}`,
	});
}

const DetailPanelContent: ReactElement = (
	<DomainDetailPanel>
		<div data-testid="child-content">Child</div>
	</DomainDetailPanel>
);

describe('DomainDetailPanel (browser)', () => {
	describe('Closed domain banner', () => {
		it('shows the closed domain banner when domain status is closed', async () => {
			setup(DetailPanelContent);

			await expect.element(page.getByText('example.com')).toBeVisible();
		});

		it('renders child content', async () => {
			setup(DetailPanelContent);

			await expect.element(page.getByTestId('child-content')).toBeVisible();
		});

		it('does not show the banner when domain status is active', async () => {
			setup(DetailPanelContent, buildDomainAttributes('active'));

			await expect
				.element(page.getByTestId('child-content'))
				.toBeVisible();
		});

		it('does not show the banner on the global domains route', async () => {
			const queryClient = getQueryClient();
			queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
				id: DOMAIN_ID,
				name: DOMAIN_NAME,
				a: buildDomainAttributes(),
			});
			setupBrowserTest(DetailPanelContent, {
				queryClient,
				withDomainIdRoute: true,
				initialRouterEntry: `/${DOMAIN_ID}/domains/global`,
			});

			await expect.element(page.getByTestId('child-content')).toBeVisible();
		});
	});

	describe('Banner dismiss', () => {
		it('hides the banner when the close icon is clicked', async () => {
			setup(DetailPanelContent);

			await expect.element(page.getByText('example.com')).toBeVisible();

			await page.getByTestId('icon: Close').click();

			await expect.element(page.getByTestId('child-content')).toBeVisible();
		});

		it('hides the banner when NEVER SHOW THIS AGAIN is clicked', async () => {
			setup(DetailPanelContent);

			await expect.element(page.getByText('example.com')).toBeVisible();

			await page
				.getByRole('button', { name: /never show this again/i })
				.click();

			await expect.element(page.getByTestId('child-content')).toBeVisible();
		});
	});
});
