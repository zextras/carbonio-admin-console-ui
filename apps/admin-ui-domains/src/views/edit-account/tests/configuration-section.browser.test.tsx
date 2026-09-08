/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type { AccountFormContextValue } from '../account-form-context';
import { EditAccountConfigurationSection } from '../configuration-section';
import { AccountFormTestProvider } from './account-form-test-provider';

function setupTest(
  values: Record<string, unknown> = {},
  contextOverrides?: Partial<AccountFormContextValue>,
) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: true });

  createBrowserSoapAPIInterceptor('SearchDirectory', {
    searchTotal: 1,
    domain: [{ id: 'domain-123', name: 'test-domain.com' }],
  });

  return setupBrowserTest(
    <AccountFormTestProvider values={values} contextOverrides={contextOverrides}>
      <EditAccountConfigurationSection />
    </AccountFormTestProvider>,
    { queryClient },
  );
}

describe('EditAccountConfigurationSection (browser)', () => {
  it('renders the three forwarding chip inputs seeded from server values', async () => {
    setupTest({
      zimbraPrefMailForwardingAddress: 'fwd-user1@example.com, fwd-user2@example.com',
      zimbraMailForwardingAddress: 'fwd-hidden@example.com',
      zimbraPrefCalendarForwardInvitesTo: 'invite@example.com',
    });

    await expect.element(page.getByText('fwd-user1@example.com')).toBeVisible();
    await expect.element(page.getByText('fwd-user2@example.com')).toBeVisible();
    await expect.element(page.getByText('fwd-hidden@example.com')).toBeVisible();
    await expect.element(page.getByText('invite@example.com')).toBeVisible();
  });

  it('accepts edits: adding a chip to the user-specified forwarding list', async () => {
    setupTest({
      zimbraPrefMailForwardingAddress: 'fwd-user1@example.com',
    });

    await expect.element(page.getByText('fwd-user1@example.com')).toBeVisible();

    const input = page.getByPlaceholder(
      'Forwarding addresses specified by the user',
    );
    await input.fill('new-fwd@example.com');
    await userEvent.keyboard('{Enter}');

    await expect.element(page.getByText('new-fwd@example.com')).toBeVisible();
    await expect.element(page.getByText('fwd-user1@example.com')).toBeVisible();
  });

  it('accepts edits: adding a chip to the calendar-invitations list', async () => {
    setupTest({
      zimbraPrefCalendarForwardInvitesTo: 'invite@example.com',
    });

    await expect.element(page.getByText('invite@example.com')).toBeVisible();

    const input = page.getByPlaceholder('Forwarding calendar invitations to these addresses');
    await input.fill('new-invite@example.com');
    await userEvent.keyboard('{Enter}');

    await expect.element(page.getByText('new-invite@example.com')).toBeVisible();
  });

  it('shows no chips when the server values are absent', async () => {
    setupTest({});

    await expect
      .element(page.getByPlaceholder('Forwarding addresses specified by the user'))
      .toBeVisible();
    await expect
      .element(page.getByText('fwd-user1@example.com', { exact: true }))
      .not.toBeInTheDocument();
  });

  describe('Chat section visibility', () => {
    it('hides the whole Chat section when the COS edition is mail', async () => {
      setupTest({}, { cosDetail: { edition: 'mail' } });

      // Anchor: wait for always-rendered content before asserting absence.
      await expect
        .element(page.getByRole('switch', { name: 'Allow access to Tasks' }))
        .toBeVisible();
      await expect.element(page.getByText('Chat', { exact: true })).not.toBeInTheDocument();
      await expect.element(page.getByText('General Settings')).not.toBeInTheDocument();
      await expect
        .element(page.getByRole('switch', { name: 'Enable Chat' }))
        .not.toBeInTheDocument();
    });

    it('hides the whole Chat section when the COS has no edition attribute', async () => {
      setupTest({}, { cosDetail: {} });

      // Anchor: wait for always-rendered content before asserting absence.
      await expect
        .element(page.getByRole('switch', { name: 'Allow access to Tasks' }))
        .toBeVisible();
      await expect.element(page.getByText('Chat', { exact: true })).not.toBeInTheDocument();
      await expect
        .element(page.getByRole('switch', { name: 'Enable Chat' }))
        .not.toBeInTheDocument();
    });

    it('shows the Chat section when the COS edition is workspace', async () => {
      setupTest({}, { cosDetail: { edition: 'workspace' } });

      await expect.element(page.getByText('Chat', { exact: true })).toBeVisible();
      await expect.element(page.getByRole('switch', { name: 'Enable Chat' })).toBeVisible();
    });
  });
});
