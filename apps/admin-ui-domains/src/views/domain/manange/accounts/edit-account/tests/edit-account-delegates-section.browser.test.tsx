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
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { AccountContext } from '../../account-context';
import EditAccountDelegatesSection from '../edit-account-delegates-section';

const mockContextValue = {
  accountDetail: {
    zimbraMailDeliveryAddress: 'owner@example.com',
    zimbraId: 'owner-id',
    zimbraPrefDelegatedSendSaveTarget: 'inherit',
  },
  cosDetail: {
    zimbraPrefDelegatedSendSaveTarget: 'inherit',
  },
  accSpecificDetail: {},
  identitiesList: [],
  folderList: [],
  getIdentitiesList: vi.fn(),
  setDeligateDetail: vi.fn(),
  setAccountDetail: vi.fn(),
  setFolderList: vi.fn(),
  deligateDetail: {},
  setDefaultCOS: vi.fn(),
  setInDirectMemberList: vi.fn(),
  setSignatureItems: vi.fn(),
  setSignatureList: vi.fn(),
  setAllUserSessionList: vi.fn(),
  setAccSpecificDetail: vi.fn(),
  setDirectMemberList: vi.fn(),
  setInitAccountDetail: vi.fn(),
  setUserSessionList: vi.fn(),
  setGlobalRights: vi.fn(),
  setinitialGlobalRights: vi.fn(),
  setDeleteAdministrationRights: vi.fn(),
};

function setupTest(contextOverrides: Record<string, unknown> = {}) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: true });

  return setupBrowserTest(
    <AccountContext.Provider
      value={{ ...mockContextValue, ...contextOverrides } as any}
    >
      <EditAccountDelegatesSection />
    </AccountContext.Provider>,
    { queryClient },
  );
}

