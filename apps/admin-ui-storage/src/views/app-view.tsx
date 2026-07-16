/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { FC, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import {
  DATA_VOLUMES,
  HSM_SETTINGS,
  S3CONNECTOR_LIST,
  SERVERS_LIST,
} from '../constants';
import { Breadcrumb } from './breadcrumb/breadcrumb';
import BucketDetailPanel from './bucket/bucket-detail-panel';
import ServersDetailPanel from './bucket/global-servers/server-detail-panel';
import HSMsettingPanel from './bucket/hsm/hsm-setting-panel';
import { VolumesDetailRoute } from './bucket/volumes-detail-route';
import { StorageLayout } from './storage-layout';

const DetailContainer: FC<{ children: ReactNode }> = ({ children }) => (
  <Container style={{ transition: 'max-width 300ms' }}>{children}</Container>
);

export const AppView: FC = () => {
  return (
    <Container>
      <Breadcrumb />
      <Routes>
        <Route element={<StorageLayout />}>
          <Route index element={<Navigate to={SERVERS_LIST} replace />} />
          <Route
            path={SERVERS_LIST}
            element={
              <DetailContainer>
                <ServersDetailPanel />
              </DetailContainer>
            }
          />
          <Route
            path={S3CONNECTOR_LIST}
            element={
              <DetailContainer>
                <BucketDetailPanel />
              </DetailContainer>
            }
          />
          <Route path={`:server/${DATA_VOLUMES}`} element={<VolumesDetailRoute />} />
          <Route
            path={`:server/${HSM_SETTINGS}`}
            element={
              <DetailContainer>
                <HSMsettingPanel />
              </DetailContainer>
            }
          />
          <Route path="*" element={null} />
        </Route>
      </Routes>
    </Container>
  );
};

