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

import { CREATE_NEW_DOMAIN_ROUTE_ID, DOMAINS_ROUTE_ID, GLOBAL_ROUTE, MANAGE } from '../constants';
import DomainListPanel from './domain/domain-list-panel';
import { DomainContentPanel } from './domain-content-panel';
import { GLOBAL_SECTION_ROUTES } from './global-section-routes';

export const AppView: FC = () => {
  const [t] = useTranslation();
  const { pathname } = useLocation();
  const detailViewMaxWidth = useDetailViewMaxWidth();

  const domainsAppPath = `/${MANAGE}/${DOMAINS_ROUTE_ID}`;
  const globalBase = `${domainsAppPath}/${GLOBAL_ROUTE}`;
  const globalSections: Array<CrumbMenuItem> = GLOBAL_SECTION_ROUTES.map(
    ({ id, labelKey, labelDefault }) => ({
      path: id === '' ? globalBase : `${globalBase}/${id}`,
      label: t(labelKey, labelDefault),
    }),
  );
  const crumbMenus = globalSections.some((s) => s.path === pathname)
    ? { [pathname]: globalSections }
    : undefined;

  const segmentAfterBase = pathname.startsWith(`${domainsAppPath}/`)
    ? pathname.substring(domainsAppPath.length + 1).split('/')[0]
    : undefined;
  const isDomainId =
    Boolean(segmentAfterBase) &&
    segmentAfterBase !== GLOBAL_ROUTE &&
    segmentAfterBase !== CREATE_NEW_DOMAIN_ROUTE_ID;

  const { data: domain } = useDomainById<{ name?: string }>({
    domainId: isDomainId ? segmentAfterBase : undefined,
    enabled: isDomainId,
  });

  const nonNavigableSegments = isDomainId
    ? [GLOBAL_ROUTE, segmentAfterBase!]
    : [GLOBAL_ROUTE];
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
