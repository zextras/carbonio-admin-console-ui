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
import { EditDistributionList } from '../edit-distribution-list/edit-distribution-list';

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
          { n: 'displayName', _content: DL_DISPLAY_NAME },
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
  createBrowserSoapAPIInterceptor('GetGrants', {
    grant: [
      {
        right: [{ _content: 'ownDistList' }],
        grantee: [{ id: 'owner-1', name: 'owner@example.com', type: 'usr' }],
      },
      {
        right: [{ _content: 'sendAsDistList' }],
        grantee: [{ id: 'send-1', name: 'sender@example.com', type: 'usr' }],
      },
    ],
  });
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

async function expectHeaderSaveCancelVisible(): Promise<void> {
  await expect
    .element(page.getByRole('button', { name: 'Save', exact: true }))
    .toBeInTheDocument();
  await expect
    .element(page.getByRole('button', { name: 'Cancel', exact: true }))
    .toBeInTheDocument();
}

async function expectHeaderSaveCancelHidden(): Promise<void> {
  await expect
    .element(page.getByRole('button', { name: 'Save', exact: true }))
    .not.toBeInTheDocument();
  await expect
    .element(page.getByRole('button', { name: 'Cancel', exact: true }))
    .not.toBeInTheDocument();
}

async function expectHeaderDeleteVisible(): Promise<void> {
  await expect
    .element(page.getByRole('button', { name: 'delete', exact: true }))
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

    it('keeps the updated display name after save when the detail query refetches', async () => {
      let detailDisplayName = DL_DISPLAY_NAME;
      await setupEditView();
      worker.use(
        http.post('/service/admin/soap/ModifyDistributionListRequest', () => {
          detailDisplayName = 'Team List Updated';
          return HttpResponse.json({ Body: { ModifyDistributionListResponse: {} } });
        }),
        http.post('/service/admin/soap/GetDistributionListRequest', () =>
          HttpResponse.json({
            Body: {
              GetDistributionListResponse: {
                dl: [
                  {
                    id: DL_ID,
                    dlm: [{ _content: 'user1@example.com' }, { _content: 'user2@example.com' }],
                    a: [
                      { n: 'displayName', _content: detailDisplayName },
                      { n: 'zimbraHideInGal', _content: 'FALSE' },
                      { n: 'zimbraNotes', _content: '' },
                      { n: 'description', _content: 'Team mailing list' },
                      { n: 'zimbraMailStatus', _content: 'enabled' },
                      { n: 'zimbraMailAlias', _content: DL_EMAIL },
                      { n: 'zimbraMailAlias', _content: 'alias1@example.com' },
                    ],
                  },
                ],
              },
            },
          }),
        ),
      );
      await waitForLoad();
      await makeDirty();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect
        .element(page.getByText('The changes have been saved'))
        .toBeInTheDocument();
      await expect
        .element(page.getByLabelText('Display Name'))
        .toHaveValue('Team List Updated');
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

    it('shows the total grant rights warning when the list has rights', async () => {
      await setupEditView();
      await waitForLoad();
      await page.getByRole('button', { name: 'delete' }).click();
      await expect
        .element(page.getByText(/shared accounts rights/))
        .toBeInTheDocument();
      await expect.element(page.getByText('4')).toBeInTheDocument();
    });

    it('does not open the delete dialog when the rights count request fails', async () => {
      await setupEditView();
      worker.use(
        http.post('/service/admin/soap/GetGrantsRequest', async ({ request }) => {
          const body = (await request.json()) as {
            Body?: { GetGrantsRequest?: { grantee?: unknown } };
          };
          if (body?.Body?.GetGrantsRequest?.grantee) {
            return new HttpResponse(null, { status: 500 });
          }
          return HttpResponse.json({
            Body: {
              GetGrantsResponse: {
                grant: [{ right: [{ _content: 'sendAsDistList' }] }],
              },
            },
          });
        }),
      );
      await waitForLoad();
      await page.getByRole('button', { name: 'delete' }).click();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await expect
        .element(page.getByText('You are deleting Team List'))
        .not.toBeInTheDocument();
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
      await expect.element(page.getByText('owner@example.com')).toBeInTheDocument();
      await userEvent.type(
        page.getByLabelText('Add owners by email address'),
        'newowner@example.com',
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

    it('removes an existing owner after confirmation', async () => {
      const removeAction = createBrowserSoapAPIInterceptor('DistributionListAction', {});
      await setupEditView();
      await waitForLoad();
      await page.getByText('OWNERS', { exact: true }).click();
      await expect.element(page.getByText('owner@example.com')).toBeInTheDocument();
      await page.getByRole('button', { name: 'Delete', exact: true }).click();
      await expect
        .element(page.getByText('Are you sure you want to remove owner@example.com'))
        .toBeInTheDocument();
      await page.getByRole('button', { name: 'YES, REMOVE IT' }).click();
      const params = (await removeAction) as { action: Record<string, unknown> };
      expect(params.action).toMatchObject({ op: 'removeOwners' });
      await expect.element(page.getByText('owner@example.com')).not.toBeInTheDocument();
    });
  });

  describe('Send-as tab interactions', () => {
    it('removes an authorized sender after confirmation', async () => {
      const revokeAction = createBrowserSoapAPIInterceptor('DistributionListAction', {});
      await setupEditView();
      await waitForLoad();
      await page.getByText('SEND AS', { exact: true }).click();
      await expect.element(page.getByText('sender@example.com')).toBeInTheDocument();
      await page.getByRole('button', { name: 'Delete', exact: true }).click();
      await expect
        .element(page.getByText('Are you sure you want to remove sender@example.com'))
        .toBeInTheDocument();
      await page.getByRole('button', { name: 'YES, REMOVE IT' }).click();
      const params = (await revokeAction) as { action: Record<string, unknown> };
      expect(params.action).toMatchObject({ op: 'revokeRights' });
      await expect.element(page.getByText('sender@example.com')).not.toBeInTheDocument();
    });

    it('edits the permission level of an authorized sender', async () => {
      type DistributionListActionRequest = {
        Body?: { DistributionListActionRequest?: { action?: Record<string, unknown> } };
      };
      const actions: Array<Record<string, unknown>> = [];
      worker.use(
        http.post('/service/admin/soap/DistributionListActionRequest', async ({ request }) => {
          const body = (await request.json()) as DistributionListActionRequest;
          actions.push(body?.Body?.DistributionListActionRequest?.action ?? {});
          return HttpResponse.json({ Body: { DistributionListActionResponse: {} } });
        }),
      );
      await setupEditView();
      await waitForLoad();
      await page.getByText('SEND AS', { exact: true }).click();
      await expect.element(page.getByText('sender@example.com')).toBeInTheDocument();
      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      await expect.element(page.getByText('Edit permission level')).toBeInTheDocument();
      await page.getByTestId('modal').getByText('Send on behalf of', { exact: true }).click();
      await page.getByRole('button', { name: 'SAVE CHANGES' }).click();
      await expect
        .element(page.getByText('Permission level has been updated successfully'))
        .toBeInTheDocument();
      // the edit flow revokes the old right first, then grants the new one
      expect(actions).toHaveLength(2);
      expect(actions[0]).toMatchObject({
        op: 'revokeRights',
        right: { right: 'sendAsDistList' },
      });
      expect(actions[1]).toMatchObject({
        op: 'grantRights',
        right: { right: 'sendOnBehalfOfDistList' },
      });
    }, 20_000);

    it('adds an authorized sender with the selected permission level', async () => {
      const grantAction = createBrowserSoapAPIInterceptor('DistributionListAction', {});
      await setupEditView();
      await waitForLoad();
      await page.getByText('SEND AS', { exact: true }).click();
      await page.getByText('Send on behalf of', { exact: true }).click();
      await userEvent.type(
        page.getByLabelText('Add senders by email address'),
        'as-new@example.com',
      );
      await page.getByRole('button', { name: 'ADD ACCOUNT' }).click();
      const params = (await grantAction) as { action: Record<string, unknown> };
      expect(params.action).toMatchObject({
        op: 'grantRights',
        right: {
          right: 'sendOnBehalfOfDistList',
          grantee: { _content: 'as-new@example.com' },
        },
      });
      await expect.element(page.getByText('as-new@example.com')).toBeInTheDocument();
    });
  });

  describe('Send-to tab interactions', () => {
    it('adds and removes senders when only these users is selected', async () => {
      await setupEditView();
      await waitForLoad();
      await page.getByText('SEND TO', { exact: true }).click();
      await page.getByText('Everyone').click();
      await page.getByText('Only these users').click();
      await userEvent.type(
        page.getByLabelText('Add senders by email address'),
        'to-new@example.com',
      );
      await page.getByRole('button', { name: 'ADD ACCOUNT' }).click();
      await expect.element(page.getByText('to-new@example.com')).toBeInTheDocument();
      await page.getByRole('button', { name: 'Delete', exact: true }).click();
      await expect.element(page.getByText('to-new@example.com')).not.toBeInTheDocument();
    });
  });

  describe('Send-as tab validation', () => {
    it('shows the blank email error when adding without typing an email', async () => {
      await setupEditView();
      await waitForLoad();
      await page.getByText('SEND AS', { exact: true }).click();
      await page.getByRole('button', { name: 'ADD ACCOUNT' }).click();
      await expect
        .element(page.getByText('Please enter at least one email address'))
        .toBeInTheDocument();
    });

    it('shows the invalid email error for a malformed address', async () => {
      await setupEditView();
      await waitForLoad();
      await page.getByText('SEND AS', { exact: true }).click();
      await userEvent.type(page.getByLabelText('Add senders by email address'), 'not-an-email');
      await page.getByRole('button', { name: 'ADD ACCOUNT' }).click();
      await expect
        .element(
          page.getByText('The account does not exist. Please check the spelling and try again.'),
        )
        .toBeInTheDocument();
    });

    it('shows the already-in-list error for an existing sender', async () => {
      await setupEditView();
      await waitForLoad();
      await page.getByText('SEND AS', { exact: true }).click();
      await userEvent.type(
        page.getByLabelText('Add senders by email address'),
        'sender@example.com',
      );
      await page.getByRole('button', { name: 'ADD ACCOUNT' }).click();
      await expect
        .element(page.getByText('The Distribution List / User is already in the list'))
        .toBeInTheDocument();
    });
  });

  describe('Send-as tab table', () => {
    it('filters the authorized senders by the search input', async () => {
      await setupEditView();
      await waitForLoad();
      await page.getByText('SEND AS', { exact: true }).click();
      await expect.element(page.getByText('sender@example.com')).toBeInTheDocument();
      await userEvent.type(page.getByLabelText('Search senders'), 'nomatch');
      await expect.element(page.getByText('sender@example.com')).not.toBeInTheDocument();
      await userEvent.clear(page.getByLabelText('Search senders'));
      await userEvent.type(page.getByLabelText('Search senders'), 'sender');
      await expect.element(page.getByText('sender@example.com')).toBeInTheDocument();
    });

    it('selects a sender row when its address is clicked', async () => {
      await setupEditView();
      await waitForLoad();
      await page.getByText('SEND AS', { exact: true }).click();
      await page.getByText('sender@example.com', { exact: true }).click();
      // the permission-level cell of the row is the last 'Send As' text on the tab
      await page.getByText('Send As', { exact: true }).last().click();
      await expect.element(page.getByText('sender@example.com')).toBeInTheDocument();
    });
  });

  describe('Send-as tab empty state', () => {
    it('shows the empty state when the list has no authorized senders', async () => {
      createBrowserSoapAPIInterceptor('GetDistributionList', {
        dl: [
          {
            id: DL_ID,
            name: DL_EMAIL,
            dlm: [{ _content: 'user1@example.com' }],
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
      createBrowserSoapAPIInterceptor('GetGrants', {
        grant: [
          {
            right: [{ _content: 'ownDistList' }],
            grantee: [{ id: 'owner-1', name: 'owner@example.com', type: 'usr' }],
          },
        ],
      });
      createBrowserSoapAPIInterceptor('GetDomain', {
        domain: [
          { id: DOMAIN_ID, name: DOMAIN_NAME, a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }] },
        ],
      });
      const queryClient = getQueryClient();
      queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
        id: DOMAIN_ID,
        name: DOMAIN_NAME,
        a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
      });
      queryClient.setQueryData(domainQueryKeys.list(), [
        { name: DOMAIN_NAME, id: DOMAIN_ID, a: [] },
      ]);
      await _setupBrowserTest(
        <EditDistributionList
          selectedMailingList={SELECTED_MAILING_LIST}
          setShowMailingListDetailView={vi.fn()}
        />,
        {
          queryClient,
          withDomainIdRoute: true,
          initialRouterEntry: `/${DOMAIN_ID}`,
        },
      );
      await waitForLoad();
      await page.getByText('SEND AS', { exact: true }).click();
      await expect
        .element(page.getByText("There aren't members here."))
        .toBeInTheDocument();
      await expect
        .element(page.getByText('Search for a user and click on the ADD button.'))
        .toBeInTheDocument();
    });
  });

  describe('Send-as tab failures', () => {
    it('shows an error snackbar when granting a sender fails with a fault', async () => {
      createBrowserSoapAPIInterceptor('DistributionListAction', {
        Fault: { Reason: { Text: 'Grant failed' } },
      });
      await setupEditView();
      await waitForLoad();
      await page.getByText('SEND AS', { exact: true }).click();
      await userEvent.type(page.getByLabelText('Add senders by email address'), 'as-new@example.com');
      await page.getByRole('button', { name: 'ADD ACCOUNT' }).click();
      await expect.element(page.getByText('Grant failed')).toBeInTheDocument();
      await expect.element(page.getByText('as-new@example.com')).not.toBeInTheDocument();
    });

    it('shows an error snackbar when the grant request rejects', async () => {
      worker.use(
        http.post('/service/admin/soap/DistributionListActionRequest', () =>
          HttpResponse.json(
            { Body: { Fault: { Reason: { Text: 'Network error' } } } },
            { status: 500 },
          ),
        ),
      );
      await setupEditView();
      await waitForLoad();
      await page.getByText('SEND AS', { exact: true }).click();
      await userEvent.type(page.getByLabelText('Add senders by email address'), 'as-new@example.com');
      await page.getByRole('button', { name: 'ADD ACCOUNT' }).click();
      await expect.element(page.getByText('Network error')).toBeInTheDocument();
      await expect.element(page.getByText('as-new@example.com')).not.toBeInTheDocument();
    });

    it('closes the edit modal without requests when the permission is unchanged', async () => {
      let actionRequested = false;
      createBrowserSoapAPIInterceptor('DistributionListAction', {}).then((params) => {
        actionRequested = true;
        return params;
      });
      await setupEditView();
      await waitForLoad();
      await page.getByText('SEND AS', { exact: true }).click();
      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      await expect.element(page.getByText('Edit permission level')).toBeInTheDocument();
      await page.getByRole('button', { name: 'SAVE CHANGES' }).click();
      await expect.element(page.getByText('Edit permission level')).not.toBeInTheDocument();
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(actionRequested).toBe(false);
    });
  });

  describe('Header Save/Cancel visibility', () => {
    it('does not show Save/Cancel after removing a member and keeps Delete visible', async () => {
      createBrowserSoapAPIInterceptor('RemoveDistributionListMember', {});
      await setupEditView();
      await waitForLoad();
      await page.getByText('MEMBERS', { exact: true }).click();
      await page.getByRole('button', { name: 'Delete', exact: true }).first().click();
      await page.getByRole('button', { name: 'YES, REMOVE IT' }).click();
      await expect.element(page.getByText('user1@example.com')).not.toBeInTheDocument();
      await expectHeaderSaveCancelHidden();
      await expectHeaderDeleteVisible();
    });

    it('does not show Save/Cancel after adding an owner', async () => {
      createBrowserSoapAPIInterceptor('DistributionListAction', {});
      createBrowserSoapAPIInterceptor('SearchGal', {
        cn: [{ id: 'gal-1', _attrs: { email: 'newowner@example.com', type: 'account' } }],
      });
      await setupEditView();
      await waitForLoad();
      await page.getByText('OWNERS', { exact: true }).click();
      await userEvent.type(
        page.getByLabelText('Add owners by email address'),
        'newowner@example.com',
      );
      await new Promise((resolve) => setTimeout(resolve, 900));
      await page.getByRole('button', { name: 'Add Owners' }).click();
      await expect
        .element(page.getByText('Owner has been added successfully'))
        .toBeInTheDocument();
      await expectHeaderSaveCancelHidden();
      await expectHeaderDeleteVisible();
    });

    it('does not show Save/Cancel after removing an authorized sender', async () => {
      createBrowserSoapAPIInterceptor('DistributionListAction', {});
      await setupEditView();
      await waitForLoad();
      await page.getByText('SEND AS', { exact: true }).click();
      await page.getByRole('button', { name: 'Delete', exact: true }).click();
      await page.getByRole('button', { name: 'YES, REMOVE IT' }).click();
      await expect.element(page.getByText('sender@example.com')).not.toBeInTheDocument();
      await expectHeaderSaveCancelHidden();
      await expectHeaderDeleteVisible();
    });

    it('shows Save/Cancel on the general tab when deferred fields are dirty', async () => {
      await setupEditView();
      await waitForLoad();
      await makeDirty();
      await expectHeaderSaveCancelVisible();
    });

    it('shows Save/Cancel on the send-to tab when the grant type changes', async () => {
      await setupEditView();
      await waitForLoad();
      await page.getByText('SEND TO', { exact: true }).click();
      await page.getByText('Everyone').click();
      await page.getByText('Members only').click();
      await expectHeaderSaveCancelVisible();
    });
  });
});
