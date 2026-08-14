/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { domainByIdKey } from '@zextras/ui-shared';
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { type FC, type ReactElement, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import CreateGalsyncAccountModel from '../create-galsync-account-model';

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';
const ACCOUNT_DATA = { id: 'acct-1', name: 'galsync', galAccount: null };

type SaveHandler = (
	accountData: { id?: string; name: string; galAccount?: null },
	galDomainName: string
) => void;

function setup(ui: ReactElement) {
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

const TestApp: FC<{
	saveHandler: SaveHandler;
	initialOpen?: boolean;
}> = ({ saveHandler, initialOpen = true }) => {
	const [open, setOpen] = useState(initialOpen);
	return (
		<>
			<button type="button" onClick={(): void => setOpen(true)}>
				Reopen
			</button>
			<CreateGalsyncAccountModel
				open={open}
				closeHandler={(): void => setOpen(false)}
				saveHandler={saveHandler}
				accountData={ACCOUNT_DATA}
			/>
		</>
	);
};

describe('CreateGalsyncAccountModel (browser)', () => {
	describe('Rendering', () => {
		it('shows the modal title, description, and action buttons when open', async () => {
			await setup(<TestApp saveHandler={vi.fn()} />);

			await expect.element(page.getByText('Create Account', { exact: true })).toBeVisible();
			await expect.element(
				page.getByText('Type the Account Name for the Global Address List (GAL)')
			).toBeVisible();
			await expect.element(page.getByRole('button', { name: /GO BACK/i })).toBeVisible();
			await expect
				.element(page.getByRole('button', { name: /CREATE ACCOUNT/i }))
				.toBeVisible();
		});

		it('shows the Account Name input', async () => {
			await setup(<TestApp saveHandler={vi.fn()} />);

			await expect.element(page.getByLabelText('Account Name')).toBeVisible();
		});

		it('displays the domain suffix derived from accountData and domain', async () => {
			await setup(<TestApp saveHandler={vi.fn()} />);

			await expect.element(page.getByText('.galsync@example.com')).toBeVisible();
		});

		it('does not render modal content when open is false', async () => {
			await setup(<TestApp saveHandler={vi.fn()} initialOpen={false} />);

			await expect.element(page.getByText('Create Account')).not.toBeInTheDocument();
		});
	});

	describe('Input', () => {
		it('updates the input value while typing', async () => {
			await setup(<TestApp saveHandler={vi.fn()} />);

			const input = page.getByLabelText('Account Name');
			await userEvent.type(input, 'new-gal');

			await expect.element(input).toHaveValue('new-gal');
		});
	});

	describe('GO BACK button', () => {
		it('closes the modal', async () => {
			await setup(<TestApp saveHandler={vi.fn()} />);

			await page.getByRole('button', { name: /GO BACK/i }).click();

			await expect.element(page.getByText('Create Account')).not.toBeInTheDocument();
		});

		it('clears the input so it is empty after reopening', async () => {
			await setup(<TestApp saveHandler={vi.fn()} />);

			const input = page.getByLabelText('Account Name');
			await userEvent.type(input, 'new-gal');
			await page.getByRole('button', { name: /GO BACK/i }).click();

			await page.getByRole('button', { name: /reopen/i }).click();

			await expect.element(page.getByLabelText('Account Name')).toHaveValue('');
		});
	});

	describe('CREATE ACCOUNT button', () => {
		it('calls saveHandler with accountData and the typed name', async () => {
			const saveHandler = vi.fn();
			await setup(<TestApp saveHandler={saveHandler} />);

			await userEvent.type(page.getByLabelText('Account Name'), 'new-gal');
			await page.getByRole('button', { name: /CREATE ACCOUNT/i }).click();

			expect(saveHandler).toHaveBeenCalledWith(ACCOUNT_DATA, 'new-gal');
		});

		it('clears the input after creating', async () => {
			await setup(<TestApp saveHandler={vi.fn()} />);

			const input = page.getByLabelText('Account Name');
			await userEvent.type(input, 'new-gal');
			await page.getByRole('button', { name: /CREATE ACCOUNT/i }).click();

			await expect.element(input).toHaveValue('');
		});
	});

	describe('Close icon', () => {
		it('closes the modal', async () => {
			await setup(<TestApp saveHandler={vi.fn()} />);

			await page.getByRole('button', { name: /^close$/i }).click();

			await expect.element(page.getByText('Create Account')).not.toBeInTheDocument();
		});

		it('clears the input so it is empty after reopening', async () => {
			await setup(<TestApp saveHandler={vi.fn()} />);

			const input = page.getByLabelText('Account Name');
			await userEvent.type(input, 'new-gal');
			await page.getByRole('button', { name: /^close$/i }).click();

			await page.getByRole('button', { name: /reopen/i }).click();

			await expect.element(page.getByLabelText('Account Name')).toHaveValue('');
		});
	});
});
