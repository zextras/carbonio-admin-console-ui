/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import {
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  setupBrowserTest as _setupBrowserTest,
  worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { domainQueryKeys } from '../../../../services/domain-query-keys';
import EditDistributionList from '../edit-distribution-list/edit-distribution-list';

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';
const DL_ID = 'dl-1';
const DL_EMAIL = 'team@example.com';
const DL_DISPLAY_NAME = 'Team List';

const SELECTED_MAILING_LIST = {
  id: DL_ID,
  name: DL_EMAIL,
  dynamic: false,
  a: [{ n: 'displayName', _content: DL_DISPLAY_NAME }],
};

type EditViewSetup = {
  setShowMailingListDetailView: ReturnType<typeof vi.fn>;
};

async function setupEditView(): Promise<EditViewSetup> {
  createBrowserSoapAPIInterceptor('GetDistributionList', {
    dl: [
      {
        id: DL_ID,
        name: DL_EMAIL,
        dlm: [{ _content: 'user1@example.com' }, { _content: 'user2@example.com' }],
        a: [
          { n: 'zimbraHideInGal', _content: 'FALSE' },
          { n: 'zimbraNotes', _content: '' },
          { n: 'description', _content: 'Team mailing list' },
          { n: 'zimbraMailStatus', _content: 'enabled' },
          { n: 'zimbraMailAlias', _content: DL_EMAIL },
          { n: 'zimbraMailAlias', _content: 'alias1@example.com' },
        ],
      },
    ],
  });
  createBrowserSoapAPIInterceptor('GetDistributionListMembership', {
    dl: [{ id: 'dl-2', name: 'other@example.com' }],
  });
  createBrowserSoapAPIInterceptor('GetGrants', { grant: [] });
  // resolves ManageAliases' useDomainById query (suffix for new aliases)
  createBrowserSoapAPIInterceptor('GetDomain', {
    domain: [{ id: DOMAIN_ID, name: DOMAIN_NAME, a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }] }],
  });

  const queryClient = getQueryClient();
  queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
    id: DOMAIN_ID,
    name: DOMAIN_NAME,
    a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
  });
  queryClient.setQueryData(domainQueryKeys.list(), [{ name: DOMAIN_NAME, id: DOMAIN_ID, a: [] }]);

  const setShowMailingListDetailView = vi.fn();
  const ui: ReactElement = (
    <EditDistributionList
      selectedMailingList={SELECTED_MAILING_LIST}
      setShowMailingListDetailView={setShowMailingListDetailView}
    />
  );
  await _setupBrowserTest(ui, {
    queryClient,
    withDomainIdRoute: true,
    initialRouterEntry: `/${DOMAIN_ID}`,
  });
  return { setShowMailingListDetailView };
}

/** Waits until the cached detail is applied to the form (alias chip shows). */
async function waitForLoad(): Promise<void> {
  await expect.element(page.getByText('alias1@example.com')).toBeInTheDocument();
}

async function makeDirty(): Promise<void> {
  await userEvent.clear(page.getByLabelText('Display Name'));
  await userEvent.type(page.getByLabelText('Display Name'), 'Team List Updated');
  await expect
    .element(page.getByRole('button', { name: 'Save', exact: true }))
    .toBeInTheDocument();
}

