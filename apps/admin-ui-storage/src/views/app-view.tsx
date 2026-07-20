/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { Navigate, Route, Routes } from 'react-router';

import { DATA_VOLUMES, HSM_SETTINGS, S3CONNECTOR_LIST, SERVERS_LIST } from '../constants';
import { Breadcrumb } from './breadcrumb/breadcrumb';
import { VolumesDetailRoute } from './data-volumes/volumes-detail-route';
import { HSMsettingPanel } from './hsm/hsm-setting-panel';
import { S3ConnectorListPanel } from './s3-connectors/s3-connector-list-panel';
import { ServerListPanel } from './servers-list/server-list-panel';
import { StorageLayout } from './storage-layout';

export const AppView = () => {
  return (
    <Container>
      <Breadcrumb />
      <Routes>
        <Route element={<StorageLayout />}>
          <Route index element={<Navigate to={SERVERS_LIST} replace />} />
          <Route path={SERVERS_LIST} element={<ServerListPanel />} />
          <Route path={S3CONNECTOR_LIST} element={<S3ConnectorListPanel />} />
          <Route path={`:server/${DATA_VOLUMES}`} element={<VolumesDetailRoute />} />
          <Route path={`:server/${HSM_SETTINGS}`} element={<HSMsettingPanel />} />
          <Route path="*" element={null} />
        </Route>
      </Routes>
    </Container>
  );
};
