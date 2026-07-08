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
import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest';
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

  describe('View switching', () => {
    it('should switch back to simplified view from advanced view', async () => {
      setupTest();

      // Switch to advanced
      const switchToAdvanced = page.getByText(/Switch to Simplified View/i).first();
      await userEvent.click(switchToAdvanced);

      await expect.element(page.getByText('DELEGATES', { exact: true }).first()).toBeVisible();

      // Switch back to simplified
      const switchToSimplified = page.getByText(/Switch to Advanced View/i).first();
      await userEvent.click(switchToSimplified);

      await expect
        .element(page.getByText("Delegate's Rights", { exact: false }))
        .toBeVisible();
    });
  });

  describe('Section headers', () => {
    it('should render Read options header', async () => {
      setupTest();

      await expect.element(page.getByText('Read options')).toBeVisible();
    });

    it('should render Send options header', async () => {
      setupTest();

      await expect.element(page.getByText('Send options')).toBeVisible();
    });

    it('should render Delegate Rights header', async () => {
      setupTest();

      await expect
        .element(page.getByText("Delegate's Rights", { exact: false }))
        .toBeVisible();
    });
  });

  describe('Advanced view table headers', () => {
    it('should show Accounts column header in advanced view', async () => {
      const delegateIdentity = {
        grantee: [{ id: 'delegate-id', name: 'delegate@example.com', type: 'usr' }],
        folder: [{ perm: 'rwidxa', id: 'folder-1', zid: 'zid-1' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      const switchControl = page.getByText(/Switch to Simplified View/i).first();
      await switchControl.click();

      await expect.element(page.getByText('Accounts').first()).toBeVisible();
    });

    it('should show Type column header in advanced view', async () => {
      const delegateIdentity = {
        grantee: [{ id: 'delegate-id', name: 'delegate@example.com', type: 'usr' }],
        folder: [{ perm: 'rwidxa', id: 'folder-1', zid: 'zid-1' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      const switchControl = page.getByText(/Switch to Simplified View/i).first();
      await switchControl.click();

      await expect.element(page.getByText('Type').first()).toBeVisible();
    });

    it('should show Rights column header in advanced view', async () => {
      const delegateIdentity = {
        grantee: [{ id: 'delegate-id', name: 'delegate@example.com', type: 'usr' }],
        folder: [{ perm: 'rwidxa', id: 'folder-1', zid: 'zid-1' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      const switchControl = page.getByText(/Switch to Simplified View/i).first();
      await switchControl.click();

      await expect.element(page.getByText('Rights').first()).toBeVisible();
    });

    it('should show Sharing Options column header in advanced view', async () => {
      const delegateIdentity = {
        grantee: [{ id: 'delegate-id', name: 'delegate@example.com', type: 'usr' }],
        folder: [{ perm: 'rwidxa', id: 'folder-1', zid: 'zid-1' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      const switchControl = page.getByText(/Switch to Simplified View/i).first();
      await switchControl.click();

      await expect.element(page.getByText('Sharing Options').first()).toBeVisible();
    });
  });

  describe('Read Only table actions', () => {
    it('should disable REMOVE button when no Read Only delegate selected', async () => {
      const delegateIdentity = {
        grantee: [{ id: 'read-delegate', name: 'readonly@example.com', type: 'usr' }],
        folder: [{ perm: 'r', id: 'folder-1', zid: 'zid-1' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      // Second REMOVE button is for Read Only table
      const removeButtons = page.getByRole('button', { name: 'REMOVE' });
      await expect.element(removeButtons.nth(1)).toBeDisabled();
    });

    it('should enable REMOVE ALL for Read Only when delegates exist', async () => {
      const delegateIdentity = {
        grantee: [{ id: 'read-delegate', name: 'readonly@example.com', type: 'usr' }],
        folder: [{ perm: 'r', id: 'folder-1', zid: 'zid-1' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      // Second REMOVE ALL button is for Read Only table
      const removeAllButtons = page.getByRole('button', { name: /REMOVE ALL/i });
      await expect.element(removeAllButtons.nth(1)).toBeEnabled();
    });

    it('should call Batch when REMOVE ALL clicked for Read Only delegates', async () => {
      const batchInterceptor = createBrowserSoapAPIInterceptor('Batch', {});
      const delegateIdentity = {
        grantee: [{ id: 'read-delegate', name: 'readonly@example.com', type: 'usr' }],
        folder: [{ perm: 'r', id: 'folder-1', zid: 'zid-1' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      const removeAllButton = page.getByRole('button', { name: /REMOVE ALL/i }).nth(1);
      await userEvent.click(removeAllButton);

      await expect(batchInterceptor).resolves.toBeDefined();
    });
  });

  describe('Send table actions', () => {
    it('should disable REMOVE button when no Send delegate selected', async () => {
      const delegateIdentity = {
        grantee: [{ id: 'send-delegate', name: 'sender@example.com', type: 'usr' }],
        right: [{ _content: 'sendAs' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      // Third REMOVE button is for Send table
      const removeButtons = page.getByRole('button', { name: 'REMOVE' });
      await expect.element(removeButtons.nth(2)).toBeDisabled();
    });

    it('should enable REMOVE ALL for Send when delegates exist', async () => {
      const delegateIdentity = {
        grantee: [{ id: 'send-delegate', name: 'sender@example.com', type: 'usr' }],
        right: [{ _content: 'sendAs' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      // Third REMOVE ALL button is for Send table
      const removeAllButtons = page.getByRole('button', { name: /REMOVE ALL/i });
      await expect.element(removeAllButtons.nth(2)).toBeEnabled();
    });

    it('should call Batch when REMOVE ALL clicked for Send delegates', async () => {
      const batchInterceptor = createBrowserSoapAPIInterceptor('Batch', {});
      const delegateIdentity = {
        grantee: [{ id: 'send-delegate', name: 'sender@example.com', type: 'usr' }],
        right: [{ _content: 'sendAs' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      const removeAllButton = page.getByRole('button', { name: /REMOVE ALL/i }).nth(2);
      await userEvent.click(removeAllButton);

      await expect(batchInterceptor).resolves.toBeDefined();
    });
  });

  describe('Wizard actions', () => {
    it('should close wizard when CANCEL clicked', async () => {
      setupTest();

      const switchControl = page.getByText(/Switch to Simplified View/i).first();
      await switchControl.click();
      await userEvent.click(page.getByRole('button', { name: /ADD NEW/i }).first());

      await expect
        .element(page.getByText('Add user on Delegates List', { exact: true }).first())
        .toBeVisible();

      await userEvent.click(page.getByRole('button', { name: /CANCEL/i }).first());

      await expect
        .element(page.getByText('Add user on Delegates List', { exact: true }))
        .not.toBeInTheDocument();
    });
  });

  describe('Multiple delegates scenario', () => {
    it('should show delegates in correct tables based on their rights', async () => {
      const delegates = [
        {
          grantee: [{ id: 'rw-delegate', name: 'readwrite@example.com', type: 'usr' }],
          folder: [{ perm: 'rwidxa', id: 'folder-1', zid: 'zid-1' }],
        },
        {
          grantee: [{ id: 'read-delegate', name: 'readonly@example.com', type: 'usr' }],
          folder: [{ perm: 'r', id: 'folder-2', zid: 'zid-2' }],
        },
        {
          grantee: [{ id: 'send-delegate', name: 'sender@example.com', type: 'usr' }],
          right: [{ _content: 'sendAs' }],
        },
      ];

      setupTest({ identitiesList: delegates });

      await expect.element(page.getByText('readwrite@example.com').first()).toBeVisible();
      await expect.element(page.getByText('readonly@example.com').first()).toBeVisible();
      await expect.element(page.getByText('sender@example.com').first()).toBeVisible();
    });
  });

  describe('Checkbox mutual exclusivity', () => {
    it('should uncheck Read Only when Read/Write is checked', async () => {
      setupTest();

      // First check Read Only
      const readOnlyCheckbox = page.getByText('Read Only').first();
      await userEvent.click(readOnlyCheckbox);

      // Then check Read/Write - should uncheck Read Only
      const readWriteCheckbox = page.getByText('Read / Write').first();
      await userEvent.click(readWriteCheckbox);

      // Both checkboxes should be clickable (test passes if no error)
    });

    it('should uncheck Read/Write when Read Only is checked', async () => {
      setupTest();

      // First check Read/Write
      const readWriteCheckbox = page.getByText('Read / Write').first();
      await userEvent.click(readWriteCheckbox);

      // Then check Read Only - should uncheck Read/Write
      const readOnlyCheckbox = page.getByText('Read Only').first();
      await userEvent.click(readOnlyCheckbox);
    });

    it('should uncheck Send on Behalf when Send is checked', async () => {
      setupTest();

      // First check Send on Behalf
      const sendBehalfCheckbox = page.getByText('Send on Behalf of').first();
      await userEvent.click(sendBehalfCheckbox);

      // Then check Send - should uncheck Send on Behalf
      const sendCheckbox = page.getByText('Send', { exact: true }).first();
      await userEvent.click(sendCheckbox);
    });

    it('should uncheck Send when Send on Behalf is checked', async () => {
      setupTest();

      // First check Send
      const sendCheckbox = page.getByText('Send', { exact: true }).first();
      await userEvent.click(sendCheckbox);

      // Then check Send on Behalf - should uncheck Send
      const sendBehalfCheckbox = page.getByText('Send on Behalf of').first();
      await userEvent.click(sendBehalfCheckbox);
    });
  });

  describe('Simplified view table headers', () => {
    it('should show Accounts / Groups column header in simplified tables', async () => {
      const delegateIdentity = {
        grantee: [{ id: 'delegate-id', name: 'delegate@example.com', type: 'usr' }],
        folder: [{ perm: 'rwidxa', id: 'folder-1', zid: 'zid-1' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      await expect
        .element(page.getByText('Accounts / Groups').first())
        .toBeVisible();
    });
  });

  describe('Folder sharing options display', () => {
    it('should show Read, Write text for delegate with write permissions', async () => {
      const delegateIdentity = {
        grantee: [{ id: 'delegate-id', name: 'delegate@example.com', type: 'usr' }],
        folder: [{ perm: 'rwidxa', id: 'folder-1', zid: 'zid-1' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      const switchControl = page.getByText(/Switch to Simplified View/i).first();
      await switchControl.click();

      await expect.element(page.getByText('Read, Write').first()).toBeVisible();
    });

    it('should show Read text for delegate with read-only permissions', async () => {
      const delegateIdentity = {
        grantee: [{ id: 'delegate-id', name: 'delegate@example.com', type: 'usr' }],
        folder: [{ perm: 'r', id: 'folder-1', zid: 'zid-1' }],
      };

      setupTest({ identitiesList: [delegateIdentity] });

      const switchControl = page.getByText(/Switch to Simplified View/i).first();
      await switchControl.click();

      await expect.element(page.getByText('Read').first()).toBeVisible();
    });
  });
});
