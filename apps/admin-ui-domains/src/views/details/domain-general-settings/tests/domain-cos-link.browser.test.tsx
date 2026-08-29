/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { domainByIdKey } from '@zextras/ui-shared';
import { createBrowserSoapAPIInterceptor, getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

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
});
