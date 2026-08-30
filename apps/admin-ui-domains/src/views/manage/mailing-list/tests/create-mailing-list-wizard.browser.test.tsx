/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import {
	createBrowserSoapAPIInterceptor,
	getQueryClient,
	setupBrowserTest as _setupBrowserTest,
	worker,
} from 'admin-ui-test-utils';
import { type DefaultBodyType, http, HttpResponse } from 'msw';
import { type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { domainQueryKeys } from '../../../../services/domain-query-keys';
import { DomainMailingList } from '../domain-mailing-list';

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

function setupWizardInterceptors(): {
	createList: Promise<any>;
	addMember: Promise<any>;
	grantAction: Promise<any>;
} {
	createBrowserSoapAPIInterceptor('SearchDirectory', {
		dl: [
			{
				name: 'team@example.com',
				id: 'dl-1',
				dynamic: false,
				a: [{ n: 'displayName', _content: 'Team List' }],
			},
		],
		searchTotal: 1,
		more: false,
	});
	createBrowserSoapAPIInterceptor('SearchGal', {
		cn: [{ id: 'gal-1', _attrs: { email: 'owner@example.com', type: 'account' } }],
	});
	const createList = createBrowserSoapAPIInterceptor('CreateDistributionList', {
		dl: [{ id: 'new-dl-1', name: 'announce@example.com' }],
	});
	const addMember = createBrowserSoapAPIInterceptor('AddDistributionListMember', {});
	const grantAction = createBrowserSoapAPIInterceptor('DistributionListAction', {});
	return { createList, addMember, grantAction };
}

async function setupWizardView(): Promise<void> {
	const queryClient = getQueryClient();
	queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
		id: DOMAIN_ID,
		name: DOMAIN_NAME,
		a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
	});
	queryClient.setQueryData(domainQueryKeys.list(), [{ name: DOMAIN_NAME, id: DOMAIN_ID, a: [] }]);
	const ui: ReactElement = <DomainMailingList />;
	await _setupBrowserTest(ui, {
		queryClient,
		withDomainIdRoute: true,
		initialRouterEntry: `/${DOMAIN_ID}`,
	});
}

async function openWizard(awaitText = 'team@example.com'): Promise<void> {
	await expect.element(page.getByText(awaitText)).toBeInTheDocument();
	await page.getByTestId('icon: Plus').click();
	await expect.element(page.getByText('New Distribution List', { exact: true })).toBeInTheDocument();
}

