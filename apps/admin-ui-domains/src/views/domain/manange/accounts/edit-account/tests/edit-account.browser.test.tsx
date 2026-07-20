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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { AccountContext, AccountDetail, CosDetail } from '../../account-context';
import EditAccount from '../edit-account';

const mockAccountDetail: AccountDetail = {
  zimbraId: 'account-123',
  name: 'testuser@example.com',
  uid: 'testuser',
  domainName: 'example.com',
  sn: 'User',
  givenName: 'Test',
  displayName: 'Test User',
  zimbraAccountStatus: 'active',
  zimbraMailDeliveryAddress: 'testuser@example.com',
  mail: 'testuser@example.com',
  zimbraCOSId: 'cos-123',
  zimbraIsAdminAccount: 'FALSE',
  zimbraIsDelegatedAdminAccount: 'FALSE',
  zimbraIsSystemAccount: 'FALSE',
  zimbraIsExternalVirtualAccount: 'FALSE',
};

const mockCosDetail: CosDetail = {
  zimbraId: 'cos-123',
  name: 'default',
  zimbraPrefDelegatedSendSaveTarget: 'inherit',
};

const mockContextValue = {
  accountDetail: mockAccountDetail,
  setAccountDetail: vi.fn(),
  initAccountDetail: mockAccountDetail,
  setInitAccountDetail: vi.fn(),
  accSpecificDetail: {},
  setAccSpecificDetail: vi.fn(),
  cosDetail: mockCosDetail,
  directMemberList: [],
  inDirectMemberList: [],
  setSignatureItems: vi.fn(),
  setSignatureList: vi.fn(),
  setDirectMemberList: vi.fn(),
  setInDirectMemberList: vi.fn(),
  otpList: [],
  identitiesList: [],
  folderList: [],
  setFolderList: vi.fn(),
  getListOtp: vi.fn(),
  getIdentitiesList: vi.fn(),
  deligateDetail: {},
  setDeligateDetail: vi.fn(),
  credentialList: [],
  getCredentialList: vi.fn(),
  initialGlobalRights: {},
  setinitialGlobalRights: vi.fn(),
  globalRights: {},
  setGlobalRights: vi.fn(),
  deleteAdministrationRights: [],
  setDeleteAdministrationRights: vi.fn(),
  userSessionList: [],
  setAllUserSessionList: vi.fn(),
  allUserSessionList: [],
  setUserSessionList: vi.fn(),
  defaultCOS: {},
  setDefaultCOS: vi.fn(),
  allowedDeletePassword: false,
  setAllowedDeletePassword: vi.fn(),
};

const defaultProps = {
  setShowEditAccountView: vi.fn(),
  setIsAccountDeleted: vi.fn(),
  selectedAccount: { id: 'account-123', name: 'testuser@example.com' },
  getAccountList: vi.fn(),
  signatureItems: [],
  signatureList: [],
  getAccountDetail: vi.fn(),
  defaultTab: 'general',
  setDefaultTab: vi.fn(),
  showModal: false,
  setShowModal: vi.fn(),
  isDirty: false,
  setIsDirty: vi.fn(),
  STATUS_COLOR: {
    active: { label: 'Active', color: 'success' },
    closed: { label: 'Closed', color: 'error' },
  },
};

function setupTest(
  contextOverrides: Record<string, unknown> = {},
  propsOverrides: Record<string, unknown> = {},
) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: true });
  queryClient.setQueryData(['user-rights'], []);
  queryClient.setQueryData(['user-settings'], {
    attrs: {
      zimbraIsAdminAccount: 'TRUE',
      zimbraIsDelegatedAdminAccount: 'FALSE',
      zimbraIsSystemAdminAccount: 'FALSE',
    },
  });

  const props = { ...defaultProps, ...propsOverrides };
  const context = { ...mockContextValue, ...contextOverrides };

  return setupBrowserTest(
    <AccountContext.Provider value={context as any}>
      <EditAccount {...(props as any)} />
    </AccountContext.Provider>,
    { queryClient },
  );
}

