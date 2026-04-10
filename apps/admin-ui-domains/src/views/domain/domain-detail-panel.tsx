/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, Padding, Row, Text } from '@zextras/ui-components';
import { useDomainStore } from '@zextras/ui-shared';
import { cloneDeep, find } from 'lodash-es';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useLocalStorage } from '../utility/utils';

type DomainDetailPanelProps = {
  children?: React.ReactNode;
};

const DomainDetailPanel: FC<DomainDetailPanelProps> = ({ children }) => {
  const [t] = useTranslation();
  const domain = useDomainStore((state) => state.domain);
  const closeDomainBanner = useDomainStore((state) => state.closeDomainBanner);
  const setCloseDomainBanner = useDomainStore((state) => state.setCloseDomainBanner);
  const [domainLocalValue, setDomainLocalValue] = useLocalStorage('close_domain_never_show', {});

  const [showDomainClose, setShowDomainClose] = useState<boolean>(
    domain.name ? !domainLocalValue[domain.name] : true,
  );

  const isDomainClosed = useMemo(() => {
    const domainStatus = find(domain?.a, { n: 'zimbraDomainStatus' });
    return !!(
      domainStatus?._content === 'closed' &&
      domain.name &&
      !domainLocalValue[domain.name] &&
      !location.pathname.includes('domains/global') &&
      closeDomainBanner !== domain.name
    );
  }, [closeDomainBanner, domain?.a, domain.name, domainLocalValue]);
  const setCloseDomainNameBanner = useCallback(
    (domainName: string) => {
      setCloseDomainBanner(domainName);
    },
    [setCloseDomainBanner],
  );
  useEffect(() => {
    if (domain?.name !== closeDomainBanner) {
      setCloseDomainNameBanner('');
    }
  }, [closeDomainBanner, domain, setCloseDomainNameBanner]);
  return (
    <Container
      orientation="column"
      crossAlignment="center"
      mainAlignment="flex-start"
      style={{ overflowY: 'hidden' }}
      background="gray6"
    >
      {isDomainClosed && showDomainClose ? (
        <Row background="warning" width="100%" padding="small" mainAlignment="space-between">
          <Row mainAlignment="flex-start">
            <ds-icon icon="CloseCircleOutline" size="large" color="white"></ds-icon>
            <Padding left="large">
              <Trans
                i18nKey="label.this_domain_is_closed"
                defaults="<text>The domain  <bold> {{domain}} </bold>  is closed</text>"
                components={{ bold: <strong />, text: <Text color="white" /> }}
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
                  setShowDomainClose(false);
                  const domainLocal = cloneDeep(domainLocalValue);
                  if (domain?.name) {
                    domainLocal[domain.name] = true;
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
                setShowDomainClose(false);
                setCloseDomainNameBanner(domain?.name || '');
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
export default DomainDetailPanel;
