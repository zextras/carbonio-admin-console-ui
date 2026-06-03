/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { usePrimaryBarState } from '@zextras/ui-shared';
import { Route, Routes } from 'react-router';

import styles from './app-view.module.css';
import { Breadcrumb } from './breadcrumb/breadcrumb';
import { CosDetailPanel } from './cos/cos-detail-panel';
import { CosListPanel } from './cos/cos-list-panel';

export const AppView = () => {
  const isPrimaryBarExpanded = usePrimaryBarState();
  return (
    <div className={styles.root}>
      <Breadcrumb />
      <Routes>
        <Route
          path={'/*'}
          element={
            <div className={styles.layout}>
              <div className={styles.sidebar}>
                <CosListPanel />
              </div>
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
