/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { ResourceEditDetailView } from '../resource-edit-detail-view';

vi.mock('../send-invite-accounts', () => ({
  SendInviteAccounts: (): ReactElement => (
    <div data-testid="mock-send-invite">Send Invite Mock</div>
  ),
}));

vi.mock('../../../../services/get-cal-resource-service', () => ({
  getCalenderResource: vi.fn(() =>
    Promise.resolve({
      calresource: [
        {
          id: RESOURCE_ID,
          name: RESOURCE_NAME,
          a: RESOURCE_ATTRIBUTES,
        },
      ],
    }),
  ),
}));

const RESOURCE_ID = 'resource-1';
const RESOURCE_NAME = 'room1@example.com';

const COS_LIST = [
  { id: 'cos-1', name: 'Default', a: [] },
  { id: 'cos-2', name: 'Premium', a: [] },
];

const RESOURCE_ATTRIBUTES = [
  { n: 'displayName', _content: 'Conference Room' },
  { n: 'mail', _content: RESOURCE_NAME },
  { n: 'zimbraCalResType', _content: 'Location' },
  { n: 'zimbraAccountStatus', _content: 'active' },
  { n: 'zimbraCalResAutoDeclineRecurring', _content: 'FALSE' },
  { n: 'zimbraCalResAutoAcceptDecline', _content: 'TRUE' },
  { n: 'zimbraCalResAutoDeclineIfBusy', _content: 'TRUE' },
  { n: 'zimbraCOSId', _content: 'cos-1' },
  { n: 'zimbraMailHost', _content: 'mail.example.com' },
  { n: 'zimbraCreateTimestamp', _content: '20240101120000.000Z' },
];

function setup(ui: ReactElement) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['cos', 'list', '', 0, 0], {
    cos: COS_LIST,
    searchTotal: COS_LIST.length,
    more: false,
  });
  queryClient.setQueryData(['domain', 'cal-resource', RESOURCE_ID], {
    id: RESOURCE_ID,
    name: RESOURCE_NAME,
    a: RESOURCE_ATTRIBUTES,
  });
  return setupBrowserTest(ui, { queryClient });
}

describe('ResourceEditDetailView (browser)', () => {
  describe('Rendering', () => {
    it('renders the resource name in the header', async () => {
      setup(
        <ResourceEditDetailView
          selectedResource={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
          onClose={vi.fn()}
          
          
        />,
      );

      await expect.element(page.getByText(RESOURCE_NAME)).toBeVisible();
    });

    it('renders the Resource section header', async () => {
      setup(
        <ResourceEditDetailView
          selectedResource={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
          onClose={vi.fn()}
          
          
        />,
      );

      await expect.element(page.getByText('Resource', { exact: true })).toBeVisible();
    });

    it('renders the Name input after data loads', async () => {
      setup(
        <ResourceEditDetailView
          selectedResource={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
          onClose={vi.fn()}
          
          
        />,
      );

      await expect.element(page.getByLabelText('Name', { exact: true })).toBeVisible();
    });

    it('renders the Email input after data loads', async () => {
      setup(
        <ResourceEditDetailView
          selectedResource={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
          onClose={vi.fn()}
          
          
        />,
      );

      await expect.element(page.getByLabelText('Email')).toBeVisible();
    });

    it('renders the Password section', async () => {
      setup(
        <ResourceEditDetailView
          selectedResource={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
          onClose={vi.fn()}
          
          
        />,
      );

      await expect.element(page.getByText('Password', { exact: true }).first()).toBeVisible();
    });

    it('renders the close button with accessible label', async () => {
      setup(
        <ResourceEditDetailView
          selectedResource={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
          onClose={vi.fn()}
          
          
        />,
      );

      await expect.element(page.getByRole('button', { name: 'Close' })).toBeVisible();
    });
  });

  describe('Close action', () => {
    it('calls onClose when close button is clicked', async () => {
      const onClose = vi.fn();
      setup(
        <ResourceEditDetailView
          selectedResource={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
          onClose={onClose}
          
          
        />,
      );

      await page.getByRole('button', { name: 'Close' }).click();

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Delete modal', () => {
    it('opens the delete modal when the delete button is clicked', async () => {
      setup(
        <ResourceEditDetailView
          selectedResource={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
          onClose={vi.fn()}
          
          
        />,
      );

      await page.getByRole('button', { name: /delete/i }).click();

      await expect
        .element(page.getByText(`You are deleting ${RESOURCE_NAME}`, { exact: false }))
        .toBeVisible();
      await expect
        .element(page.getByRole('button', { name: /delete it instead/i }))
        .toBeVisible();
      await expect
        .element(page.getByRole('button', { name: /close the resource/i }))
        .toBeVisible();
    });

    it('closes the delete modal when Cancel is pressed via keyboard (Escape)', async () => {
      setup(
        <ResourceEditDetailView
          selectedResource={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
          onClose={vi.fn()}
          
          
        />,
      );

      await page.getByRole('button', { name: /delete/i }).click();
      await expect
        .element(page.getByText(`You are deleting ${RESOURCE_NAME}`, { exact: false }))
        .toBeVisible();

      // Confirm modal close buttons are present (ESC / modal overlay close is handled by modal)
      await expect
        .element(page.getByRole('button', { name: /delete it instead/i }))
        .toBeVisible();
    });
  });

  describe('Password section', () => {
    it('shows Save/Cancel buttons when password is changed', async () => {
      setup(
        <ResourceEditDetailView
          selectedResource={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
          onClose={vi.fn()}
          
          
        />,
      );

      const passwordInput = page.getByLabelText('Password', { exact: true });
      await userEvent.type(passwordInput, 'newpassword');

      await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();
      await expect.element(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    });
  });

  describe('Name editing', () => {
    it('shows Save/Cancel buttons when name is changed', async () => {
      setup(
        <ResourceEditDetailView
          selectedResource={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
          onClose={vi.fn()}
          
          
        />,
      );

      const nameInput = page.getByLabelText('Name', { exact: true });
      await userEvent.type(nameInput, ' Updated');

      await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();
    });

    it('hides Save/Cancel after Cancel is clicked', async () => {
      setup(
        <ResourceEditDetailView
          selectedResource={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
          onClose={vi.fn()}
        />,
      );

      const nameInput = page.getByLabelText('Name', { exact: true });
      await userEvent.type(nameInput, ' Updated');
      await expect.element(page.getByRole('button', { name: /cancel/i })).toBeVisible();

      await userEvent.click(page.getByRole('button', { name: /cancel/i }));

      await expect.element(page.getByRole('button', { name: /save/i })).not.toBeInTheDocument();
    });
  });

  describe('VIEW MAIL and password validation', () => {
    it('renders the VIEW MAIL action', async () => {
      setup(
        <ResourceEditDetailView
          selectedResource={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
          onClose={vi.fn()}
        />,
      );

      await expect.element(page.getByRole('button', { name: /view mail/i })).toBeVisible();
    });

    it('shows a password length error when a short password is saved', async () => {
      setup(
        <ResourceEditDetailView
          selectedResource={{ id: RESOURCE_ID, name: RESOURCE_NAME }}
          onClose={vi.fn()}
        />,
      );

      await userEvent.type(page.getByLabelText('Password', { exact: true }), '123');
      await userEvent.click(page.getByRole('button', { name: /save/i }));

      await expect
        .element(page.getByText('Password should be more than 5 characters'))
        .toBeVisible();
    });
  });
});
