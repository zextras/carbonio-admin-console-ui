/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { usePrimaryBarState } from '@zextras/admin-ui-bootstrap';
import { Container, Padding, Text } from '@zextras/ui-components';
import { FC, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router';

import logo from '../assets/ninja_robo.svg';
import {
  ACTIVE_SYNC,
  ADMINISTRATORS,
  CREATE_NEW_DOMAIN_ROUTE_ID,
  DOMAINS,
  GENERAL_INFORMATION,
  GLOBAL_ROUTE,
  QUARANTINE,
  SETTINGS,
  TWO_FACTOR_AUTHENTICATION,
  WHITELABEL_SETTINGS,
} from '../constants';
import { Breadcrumb } from './breadcrumb/breadcrumb';
import CreateDomain from './domain/create-new-domain';
import DomainOperations from './domain/domain-detail-operation';
import DomainDetailPanel from './domain/domain-detail-panel';
import DomainList from './domain/domain-list/domain-list';
import DomainListPanel from './domain/domain-list-panel';
import GlobalActiveSync from './domain/global/global-active-sync';
import GlobalDetailPanel from './domain/global/global-detail-panel';
import GlobalTheme from './domain/global/global-theme';
import GlobalTwoFactorAuthentcation from './domain/global/global-two-factor-auth';
import GlobalDelegates from './domain/global-delegates';
import QuarantineList from './quarantine/quarantine-list';

function getContainerStyle(isPrimaryBarExpanded: boolean) {
  return {
    maxWidth: isPrimaryBarExpanded ? '981px' : '1125px',
    transition: 'width 300ms',
  };
}
const AppView: FC = () => {
  const isPrimaryBarExpanded = usePrimaryBarState();
  const [t] = useTranslation();

  const EmptyState: FC = () => (
    <Container>
      <Text
        overflow="break-word"
        weight="regular"
        size="large"
        style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
      >
        <img src={logo} alt="logo" />
      </Text>
      <Padding all="medium" width="47%">
        <Text
          color="gray1"
          overflow="break-word"
          weight="regular"
          size="large"
          style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
        >
          {t(
            'select_domain_or_create_new',
            'Please select a domain from the menu on the left or click on "Create" button to create a new one.',
          )}
        </Text>
      </Padding>
      <Padding all="medium">
        <Text
          size="small"
          overflow="break-word"
          style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
        >
          <icon-wc icon-name="Plus" size="large" color="primary"></icon-wc>
        </Text>
      </Padding>
    </Container>
  );

  return (
    <Container height={'fit'}>
      <Breadcrumb />
      <Container orientation="horizontal" mainAlignment="flex-start" height="calc(100vh - 105px)">
        <Container style={{ maxWidth: '265px' }}>
          <Suspense fallback={<spinner-wc />}>
            <DomainListPanel />
          </Suspense>
        </Container>
        <Container style={{ maxWidth: '100%' }}>
          <Container style={getContainerStyle(isPrimaryBarExpanded)}>
            <Suspense fallback={<spinner-wc />}>
              <Routes>
                <Route path={GLOBAL_ROUTE} element={<GlobalDetailPanel />} />
                <Route path={`${GLOBAL_ROUTE}/${WHITELABEL_SETTINGS}`} element={<GlobalTheme />} />
                <Route
                  path={`${GLOBAL_ROUTE}/${TWO_FACTOR_AUTHENTICATION}`}
                  element={<GlobalTwoFactorAuthentcation />}
                />
                <Route path={`${GLOBAL_ROUTE}/${QUARANTINE}`} element={<QuarantineList />} />
                <Route path={`${GLOBAL_ROUTE}/${DOMAINS}`} element={<DomainList />} />
                <Route path={`${GLOBAL_ROUTE}/${ADMINISTRATORS}`} element={<GlobalDelegates />} />
                <Route path={`${GLOBAL_ROUTE}/${SETTINGS}`} element={<GlobalDetailPanel />} />
                <Route path={`${GLOBAL_ROUTE}/${ACTIVE_SYNC}`} element={<GlobalActiveSync />} />
                <Route
                  path={`:domainId/${GENERAL_INFORMATION}`}
                  element={
                    <DomainDetailPanel>
                      <DomainOperations />
                    </DomainDetailPanel>
                  }
                />
                <Route
                  path={`:domainId/:operation`}
                  element={
                    <DomainDetailPanel>
                      <DomainOperations />
                    </DomainDetailPanel>
                  }
                />
                <Route path={CREATE_NEW_DOMAIN_ROUTE_ID} element={<CreateDomain />} />
                <Route
                  index
                  element={
                    <DomainDetailPanel>
                      <EmptyState />
                    </DomainDetailPanel>
                  }
                />
              </Routes>
            </Suspense>
          </Container>
        </Container>
      </Container>
    </Container>
  );
};

export default AppView;
