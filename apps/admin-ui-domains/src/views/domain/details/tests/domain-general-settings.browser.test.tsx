/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useDomainStore } from '@zextras/ui-shared';
import { createBrowserSoapAPIInterceptor, setupBrowserTest } from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import DomainGeneralSettings from '../domain-general-settings';

const DOMAIN_ID = 'test-domain-id-123';
const DOMAIN_NAME = 'example.com';

function buildDomainAttributes(
  overrides: Array<{ n: string; _content: string }> = [],
): Array<{ n: string; _content: string }> {
  const defaults: Array<{ n: string; _content: string }> = [
    { n: 'zimbraDomainName', _content: DOMAIN_NAME },
    { n: 'zimbraId', _content: DOMAIN_ID },
    { n: 'zimbraDomainStatus', _content: 'active' },
    { n: 'zimbraPublicServiceProtocol', _content: 'https' },
    { n: 'zimbraPublicServiceHostname', _content: 'mail.example.com' },
    { n: 'zimbraPublicServicePort', _content: '443' },
    { n: 'zimbraPrefTimeZoneId', _content: 'America/New_York' },
    { n: 'zimbraNotes', _content: 'Test domain notes' },
    { n: 'description', _content: 'Test domain description' },
    { n: 'zimbraHelpAdminURL', _content: '' },
    { n: 'zimbraHelpDelegatedURL', _content: '' },
    { n: 'zimbraDNSCheckHostname', _content: '' },
    { n: 'zimbraCreateTimestamp', _content: '20240101120000Z' },
    { n: 'carbonioNotificationFrom', _content: 'noreply@example.com' },
    { n: 'carbonioNotificationRecipients', _content: 'admin@example.com' },
    { n: 'zimbraDomainMaxAccounts', _content: '100' },
  ];

  const overrideKeys = new Set(overrides.map((o) => o.n));
  const filtered = defaults.filter((d) => !overrideKeys.has(d.n));
  return [...filtered, ...overrides];
}

function setupDomainStore(attributeOverrides: Array<{ n: string; _content: string }> = []): void {
  const domainAttributes = buildDomainAttributes(attributeOverrides);
  useDomainStore.setState({
    domain: {
      name: DOMAIN_NAME,
      id: DOMAIN_ID,
      a: domainAttributes,
    },
    cosList: [
      { id: 'cos-default-id', name: 'default' },
      { id: 'cos-professional-id', name: 'professional' },
    ],
  });
}

