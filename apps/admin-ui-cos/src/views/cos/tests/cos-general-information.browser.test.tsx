/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  delayedSoapApiForBrowser,
  getQueryClient,
  grantUserCosRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { type ModifyCosBody } from '../../../services/modify-cos-service';
import { CosGeneralInformation } from '../general-information/cos-general-information';

const COS_ID = 'e00428a1-0c00-11d9-836a-000d93afea2a';

const mockCosData = {
  cos: [
    {
      id: COS_ID,
      name: 'testcos',
      a: [
        { n: 'zimbraId', _content: COS_ID },
        { n: 'cn', _content: 'testcos' },
        { n: 'zimbraNotes', _content: 'Some notes here' },
        { n: 'description', _content: 'A test COS' },
        { n: 'zimbraCreateTimestamp', _content: '20240115123045Z' },
      ],
    },
  ],
};

const mockDefaultCosData = {
  cos: [
    {
      id: COS_ID,
      name: 'default',
      a: [
        { n: 'zimbraId', _content: COS_ID },
        { n: 'cn', _content: 'default' },
        { n: 'zimbraNotes', _content: '' },
        { n: 'description', _content: '' },
      ],
    },
  ],
};

function mockCatalogServices(): void {
  createBrowserAPIInterceptor('get', '/services/catalog/services', () =>
    HttpResponse.json({ items: [] }),
  );
}

function mockSearchDirectoryResponses(): void {
  createBrowserSoapAPIInterceptor('SearchDirectory', (body: Record<string, unknown>) => {
    const types = body?.types as string;
    if (types === 'accounts') {
      return {
        account: [
          {
            id: 'acc-001',
            name: 'user1@example.com',
            a: [
              { n: 'displayName', _content: 'User One' },
              { n: 'mail', _content: 'user1@example.com' },
              { n: 'zimbraAccountStatus', _content: 'active' },
              { n: 'zimbraIsSystemAccount', _content: 'FALSE' },
            ],
          },
        ],
        searchTotal: 1,
      };
    }
    return {
      domain: [
        {
          id: 'dom-001',
          name: 'example.com',
          a: [
            { n: 'zimbraDomainName', _content: 'example.com' },
            { n: 'zimbraDomainDefaultCOSId', _content: COS_ID },
          ],
        },
      ],
      searchTotal: 1,
    };
  });
}

function mockEmptySearchDirectoryResponses(): void {
  createBrowserSoapAPIInterceptor('SearchDirectory', () => ({
    account: [],
    domain: [],
    searchTotal: 0,
  }));
}

async function setupGeneralInfoTest(cosData = mockCosData): Promise<void> {
  const queryClient = getQueryClient();
  await grantUserCosRights(queryClient);
  mockCatalogServices();
  mockSearchDirectoryResponses();

  createBrowserSoapAPIInterceptor('GetCos', cosData);
  createBrowserSoapAPIInterceptor('FlushCache', {});
  createBrowserSoapAPIInterceptor('ModifyCos', {});
  createBrowserSoapAPIInterceptor('RenameCos', {});
  createBrowserSoapAPIInterceptor('DeleteCos', {});

  await setupBrowserTest(
    <Routes>
      <Route path="/:cosId/:operation" element={<CosGeneralInformation />} />
    </Routes>,
    { initialRouterEntry: `/${COS_ID}/general_information`, queryClient },
  );
  await expect.element(page.getByText('General Information')).toBeVisible();
}

async function setupSaveTest(cosData = mockCosData): Promise<void> {
  const queryClient = getQueryClient();
  await grantUserCosRights(queryClient);
  mockCatalogServices();
  mockSearchDirectoryResponses();

  createBrowserSoapAPIInterceptor('GetCos', cosData);
  createBrowserSoapAPIInterceptor('FlushCache', {});

  await setupBrowserTest(
    <Routes>
      <Route path="/:cosId/:operation" element={<CosGeneralInformation />} />
    </Routes>,
    { initialRouterEntry: `/${COS_ID}/general_information`, queryClient },
  );
  await expect.element(page.getByText('General Information')).toBeVisible();
}