describe('EditDistributionList (browser)', () => {
  describe('Rendering', () => {
    it('renders the header with the list address and type', async () => {
      await setupEditView();
      await waitForLoad();
      await expect.element(page.getByText(/team@example.com/)).toBeInTheDocument();
      await expect.element(page.getByText(/Standard/)).toBeInTheDocument();
    });

    it('renders the five edit tabs', async () => {
      await setupEditView();
      await waitForLoad();
      await expect.element(page.getByText('GENERAL', { exact: true })).toBeInTheDocument();
      await expect.element(page.getByText('MEMBERS', { exact: true })).toBeInTheDocument();
      await expect.element(page.getByText('OWNERS', { exact: true })).toBeInTheDocument();
      await expect.element(page.getByText('SEND AS', { exact: true })).toBeInTheDocument();
      await expect.element(page.getByText('SEND TO', { exact: true })).toBeInTheDocument();
    });

    it('renders general tab fields from the loaded list', async () => {
      await setupEditView();
      await waitForLoad();
      await expect.element(page.getByLabelText('Display Name')).toHaveValue(DL_DISPLAY_NAME);
      await expect.element(page.getByLabelText('Address')).toHaveValue(DL_EMAIL);
    });
  });

  describe('Tab navigation', () => {
    it('switches to the members tab and shows the members table', async () => {
      await setupEditView();
      await waitForLoad();
      await page.getByText('MEMBERS', { exact: true }).click();
      await expect.element(page.getByText('user1@example.com')).toBeInTheDocument();
      await expect.element(page.getByText('user2@example.com')).toBeInTheDocument();
    });

    it('switches to the owners tab and shows the add-owners input', async () => {
      await setupEditView();
      await waitForLoad();
      await page.getByText('OWNERS', { exact: true }).click();
      await expect
        .element(page.getByRole('button', { name: 'Add Owners' }))
        .toBeInTheDocument();
    });

    it('switches to the send-as tab and shows the permission level radios', async () => {
      await setupEditView();
      await waitForLoad();
      await page.getByText('SEND AS', { exact: true }).click();
      await expect
        .element(page.getByText('Send on behalf of', { exact: true }))
        .toBeInTheDocument();
    });

    it('switches to the send-to tab and shows the default grant type', async () => {
      await setupEditView();
      await waitForLoad();
      await page.getByText('SEND TO', { exact: true }).click();
      await expect.element(page.getByText('Everyone')).toBeInTheDocument();
    });
  });

  describe('Dirty guard', () => {
    it('shows the unsaved-changes modal when leaving a dirty general tab', async () => {
      await setupEditView();
      await waitForLoad();
      await makeDirty();
      await page.getByText('MEMBERS', { exact: true }).click();
      await expect.element(page.getByText('Unsaved Changes')).toBeInTheDocument();
      await expect
        .element(page.getByRole('button', { name: 'Exit without Save' }))
        .toBeInTheDocument();
      await expect
        .element(page.getByRole('button', { name: 'Save & Exit' }))
        .toBeInTheDocument();
    });

    it('Exit without Save discards the change and switches tab', async () => {
      await setupEditView();
      await waitForLoad();
      await makeDirty();
      await page.getByText('MEMBERS', { exact: true }).click();
      await page.getByRole('button', { name: 'Exit without Save' }).click();
      await expect.element(page.getByText('user1@example.com')).toBeInTheDocument();
      await page.getByText('GENERAL', { exact: true }).click();
      await expect.element(page.getByLabelText('Display Name')).toHaveValue(DL_DISPLAY_NAME);
    });

    it('Save & Exit persists the change and switches tab', async () => {
      const modify = createBrowserSoapAPIInterceptor('ModifyDistributionList', {});
      await setupEditView();
      await waitForLoad();
      await makeDirty();
      await page.getByText('MEMBERS', { exact: true }).click();
      await page.getByRole('button', { name: 'Save & Exit' }).click();
      const params = (await modify) as { a: Array<{ n: string; _content: string }> };
      expect(params.a).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ n: 'displayName', _content: 'Team List Updated' }),
        ]),
      );
      await expect.element(page.getByText('user1@example.com')).toBeInTheDocument();
    });
  });

  describe('Save', () => {
    it('sends RenameDistributionList when the address changes', async () => {
      const rename = createBrowserSoapAPIInterceptor('RenameDistributionList', {});
      await setupEditView();
      await waitForLoad();
      await userEvent.clear(page.getByLabelText('Address'));
      await userEvent.type(page.getByLabelText('Address'), 'newteam@example.com');
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      const params = await rename;
      expect(params).toMatchObject({ id: DL_ID, newName: 'newteam@example.com' });
      await expect
        .element(page.getByText('The changes have been saved'))
        .toBeInTheDocument();
    });

    it('adds a new alias and sends AddDistributionListAlias on save', async () => {
      const addAlias = createBrowserSoapAPIInterceptor('AddDistributionListAlias', {});
      await setupEditView();
      await waitForLoad();
      await page.getByRole('button', { name: 'MANAGE ALIAS' }).click();
      await userEvent.type(page.getByLabelText('New Alias Name'), 'alias2');
      await page.getByTestId('icon: PlusOutline').click();
      await expect
        .element(page.getByTestId('modal').getByText('alias2@example.com'))
        .toBeInTheDocument();
      await page.getByTestId('modal').getByTestId('icon: Close').first().click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      const params = await addAlias;
      expect(params).toMatchObject({ id: DL_ID, alias: 'alias2@example.com' });
    });

    it('removes an existing alias and sends RemoveDistributionListAlias on save', async () => {
      const removeAlias = createBrowserSoapAPIInterceptor('RemoveDistributionListAlias', {});
      await setupEditView();
      await waitForLoad();
      await page.getByRole('button', { name: 'MANAGE ALIAS' }).click();
      // the modal header close renders first; the chip close is the last one
      await page.getByTestId('modal').getByTestId('icon: Close').last().click();
      await page.getByTestId('modal').getByTestId('icon: Close').first().click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      const params = await removeAlias;
      expect(params).toMatchObject({ id: DL_ID, alias: 'alias1@example.com' });
    });

    it('shows an error snackbar when the save request fails', async () => {
      worker.use(
        http.post('/service/admin/soap/ModifyDistributionListRequest', () =>
          HttpResponse.json(
            { Body: { Fault: { Reason: { Text: 'Server error' } } } },
            { status: 500 },
          ),
        ),
      );
      await setupEditView();
      await waitForLoad();
      await makeDirty();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect.element(page.getByText('Server error')).toBeInTheDocument();
    });
  });

  describe('Delete', () => {
    it('confirms deletion, deletes the list and closes the detail view', async () => {
      const remove = createBrowserSoapAPIInterceptor('DeleteDistributionList', {});
      const { setShowMailingListDetailView } = await setupEditView();
      await waitForLoad();
      await page.getByRole('button', { name: 'delete' }).click();
      await expect
        .element(page.getByText('You are deleting Team List'))
        .toBeInTheDocument();
      await page.getByRole('button', { name: 'Yes, Delete it' }).click();
      const params = await remove;
      expect(params).toMatchObject({ id: { _content: DL_ID } });
      await expect
        .element(page.getByText('team@example.com has been deleted successfully'))
        .toBeInTheDocument();
      expect(setShowMailingListDetailView).toHaveBeenCalledWith(false);
    });

    it('closes the delete modal without deleting when cancelled', async () => {
      let deleteRequested = false;
      createBrowserSoapAPIInterceptor('DeleteDistributionList', {}).then((params) => {
        deleteRequested = true;
        return params;
      });
      await setupEditView();
      await waitForLoad();
      await page.getByRole('button', { name: 'delete' }).click();
      await expect
        .element(page.getByText('You are deleting Team List'))
        .toBeInTheDocument();
      await page.getByRole('button', { name: 'Cancel', exact: true }).click();
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(deleteRequested).toBe(false);
    });
  });

  describe('Close', () => {
    it('closes the detail view via the close icon', async () => {
      const { setShowMailingListDetailView } = await setupEditView();
      await waitForLoad();
      await page.getByTestId('icon: CloseOutline').click();
      expect(setShowMailingListDetailView).toHaveBeenCalledWith(false);
    });
  });

  describe('Members tab interactions', () => {
    it('adds a member by typed email', async () => {
      const addMember = createBrowserSoapAPIInterceptor('AddDistributionListMember', {});
      await setupEditView();
      await waitForLoad();
      await page.getByText('MEMBERS', { exact: true }).click();
      await userEvent.type(
        page.getByLabelText('Type the Accounts or paste them here'),
        'user3@example.com',
      );
      await page.getByRole('button', { name: 'Add Members' }).click();
      const params = await addMember;
      expect(params).toMatchObject({
        id: { n: 'id', _content: DL_ID },
        dlm: { n: 'dlm', _content: 'user3@example.com' },
      });
      await expect.element(page.getByText('user3@example.com')).toBeInTheDocument();
    });

    it('removes a member after confirmation', async () => {
      const removeMember = createBrowserSoapAPIInterceptor('RemoveDistributionListMember', {});
      await setupEditView();
      await waitForLoad();
      await page.getByText('MEMBERS', { exact: true }).click();
      await page.getByRole('button', { name: 'Delete', exact: true }).first().click();
      await page.getByRole('button', { name: 'YES, REMOVE IT' }).click();
      const params = await removeMember;
      expect(params).toMatchObject({
        id: { n: 'id', _content: DL_ID },
        dlm: { n: 'dlm', _content: 'user1@example.com' },
      });
      await expect.element(page.getByText('user1@example.com')).not.toBeInTheDocument();
    });
  });

  describe('Owners tab interactions', () => {
    it('adds an owner found via GAL search', async () => {
      const addAction = createBrowserSoapAPIInterceptor('DistributionListAction', {});
      createBrowserSoapAPIInterceptor('SearchGal', {
        cn: [{ id: 'gal-1', _attrs: { email: 'owner@example.com', type: 'account' } }],
      });
      await setupEditView();
      await waitForLoad();
      await page.getByText('OWNERS', { exact: true }).click();
      await userEvent.type(
        page.getByLabelText('Add owners by email address'),
        'owner@example.com',
      );
      // allow the debounced GAL search to run, then add the typed email
      await new Promise((resolve) => setTimeout(resolve, 900));
      await page.getByRole('button', { name: 'Add Owners' }).click();
      const params = (await addAction) as { action: Record<string, unknown> };
      expect(params.action).toMatchObject({ op: 'addOwners' });
      await expect
        .element(page.getByText('Owner has been added successfully'))
        .toBeInTheDocument();
    });
  });
});
