/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, IconName, ListRow } from '@zextras/ui-components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

const QuickAccess: FC<{
  openOperationView: (operation: string) => void;
  domainName: string;
}> = ({ openOperationView, domainName }) => {
  const [t] = useTranslation();
  const quickAccessItems = [
    {
      upperText: t('label.domains', 'Domains'),
      operationText: t('label.accounts', 'Accounts'),
      bottomText: t('label.open', 'Open'),
      operationIcon: 'PersonOutline' as IconName,
      bottomIcon: 'ChevronRightOutline' as IconName,
      bgColor: 'avatar-39',
      operation: 'account',
    },
    {
      upperText: t('label.domains', 'Domains'),
      operationText: t('label.distribution_list', 'Distribution List'),
      bottomText: t('label.open', 'Open'),
      operationIcon: 'DistributionListOutline' as IconName,
      bottomIcon: 'ChevronRightOutline' as IconName,
      bgColor: 'avatar-21',
      operation: 'mailinglist',
    },
  ];
  const handleClickedQuickAccess = (item: string): void => {
    openOperationView(item);
  };
  return (
    <Container
      background="gray6"
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      padding={{ top: 'extralarge', right: 'extralarge', bottom: 'extralarge' }}
      style={{ borderRadius: '0.5rem' }}
    >
      <Container
        padding={{ bottom: 'large', right: 'large', left: 'extralarge', top: 'large' }}
        mainAlignment="flex-start"
        crossAlignment="flex-start"
      >
        <ListRow>
          <Container mainAlignment="flex-start" crossAlignment="flex-start" width="2rem">
            <ds-icon size="large" icon="FlashOutline"></ds-icon>
          </Container>
          <Container mainAlignment="flex-start" crossAlignment="flex-start">
            <ds-text as="strong" color="gray0" overflow="break-word" weight="bold" size="medium">
              {t('dashboard.quick_access_to', 'Quick Access to')} {domainName}
            </ds-text>
          </Container>
        </ListRow>
      </Container>
      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ bottom: 'large', right: 'medium', left: 'medium', top: 'large' }}
      >
        {quickAccessItems.map((item) => (
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            padding={{ left: 'extralarge' }}
            key={item?.operation}
          >
            <Container
              height={'8.75rem'}
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              width={'21.75rem'}
              style={{ borderRadius: '0.5rem', background: `var(--color-${item?.bgColor})` }}
            >
              <ListRow>
                <Container padding={{ all: 'large' }}>
                  <Container mainAlignment="flex-start" crossAlignment="flex-start">
                    <ds-text as="span" color="gray6" overflow="break-word" weight="light" size="medium">
                      {item?.upperText}
                    </ds-text>
                  </Container>
                  <Container
                    mainAlignment="flex-start"
                    crossAlignment="flex-start"
                    padding={{ top: 'extrasmall' }}
                  >
                    <ds-text as="strong" color="gray6" overflow="break-word" weight="bold" size="large">
                      {item?.operationText}
                    </ds-text>
                  </Container>
                </Container>
                <Container crossAlignment="flex-end" padding={{ right: 'large' }}>
                  <ds-icon color="gray6" icon={item?.operationIcon} size="large"></ds-icon>
                </Container>
              </ListRow>
              <ListRow>
                <Container padding={{ left: 'large', right: 'large' }}>
                  <ds-divider></ds-divider>
                </Container>
              </ListRow>
              <ListRow>
                <Container
                  mainAlignment="flex-start"
                  crossAlignment="flex-start"
                  padding={{ all: 'large' }}
                  style={{ cursor: 'pointer' }}
                  onClick={(): void => {
                    handleClickedQuickAccess(item?.operation);
                  }}
                >
                  <ds-text as="span" color="gray6" overflow="break-word" weight="light" size="medium">
                    {item?.bottomText}
                  </ds-text>
                </Container>
                <Container
                  mainAlignment="flex-end"
                  crossAlignment="flex-end"
                  padding={{ all: 'large' }}
                  style={{ cursor: 'pointer' }}
                  onClick={(): void => {
                    handleClickedQuickAccess(item?.operation);
                  }}
                >
                  <ds-icon icon={item?.bottomIcon} size="medium" color="gray6"></ds-icon>
                </Container>
              </ListRow>
            </Container>
          </Container>
        ))}
      </Container>
    </Container>
  );
};

export default QuickAccess;
