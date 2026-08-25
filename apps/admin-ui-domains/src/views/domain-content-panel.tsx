/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Padding } from '@zextras/ui-components';
import { FC, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router';

import logo from '../assets/ninja_robo.svg';
import {
  ACCOUNTS,
  ACTIVE_SYNC,
  ADDRESS_BOOK,
  AUTHENTICATION,
  CREATE_NEW_DOMAIN_ROUTE_ID,
  DELEGATES_DOMAIN_ADMINS,
  DISCLAIMER,
  DISTRIBUTION_LIST,
  GAL,
  GENERAL_INFORMATION,
  GENERAL_SETTINGS,
  GLOBAL_ROUTE,
  RESOURCES,
  RESTORE_ACCOUNT,
  SAML,
  TWO_FACTOR_AUTHENTICATION,
  VIRTUAL_HOSTS,
  WHITELABEL_SETTINGS,
} from '../constants';
import CreateDomain from './domain/create-new-domain';
import DomainTwoFactorAuthentication from './domain/details/domain-2fa';
import DomainAuthentication from './domain/details/domain-authentication';
import DomainDisclaimer from './domain/details/domain-disclaimer';
import { DomainGalSettings } from './domain/details/domain-gal-settings';
import { DomainGeneralSettings } from './domain/details/domain-general-settings';
import DomainSaml from './domain/details/domain-saml';
import DomainTheme from './domain/details/domain-theme';
import { DomainVirtualHosts } from './domain/details/virtual-hosts-certificates/domain-virtual-hosts';
import { DomainDetailPanel } from './domain/domain-detail-panel';
import { DomainOperationsLayout } from './domain/domain-operations-layout';
import ManageAccounts from './domain/manange/accounts/manage-accounts';
import ActiveSync from './domain/manange/active-sync/active-sync';
import { DomainAddressBook } from './domain/manange/address-book/domain-address-book';
import ManageDelegates from './domain/manange/delegates/manage-delegates';
import DomainMailingList from './domain/manange/mailing-list/domain-mailing-list';
import DomainResources from './domain/manange/resources/domain-resources';
import RestoreAccount from './domain/manange/restore-delete-account/restore-delete-account';
import { GLOBAL_SECTION_ROUTES } from './global-section-routes';

const EmptyState: FC = () => {
  const [t] = useTranslation();
  return (
    <Container>
      <ds-text
        as="span"
        overflow="break-word"
        weight="regular"
        size="large"
        style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
      >
        <img src={logo} alt="logo" />
      </ds-text>
      <Padding all="medium" width="47%">
        <ds-text
          as="p"
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
        </ds-text>
      </Padding>
      <Padding all="medium">
        <ds-text
          as="span"
          size="small"
          overflow="break-word"
          style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
        >
          <ds-icon icon="Plus" size="large" color="primary"></ds-icon>
        </ds-text>
      </Padding>
    </Container>
  );
};

const GeneralInformation: FC = () => {
  const [t] = useTranslation();
  return <div>{t('label.general_information', 'General Information')}</div>;
};

export const DomainContentPanel = () => (
  <Suspense fallback={<ds-spinner />}>
    <Routes>
      {GLOBAL_SECTION_ROUTES.map(({ id, Component }) =>
        id === '' ? (
          <Route key={GLOBAL_ROUTE} path={GLOBAL_ROUTE} element={<Component />} />
        ) : (
          <Route key={id} path={`${GLOBAL_ROUTE}/${id}`} element={<Component />} />
        ),
      )}
      <Route path=":domainId" element={<DomainOperationsLayout />}>
        <Route path={GENERAL_INFORMATION} element={<GeneralInformation />} />
        <Route path={GENERAL_SETTINGS} element={<DomainGeneralSettings />} />
        <Route path={GAL} element={<DomainGalSettings />} />
        <Route path={AUTHENTICATION} element={<DomainAuthentication />} />
        <Route path={VIRTUAL_HOSTS} element={<DomainVirtualHosts />} />
        <Route path={TWO_FACTOR_AUTHENTICATION} element={<DomainTwoFactorAuthentication />} />
        <Route path={WHITELABEL_SETTINGS} element={<DomainTheme />} />
        <Route path={SAML} element={<DomainSaml />} />
        <Route path={ACCOUNTS} element={<ManageAccounts />} />
        <Route path={ACTIVE_SYNC} element={<ActiveSync />} />
        <Route path={ADDRESS_BOOK} element={<DomainAddressBook />} />
        <Route path={DELEGATES_DOMAIN_ADMINS} element={<ManageDelegates />} />
        <Route path={DISTRIBUTION_LIST} element={<DomainMailingList />} />
        <Route path={RESOURCES} element={<DomainResources />} />
        <Route path={RESTORE_ACCOUNT} element={<RestoreAccount />} />
        <Route path={DISCLAIMER} element={<DomainDisclaimer />} />
        <Route path="*" element={null} />
      </Route>
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
);