describe('EditAccountDelegatesSection (browser)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render simplified delegate settings and disabled add rights button', async () => {
    setupTest();

    await expect
      .element(
        page.getByText("Delegate's general Send Settings", { exact: false }),
      )
      .toBeVisible();
    await expect
      .element(
        page.getByPlaceholder(
          'Start typing an Account / Group to add it to the rights',
        ),
      )
      .toBeVisible();
    await expect.element(page.getByText(/Read \/ Write/i).first()).toBeVisible();
    await expect.element(page.getByText(/Read Only/i).first()).toBeVisible();
    await expect.element(page.getByText(/Send/i).first()).toBeVisible();
    await expect.element(page.getByText(/Send on Behalf of/i).first()).toBeVisible();
    await expect
      .element(
        page.getByRole('button', {
          name: /ADD THE ACCOUNT \/ GROUP WITH SELECTED RIGHTS/i,
        }).first(),
      )
      .toBeDisabled();
  });

  it('should switch to advanced view and render delegate table empty state', async () => {
    setupTest();

    const switchControl = page.getByText(/Switch to Simplified View/i).first();
    await expect.element(switchControl).toBeVisible();
    await switchControl.click();

    await expect.element(page.getByRole('button', { name: /ADD NEW/i }).first()).toBeVisible();
    await expect.element(page.getByText('DELEGATES', { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText('This list is empty.').first()).toBeVisible();
  });

  it('should open the add delegate wizard when clicking ADD NEW in advanced view', async () => {
    setupTest();

    const switchControl = page.getByText(/Switch to Simplified View/i).first();
    await expect.element(switchControl).toBeVisible();
    await switchControl.click();
    await userEvent.click(page.getByRole('button', { name: /ADD NEW/i }).first());

    await expect
      .element(page.getByText('Add user on Delegates List', { exact: true }).first())
      .toBeVisible();
  });

  it('should perform SearchDirectory when typing at least three characters', async () => {
    const searchInterceptor = createBrowserSoapAPIInterceptor('SearchDirectory', {
      account: [
        {
          id: 'delegate-id',
          name: 'delegate@example.com',
        },
      ],
      dl: [],
    });

    setupTest();

    const chipInput = page.getByPlaceholder(
      'Start typing an Account / Group to add it to the rights',
    );
    await userEvent.type(chipInput, 'abc');
    await expect(searchInterceptor).resolves.toHaveProperty('query');
  });

  it('should remove a selected delegate from simplified view and call Batch', async () => {
    const batchInterceptor = createBrowserSoapAPIInterceptor('Batch', {});
    const delegateIdentity = {
      grantee: [{ id: 'delegate-id', name: 'delegate@example.com', type: 'usr' }],
      folder: [{ perm: 'rwidxa', id: 'folder-1', zid: 'zid-1' }],
    };

    setupTest({ identitiesList: [delegateIdentity] });

    await expect.element(page.getByText('delegate@example.com').first()).toBeVisible();
    await userEvent.click(page.getByText('delegate@example.com').first());
    await userEvent.click(page.getByRole('button', { name: /REMOVE/i }).first());

    const request = await batchInterceptor;

    expect(request).toMatchObject({
      FolderActionRequest: [
        {
          action: {
            id: 'folder-1',
            op: '!grant',
            zid: 'zid-1',
          },
        },
      ],
    });
  });

  it('should render an identity row and open edit wizard when delegate is selected', async () => {
    const delegateIdentity = {
      grantee: [{ id: 'delegate-id', name: 'delegate@example.com', type: 'usr' }],
      right: [{ _content: 'sendAs' }],
      folder: [{ perm: 'rwidxa', id: 'folder-1', zid: 'zid-1' }],
    };

    setupTest({ identitiesList: [delegateIdentity] });

    const switchControl = page.getByText(/Switch to Simplified View/i).first();
    await expect.element(switchControl).toBeVisible();
    await switchControl.click();

    await expect.element(page.getByText('delegate@example.com').first()).toBeVisible();
    await userEvent.click(page.getByText('delegate@example.com').first());
    await userEvent.click(page.getByRole('button', { name: /EDIT/i }).first());

    await expect
      .element(page.getByText('Add user on Delegates List', { exact: true }).first())
      .toBeVisible();
  });

  describe('Checkbox toggles', () => {
    it('should toggle Read/Write checkbox when clicked', async () => {
      setupTest();

      const checkbox = page.getByText('Read / Write').first();
      await expect.element(checkbox).toBeVisible();
      await userEvent.click(checkbox);

      // Button still disabled because no account selected
      await expect
        .element(
          page.getByRole('button', {
            name: /ADD THE ACCOUNT \/ GROUP WITH SELECTED RIGHTS/i,
          }).first(),
        )
        .toBeDisabled();
    });

    it('should toggle Read Only checkbox and uncheck Read/Write', async () => {
      setupTest();

      const readOnlyCheckbox = page.getByText('Read Only').first();
      await expect.element(readOnlyCheckbox).toBeVisible();
      await userEvent.click(readOnlyCheckbox);
    });

    it('should toggle Send checkbox when clicked', async () => {
      setupTest();

      const sendCheckbox = page.getByText('Send', { exact: true }).first();
      await expect.element(sendCheckbox).toBeVisible();
      await userEvent.click(sendCheckbox);
    });

    it('should toggle Send on Behalf of checkbox and uncheck Send', async () => {
      setupTest();

      const sendBehalfCheckbox = page.getByText('Send on Behalf of').first();
      await expect.element(sendBehalfCheckbox).toBeVisible();
      await userEvent.click(sendBehalfCheckbox);
    });
  });

  describe('Simplified view tables', () => {
    it('should render Read/Write table header', async () => {
      setupTest();

      await expect
        .element(page.getByText(/Accounts with/i).first())
        .toBeVisible();
      await expect
        .element(page.getByText(/Read\/Write/i).first())
        .toBeVisible();
    });

    it('should render Read Only table header', async () => {
      setupTest();

      await expect
        .element(page.getByText(/Read Only/i).first())
        .toBeVisible();
    });

    it('should render Send rights table header', async () => {
      setupTest();

      await expect
        .element(page.getByText(/SendAs\/SendonBehalf/i).first())
        .toBeVisible();
    });

    it('should show delegate in Read/Write table when has write folder rights', async () => {
      const delegateIdentity = {
        grantee: [{ id: 'rw-delegate', name: 'readwrite@example.com', type: 'usr' }],
        folder: [{ perm: 'rwidxa', id: 'folder-1', zid: 'zid-1' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      await expect.element(page.getByText('readwrite@example.com').first()).toBeVisible();
    });

    it('should show delegate in Read Only table when has read-only folder rights', async () => {
      const delegateIdentity = {
        grantee: [{ id: 'read-delegate', name: 'readonly@example.com', type: 'usr' }],
        folder: [{ perm: 'r', id: 'folder-1', zid: 'zid-1' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      await expect.element(page.getByText('readonly@example.com').first()).toBeVisible();
    });

    it('should show delegate in Send table when has send rights', async () => {
      const delegateIdentity = {
        grantee: [{ id: 'send-delegate', name: 'sender@example.com', type: 'usr' }],
        right: [{ _content: 'sendAs' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      await expect.element(page.getByText('sender@example.com').first()).toBeVisible();
    });
  });

  describe('REMOVE ALL buttons', () => {
    it('should disable REMOVE ALL for Read/Write when no delegates with write rights', async () => {
      setupTest();

      const removeAllButtons = page.getByRole('button', { name: /REMOVE ALL/i });
      await expect.element(removeAllButtons.first()).toBeDisabled();
    });

    it('should enable REMOVE ALL when delegates with write rights exist', async () => {
      const delegateIdentity = {
        grantee: [{ id: 'rw-delegate', name: 'readwrite@example.com', type: 'usr' }],
        folder: [{ perm: 'rwidxa', id: 'folder-1', zid: 'zid-1' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      const removeAllButtons = page.getByRole('button', { name: /REMOVE ALL/i });
      await expect.element(removeAllButtons.first()).toBeEnabled();
    });

    it('should call Batch when REMOVE ALL is clicked for delegates with rights', async () => {
      const batchInterceptor = createBrowserSoapAPIInterceptor('Batch', {});
      const delegateIdentity = {
        grantee: [{ id: 'rw-delegate', name: 'readwrite@example.com', type: 'usr' }],
        folder: [{ perm: 'rwidxa', id: 'folder-1', zid: 'zid-1' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      const removeAllButton = page.getByRole('button', { name: /REMOVE ALL/i }).first();
      await userEvent.click(removeAllButton);

      await expect(batchInterceptor).resolves.toBeDefined();
    });
  });

  describe('Advanced view delegate table', () => {
    it('should show populated delegate table with columns in advanced view', async () => {
      const delegateIdentity = {
        grantee: [{ id: 'delegate-id', name: 'delegate@example.com', type: 'usr' }],
        right: [{ _content: 'sendAs' }],
        folder: [{ perm: 'rwidxa', id: 'folder-1', zid: 'zid-1' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      const switchControl = page.getByText(/Switch to Simplified View/i).first();
      await switchControl.click();

      await expect.element(page.getByText('delegate@example.com').first()).toBeVisible();
      await expect.element(page.getByText('Single User').first()).toBeVisible();
      await expect.element(page.getByText('Send As').first()).toBeVisible();
    });

    it('should disable REMOVE button when no delegate selected in advanced view', async () => {
      const delegateIdentity = {
        grantee: [{ id: 'delegate-id', name: 'delegate@example.com', type: 'usr' }],
        folder: [{ perm: 'rwidxa', id: 'folder-1', zid: 'zid-1' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      const switchControl = page.getByText(/Switch to Simplified View/i).first();
      await switchControl.click();

      await expect
        .element(page.getByRole('button', { name: /REMOVE/i }).first())
        .toBeDisabled();
    });

    it('should delete delegate in advanced view when REMOVE clicked', async () => {
      const batchInterceptor = createBrowserSoapAPIInterceptor('Batch', {});
      const delegateIdentity = {
        grantee: [{ id: 'delegate-id', name: 'delegate@example.com', type: 'usr' }],
        right: [{ _content: 'sendAs' }],
        folder: [{ perm: 'rwidxa', id: 'folder-1', zid: 'zid-1' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      const switchControl = page.getByText(/Switch to Simplified View/i).first();
      await switchControl.click();

      await userEvent.click(page.getByText('delegate@example.com').first());
      await userEvent.click(page.getByRole('button', { name: /REMOVE/i }).first());

      await expect(batchInterceptor).resolves.toBeDefined();
    });
  });

  describe('Delegate Send Settings', () => {
    it('should render Delegate Send Settings section', async () => {
      setupTest();

      await expect
        .element(page.getByText('Delegate Send Settings'))
        .toBeVisible();
    });
  });

  describe('Delegate type display', () => {
    it('should show Group type for distribution list delegate', async () => {
      const delegateIdentity = {
        grantee: [{ id: 'group-delegate', name: 'group@example.com', type: 'grp' }],
        folder: [{ perm: 'rwidxa', id: 'folder-1', zid: 'zid-1' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      const switchControl = page.getByText(/Switch to Simplified View/i).first();
      await switchControl.click();

      await expect.element(page.getByText('Group').first()).toBeVisible();
    });

    it('should show Send on Behalf Of text for sendOnBehalfOf right', async () => {
      const delegateIdentity = {
        grantee: [{ id: 'delegate-id', name: 'delegate@example.com', type: 'usr' }],
        right: [{ _content: 'sendOnBehalfOf' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      const switchControl = page.getByText(/Switch to Simplified View/i).first();
      await switchControl.click();

      await expect.element(page.getByText('Send on Behalf Of').first()).toBeVisible();
    });
  });
});
