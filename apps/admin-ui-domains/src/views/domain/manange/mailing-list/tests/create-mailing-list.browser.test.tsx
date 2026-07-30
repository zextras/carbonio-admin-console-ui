/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { domainByIdKey } from '@zextras/ui-shared';
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import CreateMailingList from '../create-mailing-list';

vi.mock('../mailing-list-section', () => ({
	default: (): ReactElement => (
		<div data-testid="mock-mailing-list-section">Distribution List Section</div>
	),
}));
vi.mock('../mailing-list-members-section', () => ({
	default: (): ReactElement => (
		<div data-testid="mock-members-section">Members Section</div>
	),
}));
vi.mock('../mailing-list-settings-sections', () => ({
	default: (): ReactElement => (
		<div data-testid="mock-settings-section">Settings Section</div>
	),
}));
vi.mock('../mailinglist-create-section', () => ({
	default: (): ReactElement => (
		<div data-testid="mock-create-section">Create Section</div>
	),
}));

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

function setup(ui: ReactElement) {
	const queryClient = getQueryClient();
	queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
		id: DOMAIN_ID,
		name: DOMAIN_NAME,
		a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
	});
	return setupBrowserTest(ui, {
		queryClient,
		withDomainIdRoute: true,
		initialRouterEntry: `/${DOMAIN_ID}`,
	});
}

describe('CreateMailingList (browser)', () => {
	describe('Rendering', () => {
		it('renders the New Distribution List wizard title', async () => {
			setup(
				<CreateMailingList
					setShowCreateMailingListView={vi.fn()}
					createMailingListReq={vi.fn()}
					isLoading={false}
				/>,
			);

			await expect
				.element(page.getByText('New Distribution List'))
				.toBeVisible();
		});

		it('renders the wizard step labels', async () => {
			setup(
				<CreateMailingList
					setShowCreateMailingListView={vi.fn()}
					createMailingListReq={vi.fn()}
					isLoading={false}
				/>,
			);

			await expect
				.element(page.getByText('Distribution List', { exact: true }))
				.toBeVisible();
		});

		it('renders the Cancel button', async () => {
			setup(
				<CreateMailingList
					setShowCreateMailingListView={vi.fn()}
					createMailingListReq={vi.fn()}
					isLoading={false}
				/>,
			);

			await expect
				.element(page.getByRole('button', { name: /cancel/i }))
				.toBeVisible();
		});
	});

	describe('Loading state', () => {
		it('shows a spinner when isLoading is true', async () => {
			setup(
				<CreateMailingList
					setShowCreateMailingListView={vi.fn()}
					createMailingListReq={vi.fn()}
					isLoading={true}
				/>,
			);

			await expect.element(page.getByRole('status')).toBeVisible();
		});
	});

	describe('Cancel action', () => {
		it('calls setShowCreateMailingListView(false) when Cancel is clicked', async () => {
			const setShowCreateMailingListView = vi.fn();
			setup(
				<CreateMailingList
					setShowCreateMailingListView={setShowCreateMailingListView}
					createMailingListReq={vi.fn()}
					isLoading={false}
				/>,
			);

			await page.getByRole('button', { name: /cancel/i }).click();

			expect(setShowCreateMailingListView).toHaveBeenCalledWith(false);
		});
	});
});
