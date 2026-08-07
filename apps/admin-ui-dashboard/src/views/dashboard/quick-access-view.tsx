/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IconName, ListRow } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import styles from './quick-access.module.css';
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
    <div className={styles.root}>
      <div className={styles.header}>
        <ListRow>
          <div className={styles.icon}>
            <ds-icon size="large" icon="FlashOutline" />
          </div>
          <div className={styles.title}>
            <ds-text as="strong" color="gray0" overflow="break-word" weight="bold" size="medium">
              {t('dashboard.quick_access_to', 'Quick Access to')} {domainName}
            </ds-text>
          </div>
        </ListRow>
      </div>
      <div className={styles.items}>
        {quickAccessItems.map((item) => (
          <QuickAccessItem key={item.operation} item={item} onOpen={openOperationView} />
        ))}
      </div>
    </div>
  );
};

