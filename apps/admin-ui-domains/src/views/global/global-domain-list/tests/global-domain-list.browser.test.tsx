/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
vi.mock('@zextras/ui-shared', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@zextras/ui-shared')>();
	return { ...actual, replaceHistory: vi.fn() };
});

import { replaceHistory } from '@zextras/ui-shared';
import {
	createBrowserSoapAPIInterceptor,
	resetMockWorker,
	setupBrowserTest,
	worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { GlobalDomainList } from '../global-domain-list';

const mockedReplaceHistory = vi.mocked(replaceHistory);

type DomainAttr = { n: string; _content: string };
type DomainItem = { name: string; id: string; a: Array<DomainAttr> };

function buildDomain(
	name: string,
	id: string,
	status = 'active',
	extraAttrs: Array<DomainAttr> = [],
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

function interceptDomains(domains: Array<DomainItem> = [], searchTotal = domains.length) {
	return createBrowserSoapAPIInterceptor('SearchDirectory', {
		domain: domains,
		searchTotal,
		more: false,
	});
}

type SearchDirectoryParams = {
	query?: string | { _content?: string };
	offset?: number;
	limit?: number;
};

function queryContent(params: SearchDirectoryParams): string {
	const { query } = params;
	if (typeof query === 'string') {
		return query;
	}
	return query?._content ?? '';
}

function interceptDynamicDomains(
	handler: (params: SearchDirectoryParams) => {
		domain: Array<DomainItem>;
		searchTotal: number;
		more: boolean;
	},
): void {
	worker.use(
		http.post('/service/admin/soap/SearchDirectoryRequest', async ({ request }) => {
			const body = await request.clone().json();
			const params = (body as { Body?: { SearchDirectoryRequest?: SearchDirectoryParams } }).Body
				?.SearchDirectoryRequest ?? {};
			return HttpResponse.json({
				Body: { SearchDirectoryResponse: handler(params) },
			});
		}),
	);
}

const SAMPLE_DOMAINS: Array<DomainItem> = [
	buildDomain('example.com', 'domain-1', 'active'),
	buildDomain('test.org', 'domain-2', 'closed'),
];

function setup(ui: ReactElement) {
	return setupBrowserTest(ui);
}

describe('GlobalDomainList (browser)', () => {
	afterEach(() => {
		resetMockWorker();
		mockedReplaceHistory.mockClear();
	});

	describe('Rendering', () => {
		it('renders the Domains header and count', async () => {
			interceptDomains(SAMPLE_DOMAINS, 2);
			await setup(<GlobalDomainList />);

			await expect.element(page.getByRole('heading', { name: 'Domains' })).toBeVisible();
			await expect.element(page.getByText('2 domains')).toBeVisible();
		});

		it('renders the table column headers', async () => {
			interceptDomains([]);
			await setup(<GlobalDomainList />);

			await expect.element(page.getByText('Domain', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Status', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Description', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Created', { exact: true })).toBeVisible();
		});

		it('renders the search input', async () => {
			interceptDomains(SAMPLE_DOMAINS, 2);
			await setup(<GlobalDomainList />);

			await expect.element(page.getByLabelText(`I'm looking for this domain…`)).toBeVisible();
		});

		it('renders the Create domain button and navigates on click', async () => {
			interceptDomains(SAMPLE_DOMAINS, 2);
			await setup(<GlobalDomainList />);

			const createButton = page.getByRole('button', { name: 'Create domain' });
			await expect.element(createButton).toBeVisible();
			await createButton.click();

			expect(mockedReplaceHistory).toHaveBeenCalledWith('/create-new-domain');
		});
	});

	describe('With data', () => {
		it('displays domain names in the table', async () => {
			interceptDomains(SAMPLE_DOMAINS, 2);
			await setup(<GlobalDomainList />);

			await expect.element(page.getByText('example.com')).toBeVisible();
			await expect.element(page.getByText('test.org')).toBeVisible();
		});

		it('displays domain status labels', async () => {
			interceptDomains(SAMPLE_DOMAINS, 2);
			await setup(<GlobalDomainList />);

			await expect.element(page.getByText('Active', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Closed', { exact: true })).toBeVisible();
		});
	});

	describe('Domain statuses', () => {
		it.each([
			['maintenance', 'In maintenance'],
			['locked', 'Locked'],
			['pending', 'Pending'],
			['lockout', 'Lockout'],
			['suspended', 'Suspended'],
		])('displays %s status as "%s"', async (status, expectedLabel) => {
			interceptDomains([buildDomain('status-test.com', 'domain-st', status)]);
			await setup(<GlobalDomainList />);

			await expect.element(page.getByText(expectedLabel, { exact: true })).toBeVisible();
		});

		it('defaults to Active when domain has no zimbraDomainStatus attribute', async () => {
			interceptDomains([{ name: 'fallback.com', id: 'domain-fb', a: [] }]);
			await setup(<GlobalDomainList />);

			await expect.element(page.getByText('Active', { exact: true })).toBeVisible();
		});

		it('falls back to the raw status string for an unknown status without crashing', async () => {
			interceptDomains([buildDomain('weird.com', 'domain-x', 'totally-unknown-status')]);
			await setup(<GlobalDomainList />);

			await expect.element(page.getByText('weird.com')).toBeVisible();
			await expect
				.element(page.getByText('totally-unknown-status', { exact: true }))
				.toBeVisible();
		});
	});

	describe('Empty state', () => {
		it('shows the empty state message when no domains exist', async () => {
			interceptDomains([], 0);
			await setup(<GlobalDomainList />);

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
			await setup(<GlobalDomainList />);

			await expect.element(page.getByText('Server error')).toBeVisible();
		});
	});

	describe('Search', () => {
		it('filters domains based on search input after debounce', async () => {
			interceptDynamicDomains((params) => {
				const content = queryContent(params);
				if (content.includes('exam')) {
					return {
						domain: [buildDomain('example.com', 'domain-1', 'active')],
						searchTotal: 1,
						more: false,
					};
				}
				return { domain: SAMPLE_DOMAINS, searchTotal: 2, more: false };
			});
			await setup(<GlobalDomainList />);

			await expect.element(page.getByText('example.com')).toBeVisible();
			await expect.element(page.getByText('test.org')).toBeVisible();

			const searchInput = page.getByLabelText(`I'm looking for this domain…`);
			await searchInput.fill('exam');

			await expect.element(page.getByText('example.com')).toBeVisible();
			await expect
				.poll(() => page.getByText('test.org').elements(), { timeout: 5000 })
				.toHaveLength(0);
		}, 15_000);

		it('shows empty state when search returns no matches', async () => {
			interceptDynamicDomains((params) => {
				const content = queryContent(params);
				if (content !== '') {
					return { domain: [], searchTotal: 0, more: false };
				}
				return { domain: SAMPLE_DOMAINS, searchTotal: 2, more: false };
			});
			await setup(<GlobalDomainList />);

			await expect.element(page.getByText('example.com')).toBeVisible();

			const searchInput = page.getByLabelText(`I'm looking for this domain…`);
			await searchInput.fill('xyznomatch');

			await expect.element(page.getByText('This list is empty.')).toBeVisible();
		}, 15_000);
	});

	describe('Navigation', () => {
		it('navigates to domain details when clicking a domain row', async () => {
			interceptDomains(SAMPLE_DOMAINS, 2);
			await setup(<GlobalDomainList />);

			await expect.element(page.getByText('example.com')).toBeVisible();

			await page.getByText('example.com').click();

			expect(mockedReplaceHistory).toHaveBeenCalledWith('/domain-1/accounts');
		});

		it('navigates to domain details from the open arrow', async () => {
			interceptDomains(SAMPLE_DOMAINS, 2);
			await setup(<GlobalDomainList />);

			await expect.element(page.getByText('example.com')).toBeVisible();
			await page.getByRole('button', { name: /Open domain for example.com/ }).click();

			expect(mockedReplaceHistory).toHaveBeenCalledWith('/domain-1/accounts');
		});
	});

	describe('Pagination', () => {
		it('shows results footer when domains exist below the pagination threshold', async () => {
			interceptDomains(SAMPLE_DOMAINS, 2);
			await setup(<GlobalDomainList />);

			await expect.element(page.getByText('example.com')).toBeVisible();
			await expect.element(page.getByText('2 results')).toBeVisible();
		});

		it('loads next page of domains when clicking next page', async () => {
			const page1Domains = Array.from({ length: 10 }, (_, i) =>
				buildDomain(`alpha-${i + 1}.com`, `p1-${i + 1}`),
			);
			const page2Domains = Array.from({ length: 10 }, (_, i) =>
				buildDomain(`beta-${i + 11}.com`, `p2-${i + 11}`),
			);

			interceptDynamicDomains((params) => {
				const offset = params.offset ?? 0;
				if (offset === 0) {
					return { domain: page1Domains, searchTotal: 25, more: true };
				}
				return { domain: page2Domains, searchTotal: 25, more: false };
			});
			await setup(<GlobalDomainList />);

			await expect.element(page.getByText('alpha-1.com')).toBeVisible();

			await page.getByRole('button', { name: 'Next page' }).click();

			await expect.element(page.getByText('beta-11.com')).toBeVisible();
		}, 15_000);
	});
});
