/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PageHeader } from '@zextras/ui-components';

import styles from './app-view.module.css';
import { Dashboard } from './dashboard/dashboard-view';

export const AppView = () => {
  return (
    <div className={styles.outer}>
      <PageHeader />
      <div className={styles.content}>
        <Dashboard />
      </div>
    </div>
  );
};
