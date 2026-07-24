/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Breadcrumbs, Container, type CrumbMenuItem } from '@zextras/ui-components';
import { useDetailViewMaxWidth } from '@zextras/ui-shared';
import { FC, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ACTIVE_SYNC,
  ADMINISTRATORS,
  DOMAINS,
  DOMAINS_ROUTE_ID,
  GLOBAL_ROUTE,
  MANAGE,
  QUARANTINE,
  SETTINGS,
  TWO_FACTOR_AUTHENTICATION,
  WHITELABEL_SETTINGS,
} from '../constants';
import DomainListPanel from './domain/domain-list-panel';
import { DomainContentPanel } from './domain-content-panel';

export const AppView: FC = () => {
  const [t] = useTranslation();
  const detailViewMaxWidth = useDetailViewMaxWidth();

  const domainsAppPath = `/${MANAGE}/${DOMAINS_ROUTE_ID}`;
  const globalBase = `${domainsAppPath}/${GLOBAL_ROUTE}`;
  const crumbMenus: Record<string, Array<CrumbMenuItem>> = {
    [domainsAppPath]: [
      { path: globalBase, label: t('label.global', 'Global') },
      { path: `${globalBase}/${DOMAINS}`, label: t('label.domains', 'Domains') },
      { path: `${globalBase}/${SETTINGS}`, label: t('label.settings', 'Settings') },
      {
        path: `${globalBase}/${ADMINISTRATORS}`,
        label: t('label.administrators', 'Administrators'),
      },
      { path: `${globalBase}/${QUARANTINE}`, label: t('label.quarantine', 'Quarantine') },
      {
        path: `${globalBase}/${WHITELABEL_SETTINGS}`,
        label: t('label.whitelabel_settings', 'Whitelabel Settings'),
      },
      {
        path: `${globalBase}/${TWO_FACTOR_AUTHENTICATION}`,
        label: t('label.two_factor_authentication', '2-Factor Authentication'),
      },
      { path: `${globalBase}/${ACTIVE_SYNC}`, label: t('label.active_sync', 'Active Sync') },
    ],
  };

  return (
    <Container height={'fit'}>
      <Breadcrumbs crumbMenus={crumbMenus} />
      <Container orientation="horizontal" mainAlignment="flex-start" height="calc(100vh - 105px)">
        <Container style={{ maxWidth: '265px' }}>
          <Suspense fallback={<ds-spinner />}>
            <DomainListPanel />
          </Suspense>
        </Container>
        <Container style={{ maxWidth: '100%' }}>
          <Container style={{ maxWidth: detailViewMaxWidth, transition: 'width 300ms' }}>
            <DomainContentPanel />
          </Container>
        </Container>
      </Container>
    </Container>
  );
};
