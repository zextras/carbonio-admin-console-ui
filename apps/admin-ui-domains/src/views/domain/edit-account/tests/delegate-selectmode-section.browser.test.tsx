/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

const mockAccountListDirectory = vi.hoisted(() => vi.fn());

vi.mock('../../../../services/account-list-directory-service', () => ({
  accountListDirectory: mockAccountListDirectory,
}));

import { DelegateSelectModeSection } from '../add-delegate-section/delegate-selectmode-section';
import { AccountFormTestProvider } from './account-form-test-provider';

function setupTest(values: Record<string, unknown> = {}): void {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: true });

  setupBrowserTest(
    <AccountFormTestProvider values={values}>
      <DelegateSelectModeSection />
    </AccountFormTestProvider>,
    { queryClient },
  );
}

describe('DelegateSelectModeSection (browser)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the delegate type select and the account search input', async () => {
    setupTest();

    await expect
      .element(page.getByText(/who will be the delegates/i))
      .toBeVisible();
    await expect
      .element(page.getByRole('textbox', { name: /search here for an account/i }))
      .toBeVisible();
  });

  it('searches accounts (debounced) and selects one from the suggestions', async () => {
    mockAccountListDirectory.mockResolvedValue({
      account: [
        { id: 'acc-1', name: 'jane@example.com' },
        { id: 'acc-2', name: 'john@example.com' },
      ],
    });
    setupTest();

    const searchInput = page.getByRole('textbox', { name: /search here for an account/i });
    await searchInput.fill('jan');

    // debounced search (700ms) then the service is called with the LDAP filter
    await vi.waitFor(
      () => {
        const searched = mockAccountListDirectory.mock.calls.some(
          (call) => call[1] === 'accounts' && String(call[3]).includes('jan'),
        );
        expect(searched).toBe(true);
      },
      { timeout: 5_000 },
    );

    // open the suggestions dropdown and pick a result
    await searchInput.click();
    const suggestion = page.getByText('jane@example.com');
    await vi.waitFor(() => expect.element(suggestion).toBeVisible());

    await suggestion.click();

    await expect.element(searchInput).toHaveValue('jane@example.com');
  });

  it('excludes the edited account from the suggestions', async () => {
    mockAccountListDirectory.mockResolvedValue({
      account: [
        { id: 'self-id', name: 'myself@example.com' },
        { id: 'acc-1', name: 'jane@example.com' },
      ],
    });
    setupTest({ zimbraId: 'self-id' });

    const searchInput = page.getByRole('textbox', { name: /search here for an account/i });
    await searchInput.fill('j');
    await vi.waitFor(() => expect(mockAccountListDirectory).toHaveBeenCalled(), {
      timeout: 5_000,
    });

    await searchInput.click();
    await vi.waitFor(() => expect.element(page.getByText('jane@example.com')).toBeVisible());
    await expect.element(page.getByText('myself@example.com')).not.toBeInTheDocument();
  });

  it('offers distribution lists when the delegate type is a group', async () => {
    mockAccountListDirectory.mockResolvedValue({
      account: [{ id: 'acc-1', name: 'jane@example.com' }],
      dl: [{ id: 'dl-1', name: 'team@example.com' }],
    });
    setupTest();

    await page.getByText(/who will be the delegates/i).click();
    await page.getByText('An Existing Group').click();

    const searchInput = page.getByRole('textbox', { name: /search here for an account/i });
    await searchInput.fill('te');
    await vi.waitFor(
      () => {
        const searched = mockAccountListDirectory.mock.calls.some(
          (call) => call[1] === 'distributionlists' && String(call[3]).includes('te'),
        );
        expect(searched).toBe(true);
      },
      { timeout: 5_000 },
    );

    await searchInput.click();
    await vi.waitFor(() => expect.element(page.getByText('team@example.com')).toBeVisible());
    await expect.element(page.getByText('jane@example.com')).not.toBeInTheDocument();
  });
});
