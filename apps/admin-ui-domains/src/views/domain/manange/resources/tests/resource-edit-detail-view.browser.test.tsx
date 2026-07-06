/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import ResourceEditDetailView from '../resource-edit-detail-view';

vi.mock('../send-invite-accounts', () => ({
	SendInviteAccounts: (): ReactElement => (
		<div data-testid="mock-send-invite">Send Invite Mock</div>
	),
}));

vi.mock('../../../../../services/get-cal-resource-service', () => ({
	getCalenderResource: vi.fn(() =>
		Promise.resolve({
			calresource: [
				{
					id: RESOURCE_ID,
					name: RESOURCE_NAME,
					a: RESOURCE_ATTRIBUTES,
				},
			],
		}),
	),
}));

const RESOURCE_ID = 'resource-1';
const RESOURCE_NAME = 'room1@example.com';

const COS_LIST = [
	{ id: 'cos-1', name: 'Default', a: [] },
	{ id: 'cos-2', name: 'Premium', a: [] },
];

const RESOURCE_ATTRIBUTES = [
	{ n: 'displayName', _content: 'Conference Room' },
	{ n: 'mail', _content: RESOURCE_NAME },
	{ n: 'zimbraCalResType', _content: 'Location' },
	{ n: 'zimbraAccountStatus', _content: 'active' },
	{ n: 'zimbraCalResAutoDeclineRecurring', _content: 'FALSE' },
	{ n: 'zimbraCalResAutoAcceptDecline', _content: 'TRUE' },
	{ n: 'zimbraCalResAutoDeclineIfBusy', _content: 'TRUE' },
	{ n: 'zimbraCOSId', _content: 'cos-1' },
	{ n: 'zimbraMailHost', _content: 'mail.example.com' },
	{ n: 'zimbraCreateTimestamp', _content: '20240101120000.000Z' },
];

function setup(ui: ReactElement) {
	const queryClient = getQueryClient();
	queryClient.setQueryData(['cos', 'list', '', 0, 0], {
		cos: COS_LIST,
		searchTotal: COS_LIST.length,
		more: false,
	});
	return setupBrowserTest(ui, { queryClient });
}

describe('ResourceEditDetailView (browser)', () => {
	describe('Rendering', () => {
		it('renders the resource name in the header', async () => {
			setup(
				<ResourceEditDetailView
					selectedResourceList={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
					setShowResourceEditDetailView={vi.fn()}
					setIsUpdateRecord={vi.fn()}
				/>,
			);

			await expect.element(page.getByText(RESOURCE_NAME)).toBeVisible();
		});

		it('renders the Resource section header', async () => {
			setup(
				<ResourceEditDetailView
					selectedResourceList={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
					setShowResourceEditDetailView={vi.fn()}
					setIsUpdateRecord={vi.fn()}
				/>,
			);

			await expect
				.element(page.getByText('Resource', { exact: true }))
				.toBeVisible();
		});

		it('renders the Name input after data loads', async () => {
			setup(
				<ResourceEditDetailView
					selectedResourceList={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
					setShowResourceEditDetailView={vi.fn()}
					setIsUpdateRecord={vi.fn()}
				/>,
			);

			await expect
				.element(page.getByLabelText('Name', { exact: true }))
				.toBeVisible();
		});

		it('renders the Email input after data loads', async () => {
			setup(
				<ResourceEditDetailView
					selectedResourceList={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
					setShowResourceEditDetailView={vi.fn()}
					setIsUpdateRecord={vi.fn()}
				/>,
			);

			await expect.element(page.getByLabelText('Email')).toBeVisible();
		});

		it('renders the close (X) button to exit the edit view', async () => {
			setup(
				<ResourceEditDetailView
					selectedResourceList={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
					setShowResourceEditDetailView={vi.fn()}
					setIsUpdateRecord={vi.fn()}
				/>,
			);

			await expect
				.element(page.getByTestId('icon: CloseOutline'))
				.toBeVisible();
		});
	});

	describe('Close action', () => {
		it('calls setShowResourceEditDetailView(false) when close button is clicked', async () => {
			const setShowResourceEditDetailView = vi.fn();
			setup(
				<ResourceEditDetailView
					selectedResourceList={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
					setShowResourceEditDetailView={setShowResourceEditDetailView}
					setIsUpdateRecord={vi.fn()}
				/>,
			);

			await page.getByTestId('icon: CloseOutline').click();

			expect(setShowResourceEditDetailView).toHaveBeenCalledWith(false);
		});
	});

	describe('Delete modal', () => {
		it('opens the delete modal when the delete button is clicked', async () => {
			setup(
				<ResourceEditDetailView
					selectedResourceList={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
					setShowResourceEditDetailView={vi.fn()}
					setIsUpdateRecord={vi.fn()}
				/>,
			);

			await page.getByRole('button', { name: /delete/i }).click();

			await expect
				.element(
					page.getByText(`You are deleting ${RESOURCE_NAME}`, { exact: false }),
				)
				.toBeVisible();
			await expect
				.element(page.getByRole('button', { name: /delete it instead/i }))
				.toBeVisible();
			await expect
				.element(page.getByRole('button', { name: /close the resource/i }))
				.toBeVisible();
		});
	});
});
