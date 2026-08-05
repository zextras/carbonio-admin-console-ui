/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import {
	createBrowserAPIInterceptor,
	createBrowserSoapAPIInterceptor,
	getQueryClient,
	setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import DomainSaml from '../domain-saml';

const DOMAIN_ID = 'test-domain-id-saml';
const DOMAIN_NAME = 'example.com';

type DomainAttribute = { n: string; _content: string };

function buildDomainAttributes(overrides: Array<DomainAttribute> = []): Array<DomainAttribute> {
	const defaults: Array<DomainAttribute> = [
		{ n: 'zimbraDomainName', _content: DOMAIN_NAME },
		{ n: 'zimbraId', _content: DOMAIN_ID },
		{ n: 'zimbraDomainStatus', _content: 'active' },
		{ n: 'zimbraPublicServiceProtocol', _content: 'https' },
		{ n: 'zimbraPublicServiceHostname', _content: 'mail.example.com' },
		{ n: 'zimbraPublicServicePort', _content: '443' },
	];
	const overrideKeys = new Set(overrides.map((o) => o.n));
	const filtered = defaults.filter((d) => !overrideKeys.has(d.n));
	return [...filtered, ...overrides];
}

function setupSamlDomain(
	samlResponse: Record<string, string> = { samlKey: 'samlValue' },
): ReturnType<typeof getQueryClient> {
	const domainAttributes = buildDomainAttributes();
	createBrowserSoapAPIInterceptor('GetDomain', {
		domain: [
			{
				name: DOMAIN_NAME,
				id: DOMAIN_ID,
				a: domainAttributes,
			},
		],
	});
	createBrowserAPIInterceptor(
		'get',
		`/service/extension/zextras_admin/auth/saml/${DOMAIN_NAME}`,
		() => HttpResponse.json(samlResponse),
	);
	const queryClient = getQueryClient();
	queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
		id: DOMAIN_ID,
		name: DOMAIN_NAME,
		a: domainAttributes,
	});
	return queryClient;
}

async function renderDomainSaml(queryClient: ReturnType<typeof getQueryClient>): Promise<void> {
	await setupBrowserTest(<DomainSaml />, {
		queryClient,
		initialRouterEntry: `/${DOMAIN_ID}/saml`,
		withDomainIdRoute: true,
	});
	await expect.element(page.getByText('samlKey')).toBeVisible();
}