describe('CreateMailingList wizard (browser)', () => {
	it('walks all steps and creates a distribution list', async () => {
		const { createList, addMember, grantAction } = setupWizardInterceptors();
		await setupWizardView();
		await openWizard();

		/* Details step */
		await userEvent.type(page.getByLabelText('Display Name'), 'Announce List');
		await userEvent.type(page.getByLabelText('List Name'), 'announce');
		await page.getByRole('button', { name: 'NEXT', exact: true }).click();

		/* Members step: empty state, add, remove */
		await expect.element(page.getByText("There aren't members here.")).toBeInTheDocument();
		await userEvent.type(page.getByLabelText('Type an account ...'), 'reader@example.com');
		await page.getByRole('button', { name: 'Add', exact: true }).click();
		await expect.element(page.getByText('reader@example.com')).toBeInTheDocument();
		await page.getByText('reader@example.com').click();
		await page.getByRole('button', { name: 'Delete', exact: true }).click();
		await expect.element(page.getByText("There aren't members here.")).toBeInTheDocument();
		// re-add for the create request
		await userEvent.type(page.getByLabelText('Type an account ...'), 'reader@example.com');
		await page.getByRole('button', { name: 'Add', exact: true }).click();
		await page.getByRole('button', { name: 'NEXT', exact: true }).click();

		/* Settings step: owners + sending options */
		await expect.element(page.getByText('Main Settings')).toBeInTheDocument();
		await page.getByText('Hidden from GAL', { exact: false }).click();
		await userEvent.type(page.getByLabelText('Type an account ...'), 'owner@example.com');
		await new Promise((resolve) => setTimeout(resolve, 900));
		await page
			.getByRole('button', { name: 'Add', exact: true })
			.first()
			.click();
		await expect.element(page.getByText('owner@example.com')).toBeInTheDocument();
		await page.getByText('Everyone').click();
		await page.getByText('Only these users').click();
		await userEvent.type(
			page.getByLabelText('Type an account to add it to the sender for the list'),
			'sender@example.com',
		);
		await page.getByRole('button', { name: 'Add', exact: true }).last().click();
		await expect.element(page.getByText('sender@example.com')).toBeInTheDocument();
		await page.getByRole('button', { name: 'BACK', exact: true }).click();
		await expect.element(page.getByText('Members', { exact: true }).first()).toBeInTheDocument();
		await page.getByRole('button', { name: 'NEXT', exact: true }).click();
		await page.getByRole('button', { name: 'NEXT', exact: true }).click();

		/* Summary step */
		await expect.element(page.getByText('Announce List')).toBeInTheDocument();
		await expect.element(page.getByText('announce@example.com')).toBeInTheDocument();
		await expect.element(page.getByText('reader@example.com')).toBeInTheDocument();
		await expect.element(page.getByText('owner@example.com')).toBeInTheDocument();
		await expect.element(page.getByText('Only these users')).toBeInTheDocument();

		/* Create */
		await page.getByRole('button', { name: 'CREATE', exact: true }).click();
		const created = await createList;
		expect(created).toHaveProperty('name', 'announce@example.com');
		const memberParams = await addMember;
		expect(memberParams).toMatchObject({
			id: { n: 'id', _content: 'new-dl-1' },
			dlm: { n: 'dlm', _content: 'reader@example.com' },
		});
		const actionParams = await grantAction;
		expect(actionParams.action).toMatchObject({ op: 'addOwners' });
		await expect.element(page.getByText('The announce@example.com has been created successfully')).toBeInTheDocument();
		await expect.element(page.getByText('New Distribution List', { exact: true })).not.toBeInTheDocument();
	});

	it('shows an error snackbar when creation fails with an existing address', async () => {
		createBrowserSoapAPIInterceptor('SearchDirectory', { dl: [], searchTotal: 0, more: false });
		worker.use(
			http.post('/service/admin/soap/CreateDistributionListRequest', () =>
				HttpResponse.json(
					{
						Body: {
							Fault: { Reason: { Text: 'email address already exists: announce@example.com' } },
						},
					},
					{ status: 500 },
				),
			),
		);
		await setupWizardView();
		await openWizard('This list is empty.');
		await userEvent.type(page.getByLabelText('Display Name'), 'Announce List');
		await userEvent.type(page.getByLabelText('List Name'), 'announce');
		await page.getByRole('button', { name: 'NEXT', exact: true }).click();
		await page.getByRole('button', { name: 'NEXT', exact: true }).click();
		await page.getByRole('button', { name: 'NEXT', exact: true }).click();
		await page.getByRole('button', { name: 'CREATE', exact: true }).click();
		await expect.element(page.getByText('Email address announce@example.com already exists')).toBeInTheDocument();
	});
});

const LIST_DL = {
	name: 'team@example.com',
	id: 'dl-1',
	dynamic: false,
	a: [{ n: 'displayName', _content: 'Team List' }]
};

const LDAP_QUERY_SUFFIX = '??sub?(&(objectClass=inetOrgPerson)(mail=*@domain.tld))';

function interceptLdapMembersSearch(memberResponder: () => HttpResponse<DefaultBodyType>): void {
	worker.use(
		http.post('/service/admin/soap/SearchDirectoryRequest', async ({ request }) => {
			const body = (await request.json()) as {
				Body?: { SearchDirectoryRequest?: { query?: string } };
			};
			const query = body?.Body?.SearchDirectoryRequest?.query ?? '';
			if (query.includes('objectClass')) {
				return memberResponder();
			}
			return HttpResponse.json({
				Body: { SearchDirectoryResponse: { dl: [LIST_DL], searchTotal: 1, more: false } },
			});
		}),
	);
}

