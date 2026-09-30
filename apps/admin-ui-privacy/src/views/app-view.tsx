/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PageHeader } from '@zextras/ui-components';
import { Suspense } from 'react';

import styles from './app-view.module.css';
import { PrivacyView } from './privacy/privacy-view';

export function AppView() {
  return (
    <div className={styles.page}>
      <PageHeader />
      <div className={styles.body}>
        <div className={styles.content}>
          <Suspense fallback={<ds-spinner />}>
            <PrivacyView />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
