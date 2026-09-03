/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createBrowserSoapAPIInterceptor, setupBrowserTest, worker } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { SendInviteAccounts } from '../send-invite-accounts';

type InviteItem = { id: string; n: string; _content: string };

const INITIAL_INVITES: Array<InviteItem> = [
  { id: '1', n: 'zimbraPrefCalendarForwardInvitesTo', _content: 'alice@example.com' },
  { id: '2', n: 'zimbraPrefCalendarForwardInvitesTo', _content: 'bob@example.com' },
];

type EditableHarnessProps = { initialList?: Array<InviteItem> };

const EditableHarness = ({ initialList = [] }: EditableHarnessProps) => {
  const [list, setList] = useState<Array<InviteItem>>(initialList);
  return (
    <SendInviteAccounts
      isEditable
      sendInviteList={list}
      setSendInviteList={setList}
    />
  );
};

describe('SendInviteAccounts (browser)', () => {
  it('renders the header and empty list message', async () => {
    await setupBrowserTest(<EditableHarness />);

    await expect.element(page.getByText('Send Invite To')).toBeVisible();
    await expect.element(page.getByText('This list is empty.')).toBeVisible();
  });

  it('keeps Add disabled until a valid email is entered', async () => {
    await setupBrowserTest(<EditableHarness />);

    const addButton = page.getByRole('button', { name: 'Add' });
    await expect.element(addButton).toBeDisabled();

    await userEvent.type(page.getByLabelText('Enter E-mail address'), 'not-an-email');
    await expect.element(addButton).toBeDisabled();
  });

  it('adds a valid email address to the list', async () => {
    createBrowserSoapAPIInterceptor('SearchDirectory', { searchTotal: 0 });
    await setupBrowserTest(<EditableHarness />);

    await userEvent.type(page.getByLabelText('Enter E-mail address'), 'user@example.com');
    await userEvent.click(page.getByRole('button', { name: 'Add' }));

    await expect.element(page.getByText('user@example.com')).toBeVisible();
  });

  it('filters the list from the search field', async () => {
    await setupBrowserTest(<EditableHarness initialList={INITIAL_INVITES} />);

    await expect.element(page.getByText('alice@example.com')).toBeVisible();
    await expect.element(page.getByText('bob@example.com')).toBeVisible();

    await userEvent.type(page.getByLabelText('Search for an account'), 'alice');

    await expect.element(page.getByText('alice@example.com')).toBeVisible();
    await expect.element(page.getByText('bob@example.com')).not.toBeInTheDocument();
  });

  it('hides the header and search bar when requested', async () => {
    await setupBrowserTest(
      <SendInviteAccounts
        isEditable={false}
        sendInviteList={INITIAL_INVITES}
        setSendInviteList={() => undefined}
        hideHeaderBar
        hideSearchBar
      />,
    );

    await expect.element(page.getByText('alice@example.com')).toBeVisible();
    await expect.element(page.getByText('Send Invite To')).not.toBeInTheDocument();
    await expect.element(page.getByLabelText('Search for an account')).not.toBeInTheDocument();
  });

  it('deletes the selected account from the list', async () => {
    await setupBrowserTest(<EditableHarness initialList={INITIAL_INVITES} />);

    const deleteButton = page.getByRole('button', { name: 'Delete' });
    await expect.element(deleteButton).toBeDisabled();

    await page.getByText('alice@example.com').click();
    await expect.element(deleteButton).toBeEnabled();

    await deleteButton.click();

    await expect.element(page.getByText('bob@example.com')).toBeVisible();
    expect(page.getByText('alice@example.com').elements()).toHaveLength(0);
    await expect.element(deleteButton).toBeDisabled();
  });

  it('adds an account to a non-empty list keeping existing entries', async () => {
    createBrowserSoapAPIInterceptor('SearchDirectory', { searchTotal: 0 });
    await setupBrowserTest(<EditableHarness initialList={INITIAL_INVITES} />);

    await userEvent.type(page.getByLabelText('Enter E-mail address'), 'carol@example.com');
    await userEvent.click(page.getByRole('button', { name: 'Add' }));

    await expect.element(page.getByText('alice@example.com')).toBeVisible();
    await expect.element(page.getByText('bob@example.com')).toBeVisible();
    await expect.element(page.getByText('carol@example.com')).toBeVisible();
  });

  it('fills the input with the account picked from the search suggestions', async () => {
    createBrowserSoapAPIInterceptor('SearchDirectory', {
      account: [{ id: 'account-1', name: 'found@example.com' }],
      searchTotal: 1,
      more: false,
    });
    await setupBrowserTest(<EditableHarness />);

    const emailInput = page.getByLabelText('Enter E-mail address');
    await emailInput.fill('found');
    await emailInput.click();

    await vi.waitFor(() => expect.element(page.getByText('found@example.com')).toBeVisible(), {
      timeout: 5_000,
    });

    await page.getByText('found@example.com').click();

    await expect.element(emailInput).toHaveValue('found@example.com');
    await expect.element(page.getByRole('button', { name: 'Add' })).toBeEnabled();
  }, 20_000);

  it('shows an error snackbar when the account search fails', async () => {
    worker.use(
      http.post('/service/admin/soap/SearchDirectoryRequest', () =>
        HttpResponse.json(
          { Body: { Fault: { Reason: { Text: 'Search directory failed' } } } },
          { status: 500 },
        ),
      ),
    );
    await setupBrowserTest(<EditableHarness />);

    await page.getByLabelText('Enter E-mail address').fill('user');

    await vi.waitFor(() => expect.element(page.getByText('Search directory failed')).toBeVisible(), {
      timeout: 5_000,
    });
  }, 20_000);
});
