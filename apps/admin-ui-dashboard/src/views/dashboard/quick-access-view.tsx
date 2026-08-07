/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, IconName, ListRow } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { QuickAccessItem, type QuickAccessItemData } from './quick-access-item';

type QuickAccessProps = {
  openOperationView: (operation: string) => void;
  domainName: string;
};

export const QuickAccess = ({ openOperationView, domainName }: QuickAccessProps) => {
  const [t] = useTranslation();
  const quickAccessItems: Array<QuickAccessItemData> = [
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
          <QuickAccessItem key={item.operation} item={item} onOpen={openOperationView} />
        ))}
      </Container>
    </Container>
  );
};

