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
import React from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { DomainRenameFields } from '../general-section/domain-rename-fields';
import { AccountFormTestProvider } from './account-form-test-provider';

const mockAccountDetail = {
  uid: 'test-user',
  name: 'test-user@test-domain.com',
  domainName: 'test-domain.com',
  zimbraId: 'mock-zimbra-id',
};

const DOMAINS = [
  { id: 'domain-1', name: 'test-domain.com' },
  { id: 'domain-2', name: 'other-domain.com' },
];

function wrapDomainRenameFields(
  values: Record<string, unknown> = mockAccountDetail,
): React.ReactElement {
  return (
    <AccountFormTestProvider values={values}>
      <DomainRenameFields />
    </AccountFormTestProvider>
  );
}

function setupDomainRenameTest(component: React.ReactElement) {
  const queryClient = getQueryClient();
  createBrowserSoapAPIInterceptor('SearchDirectory', {
    searchTotal: DOMAINS.length,
    domain: DOMAINS,
  });
  return setupBrowserTest(component, { queryClient });
}

describe('DomainRenameFields (browser)', () => {
  it('renders the account uid in the user input', async () => {
    setupDomainRenameTest(wrapDomainRenameFields());

    await expect.element(page.getByLabelText('User')).toHaveValue('test-user');
  });

  it('mirrors the account domain into the dropdown label', async () => {
    setupDomainRenameTest(wrapDomainRenameFields());

    const dropdown = page
      .getByRole('textbox', { name: /domain name/i })
      .first();
    await expect.element(dropdown).toHaveValue('test-domain.com');
  });

  it('shows the domain suggestions when typing a search', async () => {
    setupDomainRenameTest(wrapDomainRenameFields());

    const dropdown = page.getByRole('textbox', { name: /type here a domain|domain name/i }).first();
    await userEvent.fill(dropdown, 'other');
    await dropdown.click();
    await expect.element(page.getByText('other-domain.com')).toBeVisible();
  });

  it('updates the form domain when a suggestion is picked', async () => {
    setupDomainRenameTest(wrapDomainRenameFields());

    const dropdown = page.getByRole('textbox', { name: /type here a domain|domain name/i }).first();
    await userEvent.fill(dropdown, 'other');
    await dropdown.click();
    const suggestion = page.getByText('other-domain.com');
    await expect.element(suggestion).toBeVisible();
    await suggestion.click();

    await expect.element(dropdown).toHaveValue('other-domain.com');
  });

  it('normalizes the uid to lowercase without spaces while typing', async () => {
    setupDomainRenameTest(wrapDomainRenameFields());

    const userInput = page.getByLabelText('User');
    await userEvent.fill(userInput, 'My New User');

    await expect.element(userInput).toHaveValue('mynewuser');
  });
});
