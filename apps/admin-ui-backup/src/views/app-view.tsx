/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Breadcrumbs, Container, type CrumbMenuItem } from '@zextras/ui-components';
import { useDetailViewMaxWidth } from '@zextras/ui-shared';
import { FC, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useLocation } from 'react-router';

import BackupDetailPanel from './backup/backup-detail-panel';
import BackupListPanel from './backup/backup-list-panel';
import { SECTION_ROUTES } from './backup/backup-section-routes';

export const AppView: FC = () => {
  const [t] = useTranslation();
  const { pathname } = useLocation();
  const detailViewMaxWidth = useDetailViewMaxWidth();
  const appBase = `/${pathname.split('/').filter(Boolean).slice(0, 2).join('/')}`;
  const crumbMenus: Record<string, Array<CrumbMenuItem>> = {
    [appBase]: SECTION_ROUTES.filter((r) => !r.prefix).map(({ id, labelKey, labelDefault }) => ({
      path: `${appBase}/${id}`,
      label: t(labelKey, labelDefault),
    })),
  };
  return (
    <Container height={'fit'}>
      <Breadcrumbs crumbMenus={crumbMenus} />
      <Routes>
        <Route
          path={'/*'}
          element={
            <Container
              orientation="horizontal"
              mainAlignment="flex-start"
              style={{ overflow: 'hidden' }}
            >
              <Container style={{ maxWidth: '265px' }}>
                <Suspense fallback={<ds-spinner></ds-spinner>}>
                  <BackupListPanel />
                </Suspense>
              </Container>
              <Container style={{ maxWidth: '100%' }}>
                <Container style={{ maxWidth: detailViewMaxWidth, transition: 'width 300ms' }}>
                  <Suspense fallback={<ds-spinner></ds-spinner>}>
                    <BackupDetailPanel />
                  </Suspense>
                </Container>
              </Container>
            </Container>
          }
        />
      </Routes>
    </Container>
  );
};

