/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createBrowserSoapAPIInterceptor, setupBrowserTest } from 'admin-ui-test-utils';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { SendInviteAccounts } from '../send-invite-accounts';

type InviteItem = { id: string; n: string; _content: string };

const INITIAL_INVITES: Array<InviteItem> = [
  { id: '1', n: 'zimbraPrefCalendarForwardInvitesTo', _content: 'alice@example.com' },
  { id: '2', n: 'zimbraPrefCalendarForwardInvitesTo', _content: 'bob@example.com' },
];

const EditableHarness = ({ initialList = [] as Array<InviteItem> }) => {
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
});
