/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import {
	MANAGE_NO_SEND,
	READ_MAILS_ONLY,
	SEND_MAILS_ONLY,
	SEND_READ_MANAGE_MAILS,
} from '../../../constants';
import DelegateAddSection from '../add-delegate-section/delegate-add-section';
import DelegateSetRightsSection from '../add-delegate-section/delegate-setright-section';
import { AccountFormTestProvider } from './account-form-test-provider';

const VALUES = {
	zimbraId: 'self-id',
	name: 'jane@example.com',
	zimbraMailDeliveryAddress: 'jane@example.com',
};

function setupSection(ui: ReactElement, contextOverrides: Record<string, unknown> = {}): void {
	const queryClient = getQueryClient();
	queryClient.setQueryData(['advanced-supported'], { supported: true });

	setupBrowserTest(
		<AccountFormTestProvider values={VALUES} contextOverrides={contextOverrides}>
			{ui}
		</AccountFormTestProvider>,
		{ queryClient },
	);
}

function selectRights(rightsLabel: string): Promise<void> {
	return page.getByText('What rights will the delegate have?').click().then(() =>
		page.getByText(rightsLabel).click(),
	);
}

describe('DelegateSetRightsSection (browser)', () => {
	it('shows only the rights select when no rights are chosen yet', async () => {
		setupSection(<DelegateSetRightsSection />);

		await expect.element(page.getByText('Delegate`s rights')).toBeVisible();
		await expect.element(page.getByText('What rights will the delegate have?')).toBeVisible();
		await expect.element(page.getByText('Sending Options')).not.toBeInTheDocument();
		await expect
			.element(page.getByText(/select which folders the delegate can view/i))
			.not.toBeInTheDocument();
	});

	it('changing the rights to send-only reveals the sending options radios', async () => {
		setupSection(<DelegateSetRightsSection />);

		await selectRights('Send Mails only (no rights to read folders)');

		await expect.element(page.getByText('Sending Options')).toBeVisible();
		await expect
			.element(page.getByRole('radio', { name: /send as \(recipients will display/i }))
			.toBeVisible();
		await expect
			.element(page.getByRole('radio', { name: /recipients will see the sender/i }))
			.toBeVisible();
		await expect
			.element(page.getByText(/select which folders the delegate can view/i))
			.not.toBeInTheDocument();
	});

	it('read-only rights reveal the folder section and keep the sending options hidden', async () => {
		setupSection(<DelegateSetRightsSection />);

		await selectRights('Read Mails only (no rights to send mails)');

		await expect
			.element(page.getByText(/select which folders the delegate can view/i))
			.toBeVisible();
		await expect.element(page.getByText('Sending Options')).not.toBeInTheDocument();
	});

	it('manage rights reveal both the sending options and the folder section', async () => {
		setupSection(<DelegateSetRightsSection />);

		await selectRights('Send, Read and Manage Mails (all of the above)');

		await expect.element(page.getByText('Sending Options')).toBeVisible();
		await expect
			.element(page.getByText(/select which folders the delegate can view/i))
			.toBeVisible();
	});

	it('marks the stored sending option as the checked radio', async () => {
		setupSection(<DelegateSetRightsSection />, {
			deligateDetail: {
				delegeteRights: SEND_MAILS_ONLY,
				right: [{ _content: 'sendAs' }],
			},
		});

		await expect
			.element(page.getByRole('radio', { name: /send as \(recipients will display/i }))
			.toBeChecked();
		await expect
			.element(page.getByRole('radio', { name: /recipients will see the sender/i }))
			.not.toBeChecked();

		await page.getByRole('radio', { name: /recipients will see the sender/i }).click();
		await expect
			.element(page.getByRole('radio', { name: /recipients will see the sender/i }))
			.toBeVisible();
	});

	it('checks the all-folders radio when folders were granted on all folders', async () => {
		setupSection(<DelegateSetRightsSection />, {
			deligateDetail: {
				delegeteRights: READ_MAILS_ONLY,
				folderSelection: 'all_folders',
			},
		});

		await expect.element(page.getByRole('radio', { name: /^all folders/i })).toBeChecked();
		await expect.element(page.getByText('Inbox')).not.toBeInTheDocument();
	});

	it('lists the selectable folders excluding the root folder', async () => {
		setupSection(<DelegateSetRightsSection />, {
			deligateDetail: {
				delegeteRights: MANAGE_NO_SEND,
				folderSelection: 'i_want_to_select',
			},
			folderList: [
				{ id: '1', name: 'USER_ROOT', selected: false },
				{ id: '10', name: 'Inbox', selected: false },
				{ id: '11', name: 'Drafts', selected: true },
			],
		});

		await expect.element(page.getByText('Inbox')).toBeVisible();
		await expect.element(page.getByText('Drafts')).toBeVisible();
		await expect.element(page.getByText('USER_ROOT')).not.toBeInTheDocument();

		await page.getByText('Inbox').click();
		await expect.element(page.getByText('Inbox')).toBeVisible();
	});
});

describe('DelegateAddSection (browser)', () => {
	it('summarizes a send-as delegate with its derived rights label and sending option', async () => {
		setupSection(<DelegateAddSection />, {
			deligateDetail: {
				grantee: [{ name: 'partner@example.com', type: 'usr' }],
				right: [{ _content: 'sendAs' }],
				delegeteRights: SEND_READ_MANAGE_MAILS,
			},
		});

		await expect
			.element(page.getByText(/will be able to send mails as jane@example.com/i))
			.toBeVisible();
		await expect
			.element(page.getByText('Send, Read and Manage Mails (all of the above)'))
			.toBeVisible();
		await expect.element(page.getByText('Sending Options')).toBeVisible();
		await expect
			.element(page.getByText(/send as \(recipients will display this sender email jane@example.com/i))
			.toBeVisible();
	});

	it('summarizes a send-on-behalf delegate', async () => {
		setupSection(<DelegateAddSection />, {
			deligateDetail: {
				grantee: [{ name: 'partner@example.com', type: 'usr' }],
				right: [{ _content: 'sendOnBehalfOf' }],
				delegeteRights: SEND_MAILS_ONLY,
			},
		});

		await expect
			.element(page.getByText(/will be able to send mails on behalf of jane@example.com/i))
			.toBeVisible();
		await expect
			.element(page.getByText('Send Mails only (no rights to read folders)'))
			.toBeVisible();
		await expect
			.element(
				page.getByText(/send on behalf of \(recipients will display this sender email jane@example.com/i),
			)
			.toBeVisible();
	});

	it('hides the sending options for read-only delegates', async () => {
		setupSection(<DelegateAddSection />, {
			deligateDetail: {
				grantee: [{ name: 'reader@example.com', type: 'usr' }],
				delegeteRights: READ_MAILS_ONLY,
			},
		});

		await expect
			.element(page.getByText(/will be able to send mails on behalf of jane@example.com/i))
			.toBeVisible();
		await expect.element(page.getByText('Read Mails only (no rights to send mails)')).toBeVisible();
		await expect.element(page.getByText('Sending Options')).not.toBeInTheDocument();
	});
});