async function setupDeleteTest(cosData = mockCosData): Promise<void> {
  const queryClient = getQueryClient();
  await grantUserCosRights(queryClient);
  mockCatalogServices();
  mockSearchDirectoryResponses();

  createBrowserSoapAPIInterceptor('GetCos', cosData);
  createBrowserSoapAPIInterceptor('FlushCache', {});
  createBrowserSoapAPIInterceptor('ModifyCos', {});
  createBrowserSoapAPIInterceptor('RenameCos', {});

  await setupBrowserTest(
    <Routes>
      <Route path="/:cosId/:operation" element={<CosGeneralInformation />} />
    </Routes>,
    { initialRouterEntry: `/${COS_ID}/general_information`, queryClient },
  );
  await expect.element(page.getByText('General Information')).toBeVisible();
}

describe('CosGeneralInformation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    resetMockWorker();
  });

  describe('Rendering', () => {
    it('should render the page title', async () => {
      await setupGeneralInfoTest();

      await expect.element(page.getByText('General Information')).toBeVisible();
    });

    it('should render the Name field with COS name', async () => {
      await setupGeneralInfoTest();

      const nameInput = page.getByRole('textbox', { name: 'Name' });
      await expect.element(nameInput).toBeVisible();
      await expect.element(nameInput).toHaveValue('testcos');
    });

    it('should render the ID field', async () => {
      await setupGeneralInfoTest();

      const idInput = page.getByRole('textbox', { name: 'ID' });
      await expect.element(idInput).toBeVisible();
      await expect.element(idInput).toHaveValue(COS_ID);
    });

    it('should render the Description field', async () => {
      await setupGeneralInfoTest();

      const descInput = page.getByRole('textbox', { name: 'Description' });
      await expect.element(descInput).toBeVisible();
      await expect.element(descInput).toHaveValue('A test COS');
    });

    it('should render the DELETE button', async () => {
      await setupGeneralInfoTest();

      await expect.element(page.getByRole('button', { name: 'DELETE' })).toBeVisible();
    });

    it('should render Domains that use this COS section header', async () => {
      await setupGeneralInfoTest();

      await expect
        .element(page.getByText('Domains that use this COS', { exact: true }))
        .toBeVisible();
    });

    it('should render Accounts that use this COS section header', async () => {
      await setupGeneralInfoTest();

      await expect
        .element(page.getByText('Accounts that use this COS', { exact: true }))
        .toBeVisible();
    });

    it('should render Creation Date field with a value when timestamp is present', async () => {
      await setupGeneralInfoTest();

      const creationDateInput = page.getByRole('textbox', { name: 'Creation Date' });
      await expect.element(creationDateInput).toBeVisible();
      await expect.element(creationDateInput).not.toHaveValue('');
    });

    it('should render Notes textarea with initial value', async () => {
      await setupGeneralInfoTest();

      const notesTextarea = page.getByRole('textbox', { name: 'Notes' });
      await expect.element(notesTextarea).toBeVisible();
      await expect.element(notesTextarea).toHaveValue('Some notes here');
    });

    it('should render Accounts section table with email column header', async () => {
      await setupGeneralInfoTest();

      await expect.element(page.getByText('Email', { exact: true })).toBeVisible();
    });

    it('should render Domains section table with Domains column header', async () => {
      await setupGeneralInfoTest();

      await expect.element(page.getByText('Domains', { exact: true })).toBeVisible();
    });
  });

  describe('Default COS', () => {
    it('should disable Name field for default COS', async () => {
      await setupGeneralInfoTest(mockDefaultCosData);

      const nameInput = page.getByRole('textbox', { name: 'Name' });
      await expect.element(nameInput).toBeDisabled();
    });

    it('should disable DELETE button for default COS', async () => {
      await setupGeneralInfoTest(mockDefaultCosData);

      const deleteButton = page.getByRole('button', { name: 'DELETE' });
      await expect.element(deleteButton).toBeDisabled();
    });
  });

  describe('Dirty state', () => {
    it('should not show Save and Cancel buttons initially', async () => {
      await setupGeneralInfoTest();

      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });

    it('should show Save and Cancel when Name is changed', async () => {
      await setupGeneralInfoTest();

      const nameInput = page.getByRole('textbox', { name: 'Name' });
      await userEvent.fill(nameInput, 'renamed-cos');
      await expect.element(nameInput).toHaveValue('renamed-cos');

      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });

    it('should show Save and Cancel when Description is changed', async () => {
      await setupGeneralInfoTest();

      const descInput = page.getByRole('textbox', { name: 'Description' });
      await userEvent.fill(descInput, 'new description');
      await expect.element(descInput).toHaveValue('new description');

      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should revert changes when Cancel is clicked', async () => {
      await setupGeneralInfoTest();

      const descInput = page.getByRole('textbox', { name: 'Description' });
      await userEvent.fill(descInput, 'changed description');

      await page.getByRole('button', { name: 'Cancel' }).click();

      await expect.element(descInput).toHaveValue('A test COS');
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });

    it('should show Save and Cancel when Notes is changed', async () => {
      await setupGeneralInfoTest();

      const notesTextarea = page.getByRole('textbox', { name: 'Notes' });
      await userEvent.fill(notesTextarea, 'new notes content');
      await expect.element(notesTextarea).toHaveValue('new notes content');

      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });

    it('should revert Notes to original value when Cancel is clicked', async () => {
      await setupGeneralInfoTest();

      const notesTextarea = page.getByRole('textbox', { name: 'Notes' });
      await userEvent.fill(notesTextarea, 'changed notes');

      await page.getByRole('button', { name: 'Cancel' }).click();

      await expect.element(notesTextarea).toHaveValue('Some notes here');
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });
  });

  describe('Save', () => {
    it('should send ModifyCos when saving without rename', async () => {
      const modifyCosPromise = createBrowserSoapAPIInterceptor('ModifyCos', {});
      await setupSaveTest();

      const descInput = page.getByRole('textbox', { name: 'Description' });
      await userEvent.fill(descInput, 'updated description');

      await page.getByRole('button', { name: 'Save' }).click();

      const requestBody = (await modifyCosPromise) as ModifyCosBody;
      expect(requestBody._jsns).toBe('urn:zimbraAdmin');
      expect(requestBody.id._content).toBe(COS_ID);
      const descAttr = requestBody.a.find((a: { n: string }) => a.n === 'description');
      expect(descAttr).toBeDefined();
      expect(descAttr!._content).toBe('updated description');
    });

    it('should send RenameCos then ModifyCos when name is changed', async () => {
      const renameCosPromise = createBrowserSoapAPIInterceptor('RenameCos', {});
      createBrowserSoapAPIInterceptor('ModifyCos', {});
      await setupSaveTest();

      const nameInput = page.getByRole('textbox', { name: 'Name' });
      await userEvent.fill(nameInput, 'renamed-cos');

      await page.getByRole('button', { name: 'Save' }).click();

      const renameBody = (await renameCosPromise) as {
        _jsns: string;
        newName: { _content: string };
      };
      expect(renameBody._jsns).toBe('urn:zimbraAdmin');
      expect(renameBody.newName._content).toBe('renamed-cos');
    });
  });

  describe('Delete COS', () => {
    it('should open delete confirmation modal when DELETE is clicked', async () => {
      await setupGeneralInfoTest();

      await page.getByRole('button', { name: 'DELETE' }).click();

      await expect
        .element(page.getByText('Are you sure you want to delete this Class of Service?'))
        .toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Yes, Delete' })).toBeVisible();
    });

    it('should not send ModifyCos when DELETE is clicked', async () => {
      await setupGeneralInfoTest();

      const modifyCosPromise = createBrowserSoapAPIInterceptor('ModifyCos', {});

      await page.getByRole('button', { name: 'DELETE' }).click();

      await expect
        .element(page.getByText('Are you sure you want to delete this Class of Service?'))
        .toBeVisible();

      const settled = await Promise.race([
        modifyCosPromise.then(() => true),
        new Promise<boolean>((resolve) => {
          setTimeout(() => resolve(false), 2000);
        }),
      ]);
      expect(settled).toBe(false);
    });

    it('should close modal when No, Go Back is clicked', async () => {
      await setupGeneralInfoTest();

      await page.getByRole('button', { name: 'DELETE' }).click();
      await expect
        .element(page.getByText('Are you sure you want to delete this Class of Service?'))
        .toBeVisible();

      await page.getByRole('button', { name: 'No, Go Back' }).click();

      await expect
        .element(page.getByText('Are you sure you want to delete this Class of Service?'))
        .not.toBeInTheDocument();
    });

    it('should send DeleteCos when Yes, Delete is clicked', async () => {
      const deleteCosPromise = createBrowserSoapAPIInterceptor('DeleteCos', {});
      await setupDeleteTest();

      await page.getByRole('button', { name: 'DELETE' }).click();
      await page.getByRole('button', { name: 'Yes, Delete' }).click();

      const deleteBody = (await deleteCosPromise) as {
        _jsns: string;
        id: { _content: string };
      };
      expect(deleteBody._jsns).toBe('urn:zimbraAdmin');
      expect(deleteBody.id._content).toBe(COS_ID);
    });
  });

  describe('Empty lists', () => {
    it('should show empty list messages when no results', async () => {
      createBrowserSoapAPIInterceptor('GetCos', mockCosData);
      mockEmptySearchDirectoryResponses();
      mockCatalogServices();
      createBrowserSoapAPIInterceptor('FlushCache', {});
      createBrowserSoapAPIInterceptor('ModifyCos', {});
      createBrowserSoapAPIInterceptor('RenameCos', {});
      createBrowserSoapAPIInterceptor('DeleteCos', {});

      const queryClient = getQueryClient();
      await grantUserCosRights(queryClient);

      await setupBrowserTest(
        <Routes>
          <Route path="/:cosId/:operation" element={<CosGeneralInformation />} />
        </Routes>,
        { initialRouterEntry: `/${COS_ID}/general_information`, queryClient },
      );
      await expect.element(page.getByText('General Information')).toBeVisible();

      await expect.element(page.getByText('This list is empty.').first()).toBeVisible();
    });
  });

  describe('Loading', () => {
    it('should show loading spinner when data is pending', async () => {
      const queryClient = getQueryClient();
      await grantUserCosRights(queryClient);
      mockCatalogServices();
      delayedSoapApiForBrowser('GetCos', mockCosData, 5000);

      await setupBrowserTest(
        <Routes>
          <Route path="/:cosId/:operation" element={<CosGeneralInformation />} />
        </Routes>,
        { initialRouterEntry: `/${COS_ID}/general_information`, queryClient },
      );

      await expect.element(page.getByRole('status')).toBeVisible();
    });
  });

  describe('Read-only mode', () => {
    it('should disable Name field when user has no COS setAttrs rights', async () => {
      const queryClient = getQueryClient();
      queryClient.setQueryData(['account', 'info'], {
        id: 'test-user-id',
        name: 'test@example.com',
        displayName: '',
        signatures: { signature: [] },
        identities: undefined,
        rights: { targets: [] },
      });
      queryClient.setQueryData(
        ['effective-rights', 'test@example.com'],
        [
          {
            type: 'cos',
            all: [
              {
                right: [{ n: 'listCos' }],
                getAttrs: [{ all: true }],
              },
            ],
          },
        ],
      );

      mockCatalogServices();
      mockSearchDirectoryResponses();
      createBrowserSoapAPIInterceptor('GetCos', mockCosData);
      createBrowserSoapAPIInterceptor('FlushCache', {});
      createBrowserSoapAPIInterceptor('ModifyCos', {});
      createBrowserSoapAPIInterceptor('RenameCos', {});
      createBrowserSoapAPIInterceptor('DeleteCos', {});

      await setupBrowserTest(
        <Routes>
          <Route path="/:cosId/:operation" element={<CosGeneralInformation />} />
        </Routes>,
        { initialRouterEntry: `/${COS_ID}/general_information`, queryClient },
      );
      await expect.element(page.getByText('General Information')).toBeVisible();

      const nameInput = page.getByRole('textbox', { name: 'Name' });
      await expect.element(nameInput).toBeDisabled();
    });
  });

  describe('Account types and multi-email', () => {
    async function setupWithAccounts(accounts: Array<Record<string, unknown>>): Promise<void> {
      const queryClient = getQueryClient();
      await grantUserCosRights(queryClient);
      mockCatalogServices();
      createBrowserSoapAPIInterceptor('GetCos', mockCosData);
      createBrowserSoapAPIInterceptor('FlushCache', {});
      createBrowserSoapAPIInterceptor('SearchDirectory', {
        account: accounts,
        searchTotal: accounts.length,
      });

      await setupBrowserTest(
        <Routes>
          <Route path="/:cosId/:operation" element={<CosGeneralInformation />} />
        </Routes>,
        { initialRouterEntry: `/${COS_ID}/general_information`, queryClient },
      );
      await expect.element(page.getByText('General Information')).toBeVisible();
    }

    it('should display Admin user type', async () => {
      await setupWithAccounts([
        {
          id: 'acc-admin',
          name: 'admin@example.com',
          a: [
            { n: 'displayName', _content: 'Admin User' },
            { n: 'mail', _content: 'admin@example.com' },
            { n: 'zimbraAccountStatus', _content: 'active' },
            { n: 'zimbraIsAdminAccount', _content: 'TRUE' },
          ],
        },
      ]);
      await expect.element(page.getByText('Admin', { exact: true })).toBeVisible();
    });

    it('should display DelegatedAdmin user type', async () => {
      await setupWithAccounts([
        {
          id: 'acc-delegated',
          name: 'delegated@example.com',
          a: [
            { n: 'displayName', _content: 'Delegated Admin' },
            { n: 'mail', _content: 'delegated@example.com' },
            { n: 'zimbraAccountStatus', _content: 'active' },
            { n: 'zimbraIsDelegatedAdminAccount', _content: 'TRUE' },
          ],
        },
      ]);
      await expect.element(page.getByText('DelegatedAdmin')).toBeVisible();
    });

    it('should display External user type', async () => {
      await setupWithAccounts([
        {
          id: 'acc-external',
          name: 'external@example.com',
          a: [
            { n: 'displayName', _content: 'External User' },
            { n: 'mail', _content: 'external@example.com' },
            { n: 'zimbraAccountStatus', _content: 'active' },
            { n: 'zimbraIsExternalVirtualAccount', _content: 'TRUE' },
          ],
        },
      ]);
      await expect.element(page.getByText('External', { exact: true })).toBeVisible();
    });

    it('should display System user type', async () => {
      await setupWithAccounts([
        {
          id: 'acc-system',
          name: 'system@example.com',
          a: [
            { n: 'displayName', _content: 'System User' },
            { n: 'mail', _content: 'system@example.com' },
            { n: 'zimbraAccountStatus', _content: 'active' },
            { n: 'zimbraIsSystemAccount', _content: 'TRUE' },
          ],
        },
      ]);
      await expect.element(page.getByText('System', { exact: true })).toBeVisible();
    });

    it('should display Normal user type for regular accounts', async () => {
      await setupWithAccounts([
        {
          id: 'acc-normal',
          name: 'normal@example.com',
          a: [
            { n: 'displayName', _content: 'Normal User' },
            { n: 'mail', _content: 'normal@example.com' },
            { n: 'zimbraAccountStatus', _content: 'active' },
            { n: 'zimbraIsSystemAccount', _content: 'FALSE' },
          ],
        },
      ]);
      await expect.element(page.getByText('Normal', { exact: true })).toBeVisible();
    });

    it('should show 0 for accounts with a single mail entry', async () => {
      await setupWithAccounts([
        {
          id: 'acc-single',
          name: 'single@example.com',
          a: [
            { n: 'displayName', _content: 'Single Mail' },
            { n: 'mail', _content: 'single@example.com' },
            { n: 'zimbraAccountStatus', _content: 'active' },
          ],
        },
      ]);
      await expect.element(page.getByText('single@example.com')).toBeVisible();
      await expect.element(page.getByText('Normal', { exact: true })).toBeVisible();
    });
  });
});
