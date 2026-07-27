/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Breadcrumbs, Container, type CrumbMenuItem } from '@zextras/ui-components';
import { useDetailViewMaxWidth, useDomainById } from '@zextras/ui-shared';
import { FC, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import {
  ACCOUNTS,
  ACTIVE_SYNC,
  AUTHENTICATION,
  CREATE_NEW_DOMAIN_ROUTE_ID,
  DELEGATES_DOMAIN_ADMINS,
  DISCLAIMER,
  DISTRIBUTION_LIST,
  DOMAINS_ROUTE_ID,
  GAL,
  GENERAL_SETTINGS,
  GLOBAL_ROUTE,
  MAILBOX_QUOTA,
  MANAGE,
  RESOURCES,
  RESTORE_ACCOUNT,
  SAML,
  TWO_FACTOR_AUTHENTICATION,
  VIRTUAL_HOSTS,
  WHITELABEL_SETTINGS,
} from '../constants';
import DomainListPanel from './domain/domain-list-panel';
import { DomainContentPanel } from './domain-content-panel';
import { GLOBAL_SECTION_ROUTES } from './global-section-routes';

type SectionRoute = { id: string; labelKey: string; labelDefault: string };

function buildSectionMenu(
  basePath: string,
  sections: Array<SectionRoute>,
  t: ReturnType<typeof useTranslation>[0],
): Array<CrumbMenuItem> {
  return sections.map(({ id, labelKey, labelDefault }) => ({
    path: id === '' ? basePath : `${basePath}/${id}`,
    label: t(labelKey, labelDefault),
  }));
}

function getSegmentAfterBase(pathname: string, basePath: string): string | undefined {
  const prefix = `${basePath}/`;
  return pathname.startsWith(prefix)
    ? pathname.substring(prefix.length).split('/')[0]
    : undefined;
}

const DOMAIN_DETAIL_SECTIONS: Array<SectionRoute> = [
  { id: ACCOUNTS, labelKey: 'label.accounts', labelDefault: 'Accounts' },
  {
    id: DELEGATES_DOMAIN_ADMINS,
    labelKey: 'label.delegates_domain_admins',
    labelDefault: 'Delegated Domain Admins',
  },
  { id: DISTRIBUTION_LIST, labelKey: 'label.distribution_list', labelDefault: 'Distribution List' },
  { id: RESOURCES, labelKey: 'label.resources', labelDefault: 'Resources' },
  { id: ACTIVE_SYNC, labelKey: 'label.active_sync', labelDefault: 'ActiveSync' },
  { id: RESTORE_ACCOUNT, labelKey: 'label.restore_account', labelDefault: 'Restore Account' },
  { id: GENERAL_SETTINGS, labelKey: 'label.general_settings', labelDefault: 'General Settings' },
  { id: GAL, labelKey: 'label.global_address_list', labelDefault: 'Global Address List' },
  { id: AUTHENTICATION, labelKey: 'label.authentication', labelDefault: 'Authentication' },
  {
    id: VIRTUAL_HOSTS,
    labelKey: 'label.virtual_hosts_and_certificates',
    labelDefault: 'Virtual Hosts & Certificate',
  },
  { id: MAILBOX_QUOTA, labelKey: 'label.mailbox_quota', labelDefault: 'Mailbox Quota' },
  { id: WHITELABEL_SETTINGS, labelKey: 'label.whitelabel_settings', labelDefault: 'Whitelabel Settings' },
  {
    id: TWO_FACTOR_AUTHENTICATION,
    labelKey: 'label.2-factor-authentication',
    labelDefault: '2-Factor-Authentication',
  },
  { id: SAML, labelKey: 'label.saml', labelDefault: 'SAML' },
  { id: DISCLAIMER, labelKey: 'label.disclaimer', labelDefault: 'Disclaimer' },
];

const NON_DOMAIN_SEGMENTS = new Set([GLOBAL_ROUTE, CREATE_NEW_DOMAIN_ROUTE_ID]);

export const AppView: FC = () => {
  const [t] = useTranslation();
  const { pathname } = useLocation();
  const detailViewMaxWidth = useDetailViewMaxWidth();

  const domainsAppPath = `/${MANAGE}/${DOMAINS_ROUTE_ID}`;

  const segmentAfterBase = getSegmentAfterBase(pathname, domainsAppPath);
  const isDomainId =
    Boolean(segmentAfterBase) && !NON_DOMAIN_SEGMENTS.has(segmentAfterBase!);

  const { data: domain } = useDomainById<{ name?: string }>({
    domainId: isDomainId ? segmentAfterBase : undefined,
    enabled: isDomainId,
  });

  const globalBase = `${domainsAppPath}/${GLOBAL_ROUTE}`;
  const globalSections = buildSectionMenu(globalBase, GLOBAL_SECTION_ROUTES, t);

  const sectionMenu = isDomainId
    ? buildSectionMenu(`${domainsAppPath}/${segmentAfterBase}`, DOMAIN_DETAIL_SECTIONS, t)
    : globalSections.some((s) => s.path === pathname)
      ? globalSections
      : undefined;

  const crumbMenus = sectionMenu ? { [pathname]: sectionMenu } : undefined;
  const nonNavigableSegments =
    isDomainId && segmentAfterBase ? [GLOBAL_ROUTE, segmentAfterBase] : [GLOBAL_ROUTE];
  const labelOverrides =
    domain?.name && segmentAfterBase ? { [segmentAfterBase]: domain.name } : undefined;

  return (
    <Container height={'fit'}>
      <Breadcrumbs
        crumbMenus={crumbMenus}
        nonNavigableSegments={nonNavigableSegments}
        labelOverrides={labelOverrides}
      />
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
