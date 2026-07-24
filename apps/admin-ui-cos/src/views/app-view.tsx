/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Breadcrumbs } from '@zextras/ui-components';
import { usePrimaryBarState } from '@zextras/ui-shared';
import { Route, Routes, useLocation } from 'react-router';

import { CREATE_NEW_COS_ROUTE_ID } from '../constants';
import styles from './app-view.module.css';
import { CosDetailPanel } from './cos/cos-detail-panel';
import { CosListPanel } from './cos/cos-list-panel';

export const AppView = () => {
  const isPrimaryBarExpanded = usePrimaryBarState();

  const { pathname } = useLocation();
  const isCreateNewCos = pathname.includes(CREATE_NEW_COS_ROUTE_ID);
  return (
    <div className={styles.root}>
      <Breadcrumbs />
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
      </Routes>
    </div>
  );
};
