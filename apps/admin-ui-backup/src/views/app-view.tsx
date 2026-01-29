/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { usePrimaryBarState } from '@zextras/admin-ui-bootstrap';
import { Container } from '@zextras/ui-components';
import { FC, Suspense } from 'react';
import { Route } from 'react-router-dom';

import { BACKUP_ROUTE_ID, SERVICES_ROUTE_ID } from '../constants';
import BackupDetailPanel from './backup/backup-detail-panel';
import BackupListPanel from './backup/backup-list-panel';
import BreadCrumb from './breadcrumb/breadcrumb-view';

function getContainerStyle(isPrimaryBarExpanded: boolean) {
	return {
		maxWidth: isPrimaryBarExpanded ? '981px' : '1125px',
		transition: 'width 300ms'
	};
}

const AppView: FC = () => {
  const isPrimaryBarExpanded = usePrimaryBarState();
  return (
    <Container height={'fit'}>
      <BreadCrumb />
      <Route path={`/${SERVICES_ROUTE_ID}/${BACKUP_ROUTE_ID}`}>
        <Container
          orientation="horizontal"
          mainAlignment="flex-start"
          style={{ overflow: 'hidden' }}
        >
          <Container style={{ maxWidth: '265px' }}>
            <Suspense fallback={<spinner-wc />}>
              <BackupListPanel />
            </Suspense>
          </Container>
          <Container style={{ maxWidth: '100%' }}>
            <Container style={getContainerStyle(isPrimaryBarExpanded)}>
              <Suspense fallback={<spinner-wc />}>
                <BackupDetailPanel />
              </Suspense>
            </Container>
          </Container>
        </Container>
      </Route>
    </Container>
  );
};

export default AppView;