async function setupListView(userAttrs: Record<string, string> = {}): Promise<void> {
	const queryClient = getQueryClient();
	queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
		id: DOMAIN_ID,
		name: DOMAIN_NAME,
		a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
	});
	queryClient.setQueryData(domainQueryKeys.list(), [{ name: DOMAIN_NAME, id: DOMAIN_ID, a: [] }]);
	queryClient.setQueryDefaults(['account', 'settings'], { gcTime: Infinity });
	queryClient.setQueryData(['account', 'settings'], { prefs: {}, attrs: userAttrs, props: [] });
	const ui: ReactElement = <DomainMailingList />;
	await _setupBrowserTest(ui, {
		queryClient,
		withDomainIdRoute: true,
		initialRouterEntry: `/${DOMAIN_ID}`,
	});
}

async function enableDynamicModeAndLoadMembers(): Promise<void> {
	await page.getByText('Dynamic Mode', { exact: true }).click();
	await expect.element(page.getByLabelText("Distribution List's URL")).toBeInTheDocument();
	await userEvent.type(page.getByLabelText("Distribution List's URL"), LDAP_QUERY_SUFFIX);
	await page.getByTestId('icon: CheckmarkOutline').click();
}

describe('CreateMailingList wizard list section (browser)', () => {
	it('enables dynamic mode, loads the ldap members and filters them', async () => {
		interceptLdapMembersSearch(() =>
			HttpResponse.json({
				Body: {
					SearchDirectoryResponse: {
						dl: [{ id: 'm-dl', name: 'board@example.com' }],
						account: [
							{ id: 'm-acc-1', name: 'user1@example.com' },
							{ id: 'm-acc-2', name: 'user2@example.com' }
						],
						alias: [{ id: 'm-alias', name: 'alias@example.com' }],
						calresource: [{ id: 'm-res', name: 'room@example.com' }]
					}
				}
			})
		);
		await setupListView();
		await openWizard();
		await enableDynamicModeAndLoadMembers();

		await expect.element(page.getByText('board@example.com')).toBeInTheDocument();
		await expect.element(page.getByText('user1@example.com')).toBeInTheDocument();
		await expect.element(page.getByText('user2@example.com')).toBeInTheDocument();
		await expect.element(page.getByText('alias@example.com')).toBeInTheDocument();
		await expect.element(page.getByText('room@example.com')).toBeInTheDocument();

		await userEvent.type(page.getByLabelText('Filter Address'), 'user1');
		await expect.element(page.getByText('user1@example.com')).toBeInTheDocument();
		await expect.element(page.getByText('user2@example.com')).not.toBeInTheDocument();
		await expect.element(page.getByText('board@example.com')).not.toBeInTheDocument();
	});

	it('shows the not-valid message when the ldap member search returns a fault', async () => {
		interceptLdapMembersSearch(() =>
			HttpResponse.json({
				Body: {
					SearchDirectoryResponse: { Body: { Fault: { Reason: { Text: 'bad query' } } } }
				}
			})
		);
		await setupListView();
		await openWizard();
		await enableDynamicModeAndLoadMembers();

		await expect.element(page.getByText('Query is not valid')).toBeInTheDocument();
	});

	it('shows an error snackbar when loading the ldap members fails', async () => {
		interceptLdapMembersSearch(() =>
			HttpResponse.json(
				{ Body: { Fault: { Reason: { Text: 'Load failed' } } } },
				{ status: 500 }
			)
		);
		await setupListView();
		await openWizard();
		await enableDynamicModeAndLoadMembers();

		await expect.element(page.getByText('Load failed')).toBeInTheDocument();
	});

	it('hides the dynamic mode switch for delegated admins', async () => {
		interceptLdapMembersSearch(() =>
			HttpResponse.json({
				Body: { SearchDirectoryResponse: { dl: [LIST_DL], searchTotal: 1, more: false } }
			})
		);
		await setupListView({ zimbraIsDelegatedAdminAccount: 'TRUE' });
		await openWizard();

		await expect
			.element(page.getByText('Dynamic Mode', { exact: true }))
			.not.toBeInTheDocument();
	});
});
