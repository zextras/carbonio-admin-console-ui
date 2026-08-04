/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { domainByIdKey } from '@zextras/ui-shared';
import {
	createBrowserSoapAPIInterceptor,
	getQueryClient,
	setupBrowserTest
} from 'admin-ui-test-utils';
import { type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import DomainCosLink from '../domain-cos-link';

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

type SetupOptions = {
	isGlobalAdmin?: boolean;
};

function setup(ui: ReactElement, options: SetupOptions = {}) {
	const { isGlobalAdmin = false } = options;
	createBrowserSoapAPIInterceptor('SearchDirectory', {
		cos: [
			{ id: 'cos-1', name: 'Default COS', a: [] },
			{ id: 'cos-2', name: 'Premium COS', a: [] }
		],
		searchTotal: 2,
		more: false
	});
	const queryClient = getQueryClient();
	queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
		id: DOMAIN_ID,
		name: DOMAIN_NAME,
		a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }]
	});
	queryClient.setQueryData(['account', 'settings'], {
		prefs: {},
		attrs: { zimbraIsAdminAccount: isGlobalAdmin ? 'TRUE' : 'FALSE' },
		props: []
	});
	return setupBrowserTest(ui, {
		queryClient,
		withDomainIdRoute: true,
		initialRouterEntry: `/${DOMAIN_ID}`
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

			await expect.element(page.getByText('Default COS')).toBeVisible();
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
					cosMaxAccountList={[{ id: 'cos-1', name: 'Default', value: '10' }]}
					defaultCosId="cos-1"
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>
			);

			await expect.element(page.getByText('Default COS', { exact: true })).toBeVisible();
		});
	});

	describe('Global Admin controls', () => {
		it('shows dropdown, input and buttons when user is global admin', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
				{ isGlobalAdmin: true }
			);

			await expect
				.element(page.getByText('Select a COS to include in this domain'))
				.toBeVisible();
			await expect.element(page.getByText('Handle Accounts (-1 if unlimited)')).toBeVisible();
			await expect.element(page.getByRole('button', { name: /duplicate/i })).toBeVisible();
			await expect.element(page.getByRole('button', { name: /link/i })).toBeVisible();
		});

		it('hides dropdown, input and buttons when user is not global admin', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
				{ isGlobalAdmin: false }
			);

			await expect.element(page.getByText('Class of Service (cos)')).toBeVisible();
			await expect
				.element(page.getByText('Select a COS to include in this domain'))
				.not.toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: /duplicate/i }))
				.not.toBeInTheDocument();
			await expect.element(page.getByRole('button', { name: /link/i })).not.toBeInTheDocument();
		});
	});

	describe('Link action', () => {
		it('does not call modifyDomain when COS or max account is empty', async () => {
			let apiCalled = false;
			createBrowserSoapAPIInterceptor('ModifyDomain', {}).then(() => {
				apiCalled = true;
			});
			setup(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
				{ isGlobalAdmin: true }
			);

			await expect.element(page.getByText('Class of Service (cos)')).toBeVisible();

			// Click Link without selecting COS or filling max accounts
			await page.getByRole('button', { name: /link/i }).click();

			// Wait a bit to ensure API was not called
			await new Promise((resolve) => setTimeout(resolve, 500));
			expect(apiCalled).toBe(false);
		});

		it('renders Link and Duplicate buttons for global admin', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
				{ isGlobalAdmin: true }
			);

			await expect.element(page.getByRole('button', { name: /link/i })).toBeVisible();
			await expect.element(page.getByRole('button', { name: /duplicate/i })).toBeVisible();
		});
	});

	describe('Duplicate action', () => {
		it('does not call copyCos when COS or max account is empty', async () => {
			let apiCalled = false;
			createBrowserSoapAPIInterceptor('CopyCos', {}).then(() => {
				apiCalled = true;
			});
			setup(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
				{ isGlobalAdmin: true }
			);

			await expect.element(page.getByText('Class of Service (cos)')).toBeVisible();
			await page.getByRole('button', { name: /duplicate/i }).click();

			await new Promise((resolve) => setTimeout(resolve, 500));
			expect(apiCalled).toBe(false);
		});
	});

	describe('Table rendering', () => {
		it('renders multiple COS rows correctly', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[
						{ id: 'cos-1', name: 'COS One', value: '10' },
						{ id: 'cos-2', name: 'COS Two', value: '20' },
						{ id: 'cos-3', name: 'COS Three', value: '30' }
					]}
					defaultCosId="cos-1"
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>
			);

			await expect.element(page.getByText('10')).toBeVisible();
			await expect.element(page.getByText('20')).toBeVisible();
			await expect.element(page.getByText('30')).toBeVisible();
		});

		it('shows Default COS badge with star icon for default COS', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[{ id: 'cos-1', name: 'Default COS', value: '10' }]}
					defaultCosId="cos-1"
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>
			);

			await expect.element(page.getByText('Default COS', { exact: true })).toBeVisible();
			// ds-icon is a custom element, check via querySelector
			const starIcon = document.querySelector('ds-icon[icon="Star"]');
			expect(starIcon).not.toBeNull();
		});

		it('does not show Default COS badge for non-default COS', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[{ id: 'cos-2', name: 'Premium COS', value: '50' }]}
					defaultCosId="cos-1"
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>
			);

			await expect.element(page.getByText('Premium COS')).toBeVisible();
			await expect.element(page.getByText('Default COS', { exact: true })).not.toBeInTheDocument();
		});
	});

	describe('Non-global admin rendering', () => {
		it('does not show checkbox column for non-global admin', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[{ id: 'cos-1', name: 'Default COS', value: '10' }]}
					defaultCosId="cos-1"
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
				{ isGlobalAdmin: false }
			);

			await expect.element(page.getByText('Default COS')).toBeVisible();
			// Checkbox not visible for non-admin
			const checkboxes = page.getByRole('checkbox');
			await expect.element(checkboxes).not.toBeInTheDocument();
		});

		it('shows only table content without admin controls', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[
						{ id: 'cos-1', name: 'Default COS', value: '10' },
						{ id: 'cos-2', name: 'Premium COS', value: '50' }
					]}
					defaultCosId="cos-1"
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
				{ isGlobalAdmin: false }
			);

			// Table data visible
			await expect.element(page.getByText('Default COS')).toBeVisible();
			await expect.element(page.getByText('Premium COS')).toBeVisible();
			// Admin controls hidden
			await expect
				.element(page.getByRole('button', { name: /link/i }))
				.not.toBeInTheDocument();
		});
	});

	describe('Input field interactions', () => {
		it('renders max account input field for global admin', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
				{ isGlobalAdmin: true }
			);

			await expect.element(page.getByText('Handle Accounts (-1 if unlimited)')).toBeVisible();
		});

		it('renders COS selection dropdown for global admin', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
				{ isGlobalAdmin: true }
			);

			await expect
				.element(page.getByText('Select a COS to include in this domain'))
				.toBeVisible();
		});

		it('updates max account input value when typing', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
				{ isGlobalAdmin: true }
			);

			await expect.element(page.getByText('Class of Service (cos)')).toBeVisible();

			const input = page.getByLabelText('Handle Accounts (-1 if unlimited)');
			await userEvent.type(input, '100');

			// Number input returns numeric value
			await expect.element(input).toHaveValue(100);
		});

		it('allows negative numbers in max account input', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
				{ isGlobalAdmin: true }
			);

			await expect.element(page.getByText('Class of Service (cos)')).toBeVisible();

			const input = page.getByLabelText('Handle Accounts (-1 if unlimited)');
			await userEvent.type(input, '-1');

			await expect.element(input).toHaveValue(-1);
		});

		it('updates COS search input when typing', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
				{ isGlobalAdmin: true }
			);

			await expect.element(page.getByText('Class of Service (cos)')).toBeVisible();

			const input = page.getByLabelText('Select a COS to include in this domain');
			await userEvent.type(input, 'Test COS');

			await expect.element(input).toHaveValue('Test COS');
		});
	});

	describe('Table headers', () => {
		it('renders all table headers', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>
			);

			await expect.element(page.getByText('Cos List', { exact: true })).toBeVisible();
			await expect
				.element(page.getByText('How many accounts are handled? (-1 if unlimited)'))
				.toBeVisible();
		});
	});

	describe('Dropdown', () => {
		it('renders dropdown arrow icon in initial collapsed state', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[]}
					defaultCosId=""
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>,
				{ isGlobalAdmin: true }
			);

			await expect.element(page.getByText('Class of Service (cos)')).toBeVisible();

			// Check initial state - dropdown collapsed (ArrowIosDownwardOutline)
			const downArrow = document.querySelector('ds-icon[icon="ArrowIosDownwardOutline"]');
			expect(downArrow).not.toBeNull();
		});
	});

	describe('Row values rendering', () => {
		it('renders max account value in table row', async () => {
			setup(
				<DomainCosLink
					cosMaxAccountList={[{ id: 'cos-1', name: 'Test COS', value: '999' }]}
					defaultCosId="cos-1"
					domainId={DOMAIN_ID}
					domainName={DOMAIN_NAME}
				/>
			);

			// Value should be visible
			await expect.element(page.getByText('999')).toBeVisible();
		});
	});
});
