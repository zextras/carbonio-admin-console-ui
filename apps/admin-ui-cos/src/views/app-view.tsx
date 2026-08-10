/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  useIsAdvanced,
  useLicenseInfo,
  useLocalStorage,
  usePrimaryBarState,
} from '@zextras/ui-shared';
import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router';

import { CREATE_NEW_COS_ROUTE_ID } from '../constants';
import styles from './app-view.module.css';
import { CosDetailPanel } from './cos/cos-detail-panel';
import { CosLayout } from './cos/cos-layout';
import { CosListPanel } from './cos/cos-list-panel';
import { CreateNewCos } from './cos/create-new-cos/create-new-cos';
import { CosPageHeader } from './cos-page-header';

export const AppView = () => {
  const [featureFlag, setFeatureFlag] = useLocalStorage<boolean | null>(
    'new_subscription_feature_flag',
    null,
  );

  useEffect(() => {
    if (featureFlag === null) setFeatureFlag(false);
  }, [featureFlag, setFeatureFlag]);

  const isAdvanced = useIsAdvanced();
  const { data: licenseData } = useLicenseInfo();
  const isPrimaryBarExpanded = usePrimaryBarState();
  const { pathname } = useLocation();
  const isCreateNewCos = pathname.includes(CREATE_NEW_COS_ROUTE_ID);

  return (
    <div className={styles.root}>
      <CosPageHeader />
      <Routes>
        <Route
          path={'/*'}
          element={
            <div className={styles.layout}>
              {!isCreateNewCos && (
                <div className={styles.sidebar}>
                  <CosListPanel />
                </div>
              )}
              <div className={styles.detailWrapper}>
                <div className={styles.detailContent} data-expanded={isPrimaryBarExpanded}>
                  <CosDetailPanel />
                </div>
              </div>
            </div>
          }
        />
        {featureFlag && isAdvanced && !!licenseData && (
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
  );
};
