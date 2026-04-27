/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useLicenseInfo } from '@zextras/ui-shared';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import styles from './card.module.css';
import { DATE_FORMAT } from './constants';

export const LastDataSent = () => {
  const { t } = useTranslation();

  const title = t('core.subscription.last_data_sent', 'Last time data has been sent');
  const { data: licenseData } = useLicenseInfo();

  const lastValidationDate = licenseData?.response?.lastValidationCheck;

  const expirationDateLabel = lastValidationDate ? format(lastValidationDate, DATE_FORMAT) : '';
  return (
    <div className={styles.card}>
      <ds-text size="small" as="span" color="gray0">
        {title}
      </ds-text>
      <ds-text weight="bold" color="gray0" style={{ fontSize: '1.5rem' }}>
        {expirationDateLabel}
      </ds-text>
    </div>
  );
};
