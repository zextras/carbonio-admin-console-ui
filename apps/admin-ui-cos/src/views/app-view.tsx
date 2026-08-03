/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useLocalStorage } from '@zextras/ui-shared';
import { useEffect } from 'react';
import { Route, Routes } from 'react-router';

import { COS_LIST, CREATE_NEW_COS_ROUTE_ID } from '../constants';
import { Breadcrumb } from './breadcrumb/breadcrumb';
import { CosDetailPanel } from './cos/cos-detail-panel';
import { CosLayout } from './cos/cos-layout';
import styles from './cos/cos-layout.module.css';
import { CosList } from './cos/cos-list/cos-list';
import { CreateNewCos } from './cos/create-new-cos/create-new-cos';

export const AppView = () => {
  const [featureFlag, setFeatureFlag] = useLocalStorage<boolean | null>(
    'new_subscription_feature_flag',
    null,
  );

  useEffect(() => {
    if (featureFlag === null) setFeatureFlag(false);
  }, [featureFlag, setFeatureFlag]);

  return (
    <div className={styles.appRoot}>
      <Breadcrumb />
      <div className={styles.routesRow}>
        <Routes>
          <Route
            index
            element={
              <CosLayout variant="list">
                <CosList />
              </CosLayout>
            }
          />
          <Route
            path={`/${COS_LIST}`}
            element={
              <CosLayout variant="list">
                <CosList />
              </CosLayout>
            }
          />
          <Route
            path={'/:cosId/:operation'}
            element={
              <CosLayout variant="detail">
                <CosDetailPanel />
              </CosLayout>
            }
          />
          {featureFlag && (
            <Route
              path={`/${CREATE_NEW_COS_ROUTE_ID}`}
              element={
                <CosLayout variant="fullWidth">
                  <CreateNewCos />
                </CosLayout>
              }
            />
          )}
        </Routes>
      </div>
    </div>
  );
};
