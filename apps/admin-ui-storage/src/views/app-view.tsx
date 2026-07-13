/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { Navigate, Route, Routes } from 'react-router';

import { DATA_VOLUMES, HSM_SETTINGS, S3CONNECTOR_LIST, SERVERS_LIST } from '../constants';
import { Breadcrumb } from './breadcrumb/breadcrumb';
import { BucketDetailPanel } from './bucket/bucket-detail-panel';
import { ServerDetailPanel } from './bucket/global-servers/server-detail-panel';
import { HSMsettingPanel } from './bucket/hsm/hsm-setting-panel';
import { VolumesDetailRoute } from './bucket/volumes-detail-route';
import { StorageLayout } from './storage-layout';

export const AppView = () => {
  return (
    <Container>
      <Breadcrumb />
      <Routes>
        <Route element={<StorageLayout />}>
          <Route index element={<Navigate to={SERVERS_LIST} replace />} />
          <Route path={SERVERS_LIST} element={<ServerDetailPanel />} />
          <Route path={S3CONNECTOR_LIST} element={<BucketDetailPanel />} />
          <Route path={`:server/${DATA_VOLUMES}`} element={<VolumesDetailRoute />} />
          <Route path={`:server/${HSM_SETTINGS}`} element={<HSMsettingPanel />} />
          <Route path="*" element={null} />
        </Route>
      </Routes>
    </Container>
  );
};