describe('DomainSaml', () => {
	let queryClient: ReturnType<typeof getQueryClient>;

	beforeEach(() => {
		queryClient = setupSamlDomain();
	});

	describe('Rendering', () => {
		it('should render the SAML header with the domain name', async () => {
			await renderDomainSaml(queryClient);

			await expect.element(page.getByText(`SAML @${DOMAIN_NAME}`)).toBeVisible();
		});

		it('should render the Configuration section and fields', async () => {
			await renderDomainSaml(queryClient);

			await expect.element(page.getByText('Configuration', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Allow Unsecure')).toBeVisible();
			await expect.element(page.getByText('Import the SAML Metadata from the IDP')).toBeVisible();
		});

		it('should render the info banner with EntityID and ServiceURL buttons', async () => {
			await renderDomainSaml(queryClient);

			await expect
				.element(
					page.getByText(
						'Go to your IDP to configure your SAML and copy the EntityID and ServiceURL values',
					),
				)
				.toBeVisible();
			await expect.element(page.getByRole('button', { name: /entity id/i })).toBeVisible();
			await expect.element(page.getByRole('button', { name: /serviceurl/i })).toBeVisible();
		});

		it('should render SAML attributes in the table', async () => {
			await renderDomainSaml(queryClient);

			await expect.element(page.getByText('samlKey')).toBeVisible();
			await expect.element(page.getByText('samlValue')).toBeVisible();
		});

		it('should render action buttons', async () => {
			await renderDomainSaml(queryClient);

			await expect
				.element(page.getByRole('button', { name: /generate sp certificate/i }))
				.toBeVisible();
			await expect
				.element(page.getByRole('button', { name: /export configuration/i }))
				.toBeVisible();
			await expect
				.element(page.getByRole('button', { name: /delete configuration/i }))
				.toBeVisible();
			await expect.element(page.getByRole('button', { name: /^add$/i })).toBeVisible();
			await expect.element(page.getByRole('button', { name: /update/i })).toBeVisible();
			await expect.element(page.getByRole('button', { name: /remove/i })).toBeVisible();
		});
	});

	describe('Info banner', () => {
		it('should render the info banner initially', async () => {
			await renderDomainSaml(queryClient);

			await expect
				.element(
					page.getByText(
						'Go to your IDP to configure your SAML and copy the EntityID and ServiceURL values',
					),
				)
				.toBeVisible();
		});
	});

	describe('Export configuration', () => {
		it('should show success snackbar when EXPORT CONFIGURATION is clicked', async () => {
			await renderDomainSaml(queryClient);

			await page.getByRole('button', { name: /export configuration/i }).click();

			await expect.element(page.getByText('You have exported the configuration')).toBeVisible();
		});
	});

	describe('Generate certificate', () => {
		it('should show success snackbar when GENERATE SP CERTIFICATE is clicked', async () => {
			createBrowserAPIInterceptor(
				'post',
				`/service/extension/zextras_admin/auth/saml-generate/${DOMAIN_NAME}`,
				() => HttpResponse.json({ cert: 'generated' }),
			);
			await renderDomainSaml(queryClient);

			await page.getByRole('button', { name: /generate sp certificate/i }).click();

			await expect.element(page.getByText('You have generated the SP Certificate')).toBeVisible();
		});
	});

	describe('Delete configuration', () => {
		it('should show success snackbar when DELETE CONFIGURATION is clicked', async () => {
			createBrowserAPIInterceptor(
				'delete',
				`/service/extension/zextras_admin/auth/saml/${DOMAIN_NAME}`,
				() => HttpResponse.json({}),
			);
			await renderDomainSaml(queryClient);

			await page.getByRole('button', { name: /delete configuration/i }).click();

			await expect.element(page.getByText('You have deleted the configuration')).toBeVisible();
		});
	});

	describe('Import configuration', () => {
		it('should have IMPORT button disabled when metadata URL is empty', async () => {
			await renderDomainSaml(queryClient);

			const importButton = page.getByRole('button', { name: /^import$/i });
			await expect.element(importButton).toBeDisabled();
		});

		it('should enable IMPORT button when metadata URL is entered', async () => {
			await renderDomainSaml(queryClient);

			const input = page.getByRole('textbox', { name: /import the saml metadata/i });
			await input.fill('https://idp.example.com/metadata');

			const importButton = page.getByRole('button', { name: /^import$/i });
			await expect.element(importButton).toBeEnabled();
		});
	});

	describe('Attribute selection', () => {
		it('should populate input fields when clicking on an attribute row', async () => {
			await renderDomainSaml(queryClient);

			await page.getByText('samlKey').click();

			const keyInput = page.getByRole('textbox', { name: /select an attribute/i });
			await expect.element(keyInput).toHaveValue('samlKey');

			const valueInput = page.getByRole('textbox', { name: /attribute value/i });
			await expect.element(valueInput).toHaveValue('samlValue');
		});
	});

	describe('Attribute operations', () => {
		it('should render ADD/UPDATE/REMOVE buttons', async () => {
			await renderDomainSaml(queryClient);

			await expect.element(page.getByRole('button', { name: /^add$/i })).toBeVisible();
			await expect.element(page.getByRole('button', { name: /update/i })).toBeVisible();
			await expect.element(page.getByRole('button', { name: /remove/i })).toBeVisible();
		});
	});

	describe('Loading state', () => {
		it('should show shimmer when domain is loading', async () => {
			const emptyQueryClient = getQueryClient();
			createBrowserSoapAPIInterceptor('GetDomain', {
				domain: [],
			});

			await setupBrowserTest(<DomainSaml />, {
				queryClient: emptyQueryClient,
				initialRouterEntry: `/${DOMAIN_ID}/saml`,
				withDomainIdRoute: true,
			});

			await expect.element(page.getByText(`SAML @`)).toBeVisible();
		});
	});

	describe('Empty state', () => {
		it('should show empty state message when no attributes exist', async () => {
			const emptyQueryClient = setupSamlDomain({});
			createBrowserAPIInterceptor(
				'get',
				`/service/extension/zextras_admin/auth/saml/${DOMAIN_NAME}`,
				() => HttpResponse.json({}),
			);

			await setupBrowserTest(<DomainSaml />, {
				queryClient: emptyQueryClient,
				initialRouterEntry: `/${DOMAIN_ID}/saml`,
				withDomainIdRoute: true,
			});

			await expect
				.element(
					page.getByText('Please import some SAML Metadata in the field above to see its attributes'),
				)
				.toBeVisible();
		});
	});
});
