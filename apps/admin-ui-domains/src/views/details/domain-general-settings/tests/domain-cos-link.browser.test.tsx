/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { domainByIdKey } from '@zextras/ui-shared';
import {
	createBrowserSoapAPIInterceptor,
	getQueryClient,
	setupBrowserTest,
	worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { type ReactElement } from 'react';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { DomainCosLink } from '../domain-cos-link';

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

function setup(ui: ReactElement) {
	createBrowserSoapAPIInterceptor('SearchDirectory', {
		cos: [
			{ id: 'cos-1', name: 'Standard COS', a: [] },
			{ id: 'cos-2', name: 'Premium COS', a: [] },
		],
		searchTotal: 2,
		more: false,
	});
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

let unhandledRejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;

beforeAll(() => {
	unhandledRejectionHandler = (event: PromiseRejectionEvent): void => {
		if (event.reason?.message?.includes('Link COS failed')) {
			event.preventDefault();
		}
	};
	globalThis.addEventListener('unhandledrejection', unhandledRejectionHandler);
});

afterAll(() => {
	if (unhandledRejectionHandler) {
		globalThis.removeEventListener('unhandledrejection', unhandledRejectionHandler);
	}
});

describe('DomainCosLink (browser)', () => {
	describe('Rendering', () => {
		it('renders the Class of Service header', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
			);

			await expect
				.element(page.getByText('Class of Service (cos)'))
				.toBeVisible();
		});

		it('renders table headers', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
			);

			await expect
				.element(page.getByText('Cos List', { exact: true }))
				.toBeVisible();
		});

		it('shows the empty state message when no COS are linked', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
			);

			await expect
				.element(
					page.getByText(
						'There are not COS included for this domain, please select one from the dropwdown menu and click on "DUPLICATE" or "LINK"',
					),
				)
				.toBeVisible();
		});
	});

	describe('With COS data', () => {
		it('displays COS names in the table', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[
						{ id: 'cos-1', name: 'Default COS', value: '10' },
						{ id: 'cos-2', name: 'Premium COS', value: '50' },
					]}
					defaultCosId="cos-1"
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
			);

			await expect.element(page.getByText('Standard COS')).toBeVisible();
			await expect.element(page.getByText('Premium COS')).toBeVisible();
		});

		it('displays max account values', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[
						{ id: 'cos-1', name: 'Default', value: '100' },
					]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
			);

			await expect.element(page.getByText('100')).toBeVisible();
		});

		it('shows Default COS badge for the default COS', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[
						{ id: 'cos-1', name: 'Default', value: '10' },
					]}
					defaultCosId="cos-1"
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
			);

			await expect
				.element(page.getByText('Default COS', { exact: true }))
				.toBeVisible();
		});
	});

	const DEFAULT_COS_LIST = [
		{ id: 'cos-1', name: 'Standard COS', a: [] },
		{ id: 'cos-2', name: 'Premium COS', a: [] },
	];

	const MANY_COS_LIST = Array.from({ length: 21 }, (_, index) => ({
		id: `cos-many-${index}`,
		name: `COS Number ${index}`,
		a: [],
	}));

	function setupGlobalAdmin(
		ui: ReactElement,
		cosList: Array<{ id: string; name: string; a: Array<string> }> = DEFAULT_COS_LIST,
	) {
		createBrowserSoapAPIInterceptor('SearchDirectory', {
			cos: cosList,
			searchTotal: cosList.length,
			more: false,
		});
		const queryClient = getQueryClient();
		queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
			id: DOMAIN_ID,
			name: DOMAIN_NAME,
			a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
		});
		queryClient.setQueryData(['account', 'settings'], {
			attrs: { zimbraIsAdminAccount: 'TRUE' },
		});
		return setupBrowserTest(ui, {
			queryClient,
			withDomainIdRoute: true,
			initialRouterEntry: `/${DOMAIN_ID}`,
		});
	}

	async function selectCosFromDropdown(cosName: string, matchIndex = 0): Promise<void> {
		await page.getByLabelText(/select a cos to include in this domain/i).click();
		await page.getByText(cosName).nth(matchIndex).click();
	}

	describe('Global admin rendering', () => {
		it('renders the COS selection controls when the user is a global admin', async () => {
			await setupGlobalAdmin(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
			);

			await expect
				.element(page.getByLabelText(/select a cos to include in this domain/i))
				.toBeVisible();
			await expect.element(page.getByLabelText(/handle accounts/i)).toBeVisible();
			await expect.element(page.getByRole('button', { name: 'Duplicate' })).toBeVisible();
			await expect.element(page.getByRole('button', { name: 'Link' })).toBeVisible();
		});

		it('does not render the COS selection controls for a non global admin', async () => {
			await setupBrowserTest(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
				{
					queryClient: getQueryClient(),
					withDomainIdRoute: true,
					initialRouterEntry: `/${DOMAIN_ID}`,
				},
			);

			await expect
				.element(page.getByText('Class of Service (cos)'))
				.toBeVisible();
			await expect
				.element(page.getByRole('button', { name: 'Link' }))
				.not.toBeInTheDocument();
		});

		it('shows the many-COS info message when the COS list exceeds the display limit', async () => {
			await setupGlobalAdmin(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
				MANY_COS_LIST,
			);

			await page.getByLabelText(/select a cos to include in this domain/i).click();

			await expect
				.element(
					page.getByText(
						'So many COSes! Which one would you like to see? Start typing to filter.',
					),
				)
				.toBeVisible();
		});
	});

	describe('Link flow', () => {
		it('links the selected COS to the domain when Link is clicked', async () => {
			const modifyInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
				domain: [],
			});
			createBrowserSoapAPIInterceptor('GrantRight', {});
			createBrowserSoapAPIInterceptor('FlushCache', {});
			createBrowserSoapAPIInterceptor('GetDomain', { domain: [] });

			await setupGlobalAdmin(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
			);

			await selectCosFromDropdown('Standard COS');
			await userEvent.fill(page.getByLabelText(/handle accounts/i), '10');
			await page.getByRole('button', { name: 'Link' }).click();

			const requestParams = (await modifyInterceptor) as {
				id?: string;
				a?: Array<{ n: string; _content?: string }>;
			};
			expect(requestParams.id).toBe(DOMAIN_ID);
			expect(requestParams.a).toContainEqual({
				n: '+zimbraDomainCOSMaxAccounts',
				_content: 'cos-1:10',
			});
			await expect
				.element(page.getByText('The change has been saved successfully'))
				.toBeVisible();
		});

		it('updates the existing link when Link is clicked for an already linked COS', async () => {
			const modifyInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
				domain: [],
			});
			createBrowserSoapAPIInterceptor('FlushCache', {});
			createBrowserSoapAPIInterceptor('GetDomain', { domain: [] });
			let grantRightCalled = false;
			worker.use(
				http.post('/service/admin/soap/GrantRightRequest', () => {
					grantRightCalled = true;
					return HttpResponse.json({ Body: { GrantRightResponse: {} } });
				}),
			);

			await setupGlobalAdmin(
				<DomainCosLink
					cosMaxAccountList={[{ id: 'cos-1', name: 'Standard COS', value: '10' }]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
			);

			await expect
				.poll(() => page.getByText('Standard COS').elements().length)
				.toBe(1);
			await page.getByLabelText(/select a cos to include in this domain/i).click();
			await expect
				.poll(() => page.getByText('Standard COS').elements().length)
				.toBe(2);
			await page.getByText('Standard COS').nth(1).click();
			await userEvent.fill(page.getByLabelText(/handle accounts/i), '5');
			await page.getByRole('button', { name: 'Link' }).click();

			const requestParams = (await modifyInterceptor) as {
				a?: Array<{ n: string; _content?: string }>;
			};
			expect(requestParams.a).toContainEqual({
				n: 'zimbraDomainCOSMaxAccounts',
				_content: 'cos-1:5',
			});
			expect(requestParams.a?.some((attr) => attr.n.startsWith('+'))).toBe(false);
			expect(grantRightCalled).toBe(false);
		});

		it('does not call ModifyDomain when Link is clicked without a selected COS', async () => {
			let modifyDomainCalled = false;
			worker.use(
				http.post('/service/admin/soap/ModifyDomainRequest', () => {
					modifyDomainCalled = true;
					return HttpResponse.json({ Body: { ModifyDomainResponse: { domain: [] } } });
				}),
			);

			await setupGlobalAdmin(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
			);

			await userEvent.fill(page.getByLabelText(/handle accounts/i), '10');
			await page.getByRole('button', { name: 'Link' }).click();
			await new Promise((resolve) => {
				setTimeout(resolve, 500);
			});

			expect(modifyDomainCalled).toBe(false);
		});

		it('shows an error snackbar when linking the COS fails', async () => {
			worker.use(
				http.post('/service/admin/soap/ModifyDomainRequest', () =>
					HttpResponse.json(
						{ Body: { Fault: { Reason: { Text: 'Link COS failed' } } } },
						{ status: 500 },
					),
				),
			);
			createBrowserSoapAPIInterceptor('GrantRight', {});

			await setupGlobalAdmin(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
			);

			await selectCosFromDropdown('Standard COS');
			await userEvent.fill(page.getByLabelText(/handle accounts/i), '10');
			await page.getByRole('button', { name: 'Link' }).click();

			await expect.element(page.getByText('Link COS failed')).toBeVisible();
		});
	});

	describe('Duplicate flow', () => {
		it('duplicates the selected COS and links the copy to the domain', async () => {
			const copyInterceptor = createBrowserSoapAPIInterceptor('CopyCos', {
				cos: [{ id: 'cos-copy-1' }],
			});
			const modifyInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
				domain: [],
			});
			createBrowserSoapAPIInterceptor('GrantRight', {});
			createBrowserSoapAPIInterceptor('FlushCache', {});
			createBrowserSoapAPIInterceptor('GetDomain', { domain: [] });

			await setupGlobalAdmin(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
			);

			await selectCosFromDropdown('Standard COS');
			await userEvent.fill(page.getByLabelText(/handle accounts/i), '10');
			await page.getByRole('button', { name: 'Duplicate' }).click();

			const copyParams = (await copyInterceptor) as {
				name?: { _content?: string };
				cos?: { _content?: string };
			};
			expect(copyParams.name?._content).toBe(`Standard COS.${DOMAIN_NAME}`);
			expect(copyParams.cos?._content).toBe('cos-1');

			const requestParams = (await modifyInterceptor) as {
				a?: Array<{ n: string; _content?: string }>;
			};
			expect(requestParams.a).toContainEqual({
				n: '+zimbraDomainCOSMaxAccounts',
				_content: 'cos-copy-1:10',
			});
		});

		it('does not call ModifyDomain when Duplicate is clicked without a selected COS', async () => {
			let modifyDomainCalled = false;
			worker.use(
				http.post('/service/admin/soap/ModifyDomainRequest', () => {
					modifyDomainCalled = true;
					return HttpResponse.json({ Body: { ModifyDomainResponse: { domain: [] } } });
				}),
			);
			let copyCosCalled = false;
			worker.use(
				http.post('/service/admin/soap/CopyCosRequest', () => {
					copyCosCalled = true;
					return HttpResponse.json({ Body: { CopyCosResponse: { cos: [] } } });
				}),
			);

			await setupGlobalAdmin(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
			);

			await page.getByRole('button', { name: 'Duplicate' }).click();
			await new Promise((resolve) => {
				setTimeout(resolve, 500);
			});

			expect(copyCosCalled).toBe(false);
			expect(modifyDomainCalled).toBe(false);
		});

		it('does not link anything when CopyCos fails', async () => {
			worker.use(
				http.post('/service/admin/soap/CopyCosRequest', () =>
					HttpResponse.json(
						{ Body: { Fault: { Reason: { Text: 'CopyCos failed' } } } },
						{ status: 500 },
					),
				),
			);
			let modifyDomainCalled = false;
			worker.use(
				http.post('/service/admin/soap/ModifyDomainRequest', () => {
					modifyDomainCalled = true;
					return HttpResponse.json({ Body: { ModifyDomainResponse: { domain: [] } } });
				}),
			);

			await setupGlobalAdmin(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
			);

			await selectCosFromDropdown('Standard COS');
			await userEvent.fill(page.getByLabelText(/handle accounts/i), '10');
			await page.getByRole('button', { name: 'Duplicate' }).click();
			await new Promise((resolve) => {
				setTimeout(resolve, 2000);
			});

			expect(modifyDomainCalled).toBe(false);
		});
	});

	describe('Handle accounts input', () => {
		it('clamps values below -1 to -1', async () => {
			await setupGlobalAdmin(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
			);

			const input = page.getByLabelText(/handle accounts/i);
			await userEvent.fill(input, '-5');

			await expect.element(input).toHaveValue(-1);
		});

		it('ignores keys that are not digits or editing keys', async () => {
			await setupGlobalAdmin(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
			);

			const input = page.getByLabelText(/handle accounts/i);
			await userEvent.type(input, '1x0');

			await expect.element(input).toHaveValue(10);
		});
	});
});