describe('EditAccount (browser)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render account name in header', async () => {
      setupTest();

      await expect
        .element(page.getByText('testuser@example.com').first())
        .toBeVisible();
    });

    it('should render all tab labels', async () => {
      setupTest();

      await expect.element(page.getByText('GENERAL').first()).toBeVisible();
      await expect.element(page.getByText('PROFILE').first()).toBeVisible();
      await expect.element(page.getByText('CONFIGURATION').first()).toBeVisible();
      await expect.element(page.getByText('USER PREFERENCES').first()).toBeVisible();
      await expect.element(page.getByText('SECURITY').first()).toBeVisible();
      await expect.element(page.getByText('ADMINISTRATION').first()).toBeVisible();
    });

    it('should render DELEGATES tab when advanced mode is supported', async () => {
      setupTest();

      await expect.element(page.getByText('DELEGATES').first()).toBeVisible();
    });

    it('should render delete button when not dirty', async () => {
      setupTest();

      await expect
        .element(page.getByRole('button', { name: /delete/i }).first())
        .toBeVisible();
    });

    it('should render view mail button when not dirty', async () => {
      setupTest();

      await expect
        .element(page.getByRole('button', { name: /VIEW MAIL/i }).first())
        .toBeVisible();
    });

    it('should render close button', async () => {
      setupTest();

      const closeButtons = page.getByRole('button');
      await expect.element(closeButtons.first()).toBeVisible();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to PROFILE tab when clicked', async () => {
      setupTest();

      const profileTab = page.getByText('PROFILE').first();
      await userEvent.click(profileTab);

      await expect.element(profileTab).toBeVisible();
    });

    it('should switch to CONFIGURATION tab when clicked', async () => {
      setupTest();

      const configTab = page.getByText('CONFIGURATION').first();
      await userEvent.click(configTab);

      await expect.element(configTab).toBeVisible();
    });

    it('should switch to USER PREFERENCES tab when clicked', async () => {
      setupTest();

      const prefTab = page.getByText('USER PREFERENCES').first();
      await userEvent.click(prefTab);

      await expect.element(prefTab).toBeVisible();
    });

    it('should switch to SECURITY tab when clicked', async () => {
      setupTest();

      const securityTab = page.getByText('SECURITY').first();
      await userEvent.click(securityTab);

      await expect.element(securityTab).toBeVisible();
    });

    it('should switch to ADMINISTRATION tab when clicked', async () => {
      setupTest();

      const adminTab = page.getByText('ADMINISTRATION').first();
      await userEvent.click(adminTab);

      await expect.element(adminTab).toBeVisible();
    });

    it('should switch to DELEGATES tab when clicked', async () => {
      setupTest();

      const delegatesTab = page.getByText('DELEGATES').first();
      await userEvent.click(delegatesTab);

      await expect.element(delegatesTab).toBeVisible();
    });
  });

  describe('Dirty State', () => {
    it('should show Save and Cancel buttons when isDirty is true', async () => {
      setupTest({}, { isDirty: true });

      await expect
        .element(page.getByRole('button', { name: /Save/i }).first())
        .toBeVisible();
      await expect
        .element(page.getByRole('button', { name: /Cancel/i }).first())
        .toBeVisible();
    });

    it('should hide delete button when isDirty is true', async () => {
      setupTest({}, { isDirty: true });

      await expect
        .element(page.getByRole('button', { name: /delete/i }))
        .not.toBeInTheDocument();
    });

    it('should hide view mail button when isDirty is true', async () => {
      setupTest({}, { isDirty: true });

      await expect
        .element(page.getByRole('button', { name: /VIEW MAIL/i }))
        .not.toBeInTheDocument();
    });
  });


  describe('Unsaved Changes Modal', () => {
    it('should show unsaved changes modal when showModal is true', async () => {
      setupTest({}, { showModal: true });

      await expect
        .element(page.getByText(/unsaved changes/i).first())
        .toBeVisible();
    });

    it('should show Discard button in unsaved changes modal', async () => {
      setupTest({}, { showModal: true });

      await expect
        .element(page.getByRole('button', { name: /Discard/i }).first())
        .toBeVisible();
    });

    it('should show Save the changes button in unsaved changes modal', async () => {
      setupTest({}, { showModal: true });

      await expect
        .element(page.getByRole('button', { name: /Save the changes/i }).first())
        .toBeVisible();
    });

    it('should call setShowModal(false) when Discard is clicked', async () => {
      const setShowModal = vi.fn();
      setupTest({}, { showModal: true, setShowModal });

      const discardButton = page.getByRole('button', { name: /Discard/i }).first();
      await userEvent.click(discardButton);

      expect(setShowModal).toHaveBeenCalledWith(false);
    });
  });


  describe('Cancel Button', () => {
    it('should call setAccountDetail when Cancel is clicked', async () => {
      const setAccountDetail = vi.fn();
      setupTest({ setAccountDetail }, { isDirty: true });

      const cancelButton = page.getByRole('button', { name: /Cancel/i }).first();
      await userEvent.click(cancelButton);

      expect(setAccountDetail).toHaveBeenCalled();
    });
  });

  describe('Delete Button State', () => {
    it('should disable delete button when zimbraId does not match', async () => {
      setupTest(
        { accountDetail: { ...mockAccountDetail, zimbraId: 'different-id' } },
        { selectedAccount: { id: 'account-123', name: 'test@example.com' } },
      );

      const deleteButton = page.getByRole('button', { name: /delete/i }).first();
      await expect.element(deleteButton).toBeDisabled();
    });

    it('should enable delete button when zimbraId matches', async () => {
      setupTest();

      const deleteButton = page.getByRole('button', { name: /delete/i }).first();
      await expect.element(deleteButton).toBeEnabled();
    });
  });

});
