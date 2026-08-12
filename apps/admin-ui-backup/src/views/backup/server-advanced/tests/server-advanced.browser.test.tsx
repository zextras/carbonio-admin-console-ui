/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserAPIInterceptor,
  getQueryClient,
  grantUserConfigRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import ServerAdvanced from '../server-advanced';

const SERVER_ID = 'server-1';
const SERVER_NAME = 'mail01.example.com';

const ALL_SERVERS = [
  {
    id: SERVER_ID,
    name: SERVER_NAME,
    a: [{ n: 'description', _content: 'Mail server 1' }],
  },
];

const SERVER_CONFIG_RESPONSE = {
  attributes: {
    ldapDumpEnabled: { value: true },
    ZxBackup_BackupCustomizations: { value: true },
    ZxBackup_PurgeCustomizations: { value: false },
    backupSaveIndex: { value: true },
    backupLatencyHighThreshold: { value: 200 },
    backupLatencyLowThreshold: { value: 50 },
    ZxBackup_MaxWaitingTime: { value: 5000 },
    ZxBackup_MaxMetadataSize: { value: 1024 },
    backupOnTheFlyMetadata: { value: false },
    scheduledMetadataArchivingEnabled: { value: false },
    ZxBackup_MaxOperationPerAccount: { value: 10 },
    backupCompressionLevel: { value: 2 },
    backupNumberThreadsForItems: { value: 4 },
    backupNumberThreadsForAccounts: { value: 8 },
  },
};

const ServerAdvancedWithRoute = () => (
  <Routes>
    <Route path=":server" element={<ServerAdvanced />} />
  </Routes>
);

function setupMocks() {
  createBrowserAPIInterceptor(
    'get',
    `/service/extension/zextras_admin/core/getServer/${SERVER_ID}`,
    () => HttpResponse.json(SERVER_CONFIG_RESPONSE),
  );
}

