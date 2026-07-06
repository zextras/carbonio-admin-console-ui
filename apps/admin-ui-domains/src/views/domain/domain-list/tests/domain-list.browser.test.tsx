/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createBrowserSoapAPIInterceptor, setupBrowserTest, worker } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import DomainList from '../domain-list';

type DomainAttr = { n: string; _content: string };
type DomainItem = { name: string; id: string; a: DomainAttr[] };

function buildDomain(
	name: string,
	id: string,
	status = 'active',
	extraAttrs: DomainAttr[] = [],
): DomainItem {
	return {
		name,
		id,
		a: [
			{ n: 'zimbraDomainStatus', _content: status },
			{ n: 'zimbraDomainType', _content: 'local' },
			...extraAttrs,
		],
	};
}

function interceptDomains(domains: DomainItem[] = [], searchTotal = domains.length) {
	return createBrowserSoapAPIInterceptor('SearchDirectory', {
		domain: domains,
		searchTotal,
		more: false,
	});
}

const SAMPLE_DOMAINS: DomainItem[] = [
	buildDomain('example.com', 'domain-1', 'active'),
	buildDomain('test.org', 'domain-2', 'closed'),
];

function setup(ui: ReactElement) {
	return setupBrowserTest(ui);
}

describe('DomainList (browser)', () => {
	describe('Rendering', () => {
		it('renders the Domains List header', async () => {
			interceptDomains([]);
			setup(<DomainList />);

			await expect.element(page.getByText('Domains List')).toBeVisible();
		});

		it('renders the table column headers', async () => {
			interceptDomains([]);
			setup(<DomainList />);

			await expect.element(page.getByText('Domain Name', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Status', { exact: true })).toBeVisible();
		});

		it('renders the search input', async () => {
			interceptDomains(SAMPLE_DOMAINS, 2);
			setup(<DomainList />);

			await expect
				.element(page.getByLabelText(`I'm looking for this domain…`))
				.toBeVisible();
		});
	});

	describe('With data', () => {
		it('displays domain names in the table', async () => {
			interceptDomains(SAMPLE_DOMAINS, 2);
			setup(<DomainList />);

			await expect.element(page.getByText('example.com')).toBeVisible();
			await expect.element(page.getByText('test.org')).toBeVisible();
		});

		it('displays domain status labels', async () => {
			interceptDomains(SAMPLE_DOMAINS, 2);
			setup(<DomainList />);

			await expect.element(page.getByText('Active', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Closed', { exact: true })).toBeVisible();
		});
	});

	describe('Empty state', () => {
		it('shows the empty state message when no domains exist', async () => {
			interceptDomains([], 0);
			setup(<DomainList />);

			await expect.element(page.getByText('This list is empty.')).toBeVisible();
		});
	});

	describe('Error handling', () => {
		it('displays an error snackbar when the API fails', async () => {
			worker.use(
				http.post('/service/admin/soap/SearchDirectoryRequest', () =>
					HttpResponse.json(
						{ Body: { Fault: { Reason: { Text: 'Server error' } } } },
						{ status: 500 },
					),
				),
			);
			setup(<DomainList />);

			await expect.element(page.getByTestId('snackbar')).toBeVisible();
		});
	});
});
