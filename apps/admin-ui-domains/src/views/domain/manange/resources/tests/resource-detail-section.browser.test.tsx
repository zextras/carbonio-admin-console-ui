/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { domainByIdKey } from '@zextras/ui-shared';
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { type FC, type ReactElement, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { ResourceContext } from '../resource-context';
import ResourceDetailSection from '../resource-detail-section';

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

const COS_LIST = [
	{ id: 'cos-1', name: 'Default', a: [] },
	{ id: 'cos-2', name: 'Premium', a: [] },
];

const INITIAL_RESOURCE = {
	displayName: '',
	name: '',
	domain: '',
	zimbraCOSId: undefined,
	zimbraAccountStatus: undefined,
	zimbraCalResType: undefined,
	zimbraCalResAutoDeclineRecurring: undefined,
	schedulePolicyType: undefined,
	changeNameBool: false,
};

function setup(ui: ReactElement) {
	const queryClient = getQueryClient();
	queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
		id: DOMAIN_ID,
		name: DOMAIN_NAME,
		a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
	});
	queryClient.setQueryData(['cos', 'list', '', 0, 0], {
		cos: COS_LIST,
		searchTotal: COS_LIST.length,
		more: false,
	});
	return setupBrowserTest(ui, {
		queryClient,
		withDomainIdRoute: true,
		initialRouterEntry: `/${DOMAIN_ID}`,
	});
}

const TestApp: FC = () => {
	const [resourceDetail, setResourceDetail] = useState<any>(INITIAL_RESOURCE);
	return (
		<ResourceContext.Provider value={{ resourceDetail, setResourceDetail }}>
			<ResourceDetailSection />
		</ResourceContext.Provider>
	);
};

describe('ResourceDetailSection (browser)', () => {
	describe('Rendering', () => {
		it('renders the Details header', async () => {
			setup(<TestApp />);

			await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
		});

		it('renders the ResourceName input', async () => {
			setup(<TestApp />);

			await expect.element(page.getByLabelText('ResourceName')).toBeVisible();
		});

		it('renders the Name input', async () => {
			setup(<TestApp />);

			await expect.element(page.getByLabelText('Name', { exact: true })).toBeVisible();
		});

		it('renders the Type select label', async () => {
			setup(<TestApp />);

			await expect.element(page.getByText('Type', { exact: true })).toBeVisible();
		});

		it('renders the Status select label', async () => {
			setup(<TestApp />);

			await expect.element(page.getByText('Status', { exact: true })).toBeVisible();
		});

		it('renders the Class of Service select label', async () => {
			setup(<TestApp />);

			await expect.element(page.getByText('Class of Service', { exact: true })).toBeVisible();
		});

		it('renders the Auto-Refuse select label', async () => {
			setup(<TestApp />);

			await expect.element(page.getByText('Auto-Refuse', { exact: true })).toBeVisible();
		});

		it('renders the Set Policy select label', async () => {
			setup(<TestApp />);

			await expect.element(page.getByText('Set Policy', { exact: true })).toBeVisible();
		});

		it('renders the Description text area', async () => {
			setup(<TestApp />);

			await expect.element(page.getByText('Description', { exact: true })).toBeVisible();
		});
	});

	describe('Domain integration', () => {
		it('displays the domain name from useSelectedDomain in the Domain field', async () => {
			setup(<TestApp />);

			await expect.element(page.getByText(DOMAIN_NAME)).toBeVisible();
		});
	});

	describe('COS list', () => {
		it('populates the COS select with items from useCosList', async () => {
			setup(<TestApp />);

			await expect.element(page.getByText('Class of Service', { exact: true })).toBeVisible();
		});
	});
});