describe('DomainGeneralSettings (browser)', () => {
  beforeEach(() => {
    setupDomainStore();
  });

  afterEach(() => {
    useDomainStore.setState({
      domain: {},
      cosList: [],
    });
  });

  describe('Rendering', () => {
    it('should render the General Settings header', async () => {
      setupBrowserTest(<DomainGeneralSettings />);

      await expect.element(page.getByText('General Settings')).toBeVisible();
    });

    it('should render the domain name input', async () => {
      setupBrowserTest(<DomainGeneralSettings />);

      const nameInput = page.getByText('Name', { exact: true });
      await expect.element(nameInput).toBeVisible();
    });

    it('should render the domain ID input', async () => {
      setupBrowserTest(<DomainGeneralSettings />);

      const idInput = page.getByText('Id', { exact: true });
      await expect.element(idInput).toBeVisible();
    });

    it('should render the Domain System Notifications section', async () => {
      setupBrowserTest(<DomainGeneralSettings />);

      await expect.element(page.getByText('Domain System Notifications')).toBeVisible();
    });

    it('should render the Notification Sender input with pre-filled value', async () => {
      setupBrowserTest(<DomainGeneralSettings />);

      await expect.element(page.getByText('Notification Sender')).toBeVisible();
    });

    it('should render the Delete Domain button', async () => {
      setupBrowserTest(<DomainGeneralSettings />);

      await expect.element(page.getByRole('button', { name: /delete domain/i })).toBeVisible();
    });

    it('should not show Save and Cancel buttons when no changes are made', async () => {
      setupBrowserTest(<DomainGeneralSettings />);

      await expect.element(page.getByText('General Settings')).toBeVisible();
      await expect.element(page.getByRole('button', { name: /save/i })).not.toBeInTheDocument();
      await expect.element(page.getByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });
  });

  describe('Editing fields', () => {
    it('should show Save and Cancel buttons when description is changed', async () => {
      setupBrowserTest(<DomainGeneralSettings />);

      const descriptionInput = page.getByLabelText(/description/i);
      await userEvent.clear(descriptionInput);
      await userEvent.type(descriptionInput, 'Updated description');

      await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();
      await expect.element(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    });

    it('should revert changes when Cancel is clicked', async () => {
      setupBrowserTest(<DomainGeneralSettings />);

      const descriptionInput = page.getByLabelText(/description/i);
      await userEvent.clear(descriptionInput);
      await userEvent.type(descriptionInput, 'Changed value');

      const cancelButton = page.getByRole('button', { name: /cancel/i });
      await cancelButton.click();

      await expect.element(page.getByRole('button', { name: /save/i })).not.toBeInTheDocument();
    });
  });

  describe('Save domain', () => {
    it('should call ModifyDomain API when Save is clicked', async () => {
      const modifyDomainInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
        domain: [
          {
            name: DOMAIN_NAME,
            id: DOMAIN_ID,
            a: buildDomainAttributes([{ n: 'description', _content: 'New description' }]),
          },
        ],
      });

      setupBrowserTest(<DomainGeneralSettings />);

      const descriptionInput = page.getByLabelText(/description/i);
      await userEvent.clear(descriptionInput);
      await userEvent.type(descriptionInput, 'New description');

      const saveButton = page.getByRole('button', { name: /save/i });
      await saveButton.click();

      const requestParams = (await modifyDomainInterceptor) as any;
      expect(requestParams.id).toBe(DOMAIN_ID);
      expect(requestParams.a).toBeDefined();

      const descriptionAttr = requestParams.a.find((attr: any) => attr.n === 'description');
      expect(descriptionAttr._content).toBe('New description');
    });

    it('should show error when notification sender has invalid email', async () => {
      setupBrowserTest(<DomainGeneralSettings />);

      const senderInput = page.getByLabelText(/notification sender/i);
      await userEvent.clear(senderInput);
      await userEvent.type(senderInput, 'invalid-email');

      const saveButton = page.getByRole('button', { name: /save/i });
      await saveButton.click();

      await expect.element(page.getByText('Enter a valid email address.')).toBeVisible();
    });
  });

  describe('Notification Recipients', () => {
    it('should render the Send notifications to chip input', async () => {
      setupBrowserTest(<DomainGeneralSettings />);

      await expect.element(page.getByText('Send notifications to...')).toBeVisible();
    });
  });

  describe('Delete Domain', () => {
    it('should trigger domain deletion flow when Delete Domain is clicked', async () => {
      createBrowserSoapAPIInterceptor('SearchDirectory', {
        searchTotal: 0,
        more: false,
        account: [],
        dl: [],
        alias: [],
        calresource: [],
      });

      createBrowserSoapAPIInterceptor('DeleteDomain', {});

      setupBrowserTest(<DomainGeneralSettings />);

      const deleteButton = page.getByRole('button', { name: /delete domain/i });
      await deleteButton.click();

      // When domain is empty (searchTotal=0), it deletes directly
      await expect.element(page.getByText('Domain has been deleted successfully')).toBeVisible();
    });

    it('should show confirmation dialog when domain has accounts', async () => {
      createBrowserSoapAPIInterceptor('SearchDirectory', {
        searchTotal: 3,
        more: false,
        account: [
          {
            name: 'user1@example.com',
            id: 'acc-1',
            a: [{ n: 'zimbraIsSystemAccount', _content: 'FALSE' }],
          },
          {
            name: 'user2@example.com',
            id: 'acc-2',
            a: [{ n: 'zimbraIsSystemAccount', _content: 'FALSE' }],
          },
        ],
        dl: [{ name: 'group@example.com', id: 'dl-1', a: [] }],
        alias: [],
        calresource: [],
      });

      setupBrowserTest(<DomainGeneralSettings />);

      const deleteButton = page.getByRole('button', { name: /delete domain/i });
      await deleteButton.click();

      await expect.element(page.getByText(/is not empty and contains/i)).toBeVisible();
      await expect.element(page.getByText(/2 Accounts/)).toBeVisible();
      await expect.element(page.getByText(/1 Distribution List/)).toBeVisible();
    });
  });
});
