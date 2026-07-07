/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { AccountContext } from '../../../account-context';
import { EditAccountQuotaInputsLegacy } from '../edit-account-quota-inputs-legacy';

const defaultProps = {
  focusableFileQuota: false,
  highlightFileQuota: false,
  focusableMailboxQuota: false,
  highlightMailboxQuota: false,
  setFocusableFileQuota: vi.fn(),
  setHighlightFileQuota: vi.fn(),
  setFocusableMailboxQuota: vi.fn(),
  setHighlightMailboxQuota: vi.fn(),
};

const baseMockContext = {
  accountDetail: {
    zimbraMailQuota: 10737418240, // 10 GB
    filesQuotaLimit: 5368709120, // 5 GB
  },
  cosDetail: {
    zimbraMailQuota: 5368709120, // 5 GB
    filesQuotaLimit: 2684354560, // 2.5 GB
  },
  accSpecificDetail: {},
  initAccountDetail: {
    zimbraMailQuota: 10737418240,
    filesQuotaLimit: 5368709120,
  },
  setAccountDetail: vi.fn(),
  setAccSpecificDetail: vi.fn(),
  identitiesList: [],
  folderList: [],
  getIdentitiesList: vi.fn(),
  setDeligateDetail: vi.fn(),
  setFolderList: vi.fn(),
  setDefaultCOS: vi.fn(),
  setInDirectMemberList: vi.fn(),
  setSignatureItems: vi.fn(),
  setSignatureList: vi.fn(),
  setAllUserSessionList: vi.fn(),
  setDirectMemberList: vi.fn(),
  setInitAccountDetail: vi.fn(),
  setUserSessionList: vi.fn(),
  setGlobalRights: vi.fn(),
  setinitialGlobalRights: vi.fn(),
  setDeleteAdministrationRights: vi.fn(),
  deligateDetail: {},
};

function setupAdvancedTest(contextOverrides: Record<string, unknown> = {}) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: true });

  return setupBrowserTest(
    <AccountContext.Provider
      value={{ ...baseMockContext, ...contextOverrides } as any}
    >
      <EditAccountQuotaInputsLegacy {...defaultProps} />
    </AccountContext.Provider>,
    { queryClient },
  );
}

function setupNotAdvancedTest(contextOverrides: Record<string, unknown> = {}) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: false });

  return setupBrowserTest(
    <AccountContext.Provider
      value={{ ...baseMockContext, ...contextOverrides } as any}
    >
      <EditAccountQuotaInputsLegacy {...defaultProps} />
    </AccountContext.Provider>,
    { queryClient },
  );
}

describe('EditAccountQuotaInputsLegacy', () => {
  describe('Mailbox Quota Input', () => {
    it('should render mailbox quota input', async () => {
      setupAdvancedTest();

      await expect
        .element(page.getByText('Mailbox Quota Limit (GB)'))
        .toBeVisible();
    });

    it('should display initial mailbox quota value in GB', async () => {
      setupAdvancedTest();

      const input = page.getByRole('textbox').first();
      await expect.element(input).toHaveValue('10.00');
    });

    it('should call setAccountDetail when mailbox quota changes', async () => {
      const setAccountDetail = vi.fn();
      setupAdvancedTest({ setAccountDetail });

      const input = page.getByRole('textbox').first();
      await userEvent.clear(input);
      await userEvent.type(input, '15');

      expect(setAccountDetail).toHaveBeenCalled();
    });

    it('should allow decimal input', async () => {
      setupAdvancedTest();

      const input = page.getByRole('textbox').first();
      await userEvent.clear(input);
      await userEvent.type(input, '12.5');

      await expect.element(input).toHaveValue('12.5');
    });

    it('should show error when more than 3 decimal places entered', async () => {
      setupAdvancedTest();

      const input = page.getByRole('textbox').first();
      await userEvent.clear(input);
      await userEvent.type(input, '10.1234');

      await expect
        .element(page.getByText('Maximum 3 digits allowed after the decimal point'))
        .toBeVisible();
    });
  });

  describe('Files Quota Input', () => {
    it('should render files quota input when advanced and filesQuotaLimit exists', async () => {
      setupAdvancedTest();

      await expect
        .element(page.getByText('Files Space Limit (GB)'))
        .toBeVisible();
    });

    it('should not render files quota input when not advanced', async () => {
      setupNotAdvancedTest();

      await expect
        .element(page.getByText('Files Space Limit (GB)'))
        .not.toBeInTheDocument();
    });

    it('should not render files quota input when filesQuotaLimit is missing', async () => {
      setupAdvancedTest({
        initAccountDetail: {
          zimbraMailQuota: 10737418240,
          filesQuotaLimit: undefined,
        },
      });

      await expect
        .element(page.getByText('Files Space Limit (GB)'))
        .not.toBeInTheDocument();
    });

    it('should display files quota with normal value', async () => {
      setupAdvancedTest({
        initAccountDetail: {
          zimbraMailQuota: 10737418240,
          filesQuotaLimit: 5368709120, // 5 GB
        },
        accountDetail: {
          zimbraMailQuota: 10737418240,
          filesQuotaLimit: 5368709120,
        },
      });

      await expect
        .element(page.getByText('Files Space Limit (GB)'))
        .toBeVisible();
    });
  });

  describe('Input focus and highlight', () => {
    it('should call setFocusableMailboxQuota on blur', async () => {
      const setFocusableMailboxQuota = vi.fn();
      const setHighlightMailboxQuota = vi.fn();

      const queryClient = getQueryClient();
      queryClient.setQueryData(['advanced-supported'], { supported: true });

      setupBrowserTest(
        <AccountContext.Provider value={baseMockContext as any}>
          <EditAccountQuotaInputsLegacy
            {...defaultProps}
            setFocusableMailboxQuota={setFocusableMailboxQuota}
            setHighlightMailboxQuota={setHighlightMailboxQuota}
          />
        </AccountContext.Provider>,
        { queryClient },
      );

      const input = page.getByRole('textbox').first();
      await userEvent.click(input);
      await userEvent.tab();

      expect(setFocusableMailboxQuota).toHaveBeenCalledWith(false);
      expect(setHighlightMailboxQuota).toHaveBeenCalledWith(false);
    });
  });
});
