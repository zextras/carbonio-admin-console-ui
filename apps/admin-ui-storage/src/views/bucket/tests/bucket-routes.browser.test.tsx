/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Padding } from '@zextras/ui-components';
import { resetMockWorker, setupBrowserTest } from 'admin-ui-test-utils';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import {
  DATA_VOLUMES,
  HSM_SETTINGS,
  S3CONNECTOR_LIST,
  SERVERS_LIST,
} from '../../../constants';

const EmptyState: FC = () => {
  const [t] = useTranslation();
  return (
    <Container height="fill" mainAlignment="center" crossAlignment="center">
      <Padding horizontal="large">
        <ds-text as="p" size="medium" color="secondary">
          {t('storages.select_an_option', 'Please select an option from the list')}
        </ds-text>
      </Padding>
    </Container>
  );
};

const TestLayout: FC = () => <Outlet />;

const StorageRoutes: FC = () => (
  <Routes>
    <Route element={<TestLayout />}>
      <Route index element={<EmptyState />} />
      <Route path={SERVERS_LIST} element={<div>VIEW:servers-list</div>} />
      <Route path={S3CONNECTOR_LIST} element={<div>VIEW:s3connector-list</div>} />
      <Route path={`:server/${DATA_VOLUMES}`} element={<div>VIEW:data-volumes</div>} />
      <Route path={`:server/${HSM_SETTINGS}`} element={<div>VIEW:hsm-settings</div>} />
      <Route path="*" element={null} />
    </Route>
  </Routes>
);

const globalOpRoutes: Array<[string, string]> = [
  [SERVERS_LIST, 'VIEW:servers-list'],
  [S3CONNECTOR_LIST, 'VIEW:s3connector-list'],
];

const SERVER_ID = 'mailstore1.test.com';

describe('Storage bucket routes', () => {
  afterEach(() => {
    resetMockWorker();
  });

  it('renders the empty state on the index route', async () => {
    await setupBrowserTest(<StorageRoutes />, { initialRouterEntry: '/' });

    await expect
      .element(page.getByText(/Please select an option from the list/i))
      .toBeVisible();
  });

  describe('global storage operation routes', () => {
    it.each(globalOpRoutes)('renders the right view for /%s', async (op, marker) => {
      await setupBrowserTest(<StorageRoutes />, { initialRouterEntry: `/${op}` });

      await expect.element(page.getByText(marker)).toBeVisible();
    });
  });

  it(`renders VolumesDetailRoute for /:server/${DATA_VOLUMES}`, async () => {
    await setupBrowserTest(<StorageRoutes />, {
      initialRouterEntry: `/${SERVER_ID}/${DATA_VOLUMES}`,
    });

    await expect.element(page.getByText('VIEW:data-volumes')).toBeVisible();
  });

  it(`renders HSMsettingPanel for /:server/${HSM_SETTINGS}`, async () => {
    await setupBrowserTest(<StorageRoutes />, {
      initialRouterEntry: `/${SERVER_ID}/${HSM_SETTINGS}`,
    });

    await expect.element(page.getByText('VIEW:hsm-settings')).toBeVisible();
  });

  it('renders nothing for an unknown operation', async () => {
    await setupBrowserTest(<StorageRoutes />, {
      initialRouterEntry: '/totally-unknown-op',
    });

    await expect.element(page.getByText('VIEW:servers-list')).not.toBeInTheDocument();
    await expect.element(page.getByText(/Please select an option/i)).not.toBeInTheDocument();
  });
});
