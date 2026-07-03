/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, Padding, Row } from '@zextras/ui-components';
import { useLocalStorage } from '@zextras/ui-shared';
import { cloneDeep, find } from 'lodash-es';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import { useSelectedDomain } from '../../hooks/use-selected-domain';

type DomainDetailPanelProps = {
  children?: React.ReactNode;
};

export const DomainDetailPanel = ({ children }: DomainDetailPanelProps) => {
  const [t] = useTranslation();
  const { data: domain } = useSelectedDomain();
  const [searchParams, setSearchParams] = useSearchParams();
  const closeDomainBanner = searchParams.get('bannerDismissed') ?? '';
  const [domainLocalValue, setDomainLocalValue] = useLocalStorage<Record<string, boolean>>(
    'close_domain_never_show',
    {},
  );

	const [dismissedDomainName, setDismissedDomainName] = useState<string | null>(null);

  const isDomainClosed = useMemo(() => {
    const domainStatus = find(domain?.a, { n: 'zimbraDomainStatus' });
    return !!(
      domainStatus?._content === 'closed' &&
      domain?.name &&
      !domainLocalValue[domain?.name] &&
      !location.pathname.includes('domains/global') &&
      closeDomainBanner !== domain?.name
    );
  }, [closeDomainBanner, domain?.a, domain?.name, domainLocalValue]);
  return (
    <Container
      orientation="column"
      crossAlignment="center"
      mainAlignment="flex-start"
      style={{ overflowY: 'hidden' }}
      background="gray6"
    >
      {isDomainClosed && dismissedDomainName !== domain?.name ? (
        <Row background="warning" width="100%" padding="small" mainAlignment="space-between">
          <Row mainAlignment="flex-start">
            <ds-icon icon="CloseCircleOutline" size="large" color="white"></ds-icon>
            <Padding left="large">
              <Trans
                i18nKey="label.this_domain_is_closed"
                defaults="<text>The domain  <bold> {{domain}} </bold>  is closed</text>"
                components={{ bold: <strong />, text: <ds-text as="p" color="white" /> }}
                values={{
                  domain: domain?.name ?? '',
                }}
              />
            </Padding>
          </Row>

          <Row mainAlignment="flex-end">
            <Padding right="large">
              <Button
                type="outlined"
                label={t('label.never_show_this_again', 'NEVER SHOW THIS AGAIN')}
                color="white"
                backgroundColor="warning"
                onClick={(): void => {
                  setDismissedDomainName(domain?.name ?? null);
                  const domainLocal = cloneDeep(domainLocalValue);
    if (domain?.name) {
      domainLocal[domain?.name] = true;
    }
                  setDomainLocalValue(domainLocal);
                }}
              />
            </Padding>
            <ds-icon
              icon="Close"
              size="large"
              color="white"
              style={{ cursor: 'pointer' }}
              onClick={(): void => {
                setDismissedDomainName(domain?.name ?? null);
                setSearchParams(
                  (prev) => {
                    const next = new URLSearchParams(prev);
                    next.set('bannerDismissed', domain?.name || '');
                    return next;
                  },
                  { replace: true },
                );
              }}
            ></ds-icon>
          </Row>
        </Row>
      ) : (
        <></>
      )}
      {children}
    </Container>
  );
};