describe('ServerAdvanced', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(async () => {
    queryClient = getQueryClient();
    await grantUserConfigRights(queryClient);
    queryClient.setQueryData(['all-servers'], ALL_SERVERS);
    setupMocks();
  });

  afterEach(() => {
    resetMockWorker();
  });

  describe('Rendering', () => {
    it('should render the "Advanced" title', async () => {
      await setupBrowserTest(<ServerAdvancedWithRoute />, {
        queryClient,
        initialRouterEntry: `/${SERVER_NAME}`,
      });

      await expect.element(page.getByText('Advanced')).toBeVisible();
    });

    it('should render the "Check ldap" button', async () => {
      await setupBrowserTest(<ServerAdvancedWithRoute />, {
        queryClient,
        initialRouterEntry: `/${SERVER_NAME}`,
      });

      await expect.element(page.getByRole('button', { name: 'Check ldap' })).toBeVisible();
    });

    it('should render section headings', async () => {
      await setupBrowserTest(<ServerAdvancedWithRoute />, {
        queryClient,
        initialRouterEntry: `/${SERVER_NAME}`,
      });

      await expect.element(page.getByText('Tuning Options')).toBeVisible();
      await expect.element(page.getByText('Latency', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Metadata', { exact: true })).toBeVisible();
    });
  });

  describe('Switches', () => {
    it('should render LDAP Dump switch', async () => {
      await setupBrowserTest(<ServerAdvancedWithRoute />, {
        queryClient,
        initialRouterEntry: `/${SERVER_NAME}`,
      });

      await expect.element(page.getByText('LDAP Dump')).toBeVisible();
    });

    it('should render Include server configuration switch', async () => {
      await setupBrowserTest(<ServerAdvancedWithRoute />, {
        queryClient,
        initialRouterEntry: `/${SERVER_NAME}`,
      });

      await expect.element(page.getByText('Include server configuration')).toBeVisible();
    });

    it('should render Purge old configuration switch', async () => {
      await setupBrowserTest(<ServerAdvancedWithRoute />, {
        queryClient,
        initialRouterEntry: `/${SERVER_NAME}`,
      });

      await expect.element(page.getByText('Purge old configuration')).toBeVisible();
    });

    it('should render Include index switch', async () => {
      await setupBrowserTest(<ServerAdvancedWithRoute />, {
        queryClient,
        initialRouterEntry: `/${SERVER_NAME}`,
      });

      await expect.element(page.getByText('Include index')).toBeVisible();
    });

    it('should render metadata switches', async () => {
      await setupBrowserTest(<ServerAdvancedWithRoute />, {
        queryClient,
        initialRouterEntry: `/${SERVER_NAME}`,
      });

      await expect
        .element(page.getByText('Append metadata instead of rewrite (faster but dangerous)'))
        .toBeVisible();
      await expect
        .element(page.getByText('Archive user metadata folder in the remote backup'))
        .toBeVisible();
    });
  });

  describe('Input fields', () => {
    it('should render latency inputs', async () => {
      await setupBrowserTest(<ServerAdvancedWithRoute />, {
        queryClient,
        initialRouterEntry: `/${SERVER_NAME}`,
      });

      await expect.element(page.getByText('Latency High Threshold (ms)')).toBeVisible();
      await expect.element(page.getByText('Latency Low Threshold (ms)')).toBeVisible();
    });

    it('should render Max Waiting Time input', async () => {
      await setupBrowserTest(<ServerAdvancedWithRoute />, {
        queryClient,
        initialRouterEntry: `/${SERVER_NAME}`,
      });

      await expect.element(page.getByText('Max Waiting Time (ms)')).toBeVisible();
    });

    it('should render Maximum Metadata Size input', async () => {
      await setupBrowserTest(<ServerAdvancedWithRoute />, {
        queryClient,
        initialRouterEntry: `/${SERVER_NAME}`,
      });

      await expect.element(page.getByText('Maximum Metadata Size (MB)')).toBeVisible();
    });

    it('should render Other Controls inputs', async () => {
      await setupBrowserTest(<ServerAdvancedWithRoute />, {
        queryClient,
        initialRouterEntry: `/${SERVER_NAME}`,
      });

      await expect.element(page.getByText('Maximum Operation per Account')).toBeVisible();
      await expect.element(page.getByText('Compression Level')).toBeVisible();
      await expect.element(page.getByText('Thread number for items')).toBeVisible();
      await expect.element(page.getByText('Thread number for accounts')).toBeVisible();
    });
  });

  describe('Dirty state', () => {
    it('should not show Cancel and Save buttons when form is clean', async () => {
      await setupBrowserTest(<ServerAdvancedWithRoute />, {
        queryClient,
        initialRouterEntry: `/${SERVER_NAME}`,
      });

      await expect.element(page.getByText('Advanced')).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });

    it('should show Cancel and Save buttons after toggling a switch', async () => {
      await setupBrowserTest(<ServerAdvancedWithRoute />, {
        queryClient,
        initialRouterEntry: `/${SERVER_NAME}`,
      });

      // Wait for API data to load (input gets populated with value from API)
      await expect
        .element(page.getByRole('textbox', { name: 'Latency High Threshold (ms)' }))
        .toHaveValue('200');

      await userEvent.click(page.getByText('Include server configuration'));

      await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should hide Cancel and Save buttons after clicking Cancel', async () => {
      await setupBrowserTest(<ServerAdvancedWithRoute />, {
        queryClient,
        initialRouterEntry: `/${SERVER_NAME}`,
      });

      // Wait for API data to load
      await expect
        .element(page.getByRole('textbox', { name: 'Latency High Threshold (ms)' }))
        .toHaveValue('200');

      await userEvent.click(page.getByText('Include server configuration'));

      await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

      await userEvent.click(page.getByRole('button', { name: 'Cancel' }));

      await expect.element(page.getByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });
  });

  describe('Permissions', () => {
    it('should disable switches when user has no config rights', async () => {
      queryClient.setQueryData(
        ['effective-rights', 'test@example.com'],
        [{ type: 'config', all: [] }],
      );

      await setupBrowserTest(<ServerAdvancedWithRoute />, {
        queryClient,
        initialRouterEntry: `/${SERVER_NAME}`,
      });

      await expect.element(page.getByText('LDAP Dump')).toBeVisible();

      await userEvent.click(page.getByText('LDAP Dump'));

      // Should remain clean since switch is disabled
      await expect.element(page.getByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });

    it('should disable the Check ldap button when user has no config rights', async () => {
      queryClient.setQueryData(
        ['effective-rights', 'test@example.com'],
        [{ type: 'config', all: [] }],
      );

      await setupBrowserTest(<ServerAdvancedWithRoute />, {
        queryClient,
        initialRouterEntry: `/${SERVER_NAME}`,
      });

      const checkButton = page.getByRole('button', { name: 'Check ldap' });
      await expect.element(checkButton).toBeVisible();
      await expect.element(checkButton).toBeDisabled();
    });
  });
});
